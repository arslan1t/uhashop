"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary (catches errors in the root layout itself).
 * Like the route-level boundary, it self-heals stale-deploy chunk failures by
 * forcing one hard reload. Must render its own <html>/<body>.
 */
export default function GlobalError({
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
    if (Date.now() - last > 60_000) {
      sessionStorage.setItem(KEY, String(Date.now()));
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fff",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ fontSize: 40 }}>🏀</div>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Что-то пошло не так</h1>
        <p style={{ fontSize: 14, color: "#888", maxWidth: 360 }}>
          Обновите страницу — обычно это решает проблему.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 20px", borderRadius: 12, background: "#991b1b", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            Обновить
          </button>
          <button
            onClick={() => reset()}
            style={{ padding: "10px 20px", borderRadius: 12, background: "transparent", color: "#888", border: "1px solid #333", cursor: "pointer" }}
          >
            Повторить
          </button>
        </div>
      </body>
    </html>
  );
}
