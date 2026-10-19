/**
 * Admin-only management of trainer/coach accounts for the /trainer panel.
 * Deliberately NOT accessible with a trainer token — only the shop admin
 * can create or remove coach logins.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { hashPassword } from "@/lib/trainer-auth";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();
  try {
    const db = getAdminDb();
    const snap = await db.collection("academy_coaches").get();
    const coaches = snap.docs.map(d => ({ id: d.id, name: d.data().name, email: d.data().email, createdAt: d.data().createdAt }));
    return NextResponse.json({ coaches });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();
  try {
    const { name, email, password } = (await req.json()) as { name?: string; email?: string; password?: string };
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return NextResponse.json({ error: "Имя, email и пароль (мин. 6 символов) обязательны" }, { status: 400 });
    }

    const db = getAdminDb();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.collection("academy_coaches").where("email", "==", normalizedEmail).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: "Тренер с таким email уже существует" }, { status: 409 });
    }

    const id = `coach_${Date.now()}`;
    await db.collection("academy_coaches").doc(id).set({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await getAdminDb().collection("academy_coaches").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
