/**
 * Firestore operations for admin-managed products.
 * Collection: "shop_products"
 */
import {
  collection, doc, setDoc, deleteDoc, onSnapshot,
  getDocs, serverTimestamp, type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./config";
import type { Product } from "@/types";

const COLLECTION = "shop_products";

/**
 * Remove keys whose value is `undefined`. The client Firestore SDK throws
 * "Unsupported field value: undefined" on setDoc — a ball with no
 * replicaPrice/style/badge would otherwise fail to save and never sync.
 */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

/** Save (create or overwrite) a product */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const db = getDb();
  const ref = doc(collection(db, COLLECTION), product.id);
  await setDoc(ref, { ...stripUndefined(product), _updatedAt: serverTimestamp() });
}

/** Delete a product */
export async function deleteProductFromFirestore(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(collection(db, COLLECTION), id));
}

/** One-time fetch of all products */
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const db = getDb();
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map(d => {
    const data = d.data();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _updatedAt, ...product } = data;
    return product as Product;
  });
}

/** Real-time listener — calls callback whenever products change */
export function subscribeToProducts(
  callback: (products: Product[]) => void
): Unsubscribe {
  const db = getDb();
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const products = snap.docs.map(d => {
      const data = d.data();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _updatedAt, ...product } = data;
      return product as Product;
    });
    callback(products);
  });
}
