/**
 * Standalone wishlist store — works without auth.
 * Persists to localStorage. Syncs with auth store on login.
 */
import { create } from "zustand";
import { safeStorage } from "@/lib/storage";

const KEY = "uha-wishlist-v2";

function load(): string[] {
  try {
    const raw = safeStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}
function save(slugs: string[]) {
  safeStorage.setItem(KEY, JSON.stringify(slugs));
}

interface WishlistStore {
  slugs: string[];
  hydrate: () => void;
  toggle: (slug: string) => void;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  has: (slug: string) => boolean;
  count: () => number;
}

export const useWishlist = create<WishlistStore>()((set, get) => ({
  slugs: load(),

  hydrate: () => set({ slugs: load() }),

  toggle: (slug) => {
    const current = get().slugs;
    const updated = current.includes(slug)
      ? current.filter(s => s !== slug)
      : [...current, slug];
    save(updated);
    set({ slugs: updated });
  },

  add: (slug) => {
    if (get().slugs.includes(slug)) return;
    const updated = [...get().slugs, slug];
    save(updated);
    set({ slugs: updated });
  },

  remove: (slug) => {
    const updated = get().slugs.filter(s => s !== slug);
    save(updated);
    set({ slugs: updated });
  },

  has: (slug) => get().slugs.includes(slug),
  count: () => get().slugs.length,
}));
