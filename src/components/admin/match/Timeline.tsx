"use client";

import { memo } from "react";
import type { TimelineEvent } from "@/types/match";
import { EVENT_LABELS, EVENT_COLORS } from "@/types/match";

interface Props {
  events: TimelineEvent[];
  maxItems?: number;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

export const Timeline = memo(function Timeline({ events, maxItems = 50 }: Props) {
  const reversed = [...events].reverse().slice(0, maxItems);

  if (reversed.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#333] text-xs uppercase tracking-wider">
        No events yet
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {reversed.map((ev, i) => {
        const color = EVENT_COLORS[ev.action] || "#666";
        const label = EVENT_LABELS[ev.action] || ev.action;
        const isTeamA = ev.team === "A";
        const isTeamB = ev.team === "B";
        const isSystem = ev.team === "system";

        return (
          <div key={ev.id} className={`flex items-start gap-2 px-3 py-1.5 border-b border-[#111] hover:bg-[#0e0e0e] transition-colors ${i === 0 ? "bg-[#111]" : ""}`}>
            {/* Time */}
            <span className="text-[9px] text-[#333] font-mono flex-shrink-0 mt-0.5">
              {formatTime(ev.timestamp)}
            </span>

            {/* Team indicator */}
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${
              isTeamA ? "bg-blue-500" : isTeamB ? "bg-orange-500" : "bg-[#333]"
            }`} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {ev.playerName && (
                  <span className="text-[11px] font-semibold text-white">
                    #{ev.playerNumber} {ev.playerName}
                  </span>
                )}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ color, backgroundColor: color + "20" }}>
                  {label}
                </span>
                {ev.note && (
                  <span className="text-[9px] text-[#444] italic">{ev.note}</span>
                )}
              </div>
              {!isSystem && (
                <div className="text-[9px] text-[#333] mt-0.5">
                  {ev.scoreA} — {ev.scoreB}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});
