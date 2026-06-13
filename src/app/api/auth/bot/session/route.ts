import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import crypto from "crypto";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "UhaAuthenticationbot";
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** POST — create a new pending auth session, return sessionId + bot deep link */
export async function POST() {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const now = Date.now();

  try {
    const db = getAdminDb();
    await db.collection("auth_sessions").doc(sessionId).set({
      status: "pending",
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    });

    return NextResponse.json({
      sessionId,
      botUrl: `https://t.me/${BOT_USERNAME}?start=${sessionId}`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** GET ?id=SESSION_ID — poll session status */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("id");
  if (!sessionId) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const db = getAdminDb();
    const doc = await db.collection("auth_sessions").doc(sessionId).get();
    if (!doc.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

    const data = doc.data()!;

    if (new Date(data.expiresAt as string) < new Date()) {
      return NextResponse.json({ status: "expired" });
    }

    return NextResponse.json({ status: data.status, user: data.user ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
