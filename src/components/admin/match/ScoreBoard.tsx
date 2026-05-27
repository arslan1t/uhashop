"use client";

import { memo } from "react";
import type { MatchStatus } from "@/types/match";

const STATUS_LABELS: Record<MatchStatus, string> = {
  "PRE-GAME": "PRE-GAME",
  "LIVE": "LIVE",
  "PAUSED": "PAUSED",
  "OVERTIME": "OT",
  "FINISHED": "FINAL",
};

const STATUS_COLORS: Record<MatchStatus, string> = {
  "PRE-GAME": "text-[#666] bg-[#1a1a1a] border-[#333]",
  "LIVE": "text-green-400 bg-green-500/10 border-green-500/30",
  "PAUSED": "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  "OVERTIME": "text-orange-400 bg-orange-500/10 border-orange-500/30",
  "FINISHED": "text-[#666] bg-[#1a1a1a] border-[#333]",
};

interface Props {
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  overtimePeriod: number;
  tournamentName: string;
  court: string;
  date: string;
}

export const ScoreBoard = memo(function ScoreBoard({
  teamAName, teamBName, scoreA, scoreB, status, overtimePeriod,
  tournamentName, court, date,
}: Props) {
  return (
    <div className="bg-[#0d0d0d] border-b border-[#1e1e1e] select-none">
      {/* Meta row */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <span className="text-[11px] text-[#444] font-medium truncate max-w-[200px]">
          {tournamentName}
        </span>
        <span className="text-[11px] text-[#444]">{court} · {date}</span>
      </div>

      {/* Main scoreboard */}
      <div className="flex items-center justify-between px-4 pb-3">
        {/* Team A */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{teamAName}</p>
        </div>

        {/* Score + status */}
        <div className="flex flex-col items-center gap-1 px-6">
          <div className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
            {status === "OVERTIME" && overtimePeriod > 1 ? ` ${overtimePeriod}` : ""}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-5xl font-black tabular-nums font-mono leading-none transition-all ${
              scoreA > scoreB ? "text-white" : "text-[#555]"
            }`}>
              {scoreA}
            </span>
            <span className="text-2xl text-[#333] font-black">:</span>
            <span className={`text-5xl font-black tabular-nums font-mono leading-none transition-all ${
              scoreB > scoreA ? "text-white" : "text-[#555]"
            }`}>
              {scoreB}
            </span>
          </div>
        </div>

        {/* Team B */}
        <div className="flex-1 min-w-0 text-right">
          <p className="text-sm font-bold text-white truncate">{teamBName}</p>
        </div>
      </div>

      {/* Score tracker strip */}
      <ScoreTracker scoreA={scoreA} scoreB={scoreB} />
    </div>
  );
});

// ── Score tracker (1-22 strip) ────────────────────────────────────────────────

function ScoreTracker({ scoreA, scoreB }: { scoreA: number; scoreB: number }) {
  const max = Math.max(22, scoreA + 1, scoreB + 1);
  const cells = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="px-4 pb-2">
      <div className="flex gap-0.5 overflow-x-auto">
        {cells.map(n => {
          const hasA = scoreA >= n;
          const hasB = scoreB >= n;
          const both = hasA && hasB;
          return (
            <div key={n} className="flex-shrink-0 flex flex-col gap-0.5">
              {/* Team A dot */}
              <div className={`w-5 h-2 rounded-sm transition-all ${
                hasA
                  ? (scoreA === n ? "bg-blue-400" : "bg-blue-600/60")
                  : "bg-[#1c1c1c]"
              }`} />
              {/* Score number */}
              <div className={`text-[8px] text-center tabular-nums leading-none font-mono ${
                n === scoreA || n === scoreB ? "text-white" : "text-[#333]"
              }`}>
                {n % 2 === 0 ? n : ""}
              </div>
              {/* Team B dot */}
              <div className={`w-5 h-2 rounded-sm transition-all ${
                hasB
                  ? (scoreB === n ? "bg-orange-400" : "bg-orange-600/60")
                  : "bg-[#1c1c1c]"
              }`} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-blue-400 font-bold uppercase">Team A</span>
        <span className="text-[9px] text-orange-400 font-bold uppercase">Team B</span>
      </div>
    </div>
  );
}
