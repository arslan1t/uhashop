"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, Users } from "lucide-react";

interface Props {
  onClose: () => void;
}

const INP = "w-full h-12 px-4 bg-[#050505] border border-[#1e1e1e] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[rgb(var(--accent))/60] transition-colors text-sm";
const LBL = "block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2";

export function TeamRegistrationModal({ onClose }: Props) {
  const [step, setStep]     = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const [formData, setFormData] = useState({
    teamName:     "",
    captainName:  "",
    captainPhone: "",
    captainTg:    "",
    players:      ["", "", "", ""], // 4 players
  });

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const setPlayer = (index: number, value: string) => {
    const p = [...formData.players];
    p[index] = value;
    setFormData(prev => ({ ...prev, players: p }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teamName.trim())    { setError("Укажите название команды"); return; }
    if (!formData.captainName.trim()) { setError("Укажите ФИ капитана"); return; }
    if (!formData.captainTg.trim())   { setError("Укажите Telegram капитана"); return; }
    if (!formData.captainPhone.trim()) { setError("Укажите телефон"); return; }
    if (formData.players.filter(p => p.trim()).length < 4) {
      setError("Укажите всех 4 игроков команды");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/league/register-team", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка при регистрации");
      }
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl bg-[#0d0d0d] border border-white/8 rounded-2xl overflow-hidden my-auto"
        >
          {/* Red accent top bar */}
          <div className="h-1 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))]" />

          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--accent))]">
                    UHA 3×3 League
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">
                  {step === "form" ? "Регистрация команды" : "Заявка принята!"}
                </h2>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {step === "form" ? (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Team name */}
                <div>
                  <label className={LBL}>Название команды *</label>
                  <input type="text" value={formData.teamName}
                    onChange={e => set("teamName", e.target.value)}
                    placeholder="Team Dragon" className={INP} />
                </div>

                {/* Captain row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={LBL}>ФИ капитана *</label>
                    <input type="text" value={formData.captainName}
                      onChange={e => set("captainName", e.target.value)}
                      placeholder="Иван Петров" className={INP} />
                  </div>
                  <div>
                    <label className={LBL}>Telegram капитана *</label>
                    <input type="text" value={formData.captainTg}
                      onChange={e => set("captainTg", e.target.value)}
                      placeholder="@username" className={INP} />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={LBL}>Телефон *</label>
                  <input type="tel" value={formData.captainPhone}
                    onChange={e => set("captainPhone", e.target.value)}
                    placeholder="+998 90 123 45 67" className={INP} />
                </div>

                {/* 4 players */}
                <div>
                  <label className={LBL}>
                    Состав команды — 4 игрока *
                  </label>
                  <div className="space-y-2.5">
                    {formData.players.map((player, i) => (
                      <div key={i} className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[rgb(var(--accent))] w-4">
                          {i + 1}
                        </span>
                        <input
                          type="text"
                          value={player}
                          onChange={e => setPlayer(i, e.target.value)}
                          placeholder={`Игрок ${i + 1} — Фамилия Имя`}
                          className={`${INP} pl-9`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/25 mt-2">
                    Состав 3×3: 3 игрока на площадке + 1 запасной
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 py-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-[rgb(var(--accent))/25] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Регистрируем…</>
                  ) : (
                    "Зарегистрировать команду"
                  )}
                </button>

                <p className="text-center text-[11px] text-white/25">
                  После отправки мы свяжемся с капитаном через Telegram в течение 24 часов
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--accent))/15] border border-[rgb(var(--accent))/30] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-[rgb(var(--accent))]" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Готово!</h3>
                <p className="text-white/50 mb-2">
                  Команда <span className="text-white font-bold">{formData.teamName}</span> зарегистрирована.
                </p>
                <p className="text-white/30 text-sm mb-8">
                  Уведомление отправлено организаторам в Telegram.
                  Ожидайте подтверждения в течение 24 часов.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all"
                >
                  Закрыть
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
