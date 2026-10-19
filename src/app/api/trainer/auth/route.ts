/**
 * Trainer (coach) authentication for the dedicated /trainer panel.
 * Credentials live in Firestore (academy_coaches), created by the shop admin
 * via /api/admin/coaches — never self-registered.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { mintTrainerToken, verifyPassword, getTrainerId } from "@/lib/trainer-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Заполните email и пароль" }, { status: 400 });
    }

    const db = getAdminDb();
    const snap = await db.collection("academy_coaches")
      .where("email", "==", email.trim().toLowerCase()).limit(1).get();

    if (snap.empty) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const doc = snap.docs[0];
    const coach = doc.data();
    if (!verifyPassword(password, coach.passwordHash)) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const token = mintTrainerToken(doc.id);
    if (!token) return NextResponse.json({ error: "Сервер не настроен" }, { status: 500 });

    return NextResponse.json({ token, coach: { id: doc.id, name: coach.name, email: coach.email } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** GET — validate an existing trainer token, return the coach's profile. */
export async function GET(req: NextRequest) {
  const coachId = getTrainerId(req);
  if (!coachId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getAdminDb();
    const doc = await db.collection("academy_coaches").doc(coachId).get();
    if (!doc.exists) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const coach = doc.data()!;
    return NextResponse.json({ coach: { id: doc.id, name: coach.name, email: coach.email } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
