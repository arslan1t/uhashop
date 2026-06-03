/**
 * Firestore operations for UHA Academy applications.
 * Collection: "academy_applications"
 */
import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  getDocs, serverTimestamp, query, orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./config";

export type ApplicationStatus = "new" | "contacted" | "enrolled" | "rejected";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro";

export interface AcademyApplication {
  id?: string;
  parentName: string;
  parentTg: string;
  age: number;
  athleteName?: string;
  height?: number;
  weight?: number;
  skillLevel?: SkillLevel;
  notes?: string;
  status: ApplicationStatus;
  createdAt: unknown; // Firestore Timestamp
  updatedAt?: unknown;
}

const COLLECTION = "academy_applications";

export async function submitApplication(
  data: Omit<AcademyApplication, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getDb();
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(collection(db, COLLECTION), id), {
    status,
    ...(notes !== undefined ? { notes } : {}),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToApplications(
  callback: (apps: AcademyApplication[]) => void
): Unsubscribe {
  const db = getDb();
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const apps = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as AcademyApplication[];
    callback(apps);
  });
}
