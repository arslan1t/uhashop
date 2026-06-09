/**
 * Store for admin-managed custom brands.
 * Persisted in localStorage. Custom brands appear alongside hardcoded brands
 * in the admin product form and in marketplace filters.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomBrandsStore {
  brands: string[];
  addBrand: (brand: string) => void;
  removeBrand: (brand: string) => void;
}

export const useCustomBrands = create<CustomBrandsStore>()(
  persist(
    (set, get) => ({
      brands: [],
      addBrand: (brand: string) => {
        const trimmed = brand.trim();
        if (!trimmed) return;
        if (get().brands.some(b => b.toLowerCase() === trimmed.toLowerCase())) return;
        set((state) => ({ brands: [...state.brands, trimmed] }));
      },
      removeBrand: (brand: string) =>
        set((state) => ({ brands: state.brands.filter((b) => b !== brand) })),
    }),
    { name: "uha-custom-brands-v1" }
  )
);
