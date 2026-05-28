/**
 * Firestore sync for product image overrides.
 * Collection: "shop_overrides"  (one doc per product slug)
 */
import {
  collection, doc, setDoc, onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./config";
import type { ProductOverride } from "@/store/productOverrides";

const COLLECTION = "shop_overrides";

export async function saveOverrideToFirestore(override: ProductOverride): Promise<void> {
  const db = getDb();
  await setDoc(doc(collection(db, COLLECTION), override.slug), override);
}

export function subscribeToOverrides(
  callback: (overrides: Record<string, ProductOverride>) => void
): Unsubscribe {
  const db = getDb();
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const result: Record<string, ProductOverride> = {};
    snap.docs.forEach(d => {
      result[d.id] = d.data() as ProductOverride;
    });
    callback(result);
  });
}
