/**
 * Admin authentication store.
 * Credentials are validated server-side via /api/admin/auth.
 * The session token is stored in localStorage (client-only guard only).
 */
import { create } from "zustand";
import { safeStorage } from "@/lib/storage";

interface AdminState {
  isAuthenticated: boolean;
  adminUser: { email: string; name: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

const ADMIN_KEY  = "uha-admin-auth";
const TOKEN_KEY  = "uha-admin-token";

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
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) return false;

      const user = { email, name: "UHA Admin" };
      safeStorage.setItem(ADMIN_KEY, JSON.stringify(user));
      safeStorage.setItem(TOKEN_KEY, data.token);
      set({ isAuthenticated: true, adminUser: user });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    safeStorage.removeItem(ADMIN_KEY);
    safeStorage.removeItem(TOKEN_KEY);
    set({ isAuthenticated: false, adminUser: null });
  },
}));

/** Helper: get the stored admin token for API request headers */
export function getAdminToken(): string {
  return safeStorage.getItem(TOKEN_KEY) ?? "";
}
