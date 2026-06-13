"use client";

import { useEffect } from "react";
import { usePlayerSets } from "@/store/playerSets";
import { isFirebaseConfigured } from "@/lib/firebase/config";

/** Real-time Firestore subscription for player sets. Call once in Providers. */
export function useFirestoreSets() {
  const setSets = usePlayerSets(s => s.setSets);

  useEffect(() => {
    if (typeof window === "undefined" || !isFirebaseConfigured()) return;
    let unsubscribe: (() => void) | null = null;

    import("@/lib/firebase/setsFirestore").then(({ subscribeToSets }) => {
      unsubscribe = subscribeToSets((sets) => {
        setSets(sets.sort((a, b) => a.displayOrder - b.displayOrder));
      });
    }).catch(console.error);

    return () => { unsubscribe?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
