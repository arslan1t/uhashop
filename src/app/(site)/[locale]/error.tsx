"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary for the public site.
 *
 * Its main job: self-heal "stale deploy" crashes. After a new deployment, a tab
 * that was opened earlier still runs the old bundle and tries to load code
 * chunks (or call endpoints) that no longer exist → ChunkLoadError / "Failed to
 * fetch" → white screen. We detect that signature and force ONE hard reload to
 * pull the fresh HTML + current chunks. A sessionStorage guard prevents reload
 * loops for genuine, non-stale errors.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = `${error?.name ?? ""} ${error?.message ?? ""}`;
    const isStale =
      /ChunkLoadError|Loading chunk|Loading CSS chunk|Failed to fetch|dynamically imported module|import\(\)/i.test(
        msg,
      );
    if (!isStale) return;

    const KEY = "uha-stale-reload-at";
    const last = Number(sessionStorage.getItem(KEY) || "0");
    // Only auto-reload at most once per minute, so a persistent failure doesn't loop.
    if (Date.now() - last > 60_000) {
      sessionStorage.setItem(KEY, String(Date.now()));
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-4xl">🏀</div>
      <h1 className="text-lg font-bold">Что-то пошло не так</h1>
      <p className="text-sm text-[rgb(var(--muted))] max-w-sm">
        Обновите страницу — обычно это решает проблему. Если ошибка повторяется, попробуйте позже.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-[rgb(var(--accent))] text-white text-sm font-bold"
        >
          Обновить страницу
        </button>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl border border-[rgb(var(--border))] text-sm font-medium text-[rgb(var(--muted))]"
        >
          Повторить
        </button>
      </div>
    </div>
  );
}
