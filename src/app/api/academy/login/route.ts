/**
 * Public Academy login — verifies name + "код доступа" server-side against
 * Firestore (Admin SDK) and mints a signed session token. The code matches
 * either the admin-visible `pin` (plain) or, for back-compat, an older
 * self-chosen `passwordHash`. Nothing is ever matched in the browser.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { mintUserToken } from "@/lib/user-auth";
import { buildAthleteScope, buildParentScope } from "@/lib/academy-data";
import { normalizeName } from "@/lib/academy-match";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { role?: string; name?: string; code?: string; pin?: string; password?: string };
    const { role, name } = body;
    // Single unified credential — accept `code`, or `pin`/`password` from
    // older clients, whichever is provided.
    const code = (body.code ?? body.pin ?? body.password ?? "").trim();
    if (role !== "athlete" && role !== "parent") {
      return NextResponse.json({ error: "Неверная роль" }, { status: 400 });
    }
    if (!name?.trim() || !code) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    const db = getAdminDb();
    const collection = role === "athlete" ? "academy_athletes" : "academy_parents";
    const snap = await db.collection(collection).get();
    // Normalize BOTH sides — a stray space typed into the admin form when the
    // account was created would otherwise silently never match a clean login.
    const nameNorm = normalizeName(name);
    const match = snap.docs.find(d => {
      const data = d.data();
      if (typeof data.name !== "string" || normalizeName(data.name) !== nameNorm) return false;
      if (typeof data.pin === "string" && data.pin.trim() === code) return true;
      if (typeof data.passwordHash === "string" && verifyPassword(code, data.passwordHash)) return true;
      return false;
    });

    if (!match) {
      const error = role === "athlete" ? "Спортсмен не найден или неверный код" : "Родитель не найден или неверный код";
      return NextResponse.json({ error }, { status: 401 });
    }

    const token = mintUserToken(`academy:${role}:${match.id}`);
    if (!token) return NextResponse.json({ error: "Сервер не настроен" }, { status: 500 });

    const scope = role === "athlete" ? await buildAthleteScope(match.id) : await buildParentScope(match.id);
    return NextResponse.json({ token, scope });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
