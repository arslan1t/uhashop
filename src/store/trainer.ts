/**
 * Trainer (coach) authentication store for the dedicated /trainer panel.
 * Mirrors store/admin.ts but talks to /api/trainer/auth and a separate
 * token — a trainer never receives full shop-admin credentials.
 */
import { create } from "zustand";
import { safeStorage } from "@/lib/storage";

interface TrainerState {
  isAuthenticated: boolean;
  trainerUser: { id: string; name: string; email: string } | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
  validateToken: () => Promise<boolean>;
}

const TRAINER_KEY = "uha-trainer-auth";
const TOKEN_KEY = "uha-trainer-token";

export const useTrainerStore = create<TrainerState>()((set) => ({
  isAuthenticated: false,
  trainerUser: null,

  checkAuth: () => {
    const stored = safeStorage.getItem(TRAINER_KEY);
    if (stored) {
      try { set({ isAuthenticated: true, trainerUser: JSON.parse(stored) }); } catch {}
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch("/api/trainer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) return { ok: false, error: data?.error ?? "Ошибка входа" };

      safeStorage.setItem(TRAINER_KEY, JSON.stringify(data.coach));
      safeStorage.setItem(TOKEN_KEY, data.token);
      set({ isAuthenticated: true, trainerUser: data.coach });
      return { ok: true };
    } catch {
      return { ok: false, error: "Ошибка соединения" };
    }
  },

  logout: () => {
    safeStorage.removeItem(TRAINER_KEY);
    safeStorage.removeItem(TOKEN_KEY);
    set({ isAuthenticated: false, trainerUser: null });
  },

  validateToken: async () => {
    const token = safeStorage.getItem(TOKEN_KEY);
    if (!token) { set({ isAuthenticated: false, trainerUser: null }); return false; }
    try {
      const res = await fetch("/api/trainer/auth", { headers: { "x-admin-token": token } });
      if (res.status === 401) {
        safeStorage.removeItem(TRAINER_KEY);
        safeStorage.removeItem(TOKEN_KEY);
        set({ isAuthenticated: false, trainerUser: null });
        return false;
      }
      return true;
    } catch {
      return true;
    }
  },
}));

export function getTrainerToken(): string {
  return safeStorage.getItem(TOKEN_KEY) ?? "";
}
