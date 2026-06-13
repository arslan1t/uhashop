/**
 * Persist user profile extras (avatar, bio, social links) to Firestore.
 * Collection: user_profiles
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const { userId, ...data } = body;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    const db = getAdminDb();
    await db.collection("user_profiles").doc(userId).set(data, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  try {
    const db = getAdminDb();
    const snap = await db.collection("user_profiles").doc(userId).get();
    return NextResponse.json({ profile: snap.exists ? snap.data() : {} });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
