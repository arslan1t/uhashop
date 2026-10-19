"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { useAcademyAuth } from "@/store/academy";

type State = "idle" | "loading" | "waiting" | "error" | "expired";

/** Telegram login for academy athletes/parents — alternative to typing
 *  name+PIN. First-time users confirm Имя+PIN once inside the bot; after
 *  that, the same Telegram account logs in with a single tap. */
export function AcademyTelegramLoginButton({ role }: { role: "athlete" | "parent" }) {
  const [state, setState] = useState<State>("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<string | null>(null);
  const loginWithToken = useAcademyAuth(s => s.loginWithToken);
  const router = useRouter();

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const pollOnce = useCallback(async () => {
    const sessionId = sessionRef.current;
    if (!sessionId) return;
    try {
      const r = await fetch(`/api/academy/telegram-login?id=${sessionId}`);
      const data = await r.json();
      if (data.status === "completed" && data.token) {
        stopPolling();
        sessionRef.current = null;
        const result = await loginWithToken(data.token);
        if (result.ok) {
          router.replace("/academy/login"); // login page resolves the destination
        } else {
          setState("error");
        }
      } else if (data.status === "expired" || data.error === "not found") {
        stopPolling();
        sessionRef.current = null;
        setState("expired");
      }
    } catch { /* ignore transient poll errors */ }
  }, [stopPolling, loginWithToken, router]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startLogin = () => {
    setState("loading");
    const popup = window.open("", "_blank");

    (async () => {
      try {
        const res = await fetch("/api/academy/telegram-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        if (!res.ok) throw new Error("init failed");
        const { sessionId, botUrl } = await res.json();

        sessionRef.current = sessionId;
        setState("waiting");
        pollRef.current = setInterval(pollOnce, 2000);
        void pollOnce();

        if (popup && !popup.closed) popup.location.href = botUrl;
        else window.location.href = botUrl;
      } catch {
        if (popup && !popup.closed) popup.close();
        setState("error");
      }
    })();
  };

  if (state === "waiting") {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#2AABEE]/10 border border-[#2AABEE]/30 rounded-2xl text-[#2AABEE] text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> Ожидание подтверждения в Telegram...
        </div>
        <button onClick={() => { stopPolling(); sessionRef.current = null; setState("idle"); }}
          className="text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] underline-offset-2 hover:underline transition-colors">
          Отменить
        </button>
      </div>
    );
  }

  if (state === "expired" || state === "error") {
    return (
      <button onClick={() => setState("idle")}
        className="w-full text-center text-sm text-red-400 hover:underline py-2">
        {state === "expired" ? "Время истекло — попробовать снова" : "Ошибка — попробовать снова"}
      </button>
    );
  }

  return (
    <button onClick={startLogin} disabled={state === "loading"}
      className="w-full flex items-center justify-center gap-2.5 h-12 bg-[#2AABEE] hover:bg-[#1a9ad7] text-white font-bold rounded-2xl transition-all disabled:opacity-60 text-sm uppercase tracking-wide">
      {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      {state === "loading" ? "Подключение..." : "Войти через Telegram"}
    </button>
  );
}
