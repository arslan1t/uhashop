/**
 * Links an academy parent's Telegram chat so the admin panel can send them
 * payment reminders via the bot. Telegram only lets a bot message a user
 * after that user has started a conversation with it — so we mint a short
 * session, the parent taps a deep link that opens the bot and sends /start,
 * and the webhook (see /api/telegram-webhook) captures their chatId.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAcademyAuth } from "@/lib/academy-auth";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "UhaAuthenticationbot";
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  const auth = getAcademyAuth(req);
  if (!auth || auth.role !== "parent") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sessionId = randomBytes(16).toString("hex");
    const now = Date.now();
    const db = getAdminDb();
    await db.collection("academy_link_sessions").doc(sessionId).set({
      parentId: auth.id,
      status: "pending",
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    });

    return NextResponse.json({
      sessionId,
      botUrl: `https://t.me/${BOT_USERNAME}?start=aplink_${sessionId}`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** GET ?id=SESSION_ID — poll link status. */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("id");
  if (!sessionId) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const db = getAdminDb();
    const doc = await db.collection("academy_link_sessions").doc(sessionId).get();
    if (!doc.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

    const data = doc.data()!;
    if (new Date(data.expiresAt as string) < new Date()) {
      return NextResponse.json({ status: "expired" });
    }
    return NextResponse.json({ status: data.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
