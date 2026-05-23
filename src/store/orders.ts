import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminOrders, type AdminOrder } from "@/data/adminData";

interface OrdersState {
  orders: AdminOrder[];
  updateStatus: (id: string, status: AdminOrder["status"]) => void;
  resetOrders: () => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: adminOrders,

      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        })),

      resetOrders: () => set({ orders: adminOrders }),
    }),
    {
      name: "uha-admin-orders",
    }
  )
);
