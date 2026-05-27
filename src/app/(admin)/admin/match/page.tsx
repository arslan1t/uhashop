"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Play, Clock, CheckSquare, Zap, ExternalLink, Trash2, AlertCircle } from "lucide-react";
import { createMatch, listMatches, deleteMatch } from "@/lib/firebase/matchFirestore";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { createMatchTemplate } from "@/types/match";
import type { MatchDocument } from "@/types/match";

const STATUS_ICONS: Record<string, React.ElementType> = {
  "LIVE": Zap, "PAUSED": Clock, "PRE-GAME": Play, "FINISHED": CheckSquare, "OVERTIME": Zap,
};
const STATUS_COLORS: Record<string, string> = {
  "LIVE": "text-green-400 bg-green-500/10 border-green-500/20",
  "PAUSED": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "PRE-GAME": "text-[#555] bg-[#111] border-[#222]",
  "FINISHED": "text-[#444] bg-[#0d0d0d] border-[#1a1a1a]",
  "OVERTIME": "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

function genId() {
  return `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function MatchListPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<{ id: string; data: MatchDocument }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    teamAName: "",
    teamBName: "",
    tournamentName: "Spring Takeover CUP 3X3",
    court: "Court 1",
    date: new Date().toISOString().slice(0, 10),
    round: "",
  });

  const defaultPlayers = [
    { number: 4, name: "Player 1" },
    { number: 7, name: "Player 2" },
    { number: 11, name: "Player 3" },
    { number: 15, name: "Player 4" },
  ];

  const firebaseReady = isFirebaseConfigured();

  useEffect(() => {
    if (!firebaseReady) { setLoading(false); return; }
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 8000); // fail-safe
    listMatches()
      .then(list => { setMatches(list); setLoading(false); clearTimeout(timeout); })
      .catch(err => {
        console.error("Firestore error:", err);
        setLoading(false);
        clearTimeout(timeout);
      });
    return () => clearTimeout(timeout);
  }, []);

  const handleCreate = async () => {
    if (!form.teamAName || !form.teamBName || !firebaseReady) return;
    setCreating(true);
    setCreateError("");
    try {
      const id = genId();
      const doc = createMatchTemplate({
        teamAName: form.teamAName,
        teamBName: form.teamBName,
        teamAPlayers: defaultPlayers,
        teamBPlayers: defaultPlayers,
        tournamentName: form.tournamentName,
        court: form.court,
        date: form.date,
        round: form.round || undefined,
      });
      await createMatch(id, doc);
      router.push(`/admin/match/${id}`);
    } catch (err: any) {
      console.error("Create match failed:", err);
      const msg = err?.code === "permission-denied"
        ? "Нет доступа. Проверь Firestore Rules — включи Test Mode."
        : err?.code === "unavailable" || err?.code === "not-found"
        ? "Firestore не найден. Создай базу данных в Firebase Console → Firestore Database."
        : `Ошибка: ${err?.message ?? "неизвестная ошибка"}`;
      setCreateError(msg);
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    try {
      await deleteMatch(id);
      setMatches(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert("Ошибка удаления: " + (err?.message ?? "unknown"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white">Scorer Panel</h1>
          <p className="text-[#444] text-xs mt-0.5">UHA 3x3 League — Match Management</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          disabled={!firebaseReady}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/15 text-green-400 border border-green-500/25 rounded-lg text-sm font-bold hover:bg-green-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" /> New Match
        </button>
      </div>

      {/* Firebase not configured banner */}
      {!firebaseReady && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 text-sm font-bold mb-1">Firebase не настроен</p>
            <p className="text-[#666] text-xs leading-relaxed">
              Для работы realtime-системы нужно подключить Firebase.
              Скопируй <code className="text-yellow-400/70">.env.local.example</code> в <code className="text-yellow-400/70">.env.local</code>{" "}
              и заполни данные из{" "}
              <a href="https://console.firebase.google.com" target="_blank" className="text-yellow-400 hover:underline">
                Firebase Console
              </a>.
            </p>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-[#111] border border-[#222] rounded-xl space-y-3"
        >
          <h2 className="text-sm font-bold text-[#888] uppercase tracking-wider">Create New Match</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Team A", key: "teamAName", placeholder: "NAMANGAN team" },
              { label: "Team B", key: "teamBName", placeholder: "Banana Team" },
              { label: "Tournament", key: "tournamentName", placeholder: "Spring Takeover CUP 3X3" },
              { label: "Court", key: "court", placeholder: "Court 1" },
              { label: "Date", key: "date", placeholder: "", type: "date" },
              { label: "Round", key: "round", placeholder: "Pool A / Quarter-Final / Final" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-[10px] text-[#555] uppercase tracking-wider mb-1">{label}</label>
                <input
                  type={type || "text"}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full h-9 px-3 bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg text-sm text-white placeholder:text-[#333] focus:outline-none focus:border-green-500/40"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#444]">
            * Роster редактируется в панели после создания. По умолчанию 4 игрока.
          </p>

          {/* Error message */}
          {createError && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-xs font-semibold mb-0.5">Не удалось создать матч</p>
                <p className="text-[#666] text-xs leading-relaxed">{createError}</p>
                {createError.includes("Firestore") && (
                  <a href="https://console.firebase.google.com/project/uha-league/firestore"
                    target="_blank" className="text-amber-400 text-xs hover:underline mt-1 block">
                    → Открыть Firestore в консоли
                  </a>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !form.teamAName || !form.teamBName}
            className="w-full h-10 bg-green-500/15 text-green-400 border border-green-500/25 rounded-lg text-sm font-bold hover:bg-green-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {creating ? (
              <><div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />Создание...</>
            ) : (
              <><Plus className="w-4 h-4" />Создать матч</>
            )}
          </button>
        </motion.div>
      )}

      {/* Match list */}
      {loading ? (
        <div className="py-12 text-center text-[#333] text-sm">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[#333] text-sm mb-3">No matches yet</p>
          <button onClick={() => setShowForm(true)} className="text-green-400 text-sm hover:underline">
            Create your first match
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map(({ id, data }) => {
            const StatusIcon = STATUS_ICONS[data.meta.status] || Play;
            return (
              <div key={id} className="flex items-center gap-3 p-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl hover:border-[#222] transition-colors group">
                {/* Status */}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold w-20 justify-center flex-shrink-0 ${STATUS_COLORS[data.meta.status]}`}>
                  <StatusIcon className="w-2.5 h-2.5" />
                  {data.meta.status}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {data.teamA.name} <span className="text-[#444]">vs</span> {data.teamB.name}
                  </p>
                  <p className="text-[10px] text-[#444] mt-0.5">
                    {data.meta.date} · {data.meta.court} · {data.meta.tournamentName}
                  </p>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-lg font-black tabular-nums font-mono text-white">
                    {data.teamA.score}:{data.teamB.score}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/match/${id}`}
                    className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/15 flex items-center justify-center hover:bg-green-500/20 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={() => handleDelete(id)}
                    className="w-8 h-8 rounded-lg bg-red-500/5 text-red-500/40 border border-red-500/10 flex items-center justify-center hover:bg-red-500/15 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Firebase note */}
      <div className="mt-8 p-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl">
        <p className="text-[10px] text-[#333] leading-relaxed">
          <span className="text-[#555] font-bold">Setup required:</span>{" "}
          Add Firebase credentials to <code className="text-[#444]">.env.local</code> to enable realtime sync.
          See <code className="text-[#444]">.env.local.example</code> for required variables.
        </p>
      </div>
    </div>
  );
}
