import { create } from "zustand";
import { type AdminOrder } from "@/data/adminData";

interface OrdersState {
  orders: AdminOrder[];
  loading: boolean;
  fetched: boolean;
  fetchOrders: () => Promise<void>;
  updateStatus: (id: string, status: AdminOrder["status"]) => Promise<void>;
  resetOrders: () => void;
}

// Transform Supabase order row → AdminOrder format
function mapSupabaseOrder(row: Record<string, unknown>): AdminOrder {
  const addr = (row.shipping_address || {}) as Record<string, string>;
  const items = (row.items || []) as {
    name: string;
    size: string;
    qty: number;
    price: number;
    version?: string;
  }[];

  return {
    id: row.id as string,
    orderNumber: (row.order_number as string) || `UHA-${(row.id as string).slice(0, 8)}`,
    customer: addr.name || "Гость",
    telegram: addr.telegram || "",
    phone: addr.phone || undefined,
    city: addr.city || "",
    products: items.map((i) => ({
      name: i.name,
      size: i.size,
      qty: i.qty,
      price: i.price,
      version: i.version || "original",
    })),
    total: row.total as number,
    status: (row.status === "pending" ? "new" : row.status) as AdminOrder["status"],
    type: "preorder",
    notes: addr.notes || undefined,
    createdAt: new Date(row.created_at as string).toLocaleDateString("ru-RU"),
  };
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  loading: false,
  fetched: false,

  fetchOrders: async () => {
    if (get().loading) return;
    set({ loading: true });

    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (data.orders) {
        const mapped = data.orders.map(mapSupabaseOrder);
        set({ orders: mapped, fetched: true });
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    }));

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      console.error("Failed to update order status:", e);
    }
  },

  resetOrders: () => set({ orders: [], fetched: false }),
}));
