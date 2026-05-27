import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type AcademyAthlete, type AcademyParent, type TrainingSession,
  type Exercise, type Payment,
  type AcademyEvent, type AcademyBadge, type AthleteBadge,
  type ProgressEntry, type MediaItem,
  MOCK_ATHLETES, MOCK_PARENTS, MOCK_SCHEDULE, MOCK_EXERCISES, MOCK_PAYMENTS,
  MOCK_EVENTS, MOCK_BADGES, MOCK_ATHLETE_BADGES, MOCK_PROGRESS, MOCK_MEDIA,
} from "@/data/academy";

// ── Academy auth ─────────────────────────────────────────────────────
type AcademyRole = "athlete" | "parent";

interface AcademyAuthState {
  role: AcademyRole | null;
  currentId: string | null;
  isLoggedIn: boolean;
  login: (role: AcademyRole, name: string, pin: string) => { ok: boolean; error?: string };
  logout: () => void;
}

export const useAcademyAuth = create<AcademyAuthState>()(
  persist(
    (set, get) => ({
      role: null,
      currentId: null,
      isLoggedIn: false,

      login: (role, name, pin) => {
        const store = useAcademyStore.getState();
        const nameLower = name.toLowerCase().trim();

        if (role === "athlete") {
          const athlete = store.athletes.find(
            a => a.name.toLowerCase() === nameLower && a.pin === pin
          );
          if (athlete) {
            set({ role: "athlete", currentId: athlete.id, isLoggedIn: true });
            return { ok: true };
          }
          return { ok: false, error: "Спортсмен не найден или неверный PIN" };
        } else {
          const parent = store.parents.find(
            p => p.name.toLowerCase() === nameLower && p.pin === pin
          );
          if (parent) {
            set({ role: "parent", currentId: parent.id, isLoggedIn: true });
            return { ok: true };
          }
          return { ok: false, error: "Родитель не найден или неверный PIN" };
        }
      },

      logout: () => set({ role: null, currentId: null, isLoggedIn: false }),
    }),
    { name: "uha-academy-auth" }
  )
);

// ── Academy data store ───────────────────────────────────────────────
interface AcademyStore {
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

  // Reset
  resetAll: () => void;
}

export const useAcademyStore = create<AcademyStore>()(
  persist(
    (set) => ({
      athletes: MOCK_ATHLETES,
      parents: MOCK_PARENTS,
      schedule: MOCK_SCHEDULE,
      exercises: MOCK_EXERCISES,
      payments: MOCK_PAYMENTS,
      events: MOCK_EVENTS,
      badges: MOCK_BADGES,
      athleteBadges: MOCK_ATHLETE_BADGES,
      progress: MOCK_PROGRESS,
      media: MOCK_MEDIA,

      addAthlete: (athlete) =>
        set((s) => ({ athletes: [...s.athletes, athlete] })),
      updateAthlete: (id, data) =>
        set((s) => ({
          athletes: s.athletes.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),
      removeAthlete: (id) =>
        set((s) => ({ athletes: s.athletes.filter((a) => a.id !== id) })),

      addParent: (parent) =>
        set((s) => ({ parents: [...s.parents, parent] })),
      updateParent: (id, data) =>
        set((s) => ({
          parents: s.parents.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      addSession: (session) =>
        set((s) => ({ schedule: [...s.schedule, session] })),
      updateSession: (id, data) =>
        set((s) => ({
          schedule: s.schedule.map((s_) => (s_.id === id ? { ...s_, ...data } : s_)),
        })),
      removeSession: (id) =>
        set((s) => ({ schedule: s.schedule.filter((s_) => s_.id !== id) })),

      addExercise: (exercise) =>
        set((s) => ({ exercises: [...s.exercises, exercise] })),
      toggleExercise: (id) =>
        set((s) => ({
          exercises: s.exercises.map((e) =>
            e.id === id
              ? { ...e, completed: !e.completed, completedAt: !e.completed ? new Date().toISOString().slice(0, 10) : undefined }
              : e
          ),
        })),
      removeExercise: (id) =>
        set((s) => ({ exercises: s.exercises.filter((e) => e.id !== id) })),

      addPayment: (payment) =>
        set((s) => ({ payments: [...s.payments, payment] })),
      updatePaymentStatus: (id, status) =>
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === id ? { ...p, status, paidAt: status === "paid" ? new Date().toISOString().slice(0, 10) : p.paidAt } : p
          ),
        })),

      // Events
      addEvent: (event) =>
        set((s) => ({ events: [...s.events, event] })),
      updateEvent: (id, data) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      registerForEvent: (eventId, athleteId) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, registeredIds: [...(e.registeredIds || []).filter(id => id !== athleteId), athleteId] }
              : e
          ),
        })),
      unregisterFromEvent: (eventId, athleteId) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, registeredIds: (e.registeredIds || []).filter(id => id !== athleteId) }
              : e
          ),
        })),

      // Badges
      awardBadge: (athleteId, badgeId) =>
        set((s) => ({
          athleteBadges: [...s.athleteBadges, { badgeId, athleteId, earnedAt: new Date().toISOString().slice(0, 10) }],
        })),
      removeBadgeFromAthlete: (athleteId, badgeId) =>
        set((s) => ({
          athleteBadges: s.athleteBadges.filter((ab) => !(ab.athleteId === athleteId && ab.badgeId === badgeId)),
        })),
      addBadge: (badge) =>
        set((s) => ({ badges: [...s.badges, badge] })),

      // Progress
      addProgress: (entry) =>
        set((s) => ({ progress: [...s.progress, entry] })),
      removeProgress: (id) =>
        set((s) => ({ progress: s.progress.filter((p) => p.id !== id) })),

      // Media
      addMedia: (item) =>
        set((s) => ({ media: [...s.media, item] })),
      removeMedia: (id) =>
        set((s) => ({ media: s.media.filter((m) => m.id !== id) })),

      resetAll: () =>
        set({
          athletes: MOCK_ATHLETES,
          parents: MOCK_PARENTS,
          schedule: MOCK_SCHEDULE,
          exercises: MOCK_EXERCISES,
          payments: MOCK_PAYMENTS,
          events: MOCK_EVENTS,
          badges: MOCK_BADGES,
          athleteBadges: MOCK_ATHLETE_BADGES,
          progress: MOCK_PROGRESS,
          media: MOCK_MEDIA,
        }),
    }),
    { name: "uha-academy-data" }
  )
);
