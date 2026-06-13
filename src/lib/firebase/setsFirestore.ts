/**
 * Firestore operations for player sets.
 * Collection: "player_sets"
 */
import {
  collection, doc, setDoc, deleteDoc, onSnapshot,
  serverTimestamp, type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./config";
import type { PlayerSet } from "@/types";

const COLLECTION = "player_sets";

export async function saveSetToFirestore(set: PlayerSet): Promise<void> {
  const db = getDb();
  const ref = doc(collection(db, COLLECTION), set.id);
  await setDoc(ref, { ...set, _updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteSetFromFirestore(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(collection(db, COLLECTION), id));
}

export function subscribeToSets(
  callback: (sets: PlayerSet[]) => void
): Unsubscribe {
  const db = getDb();
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const sets = snap.docs.map(d => {
      const data = d.data();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _updatedAt, ...set } = data;
      return set as PlayerSet;
    });
    callback(sets);
  });
}
