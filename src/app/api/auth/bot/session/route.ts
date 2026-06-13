import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { mintUserToken, verifyUserToken } from "@/lib/user-auth";
import crypto from "crypto";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "UhaAuthenticationbot";
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * POST — create a new pending auth session, return sessionId + bot deep link.
 *
 * Optional account-linking: a logged-in user may pass their session token
 * (x-user-token) to link their Telegram to the EXISTING account. We only honor
 * linkUserId when it matches the verified token — so nobody can link their
 * Telegram into someone else's account.
 */
export async function POST(req: NextRequest) {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const now = Date.now();

  // Resolve an authenticated link target, if provided.
  let linkUserId: string | null = null;
  const tokenUserId = verifyUserToken(req.headers.get("x-user-token"));
  if (tokenUserId) {
    try {
      const body = await req.json().catch(() => ({}));
      if (body?.linkUserId && body.linkUserId === tokenUserId) {
        linkUserId = tokenUserId;
      }
    } catch { /* no body — normal login */ }
  }

  try {
    const db = getAdminDb();
    await db.collection("auth_sessions").doc(sessionId).set({
      status: "pending",
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
      ...(linkUserId ? { linkUserId } : {}),
    });

    return NextResponse.json({
      sessionId,
      botUrl: `https://t.me/${BOT_USERNAME}?start=${sessionId}`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** GET ?id=SESSION_ID — poll session status; mints a session token on completion. */
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

    const user = data.user ?? null;
    const token = data.status === "completed" && user?.id ? mintUserToken(user.id) : null;

    return NextResponse.json({ status: data.status, user, token });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
