/**
 * Admin Academy API — uses Firebase Admin SDK (bypasses Firestore rules).
 * One polymorphic route for all academy sub-collections, mirroring the
 * shape of /api/admin/sets. Contains PII (phone numbers, PINs, payments) —
 * admin-only, never exposed to the public academy login/dashboard pages.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { isTrainerAuthorized } from "@/lib/trainer-auth";
import { getAdminDb } from "@/lib/firebase/admin";

// Trainers may manage academy data (this route only ever touches academy_*
// collections) but never the rest of the shop admin — so this check is
// intentionally scoped to just this file and notify-payment, not exported.
function isAuthorized(req: NextRequest): boolean {
  return isAdminAuthorized(req) || isTrainerAuthorized(req);
}

const COLLECTIONS: Record<string, string> = {
  athletes:      "academy_athletes",
  parents:       "academy_parents",
  schedule:      "academy_schedule",
  exercises:     "academy_exercises",
  payments:      "academy_payments",
  events:        "academy_events",
  badges:        "academy_badges",
  athleteBadges: "academy_athlete_badges",
  progress:      "academy_progress",
  media:         "academy_media",
  applications:  "academy_applications",
  notes:         "academy_notes",
};

// Some docs (e.g. applications created via the website's REST-API apply
// route, or anything written with a native Firestore timestamp) come back
// from the Admin SDK as Timestamp objects, which serialize to an opaque
// {_seconds,_nanoseconds} shape over JSON. Flatten those to ISO strings so
// the client never has to special-case Firestore's wire format.
function serializeDoc(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = v && typeof v === "object" && typeof (v as { toDate?: unknown }).toDate === "function"
      ? (v as { toDate: () => Date }).toDate().toISOString()
      : v;
  }
  return out;
}

function sanitize<T>(value: T): T {
  if (typeof value === "number") return (Number.isFinite(value) ? value : undefined) as T;
  if (Array.isArray(value)) return value.map(sanitize).filter(v => v !== undefined) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const clean = sanitize(v);
      if (clean !== undefined) out[k] = clean;
    }
    return out as T;
  }
  return value;
}

function docId(resource: string, data: Record<string, unknown>): string | null {
  if (resource === "athleteBadges") {
    if (!data.athleteId || !data.badgeId) return null;
    return `${data.athleteId}__${data.badgeId}`;
  }
  return typeof data.id === "string" ? data.id : null;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse();
  try {
    const db = getAdminDb();
    const entries = await Promise.all(
      Object.entries(COLLECTIONS).map(async ([key, collection]) => {
        const snap = await db.collection(collection).get();
        let docs = snap.docs.map(d => ({ id: d.id, ...serializeDoc(d.data()) }));
        if (key === "applications") {
          docs = docs.sort((a, b) => String((b as { createdAt?: string }).createdAt ?? "").localeCompare(String((a as { createdAt?: string }).createdAt ?? "")));
        }
        return [key, docs] as const;
      })
    );
    return NextResponse.json(Object.fromEntries(entries));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse();
  try {
    const body = await req.json() as { resource?: string; data?: Record<string, unknown> };
    const { resource, data } = body;
    if (!resource || !COLLECTIONS[resource] || !data) {
      return NextResponse.json({ error: "resource and data required" }, { status: 400 });
    }
    const id = docId(resource, data);
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const db = getAdminDb();
    await db.collection(COLLECTIONS[resource]).doc(id).set(sanitize({ ...data, id }), { merge: true });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse();
  try {
    const { resource, id } = (await req.json()) as { resource?: string; id?: string };
    if (!resource || !COLLECTIONS[resource] || !id) {
      return NextResponse.json({ error: "resource and id required" }, { status: 400 });
    }
    const db = getAdminDb();
    await db.collection(COLLECTIONS[resource]).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
