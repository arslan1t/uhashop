// ─────────────────────────────────────────────────────────────────────────────
// Firestore helpers — Match operations
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc, setDoc, updateDoc, getDoc, collection, onSnapshot,
  query, orderBy, limit, getDocs, deleteDoc,
  serverTimestamp, type DocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "./config";
import type {
  MatchDocument, MatchTeam, MatchPlayer, TimelineEvent,
  PlayerStats, MatchStatus, EventAction,
} from "@/types/match";
export type TeamSide = "teamA" | "teamB";
import { computePoints, computeTeamScore, computeTeamFouls } from "@/types/match";

const MATCHES_COLLECTION = "matches";

// ── Read ─────────────────────────────────────────────────────────────────────

export async function getMatch(matchId: string): Promise<MatchDocument | null> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as MatchDocument;
}

export async function listMatches(): Promise<{ id: string; data: MatchDocument }[]> {
  const q = query(
    collection(getDb(), MATCHES_COLLECTION),
    orderBy("meta.createdAt", "desc"),
    limit(50)
  );
  const snaps = await getDocs(q);
  return snaps.docs.map(d => ({ id: d.id, data: d.data() as MatchDocument }));
}

// ── Write ────────────────────────────────────────────────────────────────────

export async function createMatch(matchId: string, data: MatchDocument): Promise<void> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await setDoc(ref, data);
}

export async function updateMatch(matchId: string, partial: Partial<MatchDocument>): Promise<void> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    ...partial,
    "meta.lastUpdated": Date.now(),
  });
}

export async function deleteMatch(matchId: string): Promise<void> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await deleteDoc(ref);
}

// ── Player / Team name editing ────────────────────────────────────────────────

/** Rename a single player */
export async function updatePlayerName(
  matchId: string,
  side: TeamSide,
  playerId: string,
  newName: string,
  currentDoc: MatchDocument
): Promise<void> {
  const players = currentDoc[side].players.map(p =>
    p.id === playerId ? { ...p, name: newName.trim() || p.name } : p
  );
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    [`${side}.players`]: players,
    "meta.lastUpdated": Date.now(),
  });
}

/** Rename a single player's jersey number */
export async function updatePlayerNumber(
  matchId: string,
  side: TeamSide,
  playerId: string,
  newNumber: number,
  currentDoc: MatchDocument
): Promise<void> {
  const players = currentDoc[side].players.map(p =>
    p.id === playerId ? { ...p, number: newNumber } : p
  );
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    [`${side}.players`]: players,
    "meta.lastUpdated": Date.now(),
  });
}

/** Rename a team */
export async function updateTeamName(
  matchId: string,
  side: TeamSide,
  newName: string
): Promise<void> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    [`${side}.name`]: newName.trim() || side,
    "meta.lastUpdated": Date.now(),
  });
}

// ── Player stat update ────────────────────────────────────────────────────────

export type StatKey = keyof PlayerStats;

/** Increment or decrement a single player stat and recompute scores */
export async function updatePlayerStat(
  matchId: string,
  side: TeamSide,
  playerId: string,
  statKey: StatKey,
  delta: 1 | -1,
  currentDoc: MatchDocument
): Promise<void> {
  const team = currentDoc[side];
  const playerIdx = team.players.findIndex(p => p.id === playerId);
  if (playerIdx === -1) return;

  // Deep clone
  const players = team.players.map(p => ({ ...p, stats: { ...p.stats } }));
  const player = players[playerIdx];

  // Apply delta (clamp to 0)
  player.stats[statKey] = Math.max(0, player.stats[statKey] + delta);

  // Auto-status: 5+ fouls = fouled out
  if (player.stats.fouls >= 5) {
    player.status = "fouled_out";
  } else if (player.status === "fouled_out" && player.stats.fouls < 5) {
    player.status = "bench";
  }

  // Recompute points
  player.points = computePoints(player.stats);

  // Recompute team totals
  const newScore = computeTeamScore(players);
  const newFouls = computeTeamFouls(players);

  const update: Record<string, unknown> = {
    [`${side}.players`]: players,
    [`${side}.score`]: newScore,
    [`${side}.totalFouls`]: newFouls,
    "meta.lastUpdated": Date.now(),
  };

  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, update);
}

/** Update player status */
export async function updatePlayerStatus(
  matchId: string,
  side: TeamSide,
  playerId: string,
  status: MatchPlayer["status"],
  currentDoc: MatchDocument
): Promise<void> {
  const team = currentDoc[side];
  const players = team.players.map(p =>
    p.id === playerId ? { ...p, status } : p
  );
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    [`${side}.players`]: players,
    "meta.lastUpdated": Date.now(),
  });
}

// ── Match status ──────────────────────────────────────────────────────────────

export async function updateMatchStatus(
  matchId: string,
  status: MatchStatus,
  extra?: Partial<MatchDocument["meta"]>
): Promise<void> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  const patch: Record<string, unknown> = {
    "meta.status": status,
    "meta.lastUpdated": Date.now(),
    ...Object.fromEntries(
      Object.entries(extra ?? {}).map(([k, v]) => [`meta.${k}`, v])
    ),
  };
  if (status === "LIVE" && !extra?.startedAt) {
    patch["meta.startedAt"] = Date.now();
  }
  if (status === "FINISHED") {
    patch["meta.finishedAt"] = Date.now();
    patch["meta.gameTimerRunning"] = false;
  }
  await updateDoc(ref, patch);
}

