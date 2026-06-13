"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Send, Loader2, CheckCircle } from "lucide-react";

type State = "idle" | "loading" | "waiting" | "success" | "error" | "expired";

interface Props {
  redirectTo?: string;
}

// Persist the pending session across tab reloads. Mobile browsers frequently
// discard a backgrounded tab while the user is in the Telegram app sharing
// their contact — without this the sessionId (and the login) would be lost.
const PENDING_KEY = "uha-tg-pending-session";

interface PendingSession {
  sessionId: string;
  expiresAt: number;
}

function readPending(): PendingSession | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingSession;
    if (!p.sessionId || p.expiresAt < Date.now()) {
      localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

function writePending(sessionId: string) {
  try {
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ sessionId, expiresAt: Date.now() + 10 * 60 * 1000 }),
    );
  } catch { /* ignore */ }
}

function clearPending() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
}

export function BotAuthButton({ redirectTo = "/profile" }: Props) {
  const [state, setState] = useState<State>("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<string | null>(null);
  const setUser = useAuthStore(s => s.setUser);
  const router = useRouter();

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  // Single poll tick — checks session status and completes login when ready.
  const pollOnce = useCallback(async () => {
    const sessionId = sessionRef.current;
    if (!sessionId) return;
    try {
      const r = await fetch(`/api/auth/bot/session?id=${sessionId}`);
      const data = await r.json();
      if (data.status === "completed" && data.user) {
        stopPolling();
        clearPending();
        sessionRef.current = null;
        setUser(data.user);
        setState("success");
        setTimeout(() => router.replace(redirectTo), 800);
      } else if (data.status === "expired" || data.error === "not found") {
        stopPolling();
        clearPending();
        sessionRef.current = null;
        setState("expired");
      }
    } catch { /* ignore transient poll errors */ }
  }, [stopPolling, setUser, router, redirectTo]);

  // Begin polling a session (used both for a fresh start and on resume).
  const beginPolling = useCallback((sessionId: string) => {
    sessionRef.current = sessionId;
    writePending(sessionId);
    setState("waiting");
    stopPolling();
    void pollOnce(); // immediate check
    pollRef.current = setInterval(pollOnce, 2000);
  }, [pollOnce, stopPolling]);

  // On mount: resume any session left pending from before a tab reload
  // (the mobile round-trip through the Telegram app). This is what makes
  // login complete reliably on phones.
  useEffect(() => {
    const pending = readPending();
    if (pending) beginPolling(pending.sessionId);
    return () => stopPolling();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the user returns to this tab (back from Telegram), poll immediately
  // and make sure the interval is alive — don't kill it.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!sessionRef.current) return;
      void pollOnce();
      if (!pollRef.current) {
        pollRef.current = setInterval(pollOnce, 2000);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [pollOnce]);

  const startAuth = () => {
    setState("loading");

    // Open a tab SYNCHRONOUSLY inside the tap gesture. On mobile, calling
    // window.open() after an `await` is treated as a non-user-initiated popup
    // and silently blocked — which is why the redirect to Telegram never
    // happened on phones. We open a blank tab now and point it at the bot URL
    // once the session is created.
    const popup = window.open("", "_blank");

    (async () => {
      try {
        const res = await fetch("/api/auth/bot/session", { method: "POST" });
        if (!res.ok) throw new Error("init failed");
        const { sessionId, botUrl } = await res.json();

        beginPolling(sessionId);

        if (popup && !popup.closed) {
          // Reuse the tab we opened in the gesture.
          popup.location.href = botUrl;
        } else {
          // Popup blocked (some in-app browsers) → navigate this tab instead.
          // When the user returns, resume-on-mount picks the session back up.
          window.location.href = botUrl;
        }

        // Auto-expire UI after 10 min
        setTimeout(() => {
          if (sessionRef.current === sessionId) {
            stopPolling();
            clearPending();
            setState(s => s === "waiting" ? "expired" : s);
          }
        }, 10 * 60 * 1000);
      } catch {
        if (popup && !popup.closed) popup.close();
        setState("error");
      }
    })();
  };

  const cancel = () => {
    stopPolling();
    clearPending();
    sessionRef.current = null;
    setState("idle");
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
        <button onClick={cancel}
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
