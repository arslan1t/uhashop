/**
 * Sets/changes the password on the caller's unified account, enabling
 * phone+password login without Telegram. Auth comes from the signed session
 * token; the password is hashed server-side and stored on user_profiles.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthUserId, unauthorizedUser } from "@/lib/user-auth";
import { hashPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorizedUser();

  try {
    const { password } = (await req.json()) as { password?: string };
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection("user_profiles").doc(userId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Профиль не найден" }, { status: 404 });
    }
    const phone = snap.data()?.phone;
    if (!phone) {
      // Phone is the login identifier — without it the password can't be used.
      return NextResponse.json({ error: "Сначала войдите через Telegram, чтобы привязать номер телефона" }, { status: 400 });
    }

    await ref.set({ passwordHash: hashPassword(password) }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
