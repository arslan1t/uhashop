// ─────────────────────────────────────────────────────────────────────────────
// UHA League — Match / Scorer Types
// Used by: Admin Panel (judge tablet) + Public League (live scores)
// ─────────────────────────────────────────────────────────────────────────────

export type MatchStatus =
  | "PRE-GAME"
  | "LIVE"
  | "PAUSED"
  | "OVERTIME"
  | "FINISHED";

export type PlayerStatus =
  | "on_court"
  | "bench"
  | "fouled_out"
  | "injured";

export type EventAction =
  | "1PT_MADE"
  | "2PT_MADE"
  | "FT_MADE"
  | "REBOUND"
  | "ASSIST"
  | "STEAL"
  | "BLOCK"
  | "TURNOVER"
  | "FOUL"
  | "TIMEOUT"
  | "MATCH_START"
  | "MATCH_END"
  | "MATCH_PAUSE"
  | "MATCH_RESUME"
  | "OVERTIME_START"
  | "UNDO";

export interface PlayerStats {
  onePoint: number;      // 1PT made
  twoPoint: number;      // 2PT made
  freeThrow: number;     // FT made
  rebounds: number;      // total rebounds
  dreb: number;          // defensive rebounds
  oreb: number;          // offensive rebounds
  assists: number;       // AST
  fouls: number;         // personal fouls
  steals: number;        // STL
  blocks: number;        // BLK
  turnovers: number;     // TO
  plusMinus: number;     // +/-
  minutesPlayed: number;
}

export const DEFAULT_STATS: PlayerStats = {
  onePoint: 0,
  twoPoint: 0,
  freeThrow: 0,
  rebounds: 0,
  dreb: 0,
  oreb: 0,
  assists: 0,
  fouls: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,
  plusMinus: 0,
  minutesPlayed: 0,
};

export interface MatchPlayer {
  id: string;
  number: number;
  name: string;
  status: PlayerStatus;
  stats: PlayerStats;
  points: number; // computed: onePoint + twoPoint*2 + freeThrow
}

export interface MatchTeam {
  id: string;
  name: string;
  players: MatchPlayer[];
  score: number;       // sum of all player points
  totalFouls: number;  // sum of all player fouls
  timeouts: number;    // timeouts remaining (each team gets 1)
}

export interface TimelineEvent {
  id: string;
  timestamp: number; // Date.now() ms
  team: "A" | "B" | "system";
  playerId?: string;
  playerName?: string;
  playerNumber?: number;
  action: EventAction;
  value?: number;      // e.g. "+1", "+2", "-1"
  scoreA: number;      // score at time of event
  scoreB: number;
  note?: string;
}

export interface MatchMeta {
  tournamentName: string;
  tournamentId?: string;
  round?: string;       // "Pool A", "Quarter-Finals", "Final", etc.
  date: string;         // "2026-05-17"
  court: string;        // "Court 1"
  status: MatchStatus;
  overtimePeriod: number;       // 0 = not in OT, 1 = OT1, 2 = OT2
  overtimeStartAt: number | null;
  startedAt: number | null;     // timestamp
  finishedAt: number | null;
  // Timer state (persisted so multiple devices stay in sync)
  gameTimerSeconds: number;     // elapsed seconds (max 600 = 10 min)
  gameTimerRunning: boolean;
  gameTimerStartedAt: number | null; // Date.now() when last started
  // Shot clock
  shotClockSeconds: number;     // remaining seconds (reset to 12)
  shotClockRunning: boolean;
  shotClockStartedAt: number | null;
  createdAt: number;
  lastUpdated: number;
}

