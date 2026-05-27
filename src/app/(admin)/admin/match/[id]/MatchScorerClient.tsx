"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, Download, ChevronRight, ChevronLeft } from "lucide-react";
import { useMatchFirestore } from "@/hooks/admin/useMatchFirestore";
import type { MatchPlayer } from "@/types/match";
import type { StatKey, TeamSide } from "@/hooks/admin/useMatchFirestore";
import { ScoreBoard } from "@/components/admin/match/ScoreBoard";
import { GameTimer } from "@/components/admin/match/GameTimer";
import { TeamPanel } from "@/components/admin/match/TeamPanel";
import { MatchControls } from "@/components/admin/match/MatchControls";
import { Timeline } from "@/components/admin/match/Timeline";
import { matchToCSV } from "@/lib/firebase/matchFirestore";
import { updateMatch } from "@/lib/firebase/matchFirestore";

interface Props {
  matchId: string;
}

export function MatchScorerClient({ matchId }: Props) {
  const {
    match, loading, error, isConnected,
    statUp, statDown, setPlayerStatus, setStatus,
    startOvertime, undo, logEvent,
    startTimer, pauseTimer, resetShot,
    elapsedSeconds, shotSeconds,
    renamePlayer, renumberPlayer, renameTeam,
  } = useMatchFirestore(matchId);

  const [showTimeline, setShowTimeline] = useState(false);

  // ── Callbacks ─────────────────────────────────────────────────────────────

  const handleUp = useCallback((side: TeamSide, pid: string, key: StatKey) => {
    statUp(side, pid, key);
  }, [statUp]);

  const handleDown = useCallback((side: TeamSide, pid: string, key: StatKey) => {
    statDown(side, pid, key);
  }, [statDown]);

  const handleStatusChange = useCallback((side: TeamSide, pid: string, status: MatchPlayer["status"]) => {
    setPlayerStatus(side, pid, status);
  }, [setPlayerStatus]);

  const handleRename = useCallback((side: TeamSide, pid: string, name: string) => {
    renamePlayer(side, pid, name);
  }, [renamePlayer]);

  const handleRenumber = useCallback((side: TeamSide, pid: string, number: number) => {
    renumberPlayer(side, pid, number);
  }, [renumberPlayer]);

  const handleRenameTeam = useCallback((side: TeamSide, name: string) => {
    renameTeam(side, name);
  }, [renameTeam]);

  const handleTimeout = useCallback((side: TeamSide) => {
    if (!match) return;
    logEvent({ team: side === "teamA" ? "A" : "B", action: "TIMEOUT", scoreA: match.teamA.score, scoreB: match.teamB.score });
  }, [match, logEvent]);

  const handleStartMatch = useCallback(() => {
    setStatus("LIVE");
    startTimer();
  }, [setStatus, startTimer]);

  const handlePause = useCallback(() => {
    setStatus("PAUSED");
    pauseTimer();
  }, [setStatus, pauseTimer]);

  const handleResume = useCallback(() => {
    setStatus("LIVE");
    startTimer();
  }, [setStatus, startTimer]);

  const handleFinish = useCallback(() => {
    setStatus("FINISHED");
    pauseTimer();
  }, [setStatus, pauseTimer]);

  const handleReset = useCallback(async () => {
    if (!match) return;
    // Reset scores and stats to zero
    const resetPlayers = (players: typeof match.teamA.players) =>
      players.map(p => ({
        ...p,
        stats: { onePoint: 0, twoPoint: 0, freeThrow: 0, rebounds: 0, dreb: 0, oreb: 0, assists: 0, fouls: 0, steals: 0, blocks: 0, turnovers: 0, plusMinus: 0, minutesPlayed: 0 },
        points: 0,
        status: "bench" as const,
      }));

    await updateMatch(matchId, {
      meta: {
        ...match.meta,
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
        lastUpdated: Date.now(),
      },
      teamA: { ...match.teamA, players: resetPlayers(match.teamA.players), score: 0, totalFouls: 0 },
      teamB: { ...match.teamB, players: resetPlayers(match.teamB.players), score: 0, totalFouls: 0 },
      timeline: [],
      lastAction: null,
    });
  }, [match, matchId]);

  const handleExportCSV = useCallback(() => {
    if (!match) return;
    const csv = matchToCSV(match);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `match_${matchId}_${match.meta.date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [match, matchId]);

  // ── Render states ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#555] text-sm">Connecting to match...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-bold mb-2">{error || "Match not found"}</p>
          <p className="text-[#555] text-sm">Check the match ID and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden select-none"
      style={{ fontFamily: "var(--font-admin, Inter, system-ui, sans-serif)" }}>

      {/* ── Top bar: connection + controls ─────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#080808] border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          {isConnected
            ? <Wifi className="w-3.5 h-3.5 text-green-400" />
            : <WifiOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
          <span className="text-[10px] text-[#444]">
            {isConnected ? "Live" : "Reconnecting..."}
          </span>
          <span className="text-[10px] text-[#333]">·</span>
          <span className="text-[10px] text-[#333] font-mono">{matchId.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors border border-[#1e1e1e]">
            <Download className="w-3 h-3" />CSV
          </button>
          <button onClick={() => setShowTimeline(s => !s)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-colors ${
              showTimeline ? "text-amber-400 border-amber-500/20 bg-amber-500/10" : "text-[#555] border-[#1e1e1e] hover:text-white hover:bg-[#1a1a1a]"
            }`}>
            {showTimeline ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            Log
          </button>
        </div>
      </div>

      {/* ── Scoreboard ─────────────────────────────────────────────────── */}
      <ScoreBoard
        teamAName={match.teamA.name}
        teamBName={match.teamB.name}
        scoreA={match.teamA.score}
        scoreB={match.teamB.score}
        status={match.meta.status}
        overtimePeriod={match.meta.overtimePeriod}
        tournamentName={match.meta.tournamentName}
        court={match.meta.court}
        date={match.meta.date}
      />

      {/* ── Timer ──────────────────────────────────────────────────────── */}
      <GameTimer
        elapsedSeconds={elapsedSeconds}
        shotSeconds={shotSeconds}
        isRunning={match.meta.gameTimerRunning}
        status={match.meta.status}
        onStart={startTimer}
        onPause={async () => await pauseTimer()}
        onResetShot={resetShot}
      />

      {/* ── Main content area ──────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Team A */}
        <div className="flex-1 overflow-hidden border-r border-[#1a1a1a]">
          <TeamPanel
            team={match.teamA}
            side="teamA"
            accent="blue"
            onUp={handleUp}
            onDown={handleDown}
            onStatusChange={handleStatusChange}
            onTimeout={() => handleTimeout("teamA")}
            onRename={handleRename}
            onRenumber={handleRenumber}
            onRenameTeam={handleRenameTeam}
          />
        </div>

        {/* Team B */}
        <div className="flex-1 overflow-hidden">
          <TeamPanel
            team={match.teamB}
            side="teamB"
            accent="orange"
            onUp={handleUp}
            onDown={handleDown}
            onStatusChange={handleStatusChange}
            onTimeout={() => handleTimeout("teamB")}
            onRename={handleRename}
            onRenumber={handleRenumber}
            onRenameTeam={handleRenameTeam}
          />
        </div>

        {/* Timeline sidebar */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-[#1a1a1a] overflow-hidden flex flex-col"
            >
              <div className="px-3 py-2 bg-[#0d0d0d] border-b border-[#1a1a1a]">
                <h3 className="text-[10px] text-[#555] uppercase tracking-widest font-bold">Event Log</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <Timeline events={match.timeline} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Match controls ──────────────────────────────────────────────── */}
      <MatchControls
        status={match.meta.status}
        onStart={handleStartMatch}
        onPause={handlePause}
        onResume={handleResume}
        onFinish={handleFinish}
        onReset={handleReset}
        onStartOT={startOvertime}
        onUndo={undo}
        canUndo={!!match.lastAction}
      />
    </div>
  );
}
