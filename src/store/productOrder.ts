/**
 * Store for custom product display order per marketplace category.
 * Persisted locally and synced with Firestore via /api/admin/ordering.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "@/lib/storage";

const TOKEN_KEY = "uha-admin-token";
function getAdminToken() { return safeStorage.getItem(TOKEN_KEY) ?? ""; }

interface ProductOrderStore {
  /** category → ordered product IDs (first = top of list) */
  orders: Record<string, string[]>;
  setOrder: (category: string, ids: string[]) => void;
  getOrder: (category: string) => string[];
  /** Load all category orders from Firestore via admin API */
  loadFromServer: () => Promise<void>;
  /** Persist one category's order to Firestore via admin API */
  saveToServer: (category: string, ids: string[]) => Promise<void>;
}

export const useProductOrder = create<ProductOrderStore>()(
  persist(
    (set, get) => ({
      orders: {},

      setOrder: (category, ids) =>
        set(state => ({ orders: { ...state.orders, [category]: ids } })),

      getOrder: (category) => get().orders[category] ?? [],

      loadFromServer: async () => {
        try {
          const res = await fetch("/api/admin/ordering");
          if (!res.ok) return;
          const { orders } = await res.json();
          if (orders && typeof orders === "object") {
            set({ orders });
          }
        } catch { /* offline — use cached */ }
      },

      saveToServer: async (category, ids) => {
        set(state => ({ orders: { ...state.orders, [category]: ids } }));
        try {
          await fetch("/api/admin/ordering", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
            body: JSON.stringify({ category, ids }),
          });
        } catch (e) {
          console.error("[UHA] Order save failed:", e);
        }
      },
    }),
    { name: "uha-product-order" }
  )
);
