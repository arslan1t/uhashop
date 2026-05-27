"use client";

import { memo } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface Props {
  elapsedSeconds: number;
  shotSeconds: number;
  isRunning: boolean;
  status: string;
  onStart: () => void;
  onPause: () => void;
  onResetShot: () => void;
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const GameTimer = memo(function GameTimer({
  elapsedSeconds, shotSeconds, isRunning, status, onStart, onPause, onResetShot,
}: Props) {
  const shotDanger = shotSeconds <= 5;
  const canRun = status === "LIVE" || status === "OVERTIME";

  return (
    <div className="flex items-center justify-center gap-6 py-3 px-4 bg-[#111] border-b border-[#222] select-none">
      {/* Game timer */}
      <div className="flex items-center gap-3">
        <div className="text-4xl font-black tabular-nums tracking-tight text-white font-mono">
          {fmt(Math.floor(elapsedSeconds))}
        </div>
        {canRun && (
          <button
            onClick={isRunning ? onPause : onStart}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              isRunning
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="w-px h-8 bg-[#333]" />

      {/* Shot clock */}
      <div className="flex items-center gap-2">
        <div className="text-xs text-[#555] uppercase tracking-wider">Shot</div>
        <div className={`text-2xl font-black tabular-nums font-mono transition-colors ${
          shotDanger ? "text-red-400" : "text-[#aaa]"
        }`}>
          {shotSeconds}
        </div>
        <button
          onClick={onResetShot}
          className="w-7 h-7 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-[#222] transition-colors"
          title="Reset shot clock (12)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});
