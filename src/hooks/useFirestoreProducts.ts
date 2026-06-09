"use client";

import { useEffect, useRef } from "react";
import { useCustomProducts } from "@/store/customProducts";
import { useProductOverrides } from "@/store/productOverrides";
import { useProductMeta } from "@/store/productMeta";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { Product } from "@/types";

/**
 * Subscribes to Firestore "shop_products" and keeps Zustand in sync.
 *
 * Logic:
 * 1. On mount: if localStorage has products not yet in Firestore → migrate them up
 * 2. Firestore subscription: MERGE — Firestore wins for same ID, local-only products preserved
 *    (prevents race condition where async save hasn't completed yet)
 * 3. Never wipe the store with an empty Firestore response
 */
export function useFirestoreProducts() {
  const setProducts        = useCustomProducts(s => s.setProducts);
  const setFirestoreSynced = useCustomProducts(s => s.setFirestoreSynced);
  const firestoreSynced    = useCustomProducts(s => s._firestoreSynced);
  const hydrated           = useCustomProducts(s => s._hydrated);
  const localProducts      = useCustomProducts(s => s.products);
  const mergeOverrides     = useProductOverrides(s => s.mergeOverrides);
  const mergeMeta          = useProductMeta(s => s.mergeMeta);
  const meta               = useProductMeta(s => s.meta);
  const migrated           = useRef(false);

  // Always-fresh meta ref — the onSnapshot callback can't directly close over reactive state
  const metaRef = useRef(meta);
  metaRef.current = meta;

  const MIGRATION_DONE_KEY = "uha-firestore-migrated-v2";

  // ── Step 1: one-time migration localStorage → Firestore ───────────────────
  // Only runs ONCE per device (flag stored in localStorage).
  // Skipped entirely if device already synced (flag present).
  useEffect(() => {
    if (!hydrated || migrated.current) return;
    if (typeof window === "undefined" || !isFirebaseConfigured()) return;
    migrated.current = true;

    const alreadyMigrated = localStorage.getItem(MIGRATION_DONE_KEY);
    if (alreadyMigrated || localProducts.length === 0) return;

    // Mark as migrated first so refresh/race doesn't re-run
    localStorage.setItem(MIGRATION_DONE_KEY, "1");

    import("@/lib/firebase/productFirestore").then(({ saveProductToFirestore }) => {
      Promise.all(localProducts.map(p => saveProductToFirestore(p)))
        .catch(console.error);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // ── Step 2: real-time Firestore subscription ───────────────────────────────
  // After first sync Firestore is THE source of truth — completely replaces local.
  useEffect(() => {
    if (typeof window === "undefined" || !isFirebaseConfigured()) return;

    let unsubscribe: (() => void) | null = null;
    let firstFire = true;

    import("@/lib/firebase/productFirestore").then(({ subscribeToProducts }) => {
      unsubscribe = subscribeToProducts((firestoreProducts) => {
        if (firstFire && firestoreProducts.length === 0) {
          // Firestore empty on first fire → keep local (migration may not be done yet)
          firstFire = false;
          return;
        }
        firstFire = false;

        // MERGE: Firestore wins for same ID, preserve pending-local,
        // but exclude products marked as deleted in local meta (fix delete race condition)
        setProducts((prev: Product[]) => {
          const firestoreIds = new Set(firestoreProducts.map((p: Product) => p.id));
          const pendingLocal = prev.filter((p: Product) => !firestoreIds.has(p.id));
          // Filter out Firestore products already deleted locally (before Firestore confirms)
          const filteredFirestore = firestoreProducts.filter(
            (p: Product) => !metaRef.current[p.id]?.isDeleted
          );
          return [...filteredFirestore, ...pendingLocal];
        });
        setFirestoreSynced();
      });
    }).catch(console.error);

    return () => { unsubscribe?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 3: real-time overrides subscription (main image changes) ──────────
  useEffect(() => {
    if (typeof window === "undefined" || !isFirebaseConfigured()) return;

    let unsubscribe: (() => void) | null = null;

    import("@/lib/firebase/overridesFirestore").then(({ subscribeToOverrides }) => {
      unsubscribe = subscribeToOverrides((overrides) => {
        if (Object.keys(overrides).length > 0) {
          mergeOverrides(overrides);
        }
      });
    }).catch(console.error);

    return () => { unsubscribe?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 4: product meta (isFeatured, isDeleted) subscription ─────────────
  useEffect(() => {
    if (typeof window === "undefined" || !isFirebaseConfigured()) return;

    let unsubscribe: (() => void) | null = null;

    import("@/lib/firebase/metaFirestore").then(({ subscribeToMeta }) => {
      unsubscribe = subscribeToMeta((meta) => {
        if (Object.keys(meta).length > 0) {
          mergeMeta(meta);
        }
      });
    }).catch(console.error);

    return () => { unsubscribe?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
