/**
 * Admin users API — reads from Firestore shop_users.
 */
import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

function getDb() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;
  const cfg = {
    apiKey,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
  const app = getApps().length > 0 ? getApp() : initializeApp(cfg);
  return getFirestore(app);
}

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ users: [], message: "Firebase not configured" });
  }
  try {
    const snap = await getDocs(
      query(collection(db, "shop_users"), orderBy("createdAt", "desc"))
    );
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ users: [], error: e instanceof Error ? e.message : String(e) });
  }
}
