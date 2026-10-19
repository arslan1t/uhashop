/**
 * Athlete-initiated mutations (toggle exercise, register/unregister for an
 * event). Token-scoped: an athlete can only mutate their own records.
 */
import { NextRequest, NextResponse } from "next/server";
import { resolveAcademyAuth } from "@/lib/academy-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { buildAthleteScope, buildParentScope } from "@/lib/academy-data";

export async function POST(req: NextRequest) {
  const auth = await resolveAcademyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as { action?: string; exerciseId?: string; eventId?: string };
    const db = getAdminDb();

    if (body.action === "toggleExercise") {
      if (auth.role !== "athlete" || !body.exerciseId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const ref = db.collection("academy_exercises").doc(body.exerciseId);
      const snap = await ref.get();
      if (!snap.exists || snap.data()?.athleteId !== auth.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const completed = !snap.data()?.completed;
      await ref.update({ completed, completedAt: completed ? new Date().toISOString().slice(0, 10) : null });
    } else if (body.action === "registerForEvent" || body.action === "unregisterFromEvent") {
      if (auth.role !== "athlete" || !body.eventId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const ref = db.collection("academy_events").doc(body.eventId);
      const snap = await ref.get();
      if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const registeredIds: string[] = snap.data()?.registeredIds ?? [];
      const next = body.action === "registerForEvent"
        ? [...registeredIds.filter((id: string) => id !== auth.id), auth.id]
        : registeredIds.filter((id: string) => id !== auth.id);
      await ref.update({ registeredIds: next });
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const scope = auth.role === "athlete" ? await buildAthleteScope(auth.id) : await buildParentScope(auth.id);
    return NextResponse.json({ scope });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
