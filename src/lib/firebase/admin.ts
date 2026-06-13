/**
 * Firebase Admin SDK — server-only module.
 * Bypasses Firestore/Storage security rules entirely.
 * Never import this file from client-side code.
 *
 * Required environment variables (no NEXT_PUBLIC_ prefix!):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (keep the \n escapes — Vercel preserves them)
 */
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { getAuth, type Auth } from "firebase-admin/auth";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!;

  const projectId   = process.env.FIREBASE_PROJECT_ID
                   ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
  const privateKey  = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "";

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK: missing env vars. Set FIREBASE_PROJECT_ID, " +
      "FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in Vercel → Settings → " +
      "Environment Variables."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });
}

let _db: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (_db) return _db;
  const db = getFirestore(getAdminApp());
  // CRITICAL: without this, saving a product that has any `undefined` field
  // (e.g. a ball with no replicaPrice/style/badge) makes .set() THROW
  // "Cannot use undefined as a Firestore value" → write silently fails →
  // product only lives in localStorage and never syncs to other devices.
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings() may only be called once per Firestore instance — safe to ignore
  }
  _db = db;
  return _db;
}

export function getAdminStorage(): Storage {
  return getStorage(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
