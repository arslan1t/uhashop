"use client";

/**
 * Lightweight top-of-page progress bar for Next.js App Router.
 * Detects navigation start via click events on internal <a> tags,
 * detects completion via usePathname(). Zero dependencies beyond React.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Phase = "idle" | "running" | "done";

export function NavigationProgress() {
  const pathname  = usePathname();
  const prevPath  = useRef(pathname);
  const [phase, setPhase]   = useState<Phase>("idle");
  const [width, setWidth]   = useState(0);
  const [opacity, setOpacity] = useState(1);
  const t1 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t2 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimers = () => {
    clearTimeout(t1.current);
    clearTimeout(t2.current);
  };

  // ── Detect internal link clicks → start bar ──────────────────────────────
  useEffect(() => {
    const onLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      // Skip external, hash, mailto, tel links
      if (!href || /^(https?:\/\/|\/\/|#|mailto:|tel:)/.test(href)) return;
      // Skip download links
      if (anchor.hasAttribute("download")) return;

      clearTimers();
      setPhase("idle");
      setWidth(0);
      setOpacity(1);

      // Tiny delay so browser processes the click first, then we animate
      t1.current = setTimeout(() => {
        setPhase("running");
        setWidth(75); // animate to 75% — CSS transition takes ~1.8s (looks like "loading")
      }, 16);
    };

    document.addEventListener("click", onLinkClick, { capture: true });
    return () => document.removeEventListener("click", onLinkClick, { capture: true });
  }, []);

  // ── Detect navigation complete (pathname changed) ─────────────────────────
  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    clearTimers();
    // Jump to 100%, wait 250ms then fade out, wait 350ms then hide
    setPhase("done");
    setWidth(100);

    t1.current = setTimeout(() => setOpacity(0), 250);
    t2.current = setTimeout(() => {
      setPhase("idle");
      setWidth(0);
      setOpacity(1);
    }, 650);
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => clearTimers, []);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        height: 2,
        width: `${width}%`,
        background: "rgb(var(--accent))",
        boxShadow: "0 0 8px 1px rgb(var(--accent) / 0.45)",
        opacity,
        transition:
          phase === "done"
            ? "width 0.25s ease-out, opacity 0.35s ease 0.25s"
            : width === 0
            ? "none"
            : "width 1.8s cubic-bezier(0.04, 0.92, 0.1, 1)",
      }}
    />
  );
}
