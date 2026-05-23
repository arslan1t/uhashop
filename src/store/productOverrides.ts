/**
 * Admin overrides store — persists image order & main image per product.
 * Manual localStorage management (compatible with existing stored data format).
 */
import { create } from "zustand";
import { safeStorage } from "@/lib/storage";

const STORAGE_KEY = "uha-product-overrides-v1";

export interface ProductOverride {
  slug: string;
  mainImage?: string;
  imageOrder?: string[];
}

interface OverridesStore {
  overrides: Record<string, ProductOverride>;
  setOverride: (slug: string, data: Partial<ProductOverride>) => void;
  clearOverride: (slug: string) => void;
  hydrate: () => void;
}

function loadFromStorage(): Record<string, ProductOverride> {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Guard against zustand/persist format accidentally written: { state: {...}, version: N }
    if (parsed?.state?.overrides) return parsed.state.overrides;
    // Normal format: { slug: { mainImage, imageOrder } }
    return parsed as Record<string, ProductOverride>;
  } catch {
    return {};
  }
}

function save(overrides: Record<string, ProductOverride>) {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export const useProductOverrides = create<OverridesStore>()((set, get) => ({
  overrides: {},

  // Called from Providers useEffect after client mount — guaranteed to have real localStorage
  hydrate: () => {
    const raw = loadFromStorage();
    // Clean up stale blob: URLs that became invalid after browser session ended
    const cleaned: Record<string, ProductOverride> = {};
    for (const [slug, override] of Object.entries(raw)) {
      const cleanedOverride: ProductOverride = { slug };
      if (override.mainImage && !override.mainImage.startsWith("blob:")) {
        cleanedOverride.mainImage = override.mainImage;
      }
      if (override.imageOrder) {
        const validOrder = override.imageOrder.filter(u => !u.startsWith("blob:"));
        if (validOrder.length > 0) cleanedOverride.imageOrder = validOrder;
      }
      cleaned[slug] = cleanedOverride;
    }
    save(cleaned);
    set({ overrides: cleaned });
  },

  setOverride: (slug, data) => {
    set(state => {
      const updated = {
        ...state.overrides,
        [slug]: { ...state.overrides[slug], slug, ...data },
      };
      save(updated);
      return { overrides: updated };
    });
  },

  clearOverride: (slug) => {
    set(state => {
      const updated = { ...state.overrides };
      delete updated[slug];
      save(updated);
      return { overrides: updated };
    });
  },
}));
