/**
 * Telegram broadcast — sends a message to all users who have a chatId
 * stored in user_profiles (i.e. authenticated via the Telegram bot).
 * Protected by x-admin-token header.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendTgMessage(chatId: number, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  const { message } = (await req.json()) as { message?: string };
  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("user_profiles").get();

    const targets = snap.docs
      .map((d) => d.data())
      .filter((u) => typeof u.chatId === "number");

    if (targets.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, message: "No users with chatId" });
    }

    let sent = 0;
    let failed = 0;

    await Promise.all(
      targets.map(async (u) => {
        try {
          const result = await sendTgMessage(u.chatId as number, message.trim());
          if (result.ok) sent++;
          else failed++;
        } catch {
          failed++;
        }
      })
    );

    return NextResponse.json({ sent, failed, total: targets.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const db = getAdminDb();
    const snap = await db.collection("user_profiles").get();
    const total = snap.docs.filter((d) => typeof d.data().chatId === "number").length;
    return NextResponse.json({ reachable: total });
  } catch (e) {
    return NextResponse.json({ reachable: 0, error: String(e) });
  }
}
