/**
 * Admin overrides store — persists image order & main image per product.
 * Synced to Firestore so changes are visible on ALL devices.
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
  mergeOverrides: (incoming: Record<string, ProductOverride>) => void;
  clearOverride: (slug: string) => void;
  hydrate: () => void;
}

function loadFromStorage(): Record<string, ProductOverride> {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed?.state?.overrides) return parsed.state.overrides;
    return parsed as Record<string, ProductOverride>;
  } catch {
    return {};
  }
}

function save(overrides: Record<string, ProductOverride>) {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

function syncToFirestore(entry: ProductOverride) {
  if (typeof window === "undefined") return;
  // Persist via the server admin API (Admin SDK) — client-side Firestore writes
  // to shop_overrides are blocked by security rules, so a direct setDoc would
  // silently fail and the image change would never sync to other devices.
  const token = safeStorage.getItem("uha-admin-token") ?? "";
  fetch("/api/admin/overrides", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": token },
    body: JSON.stringify(entry),
  }).catch(console.error);
}

export const useProductOverrides = create<OverridesStore>()((set) => ({
  overrides: {},

  hydrate: () => {
    const raw = loadFromStorage();
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
      const entry = { ...state.overrides[slug], slug, ...data };
      const updated = { ...state.overrides, [slug]: entry };
      save(updated);
      syncToFirestore(entry); // ← sync to Firestore for all devices
      return { overrides: updated };
    });
  },

  // Called by Firestore subscription to merge remote overrides
  mergeOverrides: (incoming) => {
    set(state => {
      const merged = { ...state.overrides, ...incoming };
      save(merged);
      return { overrides: merged };
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
