/**
 * Store for admin-created products.
 * Synced with Firebase Firestore via server-side API route (/api/admin/products).
 * Changes are visible on ALL devices in real time.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductBrand, ProductCategory, ProductType, ProductStyle } from "@/types";
import { safeStorage } from "@/lib/storage";

const TOKEN_KEY = "uha-admin-token";
function getAdminToken() { return safeStorage.getItem(TOKEN_KEY) ?? ""; }

/** Save a product via server-side API (reliable — works regardless of client Firebase init) */
async function apiSaveProduct(product: Product): Promise<void> {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `HTTP ${res.status}`);
  }
}

/** Delete a product via server-side API */
async function apiDeleteProduct(id: string): Promise<void> {
  const res = await fetch("/api/admin/products", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
    body: JSON.stringify({ id }),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`HTTP ${res.status}`);
  }
}

interface CustomProductsStore {
  products: Product[];
  _hydrated: boolean;
  _firestoreSynced: boolean;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  hasProduct: (id: string) => boolean;
  setHydrated: () => void;
  setProducts: (productsOrUpdater: Product[] | ((prev: Product[]) => Product[])) => void;
  setFirestoreSynced: () => void;
}

export const useCustomProducts = create<CustomProductsStore>()(
  persist(
    (set, get) => ({
      products: [],
      _hydrated: false,
      _firestoreSynced: false,

      setHydrated: () => set({ _hydrated: true }),
      setFirestoreSynced: () => set({ _firestoreSynced: true }),
      setProducts: (productsOrUpdater) =>
        set((state) => ({
          products: typeof productsOrUpdater === "function"
            ? productsOrUpdater(state.products)
            : productsOrUpdater,
        })),

      addProduct: (p) => {
        set((state) => ({ products: [...state.products, p] }));
        // Reliable server-side save — works on all devices
        if (typeof window !== "undefined") {
          apiSaveProduct(p).catch(err =>
            console.error("[UHA] Product save failed:", err)
          );
        }
      },

      updateProduct: (id, data) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
        // Sync updated product to Firestore
        if (typeof window !== "undefined") {
          const updated = get().products.find(p => p.id === id);
          if (updated) {
            apiSaveProduct({ ...updated, ...data }).catch(err =>
              console.error("[UHA] Product update failed:", err)
            );
          }
        }
      },

      removeProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        // Delete from Firestore via API
        if (typeof window !== "undefined") {
          apiDeleteProduct(id).catch(err =>
            console.error("[UHA] Product delete failed:", err)
          );
        }
      },

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
  style?: ProductStyle;
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
    style: data.style || undefined,
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
