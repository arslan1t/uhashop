"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { MatchDocument, MatchPlayer, PlayerStats, MatchStatus, EventAction, TimelineEvent } from "@/types/match";
import { computePoints, computeTeamScore, computeTeamFouls } from "@/types/match";
import {
  subscribeToMatch, updatePlayerStat, updatePlayerStatus,
  updateMatchStatus, addTimelineEvent, undoLastAction,
  startGameTimer, pauseGameTimer, resetShotClock, updateMatch,
  updatePlayerName, updatePlayerNumber, updateTeamName,
  type TeamSide, type StatKey,
} from "@/lib/firebase/matchFirestore";

// Re-export types needed by components
export type { StatKey, TeamSide };

const DEBOUNCE_MS = 300; // prevent double-tap

interface UseMatchReturn {
  match: MatchDocument | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;

  // Actions
  statUp: (side: TeamSide, playerId: string, key: StatKey) => Promise<void>;
  statDown: (side: TeamSide, playerId: string, key: StatKey) => Promise<void>;
  setPlayerStatus: (side: TeamSide, playerId: string, status: MatchPlayer["status"]) => Promise<void>;
  setStatus: (status: MatchStatus) => Promise<void>;
  startOvertime: () => Promise<void>;
  undo: () => Promise<void>;
  logEvent: (event: Omit<TimelineEvent, "id" | "timestamp">) => Promise<void>;

  // Timer actions (handled client-side with Firestore sync)
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resetShot: () => Promise<void>;
  elapsedSeconds: number;
  shotSeconds: number;
  // Name editing
  renamePlayer: (side: TeamSide, playerId: string, name: string) => Promise<void>;
  renumberPlayer: (side: TeamSide, playerId: string, number: number) => Promise<void>;
  renameTeam: (side: TeamSide, name: string) => Promise<void>;
}

