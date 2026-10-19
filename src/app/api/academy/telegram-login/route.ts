/**
 * Telegram login for academy athletes/parents — an alternative to typing
 * name+PIN. Mints a short session the bot completes (see /api/telegram-webhook):
 * already-linked accounts log in instantly; first-time users confirm with
 * Имя+PIN once inside the bot, which links their chatId for next time.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "UhaAuthenticationbot";
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  try {
    const { role } = (await req.json()) as { role?: string };
    if (role !== "athlete" && role !== "parent") {
      return NextResponse.json({ error: "Неверная роль" }, { status: 400 });
    }

    const sessionId = crypto.randomUUID().replace(/-/g, "");
    const now = Date.now();
    const db = getAdminDb();
    await db.collection("academy_telegram_sessions").doc(sessionId).set({
      role,
      status: "pending",
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    });

    return NextResponse.json({
      sessionId,
      botUrl: `https://t.me/${BOT_USERNAME}?start=aclogin_${sessionId}`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** GET ?id=SESSION_ID — poll login status; returns the minted token once completed. */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("id");
  if (!sessionId) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const db = getAdminDb();
    const doc = await db.collection("academy_telegram_sessions").doc(sessionId).get();
    if (!doc.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

    const data = doc.data()!;
    if (new Date(data.expiresAt as string) < new Date()) {
      return NextResponse.json({ status: "expired" });
    }
    return NextResponse.json({ status: data.status, token: data.token ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
