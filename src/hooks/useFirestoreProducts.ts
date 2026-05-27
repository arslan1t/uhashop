"use client";

import { useEffect } from "react";
import { useCustomProducts } from "@/store/customProducts";
import { isFirebaseConfigured } from "@/lib/firebase/config";

/**
 * Mount this hook once (in Providers or MarketplaceClient).
 * It subscribes to the Firestore "shop_products" collection
 * and keeps the Zustand store in sync across all devices in real time.
 */
export function useFirestoreProducts() {
  const setProducts = useCustomProducts(s => s.setProducts);
  const setFirestoreSynced = useCustomProducts(s => s.setFirestoreSynced);

  useEffect(() => {
    if (typeof window === "undefined" || !isFirebaseConfigured()) return;

    let unsubscribe: (() => void) | null = null;

    import("@/lib/firebase/productFirestore").then(({ subscribeToProducts }) => {
      unsubscribe = subscribeToProducts((products) => {
        setProducts(products);
        setFirestoreSynced();
      });
    }).catch(console.error);

    return () => {
      unsubscribe?.();
    };
  }, [setProducts, setFirestoreSynced]);
}