// ── Timer ─────────────────────────────────────────────────────────────────────

export async function startGameTimer(matchId: string): Promise<void> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    "meta.gameTimerRunning": true,
    "meta.gameTimerStartedAt": Date.now(),
    "meta.lastUpdated": Date.now(),
  });
}

export async function pauseGameTimer(matchId: string, elapsedSeconds: number): Promise<void> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    "meta.gameTimerRunning": false,
    "meta.gameTimerSeconds": elapsedSeconds,
    "meta.gameTimerStartedAt": null,
    "meta.lastUpdated": Date.now(),
  });
}

export async function resetShotClock(matchId: string): Promise<void> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    "meta.shotClockSeconds": 12,
    "meta.shotClockRunning": false,
    "meta.shotClockStartedAt": null,
    "meta.lastUpdated": Date.now(),
  });
}

// ── Timeline ─────────────────────────────────────────────────────────────────

export async function addTimelineEvent(
  matchId: string,
  event: TimelineEvent,
  currentTimeline: TimelineEvent[]
): Promise<void> {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    timeline: [...currentTimeline, event],
    lastAction: event,
    "meta.lastUpdated": Date.now(),
  });
}

export async function undoLastAction(
  matchId: string,
  currentDoc: MatchDocument
): Promise<void> {
  if (!currentDoc.lastAction || currentDoc.timeline.length === 0) return;

  const last = currentDoc.lastAction;

  // Build undo event
  const undoEvent: TimelineEvent = {
    id: `undo_${Date.now()}`,
    timestamp: Date.now(),
    team: "system",
    action: "UNDO",
    scoreA: currentDoc.teamA.score,
    scoreB: currentDoc.teamB.score,
    note: `Undid: ${last.action} by ${last.playerName ?? "system"}`,
  };

  // Remove last event from timeline
  const newTimeline = currentDoc.timeline.slice(0, -1);

  // Reverse the stat change
  if (
    last.playerId &&
    last.team !== "system" &&
    last.action !== "UNDO"
  ) {
    const side = last.team === "A" ? "teamA" : "teamB";
    const statKey = actionToStatKey(last.action);
    const delta = (last.value ?? 0) < 0 ? 1 : -1; // opposite of original

    if (statKey) {
      await updatePlayerStat(
        matchId, side, last.playerId, statKey,
        delta as 1 | -1,
        currentDoc
      );
    }
  }

  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  await updateDoc(ref, {
    timeline: [...newTimeline, undoEvent],
    lastAction: newTimeline.length > 0 ? newTimeline[newTimeline.length - 1] : null,
    "meta.lastUpdated": Date.now(),
  });
}

function actionToStatKey(action: EventAction): StatKey | null {
  const map: Partial<Record<EventAction, StatKey>> = {
    "1PT_MADE": "onePoint",
    "2PT_MADE": "twoPoint",
    "FT_MADE": "freeThrow",
    "REBOUND": "rebounds",
    "ASSIST": "assists",
    "STEAL": "steals",
    "BLOCK": "blocks",
    "TURNOVER": "turnovers",
    "FOUL": "fouls",
  };
  return map[action] ?? null;
}

// ── Realtime listener ─────────────────────────────────────────────────────────

export function subscribeToMatch(
  matchId: string,
  callback: (data: MatchDocument | null) => void
): () => void {
  const ref = doc(getDb(), MATCHES_COLLECTION, matchId);
  return onSnapshot(ref, (snap: DocumentSnapshot) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(snap.data() as MatchDocument);
  });
}

// ── Export utilities ──────────────────────────────────────────────────────────

export function matchToCSV(matchDoc: MatchDocument): string {
  const { teamA, teamB, meta } = matchDoc;
  const lines: string[] = [
    `Match: ${meta.tournamentName}`,
    `Date: ${meta.date} | Court: ${meta.court}`,
    `Final Score: ${teamA.name} ${teamA.score} - ${teamB.score} ${teamB.name}`,
    "",
    "TEAM A — " + teamA.name,
    "Number,Name,1PT,2PT,FT,Points,REB,AST,STL,BLK,TO,FOULS",
    ...teamA.players.map(p =>
      [p.number, p.name, p.stats.onePoint, p.stats.twoPoint, p.stats.freeThrow,
       p.points, p.stats.rebounds, p.stats.assists, p.stats.steals,
       p.stats.blocks, p.stats.turnovers, p.stats.fouls].join(",")
    ),
    "",
    "TEAM B — " + teamB.name,
    "Number,Name,1PT,2PT,FT,Points,REB,AST,STL,BLK,TO,FOULS",
    ...teamB.players.map(p =>
      [p.number, p.name, p.stats.onePoint, p.stats.twoPoint, p.stats.freeThrow,
       p.points, p.stats.rebounds, p.stats.assists, p.stats.steals,
       p.stats.blocks, p.stats.turnovers, p.stats.fouls].join(",")
    ),
    "",
    "TIMELINE",
    "Time,Team,Player,Action,Score A,Score B",
    ...matchDoc.timeline.map(e =>
      [new Date(e.timestamp).toISOString(), e.team, e.playerName ?? "-",
       e.action, e.scoreA, e.scoreB].join(",")
    ),
  ];
  return lines.join("\n");
}
