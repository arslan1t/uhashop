"use client";

import { useEffect } from "react";
import { usePlayerSets } from "@/store/playerSets";
import type { PlayerSet } from "@/types";

/** Fetches player sets via server-side Admin SDK (bypasses Firestore security rules). */
async function fetchSets(): Promise<PlayerSet[]> {
  const res = await fetch("/api/user/sets");
  if (!res.ok) return [];
  const { sets } = await res.json();
  return (sets ?? []) as PlayerSet[];
}

/** Loads sets from Firestore on mount and refreshes every 30 s. */
export function useFirestoreSets() {
  const setSets = usePlayerSets(s => s.setSets);

  useEffect(() => {
    let cancelled = false;

    const load = () =>
      fetchSets()
        .then(sets => {
          if (!cancelled)
            setSets(sets.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
        })
        .catch(() => {});

    load();
    const interval = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
