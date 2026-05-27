"use client";

import { memo, useState, useCallback, useRef } from "react";
import { ChevronDown, ChevronUp, Pencil, Check, X } from "lucide-react";
import type { MatchPlayer } from "@/types/match";
import type { StatKey, TeamSide } from "@/hooks/admin/useMatchFirestore";

const MAIN_STATS: { key: StatKey; label: string }[] = [
  { key: "onePoint",  label: "1PT" },
  { key: "twoPoint",  label: "2PT" },
  { key: "freeThrow", label: "FT"  },
  { key: "rebounds",  label: "REB" },
  { key: "assists",   label: "AST" },
  { key: "fouls",     label: "FOUL"},
];

const MORE_STATS: { key: StatKey; label: string }[] = [
  { key: "steals",        label: "STL" },
  { key: "blocks",        label: "BLK" },
  { key: "turnovers",     label: "TO"  },
  { key: "dreb",          label: "DREB"},
  { key: "oreb",          label: "OREB"},
  { key: "minutesPlayed", label: "MIN" },
];

const STATUS_COLORS: Record<MatchPlayer["status"], string> = {
  "on_court":  "bg-green-500",
  "bench":     "bg-[#444]",
  "fouled_out":"bg-red-500",
  "injured":   "bg-yellow-500",
};

const STATUS_LABELS: Record<MatchPlayer["status"], string> = {
  "on_court":  "ON",
  "bench":     "B",
  "fouled_out":"FO",
  "injured":   "INJ",
};

const STATUS_CYCLE: MatchPlayer["status"][] = ["bench", "on_court", "fouled_out", "injured"];

interface Props {
  player: MatchPlayer;
  side: TeamSide;
  onUp: (side: TeamSide, playerId: string, key: StatKey) => void;
  onDown: (side: TeamSide, playerId: string, key: StatKey) => void;
  onStatusChange: (side: TeamSide, playerId: string, status: MatchPlayer["status"]) => void;
  onRename: (side: TeamSide, playerId: string, name: string) => void;
  onRenumber: (side: TeamSide, playerId: string, number: number) => void;
}

