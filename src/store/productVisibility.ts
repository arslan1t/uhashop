/**
 * Product visibility store — controls which products are hidden (coming soon).
 * Hidden products appear on Merch page as blurred "teaser" cards.
 */
import { create } from "zustand";
import { safeStorage } from "@/lib/storage";

const KEY = "uha-hidden-products-v1";

function load(): string[] {
  try {
    const raw = safeStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function save(slugs: string[]) {
  safeStorage.setItem(KEY, JSON.stringify(slugs));
}

interface VisibilityStore {
  hiddenSlugs: string[];
  isHidden: (slug: string) => boolean;
  toggleHidden: (slug: string) => void;
  setHidden: (slug: string, hidden: boolean) => void;
  hydrate: () => void;
}

export const useProductVisibility = create<VisibilityStore>()((set, get) => ({
  hiddenSlugs: load(), // auto-load on client

  hydrate: () => {
    set({ hiddenSlugs: load() });
  },

  isHidden: (slug) => get().hiddenSlugs.includes(slug),

  toggleHidden: (slug) => {
    const current = get().hiddenSlugs;
    const updated = current.includes(slug)
      ? current.filter(s => s !== slug)
      : [...current, slug];
    save(updated);
    set({ hiddenSlugs: updated });
  },

  setHidden: (slug, hidden) => {
    const current = get().hiddenSlugs;
    const updated = hidden
      ? [...new Set([...current, slug])]
      : current.filter(s => s !== slug);
    save(updated);
    set({ hiddenSlugs: updated });
  },
}));
