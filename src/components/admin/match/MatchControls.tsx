"use client";

import { memo, useState } from "react";
import type { MatchStatus } from "@/types/match";
import { Play, Pause, CheckSquare, RotateCcw, Clock, Undo2, AlertTriangle } from "lucide-react";

interface Props {
  status: MatchStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onReset: () => void;
  onStartOT: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

function ConfirmBtn({
  label, icon: Icon, onClick, variant, disabled,
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant: "green" | "yellow" | "red" | "gray" | "blue" | "orange";
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  const colors: Record<string, string> = {
    green:  "bg-green-500/15 text-green-400 border-green-500/25 hover:bg-green-500/25",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/25",
    red:    "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25",
    gray:   "bg-[#1e1e1e] text-[#666] border-[#333] hover:bg-[#252525]",
    blue:   "bg-blue-500/15 text-blue-400 border-blue-500/25 hover:bg-blue-500/25",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/25 hover:bg-orange-500/25",
  };

  const handleClick = () => {
    if (variant === "red") {
      if (!confirming) { setConfirming(true); setTimeout(() => setConfirming(false), 2500); return; }
      setConfirming(false);
    }
    onClick();
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed ${colors[variant]} ${confirming ? "ring-2 ring-red-500/50" : ""}`}
    >
      {confirming ? <AlertTriangle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
      {confirming ? "Tap again to confirm" : label}
    </button>
  );
}

export const MatchControls = memo(function MatchControls({
  status, onStart, onPause, onResume, onFinish, onReset, onStartOT, onUndo, canUndo,
}: Props) {
  return (
    <div className="px-3 py-2 bg-[#0a0a0a] border-t border-[#1a1a1a] flex flex-wrap gap-1.5">
      {status === "PRE-GAME" && (
        <ConfirmBtn label="Start Match" icon={Play} onClick={onStart} variant="green" />
      )}
      {status === "LIVE" && (
        <>
          <ConfirmBtn label="Pause" icon={Pause} onClick={onPause} variant="yellow" />
          <ConfirmBtn label="Finish Match" icon={CheckSquare} onClick={onFinish} variant="red" />
          <ConfirmBtn label="Start OT" icon={Clock} onClick={onStartOT} variant="orange" />
        </>
      )}
      {status === "PAUSED" && (
        <>
          <ConfirmBtn label="Resume" icon={Play} onClick={onResume} variant="green" />
          <ConfirmBtn label="Finish Match" icon={CheckSquare} onClick={onFinish} variant="red" />
          <ConfirmBtn label="Start OT" icon={Clock} onClick={onStartOT} variant="orange" />
        </>
      )}
      {status === "OVERTIME" && (
        <>
          <ConfirmBtn label="Pause" icon={Pause} onClick={onPause} variant="yellow" />
          <ConfirmBtn label="Finish Match" icon={CheckSquare} onClick={onFinish} variant="red" />
        </>
      )}
      {status === "FINISHED" && (
        <div className="text-xs text-[#555] font-semibold uppercase tracking-wider py-1">Match Finished</div>
      )}

      {/* Always available */}
      <ConfirmBtn label="Undo" icon={Undo2} onClick={onUndo} variant="gray" disabled={!canUndo} />
      {status !== "LIVE" && status !== "OVERTIME" && (
        <ConfirmBtn label="Reset" icon={RotateCcw} onClick={onReset} variant="red" />
      )}
    </div>
  );
});
