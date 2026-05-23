import { create } from "zustand";
import type { Product, CartItem, ProductVersion } from "@/types";
import { safeStorage } from "@/lib/storage";

const CART_KEY = "uha-cart-v2";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string, version: ProductVersion) => void;
  removeItem: (productId: string, size: string, version: ProductVersion) => void;
  updateQuantity: (productId: string, size: string, version: ProductVersion, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  hydrate: () => void;
}

function itemPrice(item: CartItem): number {
  if (item.version === "replica" && item.product.replicaPrice != null) {
    return item.product.replicaPrice;
  }
  return item.product.price;
}

function save(items: CartItem[]) {
  safeStorage.setItem(CART_KEY, JSON.stringify(items));
}

function match(i: CartItem, productId: string, size: string, version: ProductVersion) {
  return i.product.id === productId && i.size === size && i.version === version;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  isOpen: false,

  hydrate: () => {
    const raw = safeStorage.getItem(CART_KEY);
    if (raw) {
      try {
        const items = JSON.parse(raw) as CartItem[];
        set({ items: Array.isArray(items) ? items : [] });
      } catch {}
    }
  },

  addItem: (product, size, version) => {
    set((state) => {
      const existing = state.items.find((i) => match(i, product.id, size, version));
      const items = existing
        ? state.items.map((i) =>
            match(i, product.id, size, version) ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...state.items, { product, size, version, quantity: 1 }];
      save(items);
      return { items };
    });
  },

  removeItem: (productId, size, version) => {
    set((state) => {
      const items = state.items.filter((i) => !match(i, productId, size, version));
      save(items);
      return { items };
    });
  },

  updateQuantity: (productId, size, version, qty) => {
    if (qty <= 0) { get().removeItem(productId, size, version); return; }
    set((state) => {
      const items = state.items.map((i) =>
        match(i, productId, size, version) ? { ...i, quantity: qty } : i
      );
      save(items);
      return { items };
    });
  },

  clearCart: () => { safeStorage.removeItem(CART_KEY); set({ items: [] }); },
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  totalPrice: () => get().items.reduce((s, i) => s + itemPrice(i) * i.quantity, 0),
}));

export { itemPrice };
