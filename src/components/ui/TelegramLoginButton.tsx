"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import type { TelegramAuthData } from "@/app/api/auth/telegram/route";

interface Props {
  redirectTo?: string;
  label?: string;
  size?: "large" | "medium" | "small";
}

type State = "idle" | "loading" | "success" | "error";

declare global {
  interface Window {
    // Telegram widget callback — must be global
    onTelegramAuthCallback: (user: TelegramAuthData) => void;
  }
}

export function TelegramLoginButton({
  redirectTo = "/profile",
  label,
  size = "large",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { loginWithTelegram } = useAuthStore();
  const router = useRouter();

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const isConfigured = !!botUsername && botUsername !== "your_bot_username_here";

  const handleTelegramAuth = useCallback(
    async (tgData: TelegramAuthData) => {
      setState("loading");
      setErrorMsg("");

      try {
        // 1. Verify with our API (server checks hash with bot token)
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tgData),
        });

        const json = await res.json();

        if (!res.ok || !json.ok) {
          setState("error");
          setErrorMsg(json.error ?? "Ошибка верификации Telegram");
          return;
        }

        // 2. Store user in auth store
        const ok = await loginWithTelegram(tgData);
        if (ok) {
          setState("success");
          setTimeout(() => router.replace(redirectTo), 900);
        } else {
          setState("error");
          setErrorMsg("Не удалось создать аккаунт");
        }
      } catch {
        setState("error");
        setErrorMsg("Ошибка сети. Попробуйте ещё раз.");
      }
    },
    [loginWithTelegram, redirectTo, router]
  );

  useEffect(() => {
    if (!isConfigured || !containerRef.current) return;

    // Register global callback for Telegram widget
    window.onTelegramAuthCallback = handleTelegramAuth;

    // Remove old script if exists
    if (scriptRef.current) scriptRef.current.remove();

    // Inject official Telegram widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername!);
    script.setAttribute("data-size", size);
    script.setAttribute("data-onauth", "onTelegramAuthCallback(user)");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-userpic", "false");
    script.async = true;

    scriptRef.current = script;
    containerRef.current.appendChild(script);

    return () => {
      script.remove();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).onTelegramAuthCallback;
    };
  }, [isConfigured, botUsername, size, handleTelegramAuth]);

  // ── Not configured — show setup button ──────────────────────────────
  if (!isConfigured) {
    return <NotConfigured />;
  }

  // ── Configured — show state overlays + Telegram widget ─────────────
  return (
    <div className="relative">
      {/* Telegram widget container (renders official widget) */}
      <div
        ref={containerRef}
        className={`flex justify-center transition-opacity ${state !== "idle" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      />

      {/* State overlays */}
      <AnimatePresence mode="wait">
        {state === "loading" && (
          <motion.div key="loading" {...fadeProps}
            className="flex items-center justify-center gap-2.5 h-12 w-full bg-[#2AABEE]/10 border border-[#2AABEE]/20 rounded-xl text-[#2AABEE] text-sm font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            Проверяем данные Telegram...
          </motion.div>
        )}

        {state === "success" && (
          <motion.div key="success" {...fadeProps}
            className="flex items-center justify-center gap-2.5 h-12 w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Вход выполнен! Переходим...
          </motion.div>
        )}

        {state === "error" && (
          <motion.div key="error" {...fadeProps} className="space-y-2">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/8 border border-red-500/15 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{errorMsg}</span>
            </div>
            <button
              onClick={() => setState("idle")}
              className="w-full h-10 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
            >
              Попробовать ещё раз
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────
function NotConfigured() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-amber-400 text-sm font-semibold">Telegram бот не настроен</p>
          <p className="text-[rgb(var(--muted))] text-xs mt-0.5">
            Добавь <code className="bg-[rgb(var(--surface-2))] px-1 rounded">NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</code> в <code className="bg-[rgb(var(--surface-2))] px-1 rounded">.env.local</code>
          </p>
        </div>
      </div>

      <details className="group">
        <summary className="text-xs text-[rgb(var(--muted))] cursor-pointer hover:text-[rgb(var(--foreground))] transition-colors select-none">
          Инструкция по настройке ▸
        </summary>
        <div className="mt-3 p-4 bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-2xl space-y-2 text-xs text-[rgb(var(--muted))] leading-relaxed">
          <p className="font-semibold text-[rgb(var(--foreground))]">Настройка за 3 шага:</p>
          <ol className="space-y-1.5 list-decimal list-inside">
            <li>
              Открой <a href="https://t.me/BotFather" target="_blank" className="text-[#2AABEE] hover:underline">@BotFather</a> →{" "}
              <code>/newbot</code> → получи токен
            </li>
            <li>
              В <code>@BotFather</code> → <code>/setdomain</code> → укажи{" "}
              <code>localhost</code> (для dev) и свой домен (для prod)
            </li>
            <li>
              Добавь в <code>.env.local</code>:<br />
              <code className="text-emerald-400">
                TELEGRAM_BOT_TOKEN=1234567:ABC...<br />
                NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot
              </code>
            </li>
          </ol>
          <p className="text-xs text-amber-400 mt-2">
            ⚡ После изменения .env.local перезапусти <code>npm run dev</code>
          </p>
        </div>
      </details>
    </div>
  );
}

const fadeProps = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2 },
};
