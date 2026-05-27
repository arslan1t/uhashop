import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { safeStorage } from "@/lib/storage";

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
  loading: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string, telegram?: string) => Promise<{ ok: boolean; error?: string }>;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

const AUTH_KEY = "uha-auth-v1";
const USERS_KEY = "uha-users-v1";

type StoredUser = UserProfile & { password: string };

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  hydrate: () => {
    if (isSupabaseConfigured) {
      // Supabase mode: check session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          set({
            user: {
              id: u.id,
              name: u.user_metadata?.name || u.email?.split("@")[0] || "",
              email: u.email || "",
              telegram: u.user_metadata?.telegram,
              avatar: u.user_metadata?.avatar_url,
              createdAt: u.created_at,
            },
            isAuthenticated: true,
            loading: false,
          });
        } else {
          set({ user: null, isAuthenticated: false, loading: false });
        }
      }).catch(() => set({ loading: false }));
    } else {
      // Local mode: localStorage fallback
      try {
        const raw = safeStorage.getItem(AUTH_KEY);
        if (raw) {
          const user = JSON.parse(raw) as UserProfile;
          set({ user, isAuthenticated: true, loading: false });
        } else {
          set({ loading: false });
        }
      } catch {
        set({ loading: false });
      }
    }
  },

  login: async (email, password) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, error: error.message };
        if (data.user) {
          const u = data.user;
          // Update last_sign_in in profiles
          await supabase.from("profiles").update({
            last_sign_in: new Date().toISOString(),
          }).eq("id", u.id);
          set({
            user: {
              id: u.id,
              name: u.user_metadata?.name || u.email?.split("@")[0] || "",
              email: u.email || "",
              telegram: u.user_metadata?.telegram,
              avatar: u.user_metadata?.avatar_url,
              createdAt: u.created_at,
            },
            isAuthenticated: true,
          });
          return { ok: true };
        }
        return { ok: false, error: "Unknown error" };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    } else {
      // Local fallback
      await new Promise(r => setTimeout(r, 400));
      try {
        const raw = safeStorage.getItem(USERS_KEY);
        const users: StoredUser[] = raw ? JSON.parse(raw) : [];
        const found = users.find(u => u.email === email && u.password === password);
        if (found) {
          const { password: _, ...user } = found;
          safeStorage.setItem(AUTH_KEY, JSON.stringify(user));
          set({ user, isAuthenticated: true });
          return { ok: true };
        }
      } catch {}
      return { ok: false, error: "Неверный email или пароль" };
    }
  },

  register: async (name, email, password, telegram) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, telegram },
            emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/login`,
          },
        });
        if (error) return { ok: false, error: error.message };
        if (data.user) {
          // Also upsert profile row (fallback if trigger didn't fire)
          await supabase.from("profiles").upsert({
            id: data.user.id,
            name,
            email: data.user.email || email,
            telegram: telegram || null,
            created_at: data.user.created_at,
          }, { onConflict: "id" });

          // If email confirmation is enabled, user won't have a session yet
          const needsConfirmation = !data.session;
          if (needsConfirmation) {
            return { ok: true, error: "confirm_email" };
          }
          set({
            user: {
              id: data.user.id,
              name,
              email: data.user.email || email,
              telegram,
              createdAt: data.user.created_at,
            },
            isAuthenticated: true,
          });
          return { ok: true };
        }
        return { ok: false, error: "Unknown error" };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    } else {
      // Local fallback
      await new Promise(r => setTimeout(r, 400));
      try {
        const raw = safeStorage.getItem(USERS_KEY);
        const users: StoredUser[] = raw ? JSON.parse(raw) : [];
        if (users.find(u => u.email === email)) return { ok: false, error: "Email уже зарегистрирован" };
        const user: UserProfile = {
          id: Date.now().toString(),
          name, email, telegram,
          createdAt: new Date().toISOString(),
        };
        users.push({ ...user, password });
        safeStorage.setItem(USERS_KEY, JSON.stringify(users));
        safeStorage.setItem(AUTH_KEY, JSON.stringify(user));
        set({ user, isAuthenticated: true });
        return { ok: true };
      } catch {}
      return { ok: false, error: "Ошибка регистрации" };
    }
  },

  setUser: (user: UserProfile) => {
    safeStorage.setItem(AUTH_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true, loading: false });
  },

  logout: () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut();
    }
    safeStorage.removeItem(AUTH_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
