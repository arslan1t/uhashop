/**
 * User profile extras (avatar, bio, social links). Collection: user_profiles.
 *
 * GET is public (public profile pages read it).
 * POST requires a valid user session token and writes ONLY the caller's own
 * document — the userId comes from the verified token, never from the body.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthUserId, unauthorizedUser } from "@/lib/user-auth";

// Fields a user is allowed to set on their own profile.
const ALLOWED = new Set(["name", "avatar", "bio", "socialLinks", "telegram"]);

export async function POST(req: NextRequest) {
  const authId = getAuthUserId(req);
  if (!authId) return unauthorizedUser();

  try {
    const body = (await req.json()) as Record<string, unknown>;
    // Ignore any client-supplied userId; only the token's userId is trusted.
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (ALLOWED.has(k) && v !== undefined) data[k] = v;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "no writable fields" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("user_profiles").doc(authId).set(data, { merge: true });
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
    if (!snap.exists) return NextResponse.json({ profile: {} });
    // Public projection — never expose phone / chatId / telegramId publicly.
    const d = snap.data()!;
    return NextResponse.json({
      profile: {
        name: d.name ?? null,
        avatar: d.avatar ?? null,
        bio: d.bio ?? null,
        socialLinks: d.socialLinks ?? null,
        telegram: d.telegram ?? null,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
