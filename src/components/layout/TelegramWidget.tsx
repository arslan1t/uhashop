"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle } from "lucide-react";

const TELEGRAM_URL = "https://t.me/uha_manager";

const QUICK_ACTIONS = [
  { emoji: "📏", label: "Помощь с размером", msg: "Привет! Помогите с выбором размера" },
  { emoji: "📦", label: "Сроки доставки", msg: "Привет! Хочу узнать сроки доставки" },
  { emoji: "✅", label: "Наличие товара", msg: "Привет! Хочу уточнить наличие" },
  { emoji: "🔄", label: "Оформить заказ", msg: "Привет! Хочу оформить предзаказ" },
];

export function TelegramWidget() {
  const [open, setOpen] = useState(false);

  const openChat = (msg?: string) => {
    const url = msg
      ? `${TELEGRAM_URL}?text=${encodeURIComponent(msg)}`
      : TELEGRAM_URL;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Quick actions panel */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl w-72 overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 bg-[#2AABEE]/10 border-b border-[#2AABEE]/20">
              <div className="w-9 h-9 rounded-xl bg-[#2AABEE] flex items-center justify-center flex-shrink-0">
                <Send className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">UHA SHOP</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span className="text-xs text-[rgb(var(--muted))]">Онлайн · ответим за 30 мин</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="p-3 space-y-1.5">
              <p className="text-xs font-medium text-[rgb(var(--muted))] px-2 mb-2 uppercase tracking-wider">
                Быстрые вопросы
              </p>
              {QUICK_ACTIONS.map(({ emoji, label, msg }) => (
                <button key={label} onClick={() => openChat(msg)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-[rgb(var(--surface-2))] transition-colors text-left group">
                  <span className="text-lg leading-none">{emoji}</span>
                  <span className="font-medium group-hover:text-[rgb(var(--foreground))] text-[rgb(var(--muted))] transition-colors">
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {/* Open Telegram button */}
            <div className="p-3 pt-1">
              <button onClick={() => openChat()}
                className="w-full py-3 bg-[#2AABEE] text-white font-bold rounded-xl hover:bg-[#1a9ad7] transition-colors text-sm flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Открыть Telegram
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="w-14 h-14 bg-[#2AABEE] text-white rounded-2xl shadow-xl shadow-[#2AABEE]/30 flex items-center justify-center relative overflow-hidden"
        aria-label="Open Telegram chat">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring — stays inside button bounds */}
        {!open && (
          <span className="absolute inset-0 rounded-2xl animate-ping bg-[#2AABEE] opacity-20 pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
}
