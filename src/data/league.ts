// ─────────────────────────────────────────────────────────────────────────────
// UHA LEAGUE  —  Real Data Layer
// Source: play.fiba3x3.com
// Events: Spring Takeover CUP 3X3 — All tours
// ─────────────────────────────────────────────────────────────────────────────

export type Format = "3x3" | "5x5";
export type TournamentStatus = "completed" | "live" | "upcoming";
export type AgeCategory = "18+" | "U14" | "U16" | "U18";
export type MatchRound = "pool" | "quarterfinal" | "semifinal" | "final" | "3rd_place" | "last16";
export type NewsCategory = "results" | "announcement" | "interview" | "recap";

// ── Team ──────────────────────────────────────────────────────────────────────
export interface LeagueTeam {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: "UZ" | "KZ" | "KG" | "TJ";
  format: Format;
  category: AgeCategory;
  primaryColor: string;
  secondaryColor?: string;
  // Season/tournament stats
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  rankingPoints: number; // FIBA event pts
  rank: number;
}

// ── Player ────────────────────────────────────────────────────────────────────
export interface LeaguePlayer {
  id: string;
  displayName: string;       // As registered on FIBA platform
  firstName?: string;
  lastName?: string;
  teamId: string;
  country: string;
  // Tournament stats (filled when available from FIBA)
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  pointsFor?: number;        // total team points while on court (proxy)
  twoPointMade?: number;
  twoPointAttempted?: number;
  freeThrowMade?: number;
  freeThrowAttempted?: number;
  fibaRankingPoints?: number;// individual FIBA 3x3 ranking points
  jerseyNumber?: number;
  birthYear?: number;
  height?: number;           // cm
  position?: "G" | "F" | "C";
  instagramHandle?: string;
  fibaProfileId?: string;
  // Match/game stats (from recorded matches)
  onePointMade?: number;  // 1PT scored (inside arc in 3x3)
  rebounds?: number;
  assists?: number;
  fouls?: number;
  steals?: number;
  blocks?: number;
}

// ── Per-match player stats ────────────────────────────────────────────────────
// NOTE: only MADE shots are recorded — no attempted data
export interface MatchPlayerStat {
  matchId: string;
  playerId: string;
  teamId: string;
  jerseyNumber: number;
  displayName: string;
  onePointMade: number;    // 1PT made (inside arc) — 1 point each
  twoPointMade: number;    // 2PT made (outside arc) — 2 points each
  freeThrowMade: number;   // FT made — 1 point each
  rebounds: number;
  assists: number;
  fouls: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  plusMinus?: number;
  points: number;          // computed: onePointMade + twoPointMade*2 + freeThrowMade
}

// ── Tournament ────────────────────────────────────────────────────────────────
export interface Tournament {
  id: string;
  fibaEventId: string;
  fibaUrl: string;
  youtubeUrl?: string;  // highlight video
  name: string;
  nameShort: string;
  format: Format;
  season: number;
  tourNumber: number;
  date: string;
  city: string;
  venue: string;
  status: TournamentStatus;
  totalTeams: number;
  categories: {
    category: AgeCategory;
    teamsCount: number;
    champion?: string;  // teamId
    runnerUp?: string;
    thirdPlace?: string;
    fourthPlace?: string;
  }[];
}

// ── Match ─────────────────────────────────────────────────────────────────────
export interface Match {
  id: string;
  tournamentId: string;
  category: AgeCategory;
  round: MatchRound;
  poolName?: string;  // "A", "B", "C", "D"
  team1Id: string;
  team2Id: string;
  score1: number;
  score2: number;
  time: string;   // "17:25" local time UTC+5
  status: "completed" | "live" | "upcoming";
  note?: string;  // e.g. "forfeit", "overtime"
}

// ── News ──────────────────────────────────────────────────────────────────────
export interface LeagueNews {
  id: string;
  titleRu: string;
  excerptRu: string;
  category: NewsCategory;
  date: string;
  featured: boolean;
  tournamentId?: string;
}

