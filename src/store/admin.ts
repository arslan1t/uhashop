import { create } from "zustand";
import { safeStorage } from "@/lib/storage";

interface AdminState {
  isAuthenticated: boolean;
  adminUser: { email: string; name: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

const ADMIN_KEY = "uha-admin-auth";
const VALID_ADMIN = { email: "admin@uhashop.uz", password: "uha2024admin", name: "UHA Admin" };

export const useAdminStore = create<AdminState>()((set) => ({
  isAuthenticated: false,
  adminUser: null,

  checkAuth: () => {
    const stored = safeStorage.getItem(ADMIN_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        set({ isAuthenticated: true, adminUser: user });
      } catch {}
    }
  },

  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 800));
    if (email === VALID_ADMIN.email && password === VALID_ADMIN.password) {
      const user = { email, name: VALID_ADMIN.name };
      safeStorage.setItem(ADMIN_KEY, JSON.stringify(user));
      set({ isAuthenticated: true, adminUser: user });
      return true;
    }
    return false;
  },

  logout: () => {
    safeStorage.removeItem(ADMIN_KEY);
    set({ isAuthenticated: false, adminUser: null });
  },
}));
