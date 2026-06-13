import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { safeStorage } from "@/lib/storage";
import { isFirebaseConfigured } from "@/lib/firebase/config";

// Guard against multiple onAuthStateChanged listeners (H-9 fix)
let _firebaseAuthUnsubscribe: (() => void) | null = null;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  telegram?: string;
  avatar?: string;
  createdAt: string;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
}

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string, telegram?: string) => Promise<{ ok: boolean; error?: string }>;
  setUser: (user: UserProfile) => void;
  updateProfile: (data: Partial<Pick<UserProfile, "name" | "avatar" | "bio" | "socialLinks" | "telegram">>) => void;
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
      // Telegram-bot auth: localStorage is the source of truth.
      // Firebase Auth is NOT used for user-facing login (only Telegram bot flow),
      // so we never hand off to onAuthStateChanged — it would return null and
      // silently log out users who authenticated via the Telegram bot.
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
    } else if (typeof window !== "undefined" && isFirebaseConfigured()) {
      // Firebase Auth login
      try {
        const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
        const { getFirebaseApp } = await import("@/lib/firebase/config");
        const auth = getAuth(getFirebaseApp());
        const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
        if (!fbUser.emailVerified) {
          await auth.signOut();
          return { ok: false, error: "Сначала подтвердите email. Проверьте почту." };
        }
        const profile = {
          id: fbUser.uid,
          name: fbUser.displayName || email.split("@")[0],
          email: fbUser.email || email,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        };
        // Save to Firestore shop_users
        try {
          const { getDb } = await import("@/lib/firebase/config");
          const { doc, setDoc } = await import("firebase/firestore");
          await setDoc(doc(getDb(), "shop_users", fbUser.uid), {
            ...profile, provider: "email", lastLogin: new Date().toISOString(),
          }, { merge: true });
        } catch { /* non-critical */ }
        set({
          user: profile,
          isAuthenticated: true,
        });
        return { ok: true };
      } catch (e: unknown) {
        const code = (e as { code?: string }).code;
        if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential")
          return { ok: false, error: "Неверный email или пароль" };
        if (code === "auth/too-many-requests")
          return { ok: false, error: "Слишком много попыток. Попробуйте позже." };
        return { ok: false, error: "Ошибка входа" };
      }
    } else {
      // Pure local fallback
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
    } else if (typeof window !== "undefined" && isFirebaseConfigured()) {
      // Firebase Auth registration with email verification
      try {
        const { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = await import("firebase/auth");
        const { getFirebaseApp } = await import("@/lib/firebase/config");
        const auth = getAuth(getFirebaseApp());
        const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(fbUser, { displayName: name });
        await sendEmailVerification(fbUser, {
          url: `${window.location.origin}/auth/login`,
        });
        // Sign out until email is verified
        await auth.signOut();
        return { ok: true, error: "confirm_email" };
      } catch (e: unknown) {
        const code = (e as { code?: string }).code;
        if (code === "auth/email-already-in-use")
          return { ok: false, error: "Email уже зарегистрирован" };
        if (code === "auth/weak-password")
          return { ok: false, error: "Пароль слишком простой" };
        if (code === "auth/invalid-email")
          return { ok: false, error: "Некорректный email" };
        return { ok: false, error: "Ошибка регистрации" };
      }
    } else {
      // Pure local fallback (no email service)
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

  updateProfile: (data) => {
    set(state => {
      if (!state.user) return {};
      const updated = { ...state.user, ...data };
      safeStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      // Persist to Firestore (best-effort, non-blocking)
      if (typeof window !== "undefined") {
        fetch("/api/user/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: updated.id, ...data }),
        }).catch(() => {});
      }
      return { user: updated };
    });
  },

  logout: () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut();
    } else if (typeof window !== "undefined" && isFirebaseConfigured()) {
      import("firebase/auth").then(({ getAuth, signOut }) => {
        import("@/lib/firebase/config").then(({ getFirebaseApp }) => {
          signOut(getAuth(getFirebaseApp())).catch(console.error);
        });
      });
    }
    safeStorage.removeItem(AUTH_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
