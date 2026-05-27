"use client";

import { useEffect, useRef } from "react";
import { useCustomProducts } from "@/store/customProducts";
import { isFirebaseConfigured } from "@/lib/firebase/config";

/**
 * Subscribes to Firestore "shop_products" and keeps Zustand in sync.
 *
 * Logic:
 * 1. On mount: if localStorage has products not yet in Firestore → migrate them up
 * 2. Firestore subscription: MERGE incoming products with local ones
 *    (Firestore wins for same ID, keeps local-only products too)
 * 3. Never wipe the store with an empty Firestore response
 */
export function useFirestoreProducts() {
  const setProducts     = useCustomProducts(s => s.setProducts);
  const setFirestoreSynced = useCustomProducts(s => s.setFirestoreSynced);
  const firestoreSynced = useCustomProducts(s => s._firestoreSynced);
  const hydrated        = useCustomProducts(s => s._hydrated);
  const localProducts   = useCustomProducts(s => s.products);
  const migrated        = useRef(false);

  // ── Step 1: migrate localStorage → Firestore on first load ────────────────
  useEffect(() => {
    if (!hydrated || migrated.current) return;
    if (typeof window === "undefined" || !isFirebaseConfigured()) return;
    if (localProducts.length === 0) return;

    migrated.current = true;

    import("@/lib/firebase/productFirestore").then(({ saveProductToFirestore }) => {
      Promise.all(localProducts.map(p => saveProductToFirestore(p)))
        .catch(console.error);
    });
  }, [hydrated, localProducts]);

  // ── Step 2: real-time Firestore subscription ───────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !isFirebaseConfigured()) return;

    let unsubscribe: (() => void) | null = null;

    import("@/lib/firebase/productFirestore").then(({ subscribeToProducts }) => {
      unsubscribe = subscribeToProducts((firestoreProducts) => {
        // Never wipe store with an empty Firestore response
        if (firestoreProducts.length === 0 && !firestoreSynced) return;

        // Merge: build a map from current local products, then overwrite with Firestore
        setProducts((prev: import("@/types").Product[]) => {
          const map = new Map(prev.map(p => [p.id, p]));
          firestoreProducts.forEach(p => map.set(p.id, p));
          return Array.from(map.values());
        });

        setFirestoreSynced();
      });
    }).catch(console.error);

    return () => { unsubscribe?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