// ── Record ────────────────────────────────────────────────────────────────────
export interface LeagueRecord {
  id: string;
  categoryRu: string;
  holder: string;
  value: string;
  tournament: string;
  isTeam: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
//  TOURNAMENT
// ═════════════════════════════════════════════════════════════════════════════

export const TOURNAMENTS: Tournament[] = [
  {
    id: "tour4",
    fibaEventId: "a65f9c2b-03ae-4468-a29e-98b3d484030c",
    fibaUrl: "https://play.fiba3x3.com/events/a65f9c2b-03ae-4468-a29e-98b3d484030c/schedule",
    name: "Spring Takeover CUP 3X3 4th TOUR",
    nameShort: "4th TOUR",
    format: "3x3",
    season: 2026,
    tourNumber: 4,
    date: "2026-05-17",
    city: "Ташкент",
    venue: "TSTU (Ташкентский государственный технический университет)",
    status: "completed",
    totalTeams: 39,
    youtubeUrl: "https://www.youtube.com/watch?v=9MzMBa9CiR4",
    categories: [
      {
        category: "18+",
        teamsCount: 11,
        champion: "t18_namangan",
        runnerUp: "t18_banana",
        thirdPlace: "t18_unstoppable",
        fourthPlace: "t18_5star",
      },
      {
        category: "U14",
        teamsCount: 15,
        champion: "t14_bearbasket",
        runnerUp: "t14_medvedi",
        thirdPlace: "t14_hooptime",
        fourthPlace: "t14_dolphins12",
      },
      {
        category: "U16",
        teamsCount: 13,
        champion: "t16_dolphins",
        runnerUp: "t16_afnf",
        thirdPlace: "t16_hoops",
        fourthPlace: "t16_blackpanther",
      },
    ],
  },
  {
    id: "tour3",
    fibaEventId: "3720fc42-6041-4d18-bdbb-1bb235308efa",
    fibaUrl: "https://play.fiba3x3.com/events/3720fc42-6041-4d18-bdbb-1bb235308efa",
    name: "Spring Takeover CUP 3X3 (3rd tour)",
    nameShort: "3rd TOUR",
    format: "3x3",
    season: 2026,
    tourNumber: 3,
    date: "2026-05-03",
    city: "Ташкент",
    venue: "TSTU, Tashkent",
    status: "completed",
    totalTeams: 51,
    youtubeUrl: "https://www.youtube.com/watch?v=qKHJIkqYOTU",
    categories: [
      {
        category: "18+",
        teamsCount: 12,
        champion: "t18_banana",
        runnerUp: "t18_bo1ston",
        thirdPlace: "t18_namangan",
        fourthPlace: "t18_otyrar",
      },
      {
        category: "U14",
        teamsCount: 18,
        champion: "t14_bearbasket",
        runnerUp: "t14_hooptime",
        thirdPlace: "t14_dolphins12",
        fourthPlace: "t14_newgen",
      },
      {
        category: "U16",
        teamsCount: 14,
        champion: "t16_dolphins_u16",
        runnerUp: "t16_chotam",
        thirdPlace: "t16_bcbars",
        fourthPlace: "t16_160shkola",
      },
      {
        category: "U18",
        teamsCount: 7,
        champion: "t18u_namangan",
        runnerUp: "t18u_young_thugs",
        thirdPlace: "t18u_nn",
        fourthPlace: "t18u_dolphins",
      },
    ],
  },
  {
    id: "tour1",
    fibaEventId: "3720fc42-6041-4d18-bdbb-1bb235308efa",
    fibaUrl: "https://play.fiba3x3.com/events/3720fc42-6041-4d18-bdbb-1bb235308efa",
    name: "Spring Takeover CUP 3X3 1st TOUR",
    nameShort: "1st TOUR",
    format: "3x3", season: 2026, tourNumber: 1,
    date: "2026-03-01", city: "Ташкент", venue: "TBD",
    status: "completed", totalTeams: 0,
    youtubeUrl: "https://www.youtube.com/watch?v=BV7wn6VUTc8",
    categories: [],
  },
  {
    id: "tour2",
    fibaEventId: "215bd581-0ce7-41b4-a9af-c2c7cea08335",
    fibaUrl: "https://play.fiba3x3.com/events/215bd581-0ce7-41b4-a9af-c2c7cea08335",
    name: "Spring Takeover CUP 3X3 2nd TOUR",
    nameShort: "2nd TOUR",
    format: "3x3", season: 2026, tourNumber: 2,
    date: "2026-03-22", city: "Ташкент", venue: "TBD",
    status: "completed", totalTeams: 0,
    youtubeUrl: "https://www.youtube.com/watch?v=T-r13sH4HNg",
    categories: [],
  },
  {
    id: "tour5",
    fibaEventId: "024607db-d8cd-49d0-b0c3-4c35c1a82b1a",
    fibaUrl: "https://play.fiba3x3.com/events/024607db-d8cd-49d0-b0c3-4c35c1a82b1a",
    name: "Spring Takeover CUP 3X3 FINAL TOUR",
    nameShort: "FINAL",
    format: "3x3", season: 2026, tourNumber: 5,
    date: "2026-06-14", city: "Ташкент", venue: "TBD",
    status: "upcoming", totalTeams: 0, categories: [],
  },
];

// ═════════════════════════════════════════════════════════════════════════════
//  18+ TEAMS — Final Standings (Spring Takeover CUP 3X3 4th TOUR)
// ═════════════════════════════════════════════════════════════════════════════

export const TEAMS_18PLUS: LeagueTeam[] = [
  {
    id: "t18_namangan", name: "NAMANGAN team", shortName: "NAM", city: "Наманган", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#1d4ed8", secondaryColor: "#ffffff",
    played: 5, wins: 5, losses: 0, pointsFor: 103, pointsAgainst: 50,
    rankingPoints: 103, rank: 1,
  },
  {
    id: "t18_banana", name: "Banana Team", shortName: "BAN", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#ca8a04", secondaryColor: "#ffffff",
    played: 5, wins: 4, losses: 1, pointsFor: 78, pointsAgainst: 64,
    rankingPoints: 78, rank: 2,
  },
  {
    id: "t18_unstoppable", name: "Unstoppable", shortName: "UNS", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#7c3aed", secondaryColor: "#ffffff",
    played: 5, wins: 4, losses: 1, pointsFor: 55, pointsAgainst: 48,
    rankingPoints: 55, rank: 3,
  },
  {
    id: "t18_5star", name: "5STAR", shortName: "5ST", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#dc2626", secondaryColor: "#fbbf24",
    played: 5, wins: 2, losses: 3, pointsFor: 56, pointsAgainst: 76,
    rankingPoints: 56, rank: 4,
  },
  {
    id: "t18_navair", name: "NavAir", shortName: "NAV", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#0284c7", secondaryColor: "#ffffff",
    played: 2, wins: 1, losses: 1, pointsFor: 23, pointsAgainst: 18,
    rankingPoints: 23, rank: 5,
  },
  {
    id: "t18_tearz", name: "Tearz", shortName: "TEZ", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#0f172a", secondaryColor: "#38bdf8",
    played: 3, wins: 1, losses: 2, pointsFor: 38, pointsAgainst: 41,
    rankingPoints: 38, rank: 6,
  },
  {
    id: "t18_playnext", name: "play next", shortName: "PLN", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#059669", secondaryColor: "#ffffff",
    played: 3, wins: 1, losses: 2, pointsFor: 26, pointsAgainst: 35,
    rankingPoints: 26, rank: 7,
  },
  {
    id: "t18_airhustlers", name: "Air Hustlers", shortName: "AIR", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#1e293b", secondaryColor: "#94a3b8",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 8,
    rankingPoints: 0, rank: 8,
  },
  {
    id: "t18_dyurag", name: "ДЮРАГ", shortName: "DYR", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#78350f", secondaryColor: "#fbbf24",
    played: 2, wins: 0, losses: 2, pointsFor: 10, pointsAgainst: 39,
    rankingPoints: 10, rank: 9,
  },
  {
    id: "t18_otyrar", name: "ОТЫРАР", shortName: "OTR", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#065f46", secondaryColor: "#a7f3d0",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 14,
    rankingPoints: 0, rank: 10,
  },
  {
    id: "t18_guf", name: "Guf", shortName: "GUF", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#6b7280", secondaryColor: "#ffffff",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 22,
    rankingPoints: 0, rank: 11,
  },
  // ── New teams that appeared in tour3 ──────────────────────────────────────
  {
    id: "t18_bo1ston", name: "Bo1ston", shortName: "BST", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#1e293b",
    played: 4, wins: 3, losses: 1, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 2,
  },
  {
    id: "t18_2x2", name: "2×2", shortName: "2X2", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#7c3aed",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 12,
  },
  {
    id: "t18_nks", name: "NKS", shortName: "NKS", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#0369a1",
    played: 2, wins: 1, losses: 1, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 6,
  },
  {
    id: "t18_turon", name: "Turon", shortName: "TRN", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#15803d",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 12,
  },
  {
    id: "t18_pxty", name: "PXTY", shortName: "PXT", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#374151",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 12,
  },
  {
    id: "t18_overtime_18", name: "overtime (18+)", shortName: "OVT", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#d97706",
    played: 2, wins: 1, losses: 1, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 7,
  },
  {
    id: "t18_squad", name: "Squad", shortName: "SQD", city: "Ташкент", country: "UZ",
    format: "3x3", category: "18+",
    primaryColor: "#dc2626",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 12,
  },
];

// ═════════════════════════════════════════════════════════════════════════════
//  U14 TEAMS
// ═════════════════════════════════════════════════════════════════════════════

export const TEAMS_U14: LeagueTeam[] = [
  {
    id: "t14_bearbasket", name: "BearBasketTeam 🏀", shortName: "BBT", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#92400e", secondaryColor: "#fbbf24",
    played: 5, wins: 4, losses: 1, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 1,
  },
  {
    id: "t14_medvedi", name: "Медведи 🐻", shortName: "MDV", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#78350f", secondaryColor: "#fcd34d",
    played: 5, wins: 3, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 2,
  },
  {
    id: "t14_hooptime", name: "HoopTime", shortName: "HTP", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#1d4ed8", secondaryColor: "#ffffff",
    played: 5, wins: 3, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 3,
  },
  {
    id: "t14_dolphins12", name: "DOLPHINS 12", shortName: "D12", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#0284c7", secondaryColor: "#bae6fd",
    played: 5, wins: 3, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 4,
  },
  {
    id: "t14_iba", name: "IBA", shortName: "IBA", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#7c3aed", secondaryColor: "#ffffff",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 5,
  },
  {
    id: "t14_dolphins13", name: "DOLPHINS 13", shortName: "D13", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#0369a1", secondaryColor: "#bae6fd",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 6,
  },
  {
    id: "t14_145shkola", name: "145 Школа", shortName: "145", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#15803d", secondaryColor: "#ffffff",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 7,
  },
  {
    id: "t14_newgen", name: "New Gen", shortName: "NGN", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#dc2626", secondaryColor: "#ffffff",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 8,
  },
  {
    id: "t14_hooptime2", name: "HoopTime2", shortName: "HT2", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#1e40af", secondaryColor: "#93c5fd",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 9,
  },
  {
    id: "t14_blacktigers", name: "BLACK TIGERS", shortName: "BTG", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#111827", secondaryColor: "#f59e0b",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 10,
  },
  {
    id: "t14_67boiiz", name: "67boiiz", shortName: "67B", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#be185d", secondaryColor: "#fce7f3",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 11,
  },
  {
    id: "t14_dolphins_j", name: "Долфинс u14 Дж", shortName: "DLJ", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#0284c7", secondaryColor: "#e0f2fe",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 12,
  },
  {
    id: "t14_champions", name: "CHAMPIONS", shortName: "CHP", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#b45309", secondaryColor: "#fef3c7",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 13,
  },
  {
    id: "t14_160school", name: "160school", shortName: "160", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#374151", secondaryColor: "#d1d5db",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 14,
  },
  {
    id: "t14_rocoypnaya", name: "Росоупная", shortName: "RSP", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U14", primaryColor: "#6d28d9", secondaryColor: "#ede9fe",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 15,
  },
];

// ═════════════════════════════════════════════════════════════════════════════
//  U16 TEAMS
// ═════════════════════════════════════════════════════════════════════════════

export const TEAMS_U16: LeagueTeam[] = [
  {
    id: "t16_dolphins", name: "DOLPHINS", shortName: "DLP", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#0284c7", secondaryColor: "#bae6fd",
    played: 5, wins: 4, losses: 1, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 1,
  },
  {
    id: "t16_afnf", name: "Team AFNF", shortName: "AFN", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#15803d", secondaryColor: "#bbf7d0",
    played: 5, wins: 3, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 2,
  },
  {
    id: "t16_hoops", name: "Hoops", shortName: "HPS", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#dc2626", secondaryColor: "#ffffff",
    played: 5, wins: 3, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 3,
  },
  {
    id: "t16_blackpanther", name: "Black Panther TEAM", shortName: "BPT", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#1e293b", secondaryColor: "#7c3aed",
    played: 5, wins: 2, losses: 3, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 4,
  },
  {
    id: "t16_bcbars", name: "Bc bars🧨", shortName: "BCB", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#b91c1c", secondaryColor: "#fef2f2",
    played: 3, wins: 2, losses: 1, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 5,
  },
  {
    id: "t16_nwb1", name: "NWB 1", shortName: "NWB", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#0f172a", secondaryColor: "#64748b",
    played: 2, wins: 1, losses: 1, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 6,
  },
  {
    id: "t16_unexpected", name: "Unexpected", shortName: "UNX", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#7c3aed", secondaryColor: "#ede9fe",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 7,
  },
  {
    id: "t16_overtime", name: "Overtime", shortName: "OVT", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#d97706", secondaryColor: "#1c1917",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 8,
  },
  {
    id: "t16_chotam", name: "ЧО ТАМ", shortName: "ЧТМ", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#be185d", secondaryColor: "#fce7f3",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 9,
  },
  {
    id: "t16_bisibars", name: "биси барс", shortName: "BSB", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#065f46", secondaryColor: "#6ee7b7",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 10,
  },
  {
    id: "t16_chotam2", name: "ЧО ТАМ 2", shortName: "ЧТ2", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#9d174d", secondaryColor: "#fbcfe8",
    played: 3, wins: 0, losses: 3, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 11,
  },
  {
    id: "t16_newgens", name: "New gens", shortName: "NGS", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#374151", secondaryColor: "#f9fafb",
    played: 3, wins: 0, losses: 3, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 12,
  },
  {
    id: "t16_dolphins11", name: "Dolphins 11", shortName: "D11", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#0369a1", secondaryColor: "#e0f2fe",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 13,
  },
  // ── Tour3-specific U16 teams ──────────────────────────────────────────────
  {
    id: "t16_dolphins_u16", name: "DOLPHINS u16", shortName: "DU6", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#0284c7", secondaryColor: "#bae6fd",
    played: 4, wins: 4, losses: 0, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 1,
  },
  {
    id: "t16_160shkola", name: "160 школа", shortName: "160Ш", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#374151",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 4,
  },
  {
    id: "t16_chainatown", name: "Чайнатаун", shortName: "ЧНТ", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#b45309",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 8,
  },
  {
    id: "t16_cska", name: "cska", shortName: "CSK", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#dc2626",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 9,
  },
  {
    id: "t16_oreon", name: "Oreon dept", shortName: "ORN", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U16", primaryColor: "#6b7280",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 10,
  },
];

// ═════════════════════════════════════════════════════════════════════════════
//  U18 TEAMS — New category introduced in 3rd TOUR
// ═════════════════════════════════════════════════════════════════════════════

export const TEAMS_U18: LeagueTeam[] = [
  {
    id: "t18u_namangan", name: "NAMANGAN team", shortName: "NAM", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U18", primaryColor: "#1d4ed8",
    played: 5, wins: 5, losses: 0, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 1,
  },
  {
    id: "t18u_young_thugs", name: "Young thugs", shortName: "YTH", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U18", primaryColor: "#7c3aed",
    played: 4, wins: 2, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 2,
  },
  {
    id: "t18u_nn", name: "NN", shortName: "NN", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U18", primaryColor: "#1e293b",
    played: 4, wins: 2, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 3,
  },
  {
    id: "t18u_dolphins", name: "DOLPHINS (U18)", shortName: "DLP", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U18", primaryColor: "#0284c7",
    played: 4, wins: 1, losses: 3, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 4,
  },
  {
    id: "t18u_overtime", name: "overtime (U18)", shortName: "OVT", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U18", primaryColor: "#d97706",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 5,
  },
  {
    id: "t18u_lynx", name: "LYNX", shortName: "LNX", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U18", primaryColor: "#059669",
    played: 2, wins: 0, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 6,
  },
  {
    id: "t18u_tearz", name: "Tearz (U18)", shortName: "TEZ", city: "Ташкент", country: "UZ",
    format: "3x3", category: "U18", primaryColor: "#0f172a",
    played: 3, wins: 1, losses: 2, pointsFor: 0, pointsAgainst: 0, rankingPoints: 0, rank: 7,
  },
];

// ═════════════════════════════════════════════════════════════════════════════
//  PLAYERS — As registered on FIBA platform
// ═════════════════════════════════════════════════════════════════════════════

export const PLAYERS: LeaguePlayer[] = [
  // ── NAMANGAN team (18+) — Final 4th TOUR vs Banana Team (win 20:18) ──────
  // Stats source: preview.html — only MADE values, no attempts
  {
    id: "p_nam1", displayName: "Ibragim Avazov", teamId: "t18_namangan", country: "UZ",
    jerseyNumber: 33, gamesPlayed: 5, wins: 5, losses: 0,
    onePointMade: 2, twoPointMade: 0, freeThrowMade: 0,
    rebounds: 1, assists: 0, fouls: 1,
  },
  {
    id: "p_nam2", displayName: "Salohiddin Toychiyev", teamId: "t18_namangan", country: "UZ",
    jerseyNumber: 15, gamesPlayed: 5, wins: 5, losses: 0,
    onePointMade: 3, twoPointMade: 0, freeThrowMade: 1,
    rebounds: 1, assists: 1, fouls: 1,
  },
  {
    id: "p_nam3", displayName: "Daniyor Novikovic", teamId: "t18_namangan", country: "UZ",
    jerseyNumber: 11, gamesPlayed: 5, wins: 5, losses: 0,
    onePointMade: 1, twoPointMade: 0, freeThrowMade: 0,
    rebounds: 2, assists: 0, fouls: 0,
  },
  {
    id: "p_nam4", displayName: "Ramazan Sarkiyev", teamId: "t18_namangan", country: "UZ",
    jerseyNumber: 9, gamesPlayed: 5, wins: 5, losses: 0,
    // 3×1PT + 4×2PT + 2×FT = 13 pts
    onePointMade: 3, twoPointMade: 4, freeThrowMade: 2,
    rebounds: 3, assists: 2, fouls: 0,
    fibaRankingPoints: 103,
  },

  // ── Banana Team (18+) — Final 4th TOUR vs NAMANGAN (loss 18:20) ──────────
  {
    id: "p_ban1", displayName: "Азиз Абдурашидов", teamId: "t18_banana", country: "UZ",
    jerseyNumber: 7, gamesPlayed: 5, wins: 4, losses: 1,
    onePointMade: 4, twoPointMade: 0, freeThrowMade: 0,
    rebounds: 6, assists: 1, fouls: 0,
  },
  {
    id: "p_ban2", displayName: "Тимур Арипов", teamId: "t18_banana", country: "UZ",
    jerseyNumber: 12, gamesPlayed: 5, wins: 4, losses: 1,
    // 4×2PT = 8 pts
    onePointMade: 0, twoPointMade: 4, freeThrowMade: 0,
    rebounds: 1, assists: 0, fouls: 0,
  },
  {
    id: "p_ban3", displayName: "Николай Евдокимов", teamId: "t18_banana", country: "UZ",
    jerseyNumber: 0, gamesPlayed: 5, wins: 4, losses: 1,
    // 4×1PT + 1×2PT = 6 pts
    onePointMade: 4, twoPointMade: 1, freeThrowMade: 0,
    rebounds: 9, assists: 0, fouls: 5,
  },
  {
    id: "p_ban4", displayName: "Хусейн Мирманов", teamId: "t18_banana", country: "UZ",
    jerseyNumber: 10, gamesPlayed: 5, wins: 4, losses: 1,
    onePointMade: 0, twoPointMade: 0, freeThrowMade: 0,
    rebounds: 1, assists: 1, fouls: 0,
  },

  // ── Unstoppable (18+) ────────────────────────────────────
  { id: "p_uns1", displayName: "Danila Kaldin",        teamId: "t18_unstoppable", country: "UZ" },
  { id: "p_uns2", displayName: "Эмиль Касимов",        teamId: "t18_unstoppable", country: "UZ" },
  { id: "p_uns3", displayName: "Мурад Рамматов",       teamId: "t18_unstoppable", country: "UZ" },
  { id: "p_uns4", displayName: "Давид Тамашпольский",  teamId: "t18_unstoppable", country: "UZ" },

  // ── 5STAR (18+) ──────────────────────────────────────────
  { id: "p_5st1", displayName: "Alishomon Azarov",    teamId: "t18_5star", country: "UZ" },
  { id: "p_5st2", displayName: "Arslanbek Safin",     teamId: "t18_5star", country: "UZ" },
  { id: "p_5st3", displayName: "Said Kamalov",        teamId: "t18_5star", country: "UZ" },
  { id: "p_5st4", displayName: "Никита Ногай",        teamId: "t18_5star", country: "UZ" },

  // ── Tearz (18+) ──────────────────────────────────────────
  { id: "p_tez1", displayName: "Ilya Mezentsev",      teamId: "t18_tearz", country: "UZ" },
  { id: "p_tez2", displayName: "Диас Рахимкулов",     teamId: "t18_tearz", country: "UZ" },
  { id: "p_tez3", displayName: "Владимир Чернов",     teamId: "t18_tearz", country: "UZ" },
  { id: "p_tez4", displayName: "Эмир Эркинов",        teamId: "t18_tearz", country: "UZ" },

  // ── play next (18+) ──────────────────────────────────────
  { id: "p_pln1", displayName: "Marat Yanbayev",      teamId: "t18_playnext", country: "UZ" },
  { id: "p_pln2", displayName: "Вадим Ким",           teamId: "t18_playnext", country: "UZ" },
  { id: "p_pln3", displayName: "Данил Трубачев",      teamId: "t18_playnext", country: "UZ" },

  // ── NavAir (18+) ─────────────────────────────────────────
  { id: "p_nav1", displayName: "Mavikayev Rinat",     teamId: "t18_navair",   country: "UZ" },

  // ── Air Hustlers (18+) ───────────────────────────────────
  { id: "p_air1", displayName: "Ibrohim Nigmanov",    teamId: "t18_airhustlers", country: "UZ" },
  { id: "p_air2", displayName: "Абдумалик Муродаллиев", teamId: "t18_airhustlers", country: "UZ" },

  // ── Guf (18+) ────────────────────────────────────────────
  { id: "p_guf1", displayName: "Asadbek Avalov",      teamId: "t18_guf", country: "UZ" },
  { id: "p_guf2", displayName: "Siynush Baratov",     teamId: "t18_guf", country: "UZ" },
  { id: "p_guf3", displayName: "Diyorbek Fahritgrayev", teamId: "t18_guf", country: "UZ" },
  { id: "p_guf4", displayName: "Komiljon O'kirov",    teamId: "t18_guf", country: "UZ" },

  // ── ОТЫРАР (18+) ─────────────────────────────────────────
  { id: "p_otr1", displayName: "Sayat Beksultan",     teamId: "t18_otyrar", country: "UZ" },
  { id: "p_otr2", displayName: "Дахнет Айтбек",       teamId: "t18_otyrar", country: "UZ" },
  { id: "p_otr3", displayName: "Фокен Кужабай",       teamId: "t18_otyrar", country: "UZ" },
  { id: "p_otr4", displayName: "Файзылбек Серикулы",  teamId: "t18_otyrar", country: "UZ" },

  // ── Bo1ston (18+, tour3) ──────────────────────────────────
  { id: "p_bst1", displayName: "Kamron Daminovich",   teamId: "t18_bo1ston", country: "UZ" },
  { id: "p_bst2", displayName: "Ansar Joldibayev",    teamId: "t18_bo1ston", country: "UZ" },
  { id: "p_bst3", displayName: "Islam Xalmardov",     teamId: "t18_bo1ston", country: "UZ" },
  { id: "p_bst4", displayName: "Abdulloh Yergashev",  teamId: "t18_bo1ston", country: "UZ" },

  // ── 2×2 (18+, tour3) ─────────────────────────────────────
  { id: "p_2x21", displayName: "Rustambek Azimov",    teamId: "t18_2x2", country: "UZ" },
  { id: "p_2x22", displayName: "kamran juraev",       teamId: "t18_2x2", country: "UZ" },
  { id: "p_2x23", displayName: "Игорь Захаров",       teamId: "t18_2x2", country: "UZ" },
  { id: "p_2x24", displayName: "Алексей Пивцов",      teamId: "t18_2x2", country: "UZ" },

  // ── NKS (18+, tour3) ─────────────────────────────────────
  { id: "p_nks1", displayName: "Asadbek Isabaev",     teamId: "t18_nks", country: "UZ" },
  { id: "p_nks2", displayName: "Nikita Lee",          teamId: "t18_nks", country: "UZ" },
  { id: "p_nks3", displayName: "Meyrambek Nuraddinov",teamId: "t18_nks", country: "UZ" },
  { id: "p_nks4", displayName: "Zurab Sharashenidzе", teamId: "t18_nks", country: "UZ" },

  // ── Turon (18+, tour3) ───────────────────────────────────
  { id: "p_trn1", displayName: "Asadbek Avalov",      teamId: "t18_turon", country: "UZ" },
  { id: "p_trn2", displayName: "Siyonush Baratov",    teamId: "t18_turon", country: "UZ" },
  { id: "p_trn3", displayName: "Diyorbek Fahritgrayev", teamId: "t18_turon", country: "UZ" },
  { id: "p_trn4", displayName: "Komiljon Oʻkirov",    teamId: "t18_turon", country: "UZ" },

  // ── overtime 18+ (tour3) ─────────────────────────────────
  { id: "p_ovt18_1", displayName: "Timur Khodzhaev",  teamId: "t18_overtime_18", country: "UZ" },
  { id: "p_ovt18_2", displayName: "Дмитрий Ким",      teamId: "t18_overtime_18", country: "UZ" },
  { id: "p_ovt18_3", displayName: "Руслан Рахимбаев", teamId: "t18_overtime_18", country: "UZ" },
  { id: "p_ovt18_4", displayName: "Шохрух Шохрух",    teamId: "t18_overtime_18", country: "UZ" },

  // ── Squad (18+, tour3) ───────────────────────────────────
  { id: "p_sqd1", displayName: "Akmal Sherbayev",     teamId: "t18_squad", country: "UZ" },
  { id: "p_sqd2", displayName: "Вадим Ким",           teamId: "t18_squad", country: "UZ" },
  { id: "p_sqd3", displayName: "Андрей Ли",           teamId: "t18_squad", country: "UZ" },
  { id: "p_sqd4", displayName: "Данил Трубачев",      teamId: "t18_squad", country: "UZ" },

  // ── BearBasketTeam (U14) ─────────────────────────────────
  { id: "p_bbt1", displayName: "Ashurov",         teamId: "t14_bearbasket", country: "UZ" },
  { id: "p_bbt2", displayName: "Islom2012",       teamId: "t14_bearbasket", country: "UZ" },
  { id: "p_bbt3", displayName: "TimofeyTyan",     teamId: "t14_bearbasket", country: "UZ" },
  { id: "p_bbt4", displayName: "Usmonov",         teamId: "t14_bearbasket", country: "UZ" },

  // ── Медведи (U14) ────────────────────────────────────────
  { id: "p_mdv1", displayName: "AlixanKadirov",       teamId: "t14_medvedi", country: "UZ" },
  { id: "p_mdv2", displayName: "Alnakaev",             teamId: "t14_medvedi", country: "UZ" },
  { id: "p_mdv3", displayName: "IsakovAlan",           teamId: "t14_medvedi", country: "UZ" },
  { id: "p_mdv4", displayName: "SHaymardanovArtem",    teamId: "t14_medvedi", country: "UZ" },

  // ── HoopTime (U14) ───────────────────────────────────────
  { id: "p_htp1", displayName: "Shazamov",         teamId: "t14_hooptime", country: "UZ" },
  { id: "p_htp2", displayName: "Diyor Khadirov",   teamId: "t14_hooptime", country: "UZ" },
  { id: "p_htp3", displayName: "Ruslan Rustamov",  teamId: "t14_hooptime", country: "UZ" },
  { id: "p_htp4", displayName: "Зёйонс С.",        teamId: "t14_hooptime", country: "UZ" },

  // ── DOLPHINS 12 (U14) ────────────────────────────────────
  { id: "p_d121", displayName: "Gasanovimran2013",    teamId: "t14_dolphins12", country: "UZ" },
  { id: "p_d122", displayName: "Maksim10998",         teamId: "t14_dolphins12", country: "UZ" },
  { id: "p_d123", displayName: "RamazanovBehruz",     teamId: "t14_dolphins12", country: "UZ" },
  { id: "p_d124", displayName: "Shokirov Saloh2012",  teamId: "t14_dolphins12", country: "UZ" },

  // ── IBA (U14) ────────────────────────────────────────────
  { id: "p_iba1", displayName: "Akbar2012",        teamId: "t14_iba", country: "UZ" },
  { id: "p_iba2", displayName: "LiMark2012",       teamId: "t14_iba", country: "UZ" },
  { id: "p_iba3", displayName: "Matveiy12",        teamId: "t14_iba", country: "UZ" },
  { id: "p_iba4", displayName: "Aram Arakenyan",   teamId: "t14_iba", country: "UZ" },

  // ── 145 Школа (U14) ──────────────────────────────────────
  { id: "p_1451", displayName: "TegayValera",      teamId: "t14_145shkola", country: "UZ" },
  { id: "p_1452", displayName: "TenArtiyom",       teamId: "t14_145shkola", country: "UZ" },
  { id: "p_1453", displayName: "Kamron 06",        teamId: "t14_145shkola", country: "UZ" },
  { id: "p_1454", displayName: "Sokhib Sodikov",   teamId: "t14_145shkola", country: "UZ" },

  // ── New Gen (U14) ────────────────────────────────────────
  { id: "p_ng1", displayName: "PopovMaxim2013",        teamId: "t14_newgen", country: "UZ" },
  { id: "p_ng2", displayName: "ZagorodnikovMaxim2013", teamId: "t14_newgen", country: "UZ" },
  { id: "p_ng3", displayName: "Erdin Kim",             teamId: "t14_newgen", country: "UZ" },
  { id: "p_ng4", displayName: "Kasimova Vera",         teamId: "t14_newgen", country: "UZ" },

  // ── DOLPHINS 13 (U14) ────────────────────────────────────
  { id: "p_d131", displayName: "Roman9000",            teamId: "t14_dolphins13", country: "UZ" },
  { id: "p_d132", displayName: "SunnatAllanzarov2013", teamId: "t14_dolphins13", country: "UZ" },
  { id: "p_d133", displayName: "Xoik2012",             teamId: "t14_dolphins13", country: "UZ" },
  { id: "p_d134", displayName: "Zaynetdin292874",      teamId: "t14_dolphins13", country: "UZ" },

  // ── HoopTime2 (U14) ──────────────────────────────────────
  { id: "p_ht21", displayName: "Abror",            teamId: "t14_hooptime2", country: "UZ" },
  { id: "p_ht22", displayName: "Chekurinkamran2013", teamId: "t14_hooptime2", country: "UZ" },
  { id: "p_ht23", displayName: "Алихан Бурханов",  teamId: "t14_hooptime2", country: "UZ" },
  { id: "p_ht24", displayName: "Элдос Косымов",    teamId: "t14_hooptime2", country: "UZ" },

  // ── BLACK TIGERS (U14) ───────────────────────────────────
  { id: "p_btg1", displayName: "Danil 2012",       teamId: "t14_blacktigers", country: "UZ" },
  { id: "p_btg2", displayName: "Anvar Toishtemrov",teamId: "t14_blacktigers", country: "UZ" },
  { id: "p_btg3", displayName: "Maks Komilov",     teamId: "t14_blacktigers", country: "UZ" },
  { id: "p_btg4", displayName: "Асад Сулейманов",  teamId: "t14_blacktigers", country: "UZ" },

  // ── 67boiiz (U14) ────────────────────────────────────────
  { id: "p_67b1", displayName: "Artem 12",         teamId: "t14_67boiiz", country: "UZ" },
  { id: "p_67b2", displayName: "Мухаммаджон 12",   teamId: "t14_67boiiz", country: "UZ" },
  { id: "p_67b3", displayName: "Shohruz Ne saidov",teamId: "t14_67boiiz", country: "UZ" },
  { id: "p_67b4", displayName: "Ahmad R.",          teamId: "t14_67boiiz", country: "UZ" },

  // ── Долфинс u14 Дж (U14) ─────────────────────────────────
  { id: "p_dlj1", displayName: "Artem9900725",     teamId: "t14_dolphins_j", country: "UZ" },
  { id: "p_dlj2", displayName: "Dany13948",        teamId: "t14_dolphins_j", country: "UZ" },
  { id: "p_dlj3", displayName: "Isfandiyorkarimov",teamId: "t14_dolphins_j", country: "UZ" },

  // ── Росоупная (U14) ──────────────────────────────────────
  { id: "p_rsp1", displayName: "ZaharvamDavid2012",teamId: "t14_rocoypnaya", country: "UZ" },
  { id: "p_rsp2", displayName: "Roman Giblin",     teamId: "t14_rocoypnaya", country: "UZ" },
  { id: "p_rsp3", displayName: "Artem Son",        teamId: "t14_rocoypnaya", country: "UZ" },
  { id: "p_rsp4", displayName: "Владиаслав Тен",   teamId: "t14_rocoypnaya", country: "UZ" },

  // ── 160school (U14) ──────────────────────────────────────
  { id: "p_160_1", displayName: "Mirodil Karimbekov", teamId: "t14_160school", country: "UZ" },
  { id: "p_160_2", displayName: "Сани-гани Б.",       teamId: "t14_160school", country: "UZ" },

  // ── DOLPHINS (U16) ───────────────────────────────────────
  { id: "p_dlp1", displayName: "Kholmatovimran",   teamId: "t16_dolphins", country: "UZ" },
  { id: "p_dlp2", displayName: "Kamron Kuldashev", teamId: "t16_dolphins", country: "UZ" },
  { id: "p_dlp3", displayName: "Timur Rakhmanov",  teamId: "t16_dolphins", country: "UZ" },
  { id: "p_dlp4", displayName: "Gamzat",           teamId: "t16_dolphins", country: "UZ" },

  // ── Black Panther TEAM (U16) ─────────────────────────────
  { id: "p_bpt1", displayName: "Azamat Akromov",   teamId: "t16_blackpanther", country: "UZ" },
  { id: "p_bpt2", displayName: "Sergey Kim",       teamId: "t16_blackpanther", country: "UZ" },
  { id: "p_bpt3", displayName: "Назар Иджанназов", teamId: "t16_blackpanther", country: "UZ" },
  { id: "p_bpt4", displayName: "Зафарион Купасынов",teamId: "t16_blackpanther", country: "UZ" },

  // ── Bc bars🧨 (U16) ──────────────────────────────────────
  { id: "p_bcb1", displayName: "Danil G.",         teamId: "t16_bcbars", country: "UZ" },
  { id: "p_bcb2", displayName: "Marned Mamedov",   teamId: "t16_bcbars", country: "UZ" },
  { id: "p_bcb3", displayName: "Aralan Seidaliev", teamId: "t16_bcbars", country: "UZ" },
  { id: "p_bcb4", displayName: "Самандар Султанов",teamId: "t16_bcbars", country: "UZ" },

  // ── NWB 1 (U16) ──────────────────────────────────────────
  { id: "p_nwb1", displayName: "Samir Babaev",          teamId: "t16_nwb1", country: "UZ" },
  { id: "p_nwb2", displayName: "Temurbek Egamberdiev",  teamId: "t16_nwb1", country: "UZ" },
  { id: "p_nwb3", displayName: "Islombek Ravshanov",    teamId: "t16_nwb1", country: "UZ" },
  { id: "p_nwb4", displayName: "Каадамбаев Амир",       teamId: "t16_nwb1", country: "UZ" },

  // ── Unexpected (U16) ─────────────────────────────────────
  { id: "p_unx1", displayName: "Amir Minvaliev",   teamId: "t16_unexpected", country: "UZ" },
  { id: "p_unx2", displayName: "Akmal Tashpulatov",teamId: "t16_unexpected", country: "UZ" },
  { id: "p_unx3", displayName: "Allan Tursunbaev", teamId: "t16_unexpected", country: "UZ" },
  { id: "p_unx4", displayName: "Ruslan Tyo",       teamId: "t16_unexpected", country: "UZ" },

  // ── Overtime (U16) ───────────────────────────────────────
  { id: "p_ovt1", displayName: "Emil Bulatov",         teamId: "t16_overtime", country: "UZ" },
  { id: "p_ovt2", displayName: "Behruz Khankhadzhayev",teamId: "t16_overtime", country: "UZ" },
  { id: "p_ovt3", displayName: "Ozodbek Oripov",       teamId: "t16_overtime", country: "UZ" },

  // ── ЧО ТАМ (U16) ─────────────────────────────────────────
  { id: "p_cht1", displayName: "Азим Бабаев",      teamId: "t16_chotam", country: "UZ" },
  { id: "p_cht2", displayName: "Ярослав Ким",      teamId: "t16_chotam", country: "UZ" },
  { id: "p_cht3", displayName: "Озод Хлаждаров",   teamId: "t16_chotam", country: "UZ" },
  { id: "p_cht4", displayName: "Наиль Серебро",    teamId: "t16_chotam", country: "UZ" },

  // ── ЧО ТАМ 2 (U16) ───────────────────────────────────────
  { id: "p_ct21", displayName: "Aygul",            teamId: "t16_chotam2", country: "UZ" },
  { id: "p_ct22", displayName: "Husan007",         teamId: "t16_chotam2", country: "UZ" },
  { id: "p_ct23", displayName: "Hasan Abdumannonov",teamId: "t16_chotam2", country: "UZ" },
  { id: "p_ct24", displayName: "Arthur Daminov",   teamId: "t16_chotam2", country: "UZ" },

  // ── биси барс (U16) ──────────────────────────────────────
  { id: "p_bsb1", displayName: "Arslan Sagitov",   teamId: "t16_bisibars", country: "UZ" },
  { id: "p_bsb2", displayName: "Samir Umarov",     teamId: "t16_bisibars", country: "UZ" },
  { id: "p_bsb3", displayName: "Artem Vergizov",   teamId: "t16_bisibars", country: "UZ" },
  { id: "p_bsb4", displayName: "Тохир Абдувалиев", teamId: "t16_bisibars", country: "UZ" },

  // ── New gens (U16) ───────────────────────────────────────
  { id: "p_ngs1", displayName: "King 1",           teamId: "t16_newgens", country: "UZ" },
  { id: "p_ngs2", displayName: "Marsel Ismanov",   teamId: "t16_newgens", country: "UZ" },
  { id: "p_ngs3", displayName: "Rayshan Kudratov", teamId: "t16_newgens", country: "UZ" },
  { id: "p_ngs4", displayName: "Raya",             teamId: "t16_newgens", country: "UZ" },

  // ── Dolphins 11 (U16) ────────────────────────────────────
  { id: "p_d111", displayName: "Sobur277373",          teamId: "t16_dolphins11", country: "UZ" },
  { id: "p_d112", displayName: "Yusuf Pirmukhamedov",  teamId: "t16_dolphins11", country: "UZ" },
  { id: "p_d113", displayName: "Boirjon Saktiodjayev", teamId: "t16_dolphins11", country: "UZ" },
  { id: "p_d114", displayName: "Денис Сидоркин",       teamId: "t16_dolphins11", country: "UZ" },

  // ── CHAMPIONS (U14) ──────────────────────────────────────
  { id: "p_chp1", displayName: "Абубакин А.",  teamId: "t14_champions", country: "UZ" },
  { id: "p_chp2", displayName: "Абдунтов М.",  teamId: "t14_champions", country: "UZ" },
  { id: "p_chp3", displayName: "Тарю Ш.",      teamId: "t14_champions", country: "UZ" },
  { id: "p_chp4", displayName: "Иброхим Ш.",   teamId: "t14_champions", country: "UZ" },

  // ── NAMANGAN team (U18) ──────────────────────────────────
  { id: "p_u18_nam1", displayName: "Ibragim Avazov",    teamId: "t18u_namangan", country: "UZ" },
  { id: "p_u18_nam2", displayName: "Ali Toychiev",      teamId: "t18u_namangan", country: "UZ" },
  { id: "p_u18_nam3", displayName: "Дарий Нёкович",     teamId: "t18u_namangan", country: "UZ" },
  { id: "p_u18_nam4", displayName: "Рамазан Саркиев",   teamId: "t18u_namangan", country: "UZ" },

  // ── Young thugs (U18) ────────────────────────────────────
  { id: "p_yth1", displayName: "Orhan Gedikli",         teamId: "t18u_young_thugs", country: "UZ" },
  { id: "p_yth2", displayName: "Бахтиёр Сайдрасулов",  teamId: "t18u_young_thugs", country: "UZ" },
  { id: "p_yth3", displayName: "Алишер Игамбердиев",    teamId: "t18u_young_thugs", country: "UZ" },
  { id: "p_yth4", displayName: "Михио Рамматов",        teamId: "t18u_young_thugs", country: "UZ" },

  // ── NN (U18) ─────────────────────────────────────────────
  { id: "p_u18_nn1", displayName: "Islam",              teamId: "t18u_nn", country: "UZ" },
  { id: "p_u18_nn2", displayName: "alishomon_azarov2008", teamId: "t18u_nn", country: "UZ" },
  { id: "p_u18_nn3", displayName: "Сразамир Алимов",    teamId: "t18u_nn", country: "UZ" },
  { id: "p_u18_nn4", displayName: "Диас Рахимкулов",    teamId: "t18u_nn", country: "UZ" },
];

// ═════════════════════════════════════════════════════════════════════════════
//  MATCHES — 18+ category (all recorded games)
// ═════════════════════════════════════════════════════════════════════════════

export const MATCHES_18PLUS: Match[] = [
  // ── Pool Stage (tour4) ─────────────────────────────────
  // Pool A
  { id: "m18_pA1", tournamentId: "tour4", category: "18+", round: "pool", poolName: "A",
    team1Id: "t18_banana",   team2Id: "t18_guf",      score1: 1,  score2: 0,  time: "16:55", status: "completed", note: "forfeit" },
  { id: "m18_pA2", tournamentId: "tour4", category: "18+", round: "pool", poolName: "A",
    team1Id: "t18_playnext", team2Id: "t18_guf",      score1: 1,  score2: 0,  time: "17:25", status: "completed", note: "forfeit" },
  { id: "m18_pA3", tournamentId: "tour4", category: "18+", round: "pool", poolName: "A",
    team1Id: "t18_banana",   team2Id: "t18_playnext", score1: 21, score2: 15, time: "17:40", status: "completed" },

  // Pool B
  { id: "m18_pB1", tournamentId: "tour4", category: "18+", round: "pool", poolName: "B",
    team1Id: "t18_unstoppable", team2Id: "t18_5star",  score1: 13, score2: 9,  time: "16:55", status: "completed" },
  { id: "m18_pB2", tournamentId: "tour4", category: "18+", round: "pool", poolName: "B",
    team1Id: "t18_otyrar",     team2Id: "t18_5star",  score1: 0,  score2: 1,  time: "17:25", status: "completed", note: "forfeit" },
  { id: "m18_pB3", tournamentId: "tour4", category: "18+", round: "pool", poolName: "B",
    team1Id: "t18_unstoppable", team2Id: "t18_otyrar", score1: 1,  score2: 0,  time: "17:55", status: "completed", note: "forfeit" },

  // Pool C
  { id: "m18_pC1", tournamentId: "tour4", category: "18+", round: "pool", poolName: "C",
    team1Id: "t18_namangan", team2Id: "t18_dyurag", score1: 22, score2: 3,  time: "17:10", status: "completed" },
  { id: "m18_pC2", tournamentId: "tour4", category: "18+", round: "pool", poolName: "C",
    team1Id: "t18_tearz",    team2Id: "t18_dyurag", score1: 17, score2: 7,  time: "17:40", status: "completed" },
  { id: "m18_pC3", tournamentId: "tour4", category: "18+", round: "pool", poolName: "C",
    team1Id: "t18_namangan", team2Id: "t18_tearz",  score1: 20, score2: 11, time: "17:55", status: "completed" },

  // Pool D
  { id: "m18_pD1", tournamentId: "tour4", category: "18+", round: "pool", poolName: "D",
    team1Id: "t18_navair",     team2Id: "t18_airhustlers", score1: 7,  score2: 0,  time: "17:10", status: "completed" },

  // ── Quarterfinals (tour4) ─────────────────────────────────
  { id: "m18_qf1", tournamentId: "tour4", category: "18+", round: "quarterfinal",
    team1Id: "t18_navair",     team2Id: "t18_5star",    score1: 16, score2: 18, time: "19:10", status: "completed" },
  { id: "m18_qf2", tournamentId: "tour4", category: "18+", round: "quarterfinal",
    team1Id: "t18_banana",     team2Id: "t18_tearz",    score1: 17, score2: 10, time: "19:10", status: "completed" },
  { id: "m18_qf3", tournamentId: "tour4", category: "18+", round: "quarterfinal",
    team1Id: "t18_namangan",   team2Id: "t18_playnext", score1: 22, score2: 10, time: "19:25", status: "completed" },
  { id: "m18_qf4", tournamentId: "tour4", category: "18+", round: "quarterfinal",
    team1Id: "t18_unstoppable", team2Id: "t18_airhustlers", score1: 1, score2: 0, time: "19:25", status: "completed", note: "forfeit" },

  // ── Semifinals (tour4) ────────────────────────────────────
  { id: "m18_sf1", tournamentId: "tour4", category: "18+", round: "semifinal",
    team1Id: "t18_unstoppable", team2Id: "t18_namangan", score1: 19, score2: 21, time: "19:40", status: "completed" },
  { id: "m18_sf2", tournamentId: "tour4", category: "18+", round: "semifinal",
    team1Id: "t18_banana",      team2Id: "t18_5star",    score1: 22, score2: 9,  time: "19:40", status: "completed" },

  // ── 3rd Place (tour4) ─────────────────────────────────────
  { id: "m18_3rd", tournamentId: "tour4", category: "18+", round: "3rd_place",
    team1Id: "t18_5star",       team2Id: "t18_unstoppable", score1: 19, score2: 21, time: "19:55", status: "completed" },

  // ── Final (tour4) ─────────────────────────────────────────
  { id: "m18_fin", tournamentId: "tour4", category: "18+", round: "final",
    team1Id: "t18_banana",      team2Id: "t18_namangan", score1: 18, score2: 20, time: "19:55", status: "completed" },

  // ── Tour3 18+ Matches ─────────────────────────────────────
  // Pool A
  { id: "t3_m18_pA1", tournamentId: "tour3", category: "18+", round: "pool", poolName: "A",
    team1Id: "t18_banana",       team2Id: "t18_nks",    score1: 1, score2: 0, time: "10:00", status: "completed" },
  { id: "t3_m18_pA2", tournamentId: "tour3", category: "18+", round: "pool", poolName: "A",
    team1Id: "t18_banana",       team2Id: "t18_2x2",    score1: 1, score2: 0, time: "10:20", status: "completed" },
  { id: "t3_m18_pA3", tournamentId: "tour3", category: "18+", round: "pool", poolName: "A",
    team1Id: "t18_nks",          team2Id: "t18_2x2",    score1: 1, score2: 0, time: "10:40", status: "completed" },
  // Pool B
  { id: "t3_m18_pB1", tournamentId: "tour3", category: "18+", round: "pool", poolName: "B",
    team1Id: "t18_bo1ston",      team2Id: "t18_otyrar", score1: 1, score2: 0, time: "10:00", status: "completed" },
  { id: "t3_m18_pB2", tournamentId: "tour3", category: "18+", round: "pool", poolName: "B",
    team1Id: "t18_bo1ston",      team2Id: "t18_squad",  score1: 1, score2: 0, time: "10:20", status: "completed" },
  { id: "t3_m18_pB3", tournamentId: "tour3", category: "18+", round: "pool", poolName: "B",
    team1Id: "t18_otyrar",       team2Id: "t18_squad",  score1: 1, score2: 0, time: "10:40", status: "completed" },
  // Pool C
  { id: "t3_m18_pC1", tournamentId: "tour3", category: "18+", round: "pool", poolName: "C",
    team1Id: "t18_namangan",     team2Id: "t18_overtime_18", score1: 1, score2: 0, time: "10:00", status: "completed" },
  { id: "t3_m18_pC2", tournamentId: "tour3", category: "18+", round: "pool", poolName: "C",
    team1Id: "t18_namangan",     team2Id: "t18_turon",  score1: 1, score2: 0, time: "10:20", status: "completed" },
  { id: "t3_m18_pC3", tournamentId: "tour3", category: "18+", round: "pool", poolName: "C",
    team1Id: "t18_overtime_18",  team2Id: "t18_turon",  score1: 1, score2: 0, time: "10:40", status: "completed" },
  // Pool D
  { id: "t3_m18_pD1", tournamentId: "tour3", category: "18+", round: "pool", poolName: "D",
    team1Id: "t18_playnext",     team2Id: "t18_nks",    score1: 1, score2: 0, time: "10:00", status: "completed" },
  { id: "t3_m18_pD2", tournamentId: "tour3", category: "18+", round: "pool", poolName: "D",
    team1Id: "t18_playnext",     team2Id: "t18_pxty",   score1: 1, score2: 0, time: "10:20", status: "completed" },
  { id: "t3_m18_pD3", tournamentId: "tour3", category: "18+", round: "pool", poolName: "D",
    team1Id: "t18_nks",          team2Id: "t18_pxty",   score1: 1, score2: 0, time: "10:40", status: "completed" },
  // Quarterfinals
  { id: "t3_m18_qf1", tournamentId: "tour3", category: "18+", round: "quarterfinal",
    team1Id: "t18_otyrar",   team2Id: "t18_playnext",  score1: 10, score2: 9,  time: "14:00", status: "completed" },
  { id: "t3_m18_qf2", tournamentId: "tour3", category: "18+", round: "quarterfinal",
    team1Id: "t18_banana",   team2Id: "t18_overtime_18", score1: 21, score2: 12, time: "14:15", status: "completed" },
  { id: "t3_m18_qf3", tournamentId: "tour3", category: "18+", round: "quarterfinal",
    team1Id: "t18_namangan", team2Id: "t18_nks",       score1: 12, score2: 6,  time: "14:30", status: "completed" },
  { id: "t3_m18_qf4", tournamentId: "tour3", category: "18+", round: "quarterfinal",
    team1Id: "t18_bo1ston",  team2Id: "t18_namangan",  score1: 15, score2: 12, time: "14:45", status: "completed" },
  // Semifinals
  { id: "t3_m18_sf1", tournamentId: "tour3", category: "18+", round: "semifinal",
    team1Id: "t18_bo1ston",  team2Id: "t18_namangan",  score1: 17, score2: 15, time: "16:00", status: "completed" },
  { id: "t3_m18_sf2", tournamentId: "tour3", category: "18+", round: "semifinal",
    team1Id: "t18_banana",   team2Id: "t18_otyrar",    score1: 22, score2: 9,  time: "16:00", status: "completed" },
  // 3rd place
  { id: "t3_m18_3rd", tournamentId: "tour3", category: "18+", round: "3rd_place",
    team1Id: "t18_namangan", team2Id: "t18_otyrar",    score1: 18, score2: 12, time: "16:30", status: "completed" },
  // Final
  { id: "t3_m18_fin", tournamentId: "tour3", category: "18+", round: "final",
    team1Id: "t18_banana",   team2Id: "t18_bo1ston",   score1: 21, score2: 11, time: "17:00", status: "completed" },
];

// ═════════════════════════════════════════════════════════════════════════════
//  MATCHES — U14 category (key bracket games)
// ═════════════════════════════════════════════════════════════════════════════

export const MATCHES_U14: Match[] = [
  // Last 16 (tour4)
  { id: "m14_l16_1", tournamentId: "tour4", category: "U14", round: "last16",
    team1Id: "t14_145shkola",  team2Id: "t14_hooptime2",  score1: 9,  score2: 7, time: "11:00", status: "completed", note: "OT" },
  { id: "m14_l16_2", tournamentId: "tour4", category: "U14", round: "last16",
    team1Id: "t14_dolphins12", team2Id: "t14_67boiiz",    score1: 15, score2: 12, time: "11:15", status: "completed" },

  // Quarterfinals (tour4)
  { id: "m14_qf1", tournamentId: "tour4", category: "U14", round: "quarterfinal",
    team1Id: "t14_newgen",    team2Id: "t14_dolphins12", score1: 10, score2: 11, time: "11:30", status: "completed" },
  { id: "m14_qf2", tournamentId: "tour4", category: "U14", round: "quarterfinal",
    team1Id: "t14_iba",       team2Id: "t14_bearbasket", score1: 1,  score2: 12, time: "11:45", status: "completed" },
  { id: "m14_qf3", tournamentId: "tour4", category: "U14", round: "quarterfinal",
    team1Id: "t14_145shkola", team2Id: "t14_medvedi",    score1: 11, score2: 21, time: "12:00", status: "completed" },
  { id: "m14_qf4", tournamentId: "tour4", category: "U14", round: "quarterfinal",
    team1Id: "t14_dolphins13",team2Id: "t14_hooptime",   score1: 7,  score2: 10, time: "12:00", status: "completed" },

  // Semifinals (tour4)
  { id: "m14_sf1", tournamentId: "tour4", category: "U14", round: "semifinal",
    team1Id: "t14_hooptime",  team2Id: "t14_medvedi",    score1: 5,  score2: 12, time: "12:15", status: "completed" },
  { id: "m14_sf2", tournamentId: "tour4", category: "U14", round: "semifinal",
    team1Id: "t14_dolphins12",team2Id: "t14_bearbasket", score1: 15, score2: 16, time: "12:15", status: "completed" },

  // 3rd Place (tour4)
  { id: "m14_3rd", tournamentId: "tour4", category: "U14", round: "3rd_place",
    team1Id: "t14_dolphins12",team2Id: "t14_hooptime",   score1: 15, score2: 16, time: "12:30", status: "completed", note: "OT" },

  // Final (tour4)
  { id: "m14_fin", tournamentId: "tour4", category: "U14", round: "final",
    team1Id: "t14_bearbasket",team2Id: "t14_medvedi",    score1: 9,  score2: 8,  time: "12:30", status: "completed" },

  // ── Tour3 U14 Matches ─────────────────────────────────────
  // Quarterfinals
  { id: "t3_m14_qf1", tournamentId: "tour3", category: "U14", round: "quarterfinal",
    team1Id: "t14_hooptime",   team2Id: "t14_iba",        score1: 8,  score2: 1,  time: "11:00", status: "completed" },
  { id: "t3_m14_qf2", tournamentId: "tour3", category: "U14", round: "quarterfinal",
    team1Id: "t14_dolphins12", team2Id: "t14_medvedi",    score1: 12, score2: 10, time: "11:15", status: "completed" },
  { id: "t3_m14_qf3", tournamentId: "tour3", category: "U14", round: "quarterfinal",
    team1Id: "t14_bearbasket", team2Id: "t14_hooptime2",  score1: 11, score2: 5,  time: "11:30", status: "completed" },
  { id: "t3_m14_qf4", tournamentId: "tour3", category: "U14", round: "quarterfinal",
    team1Id: "t14_newgen",     team2Id: "t14_160school",  score1: 8,  score2: 7,  time: "11:45", status: "completed" },
  // Semifinals
  { id: "t3_m14_sf1", tournamentId: "tour3", category: "U14", round: "semifinal",
    team1Id: "t14_bearbasket", team2Id: "t14_newgen",     score1: 12, score2: 7,  time: "13:00", status: "completed" },
  { id: "t3_m14_sf2", tournamentId: "tour3", category: "U14", round: "semifinal",
    team1Id: "t14_hooptime",   team2Id: "t14_dolphins12", score1: 11, score2: 10, time: "13:00", status: "completed" },
  // 3rd place
  { id: "t3_m14_3rd", tournamentId: "tour3", category: "U14", round: "3rd_place",
    team1Id: "t14_dolphins12", team2Id: "t14_newgen",     score1: 18, score2: 11, time: "14:00", status: "completed" },
  // Final
  { id: "t3_m14_fin", tournamentId: "tour3", category: "U14", round: "final",
    team1Id: "t14_bearbasket", team2Id: "t14_hooptime",   score1: 7,  score2: 4,  time: "14:30", status: "completed" },
];

// ═════════════════════════════════════════════════════════════════════════════
//  MATCHES — U16 category (key bracket games)
// ═════════════════════════════════════════════════════════════════════════════

export const MATCHES_U16: Match[] = [
  // Quarterfinals (tour4)
  { id: "m16_qf1", tournamentId: "tour4", category: "U16", round: "quarterfinal",
    team1Id: "t16_dolphins",     team2Id: "t16_dolphins11",    score1: 19, score2: 11, time: "15:05", status: "completed" },
  { id: "m16_qf2", tournamentId: "tour4", category: "U16", round: "quarterfinal",
    team1Id: "t16_unexpected",   team2Id: "t16_hoops",         score1: 3,  score2: 10, time: "15:20", status: "completed" },
  { id: "m16_qf3", tournamentId: "tour4", category: "U16", round: "quarterfinal",
    team1Id: "t16_bisibars",     team2Id: "t16_blackpanther",  score1: 3,  score2: 7,  time: "15:35", status: "completed" },
  { id: "m16_qf4", tournamentId: "tour4", category: "U16", round: "quarterfinal",
    team1Id: "t16_bcbars",       team2Id: "t16_afnf",          score1: 15, score2: 16, time: "15:50", status: "completed" },

  // Semifinals (tour4)
  { id: "m16_sf1", tournamentId: "tour4", category: "U16", round: "semifinal",
    team1Id: "t16_blackpanther", team2Id: "t16_afnf",          score1: 6,  score2: 11, time: "16:05", status: "completed" },
  { id: "m16_sf2", tournamentId: "tour4", category: "U16", round: "semifinal",
    team1Id: "t16_dolphins",     team2Id: "t16_hoops",         score1: 14, score2: 12, time: "16:05", status: "completed" },

  // 3rd Place (tour4)
  { id: "m16_3rd", tournamentId: "tour4", category: "U16", round: "3rd_place",
    team1Id: "t16_hoops",        team2Id: "t16_blackpanther",  score1: 15, score2: 8,  time: "16:20", status: "completed" },

  // Final (tour4)
  { id: "m16_fin", tournamentId: "tour4", category: "U16", round: "final",
    team1Id: "t16_dolphins",     team2Id: "t16_afnf",          score1: 19, score2: 10, time: "16:20", status: "completed" },

  // ── Tour3 U16 Matches ─────────────────────────────────────
  // Quarterfinals
  { id: "t3_m16_qf1", tournamentId: "tour3", category: "U16", round: "quarterfinal",
    team1Id: "t16_chotam",       team2Id: "t16_cska",          score1: 9,  score2: 5,  time: "11:00", status: "completed" },
  { id: "t3_m16_qf2", tournamentId: "tour3", category: "U16", round: "quarterfinal",
    team1Id: "t16_160shkola",    team2Id: "t16_chainatown",    score1: 10, score2: 8,  time: "11:15", status: "completed" },
  { id: "t3_m16_qf3", tournamentId: "tour3", category: "U16", round: "quarterfinal",
    team1Id: "t16_dolphins_u16", team2Id: "t16_hoops",         score1: 13, score2: 9,  time: "11:30", status: "completed" },
  { id: "t3_m16_qf4", tournamentId: "tour3", category: "U16", round: "quarterfinal",
    team1Id: "t16_bcbars",       team2Id: "t16_oreon",         score1: 9,  score2: 3,  time: "11:45", status: "completed" },
  // Semifinals
  { id: "t3_m16_sf1", tournamentId: "tour3", category: "U16", round: "semifinal",
    team1Id: "t16_dolphins_u16", team2Id: "t16_bcbars",        score1: 13, score2: 8,  time: "13:00", status: "completed" },
  { id: "t3_m16_sf2", tournamentId: "tour3", category: "U16", round: "semifinal",
    team1Id: "t16_chotam",       team2Id: "t16_160shkola",     score1: 12, score2: 11, time: "13:00", status: "completed" },
  // 3rd place
  { id: "t3_m16_3rd", tournamentId: "tour3", category: "U16", round: "3rd_place",
    team1Id: "t16_bcbars",       team2Id: "t16_160shkola",     score1: 7,  score2: 5,  time: "14:00", status: "completed" },
  // Final
  { id: "t3_m16_fin", tournamentId: "tour3", category: "U16", round: "final",
    team1Id: "t16_dolphins_u16", team2Id: "t16_chotam",        score1: 15, score2: 7,  time: "14:30", status: "completed" },
];

// ═════════════════════════════════════════════════════════════════════════════
//  MATCHES — U18 category (Tour3 only — new category)
// ═════════════════════════════════════════════════════════════════════════════

export const MATCHES_U18: Match[] = [
  // Pool A
  { id: "t3_m18u_pA1", tournamentId: "tour3", category: "U18", round: "pool", poolName: "A",
    team1Id: "t18u_namangan", team2Id: "t18u_tearz",   score1: 21, score2: 14, time: "10:00", status: "completed" },
  { id: "t3_m18u_pA2", tournamentId: "tour3", category: "U18", round: "pool", poolName: "A",
    team1Id: "t18u_namangan", team2Id: "t18u_lynx",    score1: 17, score2: 4,  time: "10:20", status: "completed" },
  { id: "t3_m18u_pA3", tournamentId: "tour3", category: "U18", round: "pool", poolName: "A",
    team1Id: "t18u_tearz",    team2Id: "t18u_lynx",    score1: 11, score2: 4,  time: "10:40", status: "completed" },

  // Quarterfinals
  { id: "t3_m18u_qf1", tournamentId: "tour3", category: "U18", round: "quarterfinal",
    team1Id: "t18u_nn",       team2Id: "t18u_tearz",   score1: 10, score2: 8,  time: "14:00", status: "completed" },
  { id: "t3_m18u_qf2", tournamentId: "tour3", category: "U18", round: "quarterfinal",
    team1Id: "t18u_dolphins", team2Id: "t18u_overtime", score1: 20, score2: 19, time: "14:15", status: "completed", note: "OT" },

  // Semifinals
  { id: "t3_m18u_sf1", tournamentId: "tour3", category: "U18", round: "semifinal",
    team1Id: "t18u_young_thugs", team2Id: "t18u_nn",      score1: 21, score2: 19, time: "16:00", status: "completed" },
  { id: "t3_m18u_sf2", tournamentId: "tour3", category: "U18", round: "semifinal",
    team1Id: "t18u_namangan",    team2Id: "t18u_dolphins", score1: 18, score2: 9,  time: "16:00", status: "completed" },

  // 3rd place
  { id: "t3_m18u_3rd", tournamentId: "tour3", category: "U18", round: "3rd_place",
    team1Id: "t18u_nn",       team2Id: "t18u_dolphins", score1: 21, score2: 11, time: "16:30", status: "completed" },

  // Final
  { id: "t3_m18u_fin", tournamentId: "tour3", category: "U18", round: "final",
    team1Id: "t18u_namangan", team2Id: "t18u_young_thugs", score1: 14, score2: 10, time: "17:00", status: "completed" },
];

// ═════════════════════════════════════════════════════════════════════════════
//  NEWS
// ═════════════════════════════════════════════════════════════════════════════

export const LEAGUE_NEWS: LeagueNews[] = [
  {
    id: "n1", featured: true,
    titleRu: "NAMANGAN team — чемпион 4-го тура!",
    excerptRu: "NAMANGAN team выиграл Spring Takeover CUP 3X3 4th TOUR, обыграв Banana Team в финале со счётом 20:18. Команда прошла турнир без поражений (5-0).",
    category: "results", date: "2026-05-17", tournamentId: "tour4",
  },
  {
    id: "n2", featured: true,
    titleRu: "39 команд, 3 категории — рекорд турнира",
    excerptRu: "Spring Takeover CUP 3X3 4th TOUR собрал рекордные 39 команд в трёх возрастных категориях: 18+, U14 и U16. Площадка ТГТУ приняла 2 корта с твёрдым покрытием.",
    category: "recap", date: "2026-05-17", tournamentId: "tour4",
  },
  {
    id: "n3", featured: false,
    titleRu: "BearBasketTeam — победители категории U14",
    excerptRu: "BearBasketTeam выиграл категорию U14 в напряжённом финале против Медведи со счётом 9:8. Третье место заняла HoopTime, победив DOLPHINS 12 в овертайме.",
    category: "results", date: "2026-05-17", tournamentId: "tour4",
  },
  {
    id: "n4", featured: false,
    titleRu: "DOLPHINS — чемпионы U16",
    excerptRu: "DOLPHINS уверенно выиграли категорию U16, разгромив Team AFNF в финале 19:10. Hoops завоевал бронзу, обыграв Black Panther TEAM 15:8.",
    category: "results", date: "2026-05-17", tournamentId: "tour4",
  },
  {
    id: "n5", featured: false,
    titleRu: "5-й тур уже скоро — регистрация открыта",
    excerptRu: "Следите за анонсом 5-го тура Spring Takeover CUP на нашем Instagram @uha_league. Все категории, площадка и дата будут объявлены в ближайшее время.",
    category: "announcement", date: "2026-05-20",
  },
  {
    id: "n6", featured: false,
    titleRu: "Финал 18+: драматичный матч NAMANGAN vs Banana Team",
    excerptRu: "Финальный матч 18+ стал украшением всего турнира. Banana Team вели до последних минут, но NAMANGAN team вырвал победу 20:18 благодаря командной защите.",
    category: "recap", date: "2026-05-18", tournamentId: "tour4",
  },
  {
    id: "n7", featured: false,
    titleRu: "3-й тур: Banana Team берёт реванш, дебют U18",
    excerptRu: "3-й тур собрал рекордные 51 команду. Главная сенсация — Banana Team обыграла Bo1ston в финале 21:11. Впервые прошла категория U18, которую выиграл NAMANGAN team.",
    category: "results", date: "2026-05-03", tournamentId: "tour3",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
//  RECORDS (derived from this tournament)
// ═════════════════════════════════════════════════════════════════════════════

export const LEAGUE_RECORDS: LeagueRecord[] = [
  { id: "r1", categoryRu: "Идеальный результат турнира (18+)", holder: "NAMANGAN team",   value: "5 побед, 0 поражений", tournament: "4th TOUR", isTeam: true },
  { id: "r2", categoryRu: "Крупнейшая победа (18+)",           holder: "NAMANGAN team",   value: "22:3 vs ДЮРАГ",        tournament: "4th TOUR", isTeam: true },
  { id: "r3", categoryRu: "Самый напряжённый финал (18+)",     holder: "NAMANGAN — Banana", value: "20:18",              tournament: "4th TOUR", isTeam: true },
  { id: "r4", categoryRu: "Победа в овертайме (U14, 3 место)", holder: "HoopTime",        value: "16:15 OT vs DOLPHINS 12", tournament: "4th TOUR", isTeam: true },
  { id: "r5", categoryRu: "Чемпион U14 (наименьший разрыв)",   holder: "BearBasketTeam",  value: "9:8 в финале vs Медведи", tournament: "4th TOUR", isTeam: true },
  { id: "r6", categoryRu: "Крупнейшая победа финала (U16)",    holder: "DOLPHINS",        value: "19:10 vs Team AFNF",   tournament: "4th TOUR", isTeam: true },
  { id: "r7", categoryRu: "Максимальный счёт в игре (18+)",    holder: "NAMANGAN team",   value: "22 очка (vs play next, QF)", tournament: "4th TOUR", isTeam: true },
  { id: "r8", categoryRu: "Количество команд (рекорд)",        holder: "Spring Takeover CUP 3rd TOUR", value: "51 команда", tournament: "3rd TOUR", isTeam: true },
  { id: "r9", categoryRu: "Первый дебют U18",                  holder: "NAMANGAN team (U18)", value: "Чемпион первого U18 турнира", tournament: "3rd TOUR", isTeam: true },
];

// ═════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═════════════════════════════════════════════════════════════════════════════

export const ALL_TEAMS = [...TEAMS_18PLUS, ...TEAMS_U14, ...TEAMS_U16, ...TEAMS_U18];
export const ALL_MATCHES = [...MATCHES_18PLUS, ...MATCHES_U14, ...MATCHES_U16, ...MATCHES_U18];
export const SEASON_YEAR = 2026;

export const FIBA_EVENT_URLS: Record<string, string> = {
  tour1: "https://play.fiba3x3.com/events/3720fc42-6041-4d18-bdbb-1bb235308efa",
  tour2: "https://play.fiba3x3.com/events/215bd581-0ce7-41b4-a9af-c2c7cea08335",
  tour3: "https://play.fiba3x3.com/events/3720fc42-6041-4d18-bdbb-1bb235308efa",
  tour4: "https://play.fiba3x3.com/events/a65f9c2b-03ae-4468-a29e-98b3d484030c/schedule",
  tour5: "https://play.fiba3x3.com/events/024607db-d8cd-49d0-b0c3-4c35c1a82b1a",
};

export const YOUTUBE_URLS: Record<string, string> = {
  tour1: "https://www.youtube.com/watch?v=BV7wn6VUTc8",
  tour2: "https://www.youtube.com/watch?v=T-r13sH4HNg",
  tour3: "https://www.youtube.com/watch?v=qKHJIkqYOTU",
  tour4: "https://www.youtube.com/watch?v=9MzMBa9CiR4",
};

export function getYoutubeEmbedId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
  return match ? match[1] : null;
}

export function getTeam(id: string) {
  return ALL_TEAMS.find(t => t.id === id);
}
export function getTeamsByCategory(cat: AgeCategory) {
  return ALL_TEAMS.filter(t => t.category === cat).sort((a, b) => a.rank - b.rank);
}
export function getPlayersByTeam(teamId: string) {
  return PLAYERS.filter(p => p.teamId === teamId);
}
export function getMatchesByCategory(cat: AgeCategory) {
  return ALL_MATCHES.filter(m => m.category === cat);
}
export function getMatchesByTournament(tournamentId: string) {
  return ALL_MATCHES.filter(m => m.tournamentId === tournamentId);
}
export function getMatchesByTournamentAndCategory(tournamentId: string, cat: AgeCategory) {
  return ALL_MATCHES.filter(m => m.tournamentId === tournamentId && m.category === cat);
}
export function getFinalMatch(cat: AgeCategory, tournamentId = "tour4") {
  return ALL_MATCHES.find(m => m.category === cat && m.round === "final" && m.tournamentId === tournamentId);
}
export function getCountryFlag(code: string) {
  const flags: Record<string, string> = { UZ: "🇺🇿", KZ: "🇰🇿", KG: "🇰🇬", TJ: "🇹🇯" };
  return flags[code] || "🏳️";
}
export const ROUND_LABELS: Record<string, string> = {
  pool: "Группа", last16: "1/8 финала", quarterfinal: "Четвертьфинал",
  semifinal: "Полуфинал", final: "Финал", "3rd_place": "За 3 место",
};
export const CATEGORY_COLORS: Record<AgeCategory, string> = {
  "18+": "text-amber-400 bg-amber-500/10 border-amber-500/25",
  "U14": "text-blue-400 bg-blue-500/10 border-blue-500/25",
  "U16": "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  "U18": "text-purple-400 bg-purple-500/10 border-purple-500/25",
};

/** All teams that participated in a specific tournament */
export function getTeamsByTournament(tournamentId: string): LeagueTeam[] {
  const tour = TOURNAMENTS.find(t => t.id === tournamentId);
  if (!tour) return [];
  const teamIds = new Set<string>();
  const tourMatches = ALL_MATCHES.filter(m => m.tournamentId === tournamentId);
  tourMatches.forEach(m => { teamIds.add(m.team1Id); teamIds.add(m.team2Id); });
  // Also add champions/runners from categories
  tour.categories.forEach(c => {
    if (c.champion) teamIds.add(c.champion);
    if (c.runnerUp) teamIds.add(c.runnerUp);
    if (c.thirdPlace) teamIds.add(c.thirdPlace);
    if (c.fourthPlace) teamIds.add(c.fourthPlace);
  });
  return [...teamIds].map(id => ALL_TEAMS.find(t => t.id === id)).filter(Boolean) as LeagueTeam[];
}

// ── Player helpers ────────────────────────────────────────────────────────────
export function getPlayer(id: string) {
  return PLAYERS.find(p => p.id === id);
}

/** All matches a player's team participated in */
export function getPlayerMatches(playerId: string) {
  const player = getPlayer(playerId);
  if (!player) return [];
  return ALL_MATCHES.filter(
    m => m.team1Id === player.teamId || m.team2Id === player.teamId
  ).sort((a, b) => a.time.localeCompare(b.time));
}

/** Compute win/loss record from team matches */
export function getPlayerRecord(playerId: string) {
  const player = getPlayer(playerId);
  if (!player) return { played: 0, wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 };
  const matches = getPlayerMatches(playerId).filter(m => m.note !== "forfeit" || true);
  let wins = 0, losses = 0, pf = 0, pa = 0;
  matches.forEach(m => {
    const isT1 = m.team1Id === player.teamId;
    const scored = isT1 ? m.score1 : m.score2;
    const conceded = isT1 ? m.score2 : m.score1;
    pf += scored; pa += conceded;
    if (scored > conceded) wins++; else losses++;
  });
  return { played: matches.length, wins, losses, pointsFor: pf, pointsAgainst: pa };
}

/** Tournament result medal for the player (based on team) */
export function getPlayerMedal(playerId: string, tournamentId = "tour4"): "🏆" | "🥈" | "🥉" | null {
  const player = getPlayer(playerId);
  if (!player) return null;
  const tour = TOURNAMENTS.find(t => t.id === tournamentId);
  if (!tour) return null;
  const cat = tour.categories.find(c => c.category === (ALL_TEAMS.find(t => t.id === player.teamId)?.category));
  if (!cat) return null;
  if (cat.champion === player.teamId) return "🏆";
  if (cat.runnerUp === player.teamId) return "🥈";
  if (cat.thirdPlace === player.teamId) return "🥉";
  return null;
}

export function getAllPlayerIds(): string[] {
  return PLAYERS.map(p => p.id);
}

/** Helper to get categories present in a tournament */
export function getTournamentCategories(tournamentId: string): AgeCategory[] {
  const tour = TOURNAMENTS.find(t => t.id === tournamentId);
  if (!tour) return [];
  return tour.categories.map(c => c.category);
}

// ═════════════════════════════════════════════════════════════════════════════
//  PER-MATCH PLAYER STATS (real data from recorded matches)
//  Source: Spring Takeover CUP 3X3 4th TOUR screenshots
// ═════════════════════════════════════════════════════════════════════════════

// Source: preview.html — only MADE values recorded (no attempts data)
// Points formula: 1PT*1 + 2PT*2 + FT*1
export const MATCH_PLAYER_STATS: MatchPlayerStat[] = [

  // ── FINAL: Banana Team 18 : 20 NAMANGAN team (tour4, 17.05.2026) ─────────

  // NAMANGAN team — winner (20 pts total)
  {
    matchId: "m18_fin", playerId: "p_nam4", teamId: "t18_namangan",
    jerseyNumber: 9,  displayName: "Ramazan Sarkiyev",
    onePointMade: 3, twoPointMade: 4, freeThrowMade: 2,
    rebounds: 3, assists: 2, fouls: 0,
    points: 3 + 4*2 + 2,   // = 13
  },
  {
    matchId: "m18_fin", playerId: "p_nam3", teamId: "t18_namangan",
    jerseyNumber: 11, displayName: "Daniyor Novikovic",
    onePointMade: 1, twoPointMade: 0, freeThrowMade: 0,
    rebounds: 2, assists: 0, fouls: 0,
    points: 1,
  },
  {
    matchId: "m18_fin", playerId: "p_nam1", teamId: "t18_namangan",
    jerseyNumber: 33, displayName: "Ibragim Avazov",
    onePointMade: 2, twoPointMade: 0, freeThrowMade: 0,
    rebounds: 1, assists: 0, fouls: 1,
    points: 2,
  },
  {
    matchId: "m18_fin", playerId: "p_nam2", teamId: "t18_namangan",
    jerseyNumber: 15, displayName: "Salohiddin Toychiyev",
    onePointMade: 3, twoPointMade: 0, freeThrowMade: 1,
    rebounds: 1, assists: 1, fouls: 1,
    points: 3 + 1,          // = 4
  },

  // Banana Team — loser (18 pts total)
  {
    matchId: "m18_fin", playerId: "p_ban1", teamId: "t18_banana",
    jerseyNumber: 7,  displayName: "Азиз Абдурашидов",
    onePointMade: 4, twoPointMade: 0, freeThrowMade: 0,
    rebounds: 6, assists: 1, fouls: 0,
    points: 4,
  },
  {
    matchId: "m18_fin", playerId: "p_ban3", teamId: "t18_banana",
    jerseyNumber: 0,  displayName: "Николай Евдокимов",
    onePointMade: 4, twoPointMade: 1, freeThrowMade: 0,
    rebounds: 9, assists: 0, fouls: 5,
    points: 4 + 1*2,        // = 6
  },
  {
    matchId: "m18_fin", playerId: "p_ban2", teamId: "t18_banana",
    jerseyNumber: 12, displayName: "Тимур Арипов",
    onePointMade: 0, twoPointMade: 4, freeThrowMade: 0,
    rebounds: 1, assists: 0, fouls: 0,
    points: 4*2,             // = 8
  },
  {
    matchId: "m18_fin", playerId: "p_ban4", teamId: "t18_banana",
    jerseyNumber: 10, displayName: "Хусейн Мирманов",
    onePointMade: 0, twoPointMade: 0, freeThrowMade: 0,
    rebounds: 1, assists: 1, fouls: 0,
    points: 0,
  },
];

/** Match IDs that have per-player stats recorded */
export const MATCHES_WITH_STATS = new Set(MATCH_PLAYER_STATS.map(s => s.matchId));

/** Get all player stats for a specific match */
export function getMatchStats(matchId: string): MatchPlayerStat[] {
  return MATCH_PLAYER_STATS.filter(s => s.matchId === matchId);
}

/** Get stats for one team in a match */
export function getMatchTeamStats(matchId: string, teamId: string): MatchPlayerStat[] {
  return MATCH_PLAYER_STATS.filter(s => s.matchId === matchId && s.teamId === teamId)
    .sort((a, b) => b.points - a.points);
}

/** Get all match IDs that have stats (for generateStaticParams) */
export function getAllMatchIdsWithStats(): string[] {
  return [...MATCHES_WITH_STATS];
}
