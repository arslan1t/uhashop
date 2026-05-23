/**
 * Store for admin-created products.
 * Persists to localStorage so products survive page reloads.
 * Merged with static products.ts catalog on the site.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductBrand, ProductCategory, ProductType } from "@/types";

interface CustomProductsStore {
  products: Product[];
  _hydrated: boolean;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  hasProduct: (id: string) => boolean;
  setHydrated: () => void;
}

export const useCustomProducts = create<CustomProductsStore>()(
  persist(
    (set, get) => ({
      products: [],
      _hydrated: false,

      setHydrated: () => set({ _hydrated: true }),

      addProduct: (p) =>
        set((state) => ({ products: [...state.products, p] })),

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      hasProduct: (id) => get().products.some((p) => p.id === id),
    }),
    {
      name: "uha-custom-products",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

/** Convert admin form data → full Product object */
export function buildProductFromForm(data: {
  nameRu: string;
  nameUz?: string;
  slug: string;
  brand: string;
  category: string;
  type: string;
  status: string;
  badge?: string;
  isFeatured: boolean;
  estimatedDelivery: string;
  price: number;
  replicaPrice?: number;
  replicaDelivery?: string;
  stock?: number;
  descriptionRu?: string;
  shoeSizes: Record<number, boolean>;
  apparelSizes: Record<string, boolean>;
  mainImage?: string;
  image?: string;
}, existingId?: string): Product {
  const id = existingId ?? `custom-${Date.now()}`;
  // Normalize slug: replace spaces with hyphens, lowercase
  const cleanSlug = data.slug
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
  const isShoes = data.category === "shoes";

  const sizes = isShoes
    ? Object.entries(data.shoeSizes)
        .filter(([, avail]) => avail !== false)
        .map(([eu, available]) => ({ eu: Number(eu), available: available !== false }))
    : Object.entries(data.apparelSizes)
        .filter(([, avail]) => avail !== false)
        .map(([label, available]) => ({ label: label as "XS"|"S"|"M"|"L"|"XL"|"XXL", available: available !== false }));

  const catFolder = isShoes ? "shoes" : "apparel";
  const image = data.image || data.mainImage || `/images/products/${catFolder}/${cleanSlug}/1.jpg`;

  return {
    id,
    slug: cleanSlug,
    name: data.nameRu,
    nameRu: data.nameRu,
    brand: data.brand as ProductBrand,
    category: data.category as ProductCategory,
    type: data.type as ProductType,
    price: data.price,
    replicaPrice: data.replicaPrice || undefined,
    replicaDelivery: data.replicaDelivery || undefined,
    currency: "USD",
    image,
    images: [image],
    sizes: sizes as Product["sizes"],
    estimatedDelivery: data.estimatedDelivery,
    badge: (data.badge as Product["badge"]) || undefined,
    tags: [data.brand.toLowerCase(), data.category, data.nameRu.toLowerCase()],
    descriptionRu: data.descriptionRu || data.nameRu,
    descriptionUz: data.nameRu,
    inStock: data.stock || undefined,
    sku: `UHA-${data.slug.toUpperCase().replace(/-/g, "").slice(0, 8)}`,
    isFeatured: data.isFeatured,
    isNew: data.badge === "new",
  };
}
