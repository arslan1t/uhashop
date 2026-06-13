/**
 * Admin Sets API — uses Firebase Admin SDK (bypasses Firestore rules).
 * Collection: player_sets
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

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

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();
  try {
    const db = getAdminDb();
    const snap = await db.collection("player_sets").get();
    const sets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ sets });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();
  try {
    const body = await req.json();
    const { id, ...rest } = body as { id?: string } & Record<string, unknown>;
    if (!id) return NextResponse.json({ error: "Set id required" }, { status: 400 });
    const db = getAdminDb();
    await db.collection("player_sets").doc(id).set({ id, ...sanitize(rest) }, { merge: true });
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
    const db = getAdminDb();
    await db.collection("player_sets").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
