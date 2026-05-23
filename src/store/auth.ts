import { create } from "zustand";
import { safeStorage } from "@/lib/storage";
import type { TelegramAuthData } from "@/app/api/auth/telegram/route";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  telegram?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  wishlist: string[];
  hydrate: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithTelegram: (tgData: TelegramAuthData) => Promise<boolean>;
  register: (name: string, email: string, password: string, telegram?: string) => Promise<boolean>;
  logout: () => void;
  toggleWishlist: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;
}

const AUTH_KEY  = "uha-auth-v1";
const WISH_KEY  = "uha-wishlist-v1";
const USERS_KEY = "uha-users-v1";

type StoredUser = UserProfile & { password: string };

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  wishlist: [],

  hydrate: () => {
    try {
      const raw = safeStorage.getItem(AUTH_KEY);
      if (raw) {
        const user = JSON.parse(raw) as UserProfile;
        set({ user, isAuthenticated: true });
      }
      const wraw = safeStorage.getItem(WISH_KEY);
      if (wraw) set({ wishlist: JSON.parse(wraw) as string[] });
    } catch {}
  },

  login: async (email, password) => {
    await new Promise(r => setTimeout(r, 600));
    try {
      const raw = safeStorage.getItem(USERS_KEY);
      const users: StoredUser[] = raw ? JSON.parse(raw) : [];
      const found = users.find(u => u.email === email && u.password === password);
      if (found) {
        const { password: _, ...user } = found;
        safeStorage.setItem(AUTH_KEY, JSON.stringify(user));
        set({ user, isAuthenticated: true });
        return true;
      }
    } catch {}
    return false;
  },

  loginWithTelegram: async (tgData) => {
    try {
      // Hash already verified by /api/auth/telegram before this is called
      const tgEmail = `tg_${tgData.id}@telegram.local`;
      const raw = safeStorage.getItem(USERS_KEY);
      const users: StoredUser[] = raw ? JSON.parse(raw) : [];
      let found = users.find(u => u.email === tgEmail);
      if (!found) {
        // First login via Telegram → auto-register
        const fullName = [tgData.first_name, (tgData as { last_name?: string }).last_name]
          .filter(Boolean).join(" ");
        const newUser: StoredUser = {
          id: `tg_${tgData.id}`,
          name: fullName,
          email: tgEmail,
          telegram: tgData.username ? `@${tgData.username}` : undefined,
          avatar: tgData.photo_url,
          createdAt: new Date().toISOString(),
          password: "",
        };
        users.push(newUser);
        safeStorage.setItem(USERS_KEY, JSON.stringify(users));
        found = newUser;
      } else {
        // Update name/avatar from fresh Telegram data
        const fullName = [tgData.first_name, (tgData as { last_name?: string }).last_name]
          .filter(Boolean).join(" ");
        found.name = fullName;
        if (tgData.photo_url) found.avatar = tgData.photo_url;
        if (tgData.username) found.telegram = `@${tgData.username}`;
        safeStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      const { password: _, ...user } = found;
      safeStorage.setItem(AUTH_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    } catch {}
    return false;
  },

  register: async (name, email, password, telegram) => {
    await new Promise(r => setTimeout(r, 700));
    try {
      const raw = safeStorage.getItem(USERS_KEY);
      const users: StoredUser[] = raw ? JSON.parse(raw) : [];
      if (users.find(u => u.email === email)) return false; // already exists
      const user: UserProfile = {
        id: Date.now().toString(),
        name, email, telegram,
        createdAt: new Date().toISOString(),
      };
      users.push({ ...user, password });
      safeStorage.setItem(USERS_KEY, JSON.stringify(users));
      safeStorage.setItem(AUTH_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    } catch {}
    return false;
  },

  logout: () => {
    safeStorage.removeItem(AUTH_KEY);
    set({ user: null, isAuthenticated: false });
  },

  toggleWishlist: (slug) => {
    const current = get().wishlist;
    const updated = current.includes(slug)
      ? current.filter(s => s !== slug)
      : [...current, slug];
    safeStorage.setItem(WISH_KEY, JSON.stringify(updated));
    set({ wishlist: updated });
  },

  isInWishlist: (slug) => get().wishlist.includes(slug),
}));
