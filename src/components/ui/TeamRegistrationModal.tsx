"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function TeamRegistrationModal({ onClose }: Props) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    captainPhone: "",
    captainTg: "",
    players: ["", "", ""], // 3 player names
  });
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...formData.players];
    newPlayers[index] = value;
    setFormData(prev => ({ ...prev, players: newPlayers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.teamName.trim()) {
      setError("Укажите название команды");
      return;
    }
    if (!formData.captainName.trim()) {
      setError("Укажите ФИ капитана");
      return;
    }
    if (!formData.captainPhone.trim()) {
      setError("Укажите номер телефона");
      return;
    }
    if (formData.players.filter(p => p.trim()).length < 3) {
      setError("Укажите 3 игроков");
      return;
    }

    setLoading(true);

    try {
      // Send to API
      const response = await fetch("/api/league/register-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
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
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#101010] border border-[#1e1e1e] rounded-2xl p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white">
              {step === "form" ? "Регистрация Команды" : "Спасибо!"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Название команды *
                </label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={e => handleChange("teamName", e.target.value)}
                  placeholder="Team Dragon"
                  className="w-full h-12 px-4 bg-[#050505] border border-[#1e1e1e] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff6b00] transition-colors"
                />
              </div>

              {/* Captain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">
                    ФИ капитана *
                  </label>
                  <input
                    type="text"
                    value={formData.captainName}
                    onChange={e => handleChange("captainName", e.target.value)}
                    placeholder="Иван Петров"
                    className="w-full h-12 px-4 bg-[#050505] border border-[#1e1e1e] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff6b00] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Telegram *
                  </label>
                  <input
                    type="text"
                    value={formData.captainTg}
                    onChange={e => handleChange("captainTg", e.target.value)}
                    placeholder="@username"
                    className="w-full h-12 px-4 bg-[#050505] border border-[#1e1e1e] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff6b00] transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  value={formData.captainPhone}
                  onChange={e => handleChange("captainPhone", e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full h-12 px-4 bg-[#050505] border border-[#1e1e1e] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff6b00] transition-colors"
                />
              </div>

              {/* Players */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
                  Игроки (3 игрока) *
                </label>
                <div className="space-y-3">
                  {formData.players.map((player, i) => (
                    <input
                      key={i}
                      type="text"
                      value={player}
                      onChange={e => handlePlayerChange(i, e.target.value)}
                      placeholder={`Игрок ${i + 1}`}
                      className="w-full h-12 px-4 bg-[#050505] border border-[#1e1e1e] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff6b00] transition-colors"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#ff6b00] hover:bg-[#ff8533] disabled:opacity-50 text-black font-bold text-sm uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Регистрируем...
                  </>
                ) : (
                  "Зарегистрировать"
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Мы свяжемся с вами в течение 24 часов
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#ff6b00]" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Спасибо!</h3>
              <p className="text-gray-400 mb-8">
                Заявка на регистрацию команды <strong>{formData.teamName}</strong> принята.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Мы свяжемся с капитаном в течение 24 часов через Telegram.
              </p>
              <button
                onClick={onClose}
                className="w-full h-12 bg-[#ff6b00] hover:bg-[#ff8533] text-black font-bold text-sm uppercase tracking-widest rounded-lg transition-all"
              >
                Закрыть
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