export const PlayerRow = memo(function PlayerRow({
  player, side, onUp, onDown, onStatusChange, onRename, onRenumber
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingNumber, setEditingNumber] = useState(false);
  const [nameVal, setNameVal] = useState(player.name);
  const [numVal, setNumVal] = useState(String(player.number));
  const nameInputRef = useRef<HTMLInputElement>(null);
  const numInputRef = useRef<HTMLInputElement>(null);

  const foulDanger = player.stats.fouls >= 5;
  const foulWarn = player.stats.fouls >= 3 && player.stats.fouls < 5;

  const handleStatusCycle = useCallback(() => {
    const curr = STATUS_CYCLE.indexOf(player.status);
    const next = STATUS_CYCLE[(curr + 1) % STATUS_CYCLE.length];
    onStatusChange(side, player.id, next);
  }, [player.status, side, player.id, onStatusChange]);

  const startEditName = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNameVal(player.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const commitName = () => {
    const val = nameVal.trim();
    if (val && val !== player.name) onRename(side, player.id, val);
    setEditingName(false);
  };

  const cancelName = () => {
    setNameVal(player.name);
    setEditingName(false);
  };

  const startEditNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNumVal(String(player.number));
    setEditingNumber(true);
    setTimeout(() => { numInputRef.current?.focus(); numInputRef.current?.select(); }, 50);
  };

  const commitNumber = () => {
    const n = parseInt(numVal, 10);
    if (!isNaN(n) && n >= 0 && n <= 99 && n !== player.number) onRenumber(side, player.id, n);
    setEditingNumber(false);
  };

  return (
    <div className={`rounded-lg border transition-colors ${
      foulDanger
        ? "border-red-500/30 bg-red-500/5"
        : player.status === "fouled_out"
        ? "border-red-500/20 bg-[#111]"
        : "border-[#1e1e1e] bg-[#111]"
    }`}>
      {/* Main row */}
      <div className="flex items-center gap-2 p-2">
        {/* Status indicator */}
        <button
          onClick={handleStatusCycle}
          className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 transition-colors ${STATUS_COLORS[player.status]}`}
          title="Статус — тап для смены">
          {STATUS_LABELS[player.status]}
        </button>

        {/* Jersey number — click to edit */}
        <div className="flex-shrink-0 w-8">
          {editingNumber ? (
            <div className="flex items-center gap-0.5">
              <input
                ref={numInputRef}
                value={numVal}
                onChange={e => setNumVal(e.target.value.replace(/\D/g, ""))}
                onBlur={commitNumber}
                onKeyDown={e => { if (e.key === "Enter") commitNumber(); if (e.key === "Escape") setEditingNumber(false); }}
                className="w-8 h-6 bg-[#222] border border-blue-500/50 rounded text-center text-xs font-bold text-white focus:outline-none"
                maxLength={2}
              />
            </div>
          ) : (
            <button
              onClick={startEditNumber}
              className="w-8 h-6 text-center text-[rgb(var(--muted,#666))] text-xs font-bold hover:text-white hover:bg-[#222] rounded transition-colors"
              title="Изменить номер">
              {player.number}
            </button>
          )}
        </div>

        {/* Name — click to edit */}
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-1">
              <input
                ref={nameInputRef}
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => { if (e.key === "Enter") commitName(); if (e.key === "Escape") cancelName(); }}
                className="flex-1 h-7 px-2 bg-[#1a1a1a] border border-blue-500/50 rounded text-sm text-white focus:outline-none"
                placeholder="Имя игрока"
              />
              <button onClick={commitName} className="w-5 h-5 flex items-center justify-center text-green-400 hover:text-green-300">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={cancelName} className="w-5 h-5 flex items-center justify-center text-[#555] hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditName}
              className={`text-sm font-semibold truncate text-left w-full group/name flex items-center gap-1 ${
                player.status === "fouled_out" ? "text-red-400 line-through" : "text-white"
              }`}
              title="Нажми чтобы изменить имя">
              <span className="truncate">{player.name}</span>
              <Pencil className="w-2.5 h-2.5 text-[#333] opacity-0 group-hover/name:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          )}
          <p className={`text-[10px] font-black mt-0.5 ${foulDanger ? "text-red-400" : "text-[#444]"}`}>
            {player.points} pts
          </p>
        </div>

        {/* Main stat buttons */}
        <div className="flex gap-1.5 overflow-x-auto">
          {MAIN_STATS.map(({ key, label }) => (
            <StatButton
              key={key}
              label={label}
              value={player.stats[key as keyof typeof player.stats] as number}
              isFoul={key === "fouls"}
              foulDanger={key === "fouls" && foulDanger}
              foulWarn={key === "fouls" && foulWarn}
              onUp={() => onUp(side, player.id, key)}
              onDown={() => onDown(side, player.id, key)}
            />
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-6 h-6 rounded flex items-center justify-center text-[#444] hover:text-white transition-colors flex-shrink-0">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* More stats (expanded) */}
      {expanded && (
        <div className="px-2 pb-2 border-t border-[#1a1a1a] pt-2">
          <div className="flex gap-1.5 flex-wrap">
            {MORE_STATS.map(({ key, label }) => (
              <StatButton
                key={key}
                label={label}
                value={player.stats[key as keyof typeof player.stats] as number}
                isFoul={false}
                foulDanger={false}
                foulWarn={false}
                onUp={() => onUp(side, player.id, key)}
                onDown={() => onDown(side, player.id, key)}
                compact
              />
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-[#444] uppercase tracking-wider">+/-</span>
            <span className={`text-sm font-bold ${
              player.stats.plusMinus > 0 ? "text-green-400"
              : player.stats.plusMinus < 0 ? "text-red-400"
              : "text-[#555]"
            }`}>
              {player.stats.plusMinus > 0 ? "+" : ""}{player.stats.plusMinus}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

// ── Stat Button ────────────────────────────────────────────────────────────────

interface StatButtonProps {
  label: string;
  value: number;
  isFoul: boolean;
  foulDanger: boolean;
  foulWarn: boolean;
  onUp: () => void;
  onDown: () => void;
  compact?: boolean;
}

const StatButton = memo(function StatButton({
  label, value, isFoul, foulDanger, foulWarn, onUp, onDown, compact,
}: StatButtonProps) {
  const size = compact ? "w-12" : "w-14";

  return (
    <div className={`${size} flex flex-col items-center gap-0.5 flex-shrink-0`}>
      <span className={`text-[9px] uppercase tracking-wider font-bold ${
        foulDanger ? "text-red-400" : foulWarn ? "text-yellow-400" : "text-[#555]"
      }`}>
        {label}
      </span>
      <button
        onClick={onUp}
        className={`w-full h-6 rounded text-xs font-black transition-all active:scale-95 ${
          isFoul
            ? foulDanger
              ? "bg-red-500 text-white hover:bg-red-400"
              : foulWarn
              ? "bg-yellow-500/80 text-black hover:bg-yellow-400"
              : "bg-[#1e1e1e] text-green-400 border border-green-500/20 hover:bg-green-500/10"
            : "bg-[#1e1e1e] text-green-400 border border-green-500/20 hover:bg-green-500/10"
        }`}>
        +
      </button>
      <span className={`text-sm font-black tabular-nums ${
        foulDanger ? "text-red-400" : foulWarn ? "text-yellow-400" : "text-white"
      }`}>
        {value}
      </span>
      <button
        onClick={onDown}
        disabled={value === 0}
        className="w-full h-6 rounded text-xs font-black bg-[#1a1a1a] text-red-500 border border-red-500/15 hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95">
        -
      </button>
    </div>
  );
});
