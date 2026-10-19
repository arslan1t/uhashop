/**
 * Phone + password login for the unified account — the no-Telegram fallback.
 * The phone is the one captured during the Telegram contact-share step, so
 * any account that has set a password can log in here without Telegram.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { mintUserToken } from "@/lib/user-auth";
import { verifyPassword } from "@/lib/password";

/** Normalize a phone to digits only (so +998 90… and 99890… match). */
function normalizePhone(s: string): string {
  return s.replace(/\D/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = (await req.json()) as { phone?: string; password?: string };
    if (!phone?.trim() || !password) {
      return NextResponse.json({ error: "Введите телефон и пароль" }, { status: 400 });
    }

    const db = getAdminDb();
    const target = normalizePhone(phone);
    // Phone formats may vary across docs (with/without +, spaces) — scan and
    // compare on normalized digits rather than an exact-match query.
    const snap = await db.collection("user_profiles").get();
    const match = snap.docs.find(d => {
      const p = d.data().phone;
      return typeof p === "string" && p && normalizePhone(p) === target;
    });

    if (!match || !match.data().passwordHash || !verifyPassword(password, match.data().passwordHash)) {
      return NextResponse.json({ error: "Неверный телефон или пароль" }, { status: 401 });
    }

    const token = mintUserToken(match.id);
    if (!token) return NextResponse.json({ error: "Сервер не настроен" }, { status: 500 });

    const d = match.data();
    return NextResponse.json({
      token,
      profile: {
        id: match.id,
        name: d.name ?? "",
        email: d.email ?? `${match.id}@telegram.local`,
        avatar: d.avatar ?? null,
        telegram: d.telegram ?? null,
        phone: d.phone ?? null,
        bio: d.bio ?? null,
        socialLinks: d.socialLinks ?? null,
        academy: d.academy ?? null,
        hasPassword: true,
        createdAt: d.createdAt ?? new Date().toISOString(),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
