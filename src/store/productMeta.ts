/**
 * Persists admin-toggled metadata for static products.
 * Synced to Firestore "shop_meta" — changes visible on ALL devices.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "@/lib/storage";

interface ProductMeta {
  isFeatured?: boolean;
  status?: "published" | "draft" | "archived";
  isDeleted?: boolean;
}

interface ProductMetaStore {
  meta: Record<string, ProductMeta>;
  featuredOrder: string[];
  setFeatured: (id: string, value: boolean) => void;
  setStatus: (id: string, status: "published" | "draft" | "archived") => void;
  setDeleted: (id: string, value: boolean) => void;
  setFeaturedOrder: (ids: string[]) => void;
  getMeta: (id: string) => ProductMeta;
  mergeMeta: (incoming: Record<string, ProductMeta>) => void;
}

function syncMeta(id: string, data: ProductMeta) {
  if (typeof window === "undefined") return;
  // Persist via the server admin API (Admin SDK) — client writes to shop_meta
  // are blocked by security rules, so feature/archive/delete toggles would
  // otherwise never sync to other devices or the public site.
  const token = safeStorage.getItem("uha-admin-token") ?? "";
  fetch("/api/admin/meta", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": token },
    body: JSON.stringify({ id, ...data }),
  }).catch(console.error);
}

export const useProductMeta = create<ProductMetaStore>()(
  persist(
    (set, get) => ({
      meta: {},
      featuredOrder: [],

      setFeatured: (id, value) => {
        set(state => ({
          meta: { ...state.meta, [id]: { ...state.meta[id], isFeatured: value } },
        }));
        syncMeta(id, { ...get().meta[id], isFeatured: value });
      },

      setStatus: (id, status) => {
        set(state => ({
          meta: { ...state.meta, [id]: { ...state.meta[id], status } },
        }));
        syncMeta(id, { ...get().meta[id], status });
      },

      setDeleted: (id, value) => {
        set(state => ({
          meta: { ...state.meta, [id]: { ...state.meta[id], isDeleted: value } },
        }));
        syncMeta(id, { ...get().meta[id], isDeleted: value });
      },

      setFeaturedOrder: (ids) => set({ featuredOrder: ids }),

      getMeta: (id) => get().meta[id] ?? {},

      mergeMeta: (incoming) => {
        set(state => ({ meta: { ...state.meta, ...incoming } }));
      },
    }),
    { name: "uha-product-meta" }
  )
);
