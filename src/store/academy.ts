import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type AcademyAthlete, type AcademyParent, type TrainingSession,
  type Exercise, type Payment,
  type AcademyEvent, type AcademyBadge, type AthleteBadge,
  type ProgressEntry, type MediaItem, type AcademyNote,
} from "@/data/academy";
import type { AcademyApplication, ApplicationStatus } from "@/lib/firebase/academyApplications";
import { safeStorage } from "@/lib/storage";

const ADMIN_TOKEN_KEY = "uha-admin-token";
const TRAINER_TOKEN_KEY = "uha-trainer-token";
// The /api/admin/academy* routes accept either credential in the same
// header — whichever this browser is actually signed in with (shop admin
// or a trainer) — so this store works unmodified from both panels.
function getAdminToken() {
  return safeStorage.getItem(ADMIN_TOKEN_KEY) || safeStorage.getItem(TRAINER_TOKEN_KEY) || "";
}
/** Whichever academy-capable token this browser holds (shop admin or trainer). */
export function getAcademyAuthToken(): string {
  return getAdminToken();
}

// ── Public academy session (athlete/parent PIN login) ────────────────────
// Token is verified server-side against Firestore — PINs never reach the
// browser, and the scope payload only ever contains this account's own data.
const ACADEMY_TOKEN_KEY = "uha-academy-token";
function getAcademyToken() { return safeStorage.getItem(ACADEMY_TOKEN_KEY) ?? ""; }
// The unified shop session token — the academy APIs (resolveAcademyAuth) accept
// it too and resolve the linked academy record, so a shop-logged-in member can
// open their kabinet without a separate academy login.
function getShopToken() { return safeStorage.getItem("uha-user-token") ?? ""; }
/** Headers carrying whichever academy-capable credential the browser holds. */
function academyAuthHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  const at = getAcademyToken();
  if (at) h["x-academy-token"] = at;
  const st = getShopToken();
  if (st) h["x-user-token"] = st;
  return h;
}
/** True if either an academy token OR a shop session token is present. */
function hasAnyAcademyAuth() { return !!(getAcademyToken() || getShopToken()); }

export interface AthleteScope {
  role: "athlete";
  athlete: AcademyAthlete;
  schedule: TrainingSession[];
  exercises: Exercise[];
  progress: ProgressEntry[];
  athleteBadges: AthleteBadge[];
  badges: AcademyBadge[];
  events: AcademyEvent[];
  media: MediaItem[];
  notes: AcademyNote[];
}

export interface ParentScope {
  role: "parent";
  parent: AcademyParent;
  children: AcademyAthlete[];
  schedule: TrainingSession[];
  exercises: Exercise[];
  payments: Payment[];
  progress: ProgressEntry[];
  athleteBadges: AthleteBadge[];
  badges: AcademyBadge[];
  events: AcademyEvent[];
  media: MediaItem[];
  notes: AcademyNote[];
}

export type AcademyScope = AthleteScope | ParentScope;

type AcademyRole = "athlete" | "parent";

