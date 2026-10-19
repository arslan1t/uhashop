"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { useAcademyAuth } from "@/store/academy";

type State = "idle" | "loading" | "waiting" | "success" | "error" | "expired";

const ACADEMY_TOKEN_KEY = "uha-academy-token";
function getAcademyToken() {
  try { return localStorage.getItem(ACADEMY_TOKEN_KEY) ?? ""; } catch { return ""; }
}

/** Lets an academy parent link their Telegram chat so the admin panel can
 *  send them payment reminders via the bot — Telegram only allows messaging
 *  a user after they've started a chat with it themselves. */
export function AcademyTelegramLinkButton() {
  const [state, setState] = useState<State>("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<string | null>(null);
  const refresh = useAcademyAuth(s => s.refresh);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const pollOnce = useCallback(async () => {
    const sessionId = sessionRef.current;
    if (!sessionId) return;
    try {
      const r = await fetch(`/api/academy/parent-link?id=${sessionId}`);
      const data = await r.json();
      if (data.status === "completed") {
        stopPolling();
        sessionRef.current = null;
        setState("success");
        await refresh();
      } else if (data.status === "expired" || data.error === "not found") {
        stopPolling();
        sessionRef.current = null;
        setState("expired");
      }
    } catch { /* ignore transient poll errors */ }
  }, [stopPolling, refresh]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startLink = () => {
    setState("loading");
    const popup = window.open("", "_blank");

    (async () => {
      try {
        const res = await fetch("/api/academy/parent-link", {
          method: "POST",
          headers: { "x-academy-token": getAcademyToken() },
        });
        if (!res.ok) throw new Error("init failed");
        const { sessionId, botUrl } = await res.json();

        sessionRef.current = sessionId;
        setState("waiting");
        pollRef.current = setInterval(pollOnce, 2000);

        if (popup && !popup.closed) popup.location.href = botUrl;
        else window.location.href = botUrl;
      } catch {
        if (popup && !popup.closed) popup.close();
        setState("error");
      }
    })();
  };

  if (state === "success") {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
        <CheckCircle className="w-3.5 h-3.5" /> Telegram подключен
      </span>
    );
  }

  if (state === "waiting") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[#2AABEE] text-xs font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ожидание подтверждения в Telegram...
      </span>
    );
  }

  if (state === "expired" || state === "error") {
    return (
      <button onClick={() => setState("idle")} className="text-xs text-red-400 hover:underline">
        {state === "expired" ? "Время истекло — попробовать снова" : "Ошибка — попробовать снова"}
      </button>
    );
  }

  return (
    <button onClick={startLink} disabled={state === "loading"}
      className="inline-flex items-center gap-1.5 text-[#2AABEE] hover:text-[#1a9ad7] text-xs font-semibold transition-colors disabled:opacity-50">
      {state === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
      Подключить Telegram для уведомлений
    </button>
  );
}
