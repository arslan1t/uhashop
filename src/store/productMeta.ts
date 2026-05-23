/**
 * Persists admin-toggled metadata for static products:
 * isFeatured, status overrides.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProductMeta {
  isFeatured?: boolean;
  status?: "published" | "draft" | "archived";
}

interface ProductMetaStore {
  meta: Record<string, ProductMeta>;
  /** Ordered list of featured product IDs. Empty = use defaults from data. */
  featuredOrder: string[];
  setFeatured: (id: string, value: boolean) => void;
  setStatus: (id: string, status: "published" | "draft" | "archived") => void;
  setFeaturedOrder: (ids: string[]) => void;
  getMeta: (id: string) => ProductMeta;
}

export const useProductMeta = create<ProductMetaStore>()(
  persist(
    (set, get) => ({
      meta: {},
      featuredOrder: [],

      setFeatured: (id, value) =>
        set(state => ({
          meta: { ...state.meta, [id]: { ...state.meta[id], isFeatured: value } },
        })),

      setStatus: (id, status) =>
        set(state => ({
          meta: { ...state.meta, [id]: { ...state.meta[id], status } },
        })),

      setFeaturedOrder: (ids) => set({ featuredOrder: ids }),

      getMeta: (id) => get().meta[id] ?? {},
    }),
    { name: "uha-product-meta" }
  )
);
