"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Send, Loader2, CheckCircle } from "lucide-react";

type State = "idle" | "loading" | "waiting" | "success" | "error" | "expired";

interface Props {
  redirectTo?: string;
}

export function BotAuthButton({ redirectTo = "/profile" }: Props) {
  const [state, setState] = useState<State>("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setUser = useAuthStore(s => s.setUser);
  const router = useRouter();

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => () => stopPolling(), []);

  // Poll more aggressively when user returns to this tab
  useEffect(() => {
    const onFocus = () => {
      if (state === "waiting") {
        // immediate extra poll on tab focus
        pollRef.current && clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    window.addEventListener("visibilitychange", onFocus);
    return () => window.removeEventListener("visibilitychange", onFocus);
  }, [state]);

  const startAuth = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/auth/bot/session", { method: "POST" });
      if (!res.ok) throw new Error("init failed");
      const { sessionId, botUrl } = await res.json();

      window.open(botUrl, "_blank", "noopener,noreferrer");
      setState("waiting");

      const poll = async () => {
        try {
          const r = await fetch(`/api/auth/bot/session?id=${sessionId}`);
          const data = await r.json();
          if (data.status === "completed" && data.user) {
            stopPolling();
            setUser(data.user);
            setState("success");
            setTimeout(() => router.replace(redirectTo), 800);
          } else if (data.status === "expired") {
            stopPolling();
            setState("expired");
          }
        } catch { /* ignore poll errors */ }
      };

      pollRef.current = setInterval(poll, 2000);

      // Auto-expire UI after 10 min
      setTimeout(() => {
        stopPolling();
        setState(s => s === "waiting" ? "expired" : s);
      }, 10 * 60 * 1000);
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 font-semibold">
        <CheckCircle className="w-5 h-5" /> Вход выполнен!
      </div>
    );
  }

  if (state === "waiting") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#2AABEE]/10 border border-[#2AABEE]/30 rounded-2xl text-[#2AABEE] text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          Ожидание подтверждения в Telegram...
        </div>
        <p className="text-xs text-[rgb(var(--muted))] text-center">
          Поделитесь номером в боте и вернитесь на эту страницу
        </p>
        <button onClick={() => { stopPolling(); setState("idle"); }}
          className="text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] underline-offset-2 hover:underline transition-colors">
          Отменить
        </button>
      </div>
    );
  }

  if (state === "expired") {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-[rgb(var(--muted))] text-center">Время сессии истекло.</p>
        <button onClick={() => setState("idle")}
          className="text-[rgb(var(--accent))] text-sm font-semibold hover:underline">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-red-400 text-center">Ошибка соединения.</p>
        <button onClick={() => setState("idle")}
          className="text-[rgb(var(--accent))] text-sm font-semibold hover:underline">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <button onClick={startAuth} disabled={state === "loading"}
      className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#2AABEE] hover:bg-[#1a9ad7] active:bg-[#1589c0] text-white font-bold rounded-2xl transition-all disabled:opacity-60 text-sm uppercase tracking-wide shadow-lg shadow-[#2AABEE]/20">
      {state === "loading"
        ? <Loader2 className="w-5 h-5 animate-spin" />
        : <Send className="w-5 h-5" />}
      {state === "loading" ? "Подключение..." : "Продолжить через Telegram"}
    </button>
  );
}
