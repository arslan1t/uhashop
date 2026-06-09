"use client";

import { useEffect, useRef } from "react";
import { useCustomProducts, resyncProductToServer } from "@/store/customProducts";
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
 * 3. Self-heal: any local product missing from Firestore (a save that failed
 *    earlier) is automatically re-pushed — so it can never get stuck local-only
 * 4. Never wipe the store with an empty Firestore response
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

  // Ids we've already re-pushed this session — avoids spamming the API
  const resyncedIds = useRef<Set<string>>(new Set());

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
          // Normalize legacy delivery dates — old Firestore data had "14–21 дней"
          // before the store-wide update to "7–14 дней"
          const normalizedFirestore = filteredFirestore.map((p: Product) => ({
            ...p,
            estimatedDelivery: p.estimatedDelivery === "14–21 дней"
              ? "7–14 дней"
              : p.estimatedDelivery,
          }));
          return [...normalizedFirestore, ...pendingLocal];
        });
        setFirestoreSynced();

        // ── Self-heal: re-push any local product that's missing from Firestore ──
        // This recovers products whose original save failed (e.g. the old
        // undefined-field bug) — they auto-sync on the next load instead of
        // staying stuck local-only forever.
        const firestoreIds = new Set(firestoreProducts.map((p: Product) => p.id));
        const localOnly = useCustomProducts.getState().products.filter((p: Product) =>
          !firestoreIds.has(p.id) &&
          !metaRef.current[p.id]?.isDeleted &&
          !resyncedIds.current.has(p.id)
        );
        if (localOnly.length > 0) {
          // Small delay so a just-added product's in-flight write can land first
          setTimeout(() => {
            localOnly.forEach((p: Product) => {
              resyncedIds.current.add(p.id);
              resyncProductToServer(p).catch(err =>
                console.error(`[UHA] Re-sync failed for ${p.id}:`, err)
              );
            });
          }, 2500);
        }
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