// Full match document as stored in Firestore
export interface MatchDocument {
  meta: MatchMeta;
  teamA: MatchTeam;
  teamB: MatchTeam;
  timeline: TimelineEvent[];
  lastAction: TimelineEvent | null; // for undo
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function computePoints(stats: PlayerStats): number {
  return stats.onePoint + stats.twoPoint * 2 + stats.freeThrow;
}

export function computeTeamScore(players: MatchPlayer[]): number {
  return players.reduce((sum, p) => sum + p.points, 0);
}

export function computeTeamFouls(players: MatchPlayer[]): number {
  return players.reduce((sum, p) => sum + p.stats.fouls, 0);
}

export function getFoulWarning(totalFouls: number): {
  level: "none" | "warning" | "danger";
  message: string;
} {
  if (totalFouls >= 10) return { level: "danger", message: "10+ fouls → 2 FT + possession" };
  if (totalFouls >= 7) return { level: "warning", message: "7+ fouls → 2 FT awarded" };
  return { level: "none", message: "" };
}

export const EVENT_LABELS: Record<EventAction, string> = {
  "1PT_MADE": "1PT",
  "2PT_MADE": "2PT",
  "FT_MADE": "FT",
  "REBOUND": "Rebound",
  "ASSIST": "Assist",
  "STEAL": "Steal",
  "BLOCK": "Block",
  "TURNOVER": "Turnover",
  "FOUL": "Foul",
  "TIMEOUT": "Timeout",
  "MATCH_START": "Match Started",
  "MATCH_END": "Match Ended",
  "MATCH_PAUSE": "Match Paused",
  "MATCH_RESUME": "Match Resumed",
  "OVERTIME_START": "Overtime Started",
  "UNDO": "Undo",
};

export const EVENT_COLORS: Record<EventAction, string> = {
  "1PT_MADE": "#22c55e",
  "2PT_MADE": "#16a34a",
  "FT_MADE": "#4ade80",
  "REBOUND": "#60a5fa",
  "ASSIST": "#a78bfa",
  "STEAL": "#f59e0b",
  "BLOCK": "#fb923c",
  "TURNOVER": "#f87171",
  "FOUL": "#ef4444",
  "TIMEOUT": "#94a3b8",
  "MATCH_START": "#22d3ee",
  "MATCH_END": "#64748b",
  "MATCH_PAUSE": "#94a3b8",
  "MATCH_RESUME": "#22d3ee",
  "OVERTIME_START": "#f59e0b",
  "UNDO": "#6b7280",
};

// Template to create a new match document
export function createMatchTemplate(params: {
  teamAName: string;
  teamBName: string;
  teamAPlayers: { number: number; name: string }[];
  teamBPlayers: { number: number; name: string }[];
  tournamentName: string;
  court: string;
  date: string;
  round?: string;
}): MatchDocument {
  const makePlayer = (p: { number: number; name: string }, idx: number): MatchPlayer => ({
    id: `p${idx}`,
    number: p.number,
    name: p.name,
    status: "bench",
    stats: { ...DEFAULT_STATS },
    points: 0,
  });

  const teamA: MatchTeam = {
    id: "teamA",
    name: params.teamAName,
    players: params.teamAPlayers.map((p, i) => makePlayer(p, i)),
    score: 0,
    totalFouls: 0,
    timeouts: 1,
  };
  const teamB: MatchTeam = {
    id: "teamB",
    name: params.teamBName,
    players: params.teamBPlayers.map((p, i) => makePlayer(p, i + 4)),
    score: 0,
    totalFouls: 0,
    timeouts: 1,
  };

  return {
    meta: {
      tournamentName: params.tournamentName,
      round: params.round,
      date: params.date,
      court: params.court,
      status: "PRE-GAME",
      overtimePeriod: 0,
      overtimeStartAt: null,
      startedAt: null,
      finishedAt: null,
      gameTimerSeconds: 0,
      gameTimerRunning: false,
      gameTimerStartedAt: null,
      shotClockSeconds: 12,
      shotClockRunning: false,
      shotClockStartedAt: null,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    },
    teamA,
    teamB,
    timeline: [],
    lastAction: null,
  };
}
