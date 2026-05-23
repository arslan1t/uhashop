import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CategoryImagesStore {
  images: Record<string, string>; // slug → image path
  setImage: (slug: string, path: string) => void;
}

export const useCategoryImages = create<CategoryImagesStore>()(
  persist(
    (set) => ({
      images: {},
      setImage: (slug, path) =>
        set(state => ({ images: { ...state.images, [slug]: path } })),
    }),
    { name: "uha-category-images" }
  )
);
