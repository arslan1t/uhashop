/**
 * Store for admin-managed player sets.
 * Synced with Firestore via /api/admin/sets (server-side Admin SDK).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerSet } from "@/types";
import { safeStorage } from "@/lib/storage";

const TOKEN_KEY = "uha-admin-token";
function getAdminToken() { return safeStorage.getItem(TOKEN_KEY) ?? ""; }

async function apiSaveSet(set: PlayerSet): Promise<void> {
  const res = await fetch("/api/admin/sets", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
    body: JSON.stringify(set),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `HTTP ${res.status}`);
  }
}

async function apiDeleteSet(id: string): Promise<void> {
  const res = await fetch("/api/admin/sets", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
    body: JSON.stringify({ id }),
  });
  if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
}

export async function resyncSetToServer(set: PlayerSet): Promise<void> {
  return apiSaveSet(set);
}

export async function deleteSetFromServer(id: string): Promise<void> {
  return apiDeleteSet(id);
}

interface PlayerSetsStore {
  sets: PlayerSet[];
  setSets: (sets: PlayerSet[] | ((prev: PlayerSet[]) => PlayerSet[])) => void;
  addSet: (s: PlayerSet) => void;
  updateSet: (id: string, data: Partial<PlayerSet>) => void;
  removeSet: (id: string) => void;
}

export const usePlayerSets = create<PlayerSetsStore>()(
  persist(
    (set, get) => ({
      sets: [],

      setSets: (setsOrUpdater) =>
        set((state) => ({
          sets: typeof setsOrUpdater === "function"
            ? setsOrUpdater(state.sets)
            : setsOrUpdater,
        })),

      addSet: (s) => {
        set((state) => ({ sets: [...state.sets, s] }));
        if (typeof window !== "undefined") {
          apiSaveSet(s).catch(err => console.error("[UHA] Set save failed:", err));
        }
      },

      updateSet: (id, data) => {
        set((state) => ({
          sets: state.sets.map((s) => s.id === id ? { ...s, ...data } : s),
        }));
        if (typeof window !== "undefined") {
          const updated = get().sets.find(s => s.id === id);
          if (updated) {
            apiSaveSet({ ...updated, ...data }).catch(err =>
              console.error("[UHA] Set update failed:", err)
            );
          }
        }
      },

      removeSet: (id) => {
        set((state) => ({ sets: state.sets.filter((s) => s.id !== id) }));
        if (typeof window !== "undefined") {
          apiDeleteSet(id).catch(err => console.error("[UHA] Set delete failed:", err));
        }
      },
    }),
    { name: "uha-player-sets" }
  )
);
