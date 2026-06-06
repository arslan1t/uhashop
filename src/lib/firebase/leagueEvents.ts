/**
 * Firestore operations for UHA League 3x3 events.
 * Collection: "league_events"
 */
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy,
  onSnapshot, where, type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./config";

export interface LeagueEvent {
  id?: string;
  name: string;
  date: string; // ISO date
  city: string;
  prizePool: number; // USD
  availableSlots: number;
  registeredTeams: number;
  maxTeams: number;
  description?: string;
  imageUrl?: string;
  videoUrl?: string; // YouTube
  status: "upcoming" | "live" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION = "league_events";

export async function createEvent(data: Omit<LeagueEvent, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const db = getDb();
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateEvent(id: string, data: Partial<LeagueEvent>): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getEvents(): Promise<LeagueEvent[]> {
  const db = getDb();
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("date", "desc"))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LeagueEvent));
}

export function subscribeToEvents(callback: (events: LeagueEvent[]) => void): Unsubscribe {
  const db = getDb();
  return onSnapshot(
    query(collection(db, COLLECTION), orderBy("date", "desc")),
    (snap) => {
      const events = snap.docs.map(d => ({ id: d.id, ...d.data() } as LeagueEvent));
      callback(events);
    }
  );
}

export async function getUpcomingEvent(): Promise<LeagueEvent | null> {
  const db = getDb();
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where("status", "==", "upcoming"),
      orderBy("date", "asc")
    )
  );
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as LeagueEvent;
}