export function useMatchFirestore(matchId: string): UseMatchReturn {
  const [match, setMatch] = useState<MatchDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [shotSeconds, setShotSeconds] = useState(12);

  const lastActionTime = useRef<Record<string, number>>({});
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchRef = useRef<MatchDocument | null>(null);

  // Keep matchRef in sync
  useEffect(() => { matchRef.current = match; }, [match]);

  // ── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToMatch(matchId, (data) => {
      setLoading(false);
      setIsConnected(true);
      if (data) {
        setMatch(data);
        // Sync timer state from Firestore
        if (!data.meta.gameTimerRunning) {
          setElapsedSeconds(data.meta.gameTimerSeconds);
        }
        if (!data.meta.shotClockRunning) {
          setShotSeconds(data.meta.shotClockSeconds);
        }
      } else {
        setError("Match not found");
      }
    });

    return () => unsub();
  }, [matchId]);

  // ── Local game timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!match) return;
    if (match.meta.gameTimerRunning && match.meta.gameTimerStartedAt) {
      // Calculate elapsed from Firestore start
      const base = match.meta.gameTimerSeconds;
      const startedAt = match.meta.gameTimerStartedAt;
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const addedSeconds = Math.floor((now - startedAt) / 1000);
        setElapsedSeconds(base + addedSeconds);
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [match?.meta.gameTimerRunning, match?.meta.gameTimerStartedAt]);

  // ── Local shot clock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!match) return;
    if (match.meta.shotClockRunning && match.meta.shotClockStartedAt) {
      const base = match.meta.shotClockSeconds;
      const startedAt = match.meta.shotClockStartedAt;
      shotIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, base - elapsed);
        setShotSeconds(remaining);
      }, 100);
    } else {
      if (shotIntervalRef.current) {
        clearInterval(shotIntervalRef.current);
        shotIntervalRef.current = null;
      }
      setShotSeconds(match.meta.shotClockSeconds);
    }
    return () => {
      if (shotIntervalRef.current) clearInterval(shotIntervalRef.current);
    };
  }, [match?.meta.shotClockRunning, match?.meta.shotClockStartedAt, match?.meta.shotClockSeconds]);

  // ── Debounce helper ───────────────────────────────────────────────────────
  const canAct = useCallback((key: string): boolean => {
    const now = Date.now();
    const last = lastActionTime.current[key] ?? 0;
    if (now - last < DEBOUNCE_MS) return false;
    lastActionTime.current[key] = now;
    return true;
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const statUp = useCallback(async (side: TeamSide, playerId: string, key: StatKey) => {
    if (!canAct(`${side}_${playerId}_${key}_up`) || !matchRef.current) return;
    const doc = matchRef.current;

    // Optimistic update
    setMatch(prev => {
      if (!prev) return prev;
      return applyStatDelta(prev, side, playerId, key, 1);
    });

    // Firestore update
    try {
      await updatePlayerStat(matchId, side, playerId, key, 1, doc);

      // Log timeline
      const player = doc[side].players.find(p => p.id === playerId);
      if (player) {
        const action = statKeyToAction(key);
        if (action) {
          await addTimelineEvent(matchId, {
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            timestamp: Date.now(),
            team: side === "teamA" ? "A" : "B",
            playerId: player.id,
            playerName: player.name,
            playerNumber: player.number,
            action,
            value: 1,
            scoreA: doc.teamA.score,
            scoreB: doc.teamB.score,
          }, doc.timeline);
        }
      }
    } catch (err) {
      // Rollback optimistic update
      setMatch(prev => {
        if (!prev) return prev;
        return applyStatDelta(prev, side, playerId, key, -1);
      });
      setError("Update failed");
    }
  }, [matchId, canAct]);

  const statDown = useCallback(async (side: TeamSide, playerId: string, key: StatKey) => {
    if (!canAct(`${side}_${playerId}_${key}_down`) || !matchRef.current) return;
    const doc = matchRef.current;

    setMatch(prev => {
      if (!prev) return prev;
      return applyStatDelta(prev, side, playerId, key, -1);
    });

    try {
      await updatePlayerStat(matchId, side, playerId, key, -1, doc);
    } catch {
      setMatch(prev => {
        if (!prev) return prev;
        return applyStatDelta(prev, side, playerId, key, 1);
      });
      setError("Update failed");
    }
  }, [matchId, canAct]);

  const setPlayerStatus = useCallback(async (
    side: TeamSide, playerId: string, status: MatchPlayer["status"]
  ) => {
    if (!matchRef.current) return;
    await updatePlayerStatus(matchId, side, playerId, status, matchRef.current);
  }, [matchId]);

  const setStatus = useCallback(async (status: MatchStatus) => {
    if (!matchRef.current) return;
    await updateMatchStatus(matchId, status);
    const ev: TimelineEvent = {
      id: `${Date.now()}`,
      timestamp: Date.now(),
      team: "system",
      action: status === "LIVE" ? "MATCH_START"
        : status === "PAUSED" ? "MATCH_PAUSE"
        : status === "FINISHED" ? "MATCH_END"
        : "MATCH_RESUME",
      scoreA: matchRef.current.teamA.score,
      scoreB: matchRef.current.teamB.score,
    };
    await addTimelineEvent(matchId, ev, matchRef.current.timeline);
  }, [matchId]);

  const startOvertime = useCallback(async () => {
    if (!matchRef.current) return;
    const period = matchRef.current.meta.overtimePeriod + 1;
    await updateMatch(matchId, {
      meta: {
        ...matchRef.current.meta,
        status: "OVERTIME",
        overtimePeriod: period,
        overtimeStartAt: Date.now(),
      },
    });
    const ev: TimelineEvent = {
      id: `ot_${Date.now()}`,
      timestamp: Date.now(),
      team: "system",
      action: "OVERTIME_START",
      scoreA: matchRef.current.teamA.score,
      scoreB: matchRef.current.teamB.score,
      note: `Overtime Period ${period}`,
    };
    await addTimelineEvent(matchId, ev, matchRef.current.timeline);
  }, [matchId]);

  const undo = useCallback(async () => {
    if (!matchRef.current) return;
    await undoLastAction(matchId, matchRef.current);
  }, [matchId]);

  const logEvent = useCallback(async (event: Omit<TimelineEvent, "id" | "timestamp">) => {
    if (!matchRef.current) return;
    const full: TimelineEvent = {
      ...event,
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    await addTimelineEvent(matchId, full, matchRef.current.timeline);
  }, [matchId]);

  const startTimer = useCallback(async () => {
    await startGameTimer(matchId);
  }, [matchId]);

  const pauseTimer = useCallback(async () => {
    await pauseGameTimer(matchId, elapsedSeconds);
  }, [matchId, elapsedSeconds]);

  const resetShot = useCallback(async () => {
    await resetShotClock(matchId);
  }, [matchId]);

  const renamePlayer = useCallback(async (side: TeamSide, playerId: string, name: string) => {
    if (!matchRef.current || !name.trim()) return;
    await updatePlayerName(matchId, side, playerId, name, matchRef.current);
  }, [matchId]);

  const renumberPlayer = useCallback(async (side: TeamSide, playerId: string, number: number) => {
    if (!matchRef.current) return;
    await updatePlayerNumber(matchId, side, playerId, number, matchRef.current);
  }, [matchId]);

  const renameTeam = useCallback(async (side: TeamSide, name: string) => {
    if (!name.trim()) return;
    await updateTeamName(matchId, side, name);
  }, [matchId]);

  return {
    match, loading, error, isConnected,
    statUp, statDown, setPlayerStatus, setStatus,
    startOvertime, undo, logEvent,
    startTimer, pauseTimer, resetShot,
    elapsedSeconds, shotSeconds,
    renamePlayer, renumberPlayer, renameTeam,
  };
}

// ── Optimistic stat apply ─────────────────────────────────────────────────────

function applyStatDelta(
  doc: MatchDocument,
  side: TeamSide,
  playerId: string,
  key: StatKey,
  delta: 1 | -1
): MatchDocument {
  const team = doc[side];
  const players = team.players.map(p => {
    if (p.id !== playerId) return p;
    const newStats = { ...p.stats, [key]: Math.max(0, p.stats[key] + delta) };
    const newPoints = computePoints(newStats);
    const newStatus = newStats.fouls >= 5 ? "fouled_out" : p.status;
    return { ...p, stats: newStats, points: newPoints, status: newStatus } as MatchPlayer;
  });
  const newScore = computeTeamScore(players);
  const newFouls = computeTeamFouls(players);
  return {
    ...doc,
    [side]: { ...team, players, score: newScore, totalFouls: newFouls },
  };
}

function statKeyToAction(key: StatKey): EventAction | null {
  const map: Partial<Record<StatKey, EventAction>> = {
    onePoint: "1PT_MADE",
    twoPoint: "2PT_MADE",
    freeThrow: "FT_MADE",
    rebounds: "REBOUND",
    assists: "ASSIST",
    steals: "STEAL",
    blocks: "BLOCK",
    turnovers: "TURNOVER",
    fouls: "FOUL",
  };
  return map[key] ?? null;
}
