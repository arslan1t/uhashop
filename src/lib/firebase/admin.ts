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

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getAdminApp());
}
