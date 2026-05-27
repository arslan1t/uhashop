// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration — uha-league project
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "" &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== ""
  );
}

// ── Lazy singleton — only initialised when actually needed ────────────────────
let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _storage: FirebaseStorage | null = null;

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    // Don't init Firebase on the server / SSR
    throw new Error("Firebase should not be initialised on the server.");
  }
  if (getApps().length > 0) return getApp();
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase not configured. Add credentials to .env.local");
  }
  return initializeApp(firebaseConfig);
}

export function getFirebaseInstances() {
  if (!_app) {
    _app = getFirebaseApp();
    _db  = getFirestore(_app);
    _auth = getAuth(_app);
    _storage = getStorage(_app);
  }
  return { app: _app, db: _db!, auth: _auth!, storage: _storage! };
}

export function getDb(): Firestore {
  return getFirebaseInstances().db;
}

export function getFirebaseAuth(): Auth {
  return getFirebaseInstances().auth;
}

export function getFirebaseStorage(): FirebaseStorage {
  return getFirebaseInstances().storage;
}

export { getFirebaseApp };