interface AcademyAuthState {
  role: AcademyRole | null;
  currentId: string | null;
  isLoggedIn: boolean;
  initialized: boolean;
  scope: AcademyScope | null;
  login: (role: AcademyRole, name: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  /** Consume a token minted by the Telegram login bot flow (?t= deep link). */
  loginWithToken: (token: string) => Promise<{ ok: boolean }>;
  refresh: () => Promise<void>;
  performAction: (body: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

function scopeId(scope: AcademyScope | null): string | null {
  if (!scope) return null;
  return scope.role === "athlete" ? scope.athlete.id : scope.parent.id;
}

export const useAcademyAuth = create<AcademyAuthState>()((set) => ({
  role: null,
  currentId: null,
  isLoggedIn: false,
  initialized: false,
  scope: null,

  login: async (role, name, code) => {
    try {
      const res = await fetch("/api/academy/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, name, code }),
      });
      const json = await res.json();
      if (!res.ok || !json.token) {
        set({ initialized: true });
        return { ok: false, error: json?.error || "Ошибка входа" };
      }
      safeStorage.setItem(ACADEMY_TOKEN_KEY, json.token);
      set({ role, currentId: scopeId(json.scope), isLoggedIn: true, initialized: true, scope: json.scope ?? null });
      return { ok: true };
    } catch {
      set({ initialized: true });
      return { ok: false, error: "Ошибка входа" };
    }
  },

  refresh: async () => {
    // Accept either the dedicated academy token or the unified shop session —
    // a member logged into the shop can open their kabinet without re-login.
    if (!hasAnyAcademyAuth()) { set({ isLoggedIn: false, initialized: true }); return; }
    try {
      const res = await fetch("/api/academy/me", { headers: academyAuthHeaders() });
      if (!res.ok) { set({ isLoggedIn: false, role: null, currentId: null, scope: null, initialized: true }); return; }
      const { scope } = await res.json();
      set({ role: scope?.role ?? null, currentId: scopeId(scope), isLoggedIn: !!scope, scope, initialized: true });
    } catch {
      set({ isLoggedIn: false, initialized: true });
    }
  },

  loginWithToken: async (token) => {
    safeStorage.setItem(ACADEMY_TOKEN_KEY, token);
    try {
      const res = await fetch("/api/academy/me", { headers: { "x-academy-token": token } });
      if (!res.ok) { safeStorage.removeItem(ACADEMY_TOKEN_KEY); set({ initialized: true }); return { ok: false }; }
      const { scope } = await res.json();
      set({ role: scope?.role ?? null, currentId: scopeId(scope), isLoggedIn: !!scope, scope, initialized: true });
      return { ok: !!scope };
    } catch {
      safeStorage.removeItem(ACADEMY_TOKEN_KEY);
      set({ initialized: true });
      return { ok: false };
    }
  },

  performAction: async (body) => {
    if (!hasAnyAcademyAuth()) return;
    const res = await fetch("/api/academy/action", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...academyAuthHeaders() },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { scope } = await res.json();
      set({ scope });
    }
  },

  logout: () => {
    safeStorage.removeItem(ACADEMY_TOKEN_KEY);
    set({ role: null, currentId: null, isLoggedIn: false, scope: null });
  },
}));

type Resource = "athletes" | "parents" | "schedule" | "exercises" | "payments" | "events" | "badges" | "athleteBadges" | "progress" | "media" | "applications" | "notes";

async function apiSave(resource: Resource, data: object): Promise<void> {
  const res = await fetch("/api/admin/academy", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
    body: JSON.stringify({ resource, data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `HTTP ${res.status}`);
  }
}

async function apiDelete(resource: Resource, id: string): Promise<void> {
  const res = await fetch("/api/admin/academy", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
    body: JSON.stringify({ resource, id }),
  });
  if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
}

function sync(promise: Promise<void>, label: string) {
  if (typeof window !== "undefined") {
    promise.catch(err => {
      console.error(`[UHA] Academy ${label} failed:`, err);
      // Saves are fire-and-forget against the UI, so a failed Firestore write
      // would otherwise go unnoticed and silently leave the change local-only.
      alert(`Не удалось сохранить изменения в базе (${label}): ${err?.message ?? err}\n\nПроверьте подключение и повторите попытку — иначе спортсмен/родитель не сможет войти на другом устройстве.`);
    });
  }
}

export interface AcademyData {
  athletes: AcademyAthlete[];
  parents: AcademyParent[];
  schedule: TrainingSession[];
  exercises: Exercise[];
  payments: Payment[];
  events: AcademyEvent[];
  badges: AcademyBadge[];
  athleteBadges: AthleteBadge[];
  progress: ProgressEntry[];
  media: MediaItem[];
  applications: AcademyApplication[];
  notes: AcademyNote[];
}

const EMPTY_DATA: AcademyData = {
  athletes: [], parents: [], schedule: [], exercises: [], payments: [],
  events: [], badges: [], athleteBadges: [], progress: [], media: [],
  applications: [], notes: [],
};

/** Fetch the full dataset from Firestore (admin-only) and hydrate the store. */
export async function fetchAcademyData(): Promise<AcademyData> {
  const res = await fetch("/api/admin/academy", {
    headers: { "x-admin-token": getAdminToken() },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Academy data store (admin-managed, synced to Firestore) ─────────────
interface AcademyStore extends AcademyData {
  hydrate: (data: AcademyData) => void;

  // Athletes
  addAthlete: (athlete: AcademyAthlete) => void;
  updateAthlete: (id: string, data: Partial<AcademyAthlete>) => void;
  removeAthlete: (id: string) => void;

  // Parents
  addParent: (parent: AcademyParent) => void;
  updateParent: (id: string, data: Partial<AcademyParent>) => void;

  // Schedule
  addSession: (session: TrainingSession) => void;
  updateSession: (id: string, data: Partial<TrainingSession>) => void;
  removeSession: (id: string) => void;

  // Exercises
  addExercise: (exercise: Exercise) => void;
  toggleExercise: (id: string) => void;
  removeExercise: (id: string) => void;

  // Payments
  addPayment: (payment: Payment) => void;
  updatePaymentStatus: (id: string, status: Payment["status"]) => void;

  // Events
  addEvent: (event: AcademyEvent) => void;
  updateEvent: (id: string, data: Partial<AcademyEvent>) => void;
  removeEvent: (id: string) => void;
  registerForEvent: (eventId: string, athleteId: string) => void;
  unregisterFromEvent: (eventId: string, athleteId: string) => void;

  // Badges
  awardBadge: (athleteId: string, badgeId: string) => void;
  removeBadgeFromAthlete: (athleteId: string, badgeId: string) => void;
  addBadge: (badge: AcademyBadge) => void;

  // Progress
  addProgress: (entry: ProgressEntry) => void;
  removeProgress: (id: string) => void;

  // Media
  addMedia: (item: MediaItem) => void;
  removeMedia: (id: string) => void;

  // Applications (academy_applications — read via the same Admin SDK route
  // since Firestore rules deny client-SDK reads with no Firebase Auth)
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;

  // Trainer notes (academy_notes) — coach feedback shown to athlete/parent
  addNote: (athleteId: string, coachName: string, text: string) => void;
  removeNote: (id: string) => void;
}

export const useAcademyStore = create<AcademyStore>()(
  persist(
    (set, get) => ({
      ...EMPTY_DATA,

      hydrate: (data) => set(data),

      addAthlete: (athlete) => {
        set((s) => ({ athletes: [...s.athletes, athlete] }));
        sync(apiSave("athletes", athlete), "athlete save");
      },
      updateAthlete: (id, data) => {
        set((s) => ({ athletes: s.athletes.map((a) => (a.id === id ? { ...a, ...data } : a)) }));
        const updated = get().athletes.find(a => a.id === id);
        if (updated) sync(apiSave("athletes", updated), "athlete update");
      },
      removeAthlete: (id) => {
        set((s) => ({ athletes: s.athletes.filter((a) => a.id !== id) }));
        sync(apiDelete("athletes", id), "athlete delete");
      },

      addParent: (parent) => {
        set((s) => ({ parents: [...s.parents, parent] }));
        sync(apiSave("parents", parent), "parent save");
      },
      updateParent: (id, data) => {
        set((s) => ({ parents: s.parents.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
        const updated = get().parents.find(p => p.id === id);
        if (updated) sync(apiSave("parents", updated), "parent update");
      },

      addSession: (session) => {
        set((s) => ({ schedule: [...s.schedule, session] }));
        sync(apiSave("schedule", session), "session save");
      },
      updateSession: (id, data) => {
        set((s) => ({ schedule: s.schedule.map((s_) => (s_.id === id ? { ...s_, ...data } : s_)) }));
        const updated = get().schedule.find(s_ => s_.id === id);
        if (updated) sync(apiSave("schedule", updated), "session update");
      },
      removeSession: (id) => {
        set((s) => ({ schedule: s.schedule.filter((s_) => s_.id !== id) }));
        sync(apiDelete("schedule", id), "session delete");
      },

      addExercise: (exercise) => {
        set((s) => ({ exercises: [...s.exercises, exercise] }));
        sync(apiSave("exercises", exercise), "exercise save");
      },
      toggleExercise: (id) => {
        set((s) => ({
          exercises: s.exercises.map((e) =>
            e.id === id
              ? { ...e, completed: !e.completed, completedAt: !e.completed ? new Date().toISOString().slice(0, 10) : undefined }
              : e
          ),
        }));
        const updated = get().exercises.find(e => e.id === id);
        if (updated) sync(apiSave("exercises", updated), "exercise toggle");
      },
      removeExercise: (id) => {
        set((s) => ({ exercises: s.exercises.filter((e) => e.id !== id) }));
        sync(apiDelete("exercises", id), "exercise delete");
      },

      addPayment: (payment) => {
        set((s) => ({ payments: [...s.payments, payment] }));
        sync(apiSave("payments", payment), "payment save");
      },
      updatePaymentStatus: (id, status) => {
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === id ? { ...p, status, paidAt: status === "paid" ? new Date().toISOString().slice(0, 10) : p.paidAt } : p
          ),
        }));
        const updated = get().payments.find(p => p.id === id);
        if (updated) sync(apiSave("payments", updated), "payment update");
      },

      addEvent: (event) => {
        set((s) => ({ events: [...s.events, event] }));
        sync(apiSave("events", event), "event save");
      },
      updateEvent: (id, data) => {
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...data } : e)) }));
        const updated = get().events.find(e => e.id === id);
        if (updated) sync(apiSave("events", updated), "event update");
      },
      removeEvent: (id) => {
        set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
        sync(apiDelete("events", id), "event delete");
      },
      registerForEvent: (eventId, athleteId) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, registeredIds: [...(e.registeredIds || []).filter(id => id !== athleteId), athleteId] }
              : e
          ),
        }));
        const updated = get().events.find(e => e.id === eventId);
        if (updated) sync(apiSave("events", updated), "event register");
      },
      unregisterFromEvent: (eventId, athleteId) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, registeredIds: (e.registeredIds || []).filter(id => id !== athleteId) }
              : e
          ),
        }));
        const updated = get().events.find(e => e.id === eventId);
        if (updated) sync(apiSave("events", updated), "event unregister");
      },

      awardBadge: (athleteId, badgeId) => {
        if (!athleteId || !badgeId) return;
        const entry = { badgeId, athleteId, earnedAt: new Date().toISOString().slice(0, 10) };
        set((s) => ({ athleteBadges: [...s.athleteBadges, entry] }));
        sync(apiSave("athleteBadges", entry), "badge award");
      },
      removeBadgeFromAthlete: (athleteId, badgeId) => {
        set((s) => ({
          athleteBadges: s.athleteBadges.filter((ab) => !(ab.athleteId === athleteId && ab.badgeId === badgeId)),
        }));
        sync(apiDelete("athleteBadges", `${athleteId}__${badgeId}`), "badge remove");
      },
      addBadge: (badge) => {
        set((s) => ({ badges: [...s.badges, badge] }));
        sync(apiSave("badges", badge), "badge save");
      },

      addProgress: (entry) => {
        set((s) => ({ progress: [...s.progress, entry] }));
        sync(apiSave("progress", entry), "progress save");
      },
      removeProgress: (id) => {
        set((s) => ({ progress: s.progress.filter((p) => p.id !== id) }));
        sync(apiDelete("progress", id), "progress delete");
      },

      addMedia: (item) => {
        set((s) => ({ media: [...s.media, item] }));
        sync(apiSave("media", item), "media save");
      },
      removeMedia: (id) => {
        set((s) => ({ media: s.media.filter((m) => m.id !== id) }));
        sync(apiDelete("media", id), "media delete");
      },

      updateApplicationStatus: (id, status) => {
        set((s) => ({
          applications: s.applications.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a)),
        }));
        const updated = get().applications.find(a => a.id === id);
        if (updated) sync(apiSave("applications", updated), "application status");
      },

      addNote: (athleteId, coachName, text) => {
        const note: AcademyNote = { id: `note_${Date.now()}`, athleteId, coachName, text, createdAt: new Date().toISOString() };
        set((s) => ({ notes: [...s.notes, note] }));
        sync(apiSave("notes", note), "note save");
      },
      removeNote: (id) => {
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
        sync(apiDelete("notes", id), "note delete");
      },
    }),
    { name: "uha-academy-data" }
  )
);
