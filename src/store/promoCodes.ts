import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PromoCode {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string; // ISO date string, optional
}

interface PromoStore {
  codes: PromoCode[];
  addCode: (code: Omit<PromoCode, "id" | "usedCount">) => void;
  updateCode: (id: string, data: Partial<PromoCode>) => void;
  removeCode: (id: string) => void;
  toggleActive: (id: string) => void;
  validate: (input: string, orderTotal: number) => { valid: boolean; code?: PromoCode; error?: string };
  applyUse: (id: string) => void;
}

const DEFAULT_CODES: PromoCode[] = [
  {
    id: "1",
    code: "HOOPER10",
    discountType: "percent",
    discountValue: 10,
    minOrder: 50,
    usedCount: 0,
    active: true,
  },
  {
    id: "2",
    code: "UHA20",
    discountType: "percent",
    discountValue: 20,
    minOrder: 100,
    usedCount: 0,
    active: true,
  },
  {
    id: "3",
    code: "WELCOME15",
    discountType: "fixed",
    discountValue: 15,
    minOrder: 80,
    usedCount: 0,
    active: false,
  },
];

export const usePromoStore = create<PromoStore>()(
  persist(
    (set, get) => ({
      codes: DEFAULT_CODES,

      addCode: (data) =>
        set((state) => ({
          codes: [
            ...state.codes,
            { ...data, id: Date.now().toString(), usedCount: 0 },
          ],
        })),

      updateCode: (id, data) =>
        set((state) => ({
          codes: state.codes.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      removeCode: (id) =>
        set((state) => ({ codes: state.codes.filter((c) => c.id !== id) })),

      toggleActive: (id) =>
        set((state) => ({
          codes: state.codes.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c
          ),
        })),

      validate: (input, orderTotal) => {
        const code = get().codes.find(
          (c) => c.code.toLowerCase() === input.trim().toLowerCase()
        );
        if (!code) return { valid: false, error: "invalid" };
        if (!code.active) return { valid: false, error: "expired" };
        if (code.expiresAt && new Date(code.expiresAt) < new Date())
          return { valid: false, error: "expired" };
        if (code.maxUses && code.usedCount >= code.maxUses)
          return { valid: false, error: "expired" };
        if (code.minOrder && orderTotal < code.minOrder)
          return { valid: false, error: "min_order", code };
        return { valid: true, code };
      },

      applyUse: (id) =>
        set((state) => ({
          codes: state.codes.map((c) =>
            c.id === id ? { ...c, usedCount: c.usedCount + 1 } : c
          ),
        })),
    }),
    { name: "uha-promo-codes" }
  )
);

/** Calculate discounted total */
export function calcDiscount(code: PromoCode, total: number): number {
  if (code.discountType === "percent") {
    return Math.round((total * code.discountValue) / 100 * 100) / 100;
  }
  return Math.min(code.discountValue, total);
}
