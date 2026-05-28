/**
 * Firestore sync for product metadata (isFeatured, status, isDeleted).
 * Collection: "shop_meta"  (one doc per product ID)
 */
import { collection, doc, setDoc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { getDb } from "./config";

export interface ProductMetaEntry {
  id: string;
  isFeatured?: boolean;
  status?: "published" | "draft" | "archived";
  isDeleted?: boolean;
}

const COLLECTION = "shop_meta";

export async function saveMetaToFirestore(entry: ProductMetaEntry): Promise<void> {
  const db = getDb();
  await setDoc(doc(collection(db, COLLECTION), entry.id), entry, { merge: true });
}

export function subscribeToMeta(
  callback: (meta: Record<string, ProductMetaEntry>) => void
): Unsubscribe {
  const db = getDb();
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const result: Record<string, ProductMetaEntry> = {};
    snap.docs.forEach(d => { result[d.id] = d.data() as ProductMetaEntry; });
    callback(result);
  });
}
