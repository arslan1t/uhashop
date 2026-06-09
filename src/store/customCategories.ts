import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CustomCategory {
  id: string;
  name: string;
  nameUz: string;
  slug: string;
}

interface CustomCategoriesStore {
  categories: CustomCategory[];
  addCategory:    (cat: Omit<CustomCategory, "id">) => void;
  removeCategory: (id: string) => void;
}

export const useCustomCategories = create<CustomCategoriesStore>()(
  persist(
    (set) => ({
      categories: [],
      addCategory: (cat) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...cat, id: `custom-cat-${Date.now()}` },
          ],
        })),
      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    { name: "uha-custom-categories-v1" }
  )
);
