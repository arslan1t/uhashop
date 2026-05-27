"use client";

import { memo, useState, useRef } from "react";
import type { MatchTeam, MatchPlayer } from "@/types/match";
import { getFoulWarning } from "@/types/match";
import type { StatKey, TeamSide } from "@/hooks/admin/useMatchFirestore";
import { PlayerRow } from "./PlayerRow";
import { AlertTriangle, Pencil, Check, X } from "lucide-react";

interface Props {
  team: MatchTeam;
  side: TeamSide;
  accent: "blue" | "orange";
  onUp: (side: TeamSide, playerId: string, key: StatKey) => void;
  onDown: (side: TeamSide, playerId: string, key: StatKey) => void;
  onStatusChange: (side: TeamSide, playerId: string, status: MatchPlayer["status"]) => void;
  onTimeout: () => void;
  onRename: (side: TeamSide, playerId: string, name: string) => void;
  onRenumber: (side: TeamSide, playerId: string, number: number) => void;
  onRenameTeam: (side: TeamSide, name: string) => void;
}

export const TeamPanel = memo(function TeamPanel({
  team, side, accent, onUp, onDown, onStatusChange, onTimeout,
  onRename, onRenumber, onRenameTeam,
}: Props) {
  const foulInfo = getFoulWarning(team.totalFouls);
  const accentColor = accent === "blue" ? "#3b82f6" : "#f97316";

  const [editingTeamName, setEditingTeamName] = useState(false);
  const [teamNameVal, setTeamNameVal] = useState(team.name);
  const teamNameRef = useRef<HTMLInputElement>(null);

  const startEditTeam = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTeamNameVal(team.name);
    setEditingTeamName(true);
    setTimeout(() => { teamNameRef.current?.focus(); teamNameRef.current?.select(); }, 50);
  };

  const commitTeamName = () => {
    const val = teamNameVal.trim();
    if (val && val !== team.name) onRenameTeam(side, val);
    setEditingTeamName(false);
  };

  const cancelTeamName = () => {
    setTeamNameVal(team.name);
    setEditingTeamName(false);
  };

  const accentText = accent === "blue" ? "text-blue-400" : "text-orange-400";
  const borderStyle = accent === "blue"
    ? { borderLeftWidth: 3, borderLeftColor: accentColor }
    : { borderRightWidth: 3, borderRightColor: accentColor };

  return (
    <div className="flex flex-col h-full">
      {/* Team header */}
      <div className="px-3 py-2 border-b border-[#1e1e1e]" style={borderStyle}>
        <div className="flex items-center justify-between mb-1">
          {/* Editable team name */}
          {editingTeamName ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <input
                ref={teamNameRef}
                value={teamNameVal}
                onChange={e => setTeamNameVal(e.target.value)}
                onBlur={commitTeamName}
                onKeyDown={e => { if (e.key === "Enter") commitTeamName(); if (e.key === "Escape") cancelTeamName(); }}
                className="flex-1 h-7 px-2 bg-[#1a1a1a] border border-blue-500/50 rounded text-sm font-black text-white focus:outline-none uppercase tracking-wider"
                placeholder="Название команды"
              />
              <button onClick={commitTeamName} className="w-5 h-5 flex items-center justify-center text-green-400">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={cancelTeamName} className="w-5 h-5 flex items-center justify-center text-[#555]">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditTeam}
              className={`text-sm font-black uppercase tracking-wider ${accentText} hover:opacity-80 transition-opacity flex items-center gap-1.5 group/team`}
              title="Нажми чтобы изменить название команды">
              <span className="truncate max-w-[120px]">{team.name}</span>
              <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/team:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          )}

          {/* Team fouls badge */}
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ml-2 flex-shrink-0 ${
            foulInfo.level === "danger" ? "bg-red-500/20 text-red-400 border-red-500/30"
            : foulInfo.level === "warning" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            : "bg-[#1a1a1a] text-[#555] border-[#222]"
          }`}>
            <span>FOULS</span>
            <span className="font-black">{team.totalFouls}</span>
          </div>
        </div>

        {/* Foul warning */}
        {foulInfo.level !== "none" && (
          <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${
            foulInfo.level === "danger" ? "text-red-400" : "text-yellow-400"
          }`}>
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            {foulInfo.message}
          </div>
        )}

        {/* Timeout */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-[#444] uppercase tracking-wider">Timeout</span>
          <button
            onClick={onTimeout}
            className={`w-6 h-5 rounded flex items-center justify-center text-[9px] font-black border transition-colors ${
              team.timeouts > 0
                ? `text-white border-opacity-30 hover:opacity-80`
                : "text-[#333] border-[#222] bg-[#111] cursor-not-allowed"
            }`}
            style={team.timeouts > 0 ? { backgroundColor: accentColor + "25", borderColor: accentColor + "50", color: accentColor } : {}}>
            T
          </button>
        </div>
      </div>

      {/* Players */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {team.players.map(player => (
          <PlayerRow
            key={player.id}
            player={player}
            side={side}
            onUp={onUp}
            onDown={onDown}
            onStatusChange={onStatusChange}
            onRename={onRename}
            onRenumber={onRenumber}
          />
        ))}
      </div>
    </div>
  );
});
