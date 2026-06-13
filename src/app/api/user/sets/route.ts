/**
 * Public API for user-created player sets.
 * Writes to the same "player_sets" Firestore collection as admin sets.
 * Ownership enforced: users can only modify sets where createdBy === userId.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthUserId, unauthorizedUser } from "@/lib/user-auth";
import type { PlayerSet } from "@/types";

function sanitize<T>(v: T): T {
  if (typeof v === "number") return (Number.isFinite(v) ? v : undefined) as T;
  if (Array.isArray(v)) return v.map(sanitize).filter(x => x !== undefined) as T;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) {
      const c = sanitize(val);
      if (c !== undefined) out[k] = c;
    }
    return out as T;
  }
  return v;
}

/** Public — returns all sets. Admin SDK bypasses Firestore security rules. */
export async function GET() {
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
  try {
    const authId = getAuthUserId(req);
    if (!authId) return unauthorizedUser();

    const body = await req.json() as Partial<PlayerSet> & { userId?: string };
    // Strip any client-supplied userId/createdBy — ownership comes from the token.
    const { userId: _ignored, createdBy: _ignored2, ...setData } = body;
    if (!setData.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

    const id = setData.id ?? `uset-${Date.now()}`;
    const db = getAdminDb();

    // If updating an existing set, the caller must own it.
    if (setData.id) {
      const existing = await db.collection("player_sets").doc(setData.id).get();
      if (existing.exists && existing.data()?.createdBy !== authId) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }

    const payload = sanitize({
      ...setData,
      id,
      createdBy: authId,
      displayOrder: setData.displayOrder ?? 999,
      createdAt: setData.createdAt ?? new Date().toISOString(),
    });
    await db.collection("player_sets").doc(id).set(payload, { merge: true });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authId = getAuthUserId(req);
    if (!authId) return unauthorizedUser();

    const { setId } = (await req.json()) as { setId?: string };
    if (!setId) return NextResponse.json({ error: "setId required" }, { status: 400 });

    const db = getAdminDb();
    const snap = await db.collection("player_sets").doc(setId).get();
    if (!snap.exists) return NextResponse.json({ error: "not found" }, { status: 404 });
    const data = snap.data() as PlayerSet;
    if (data.createdBy !== authId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    await db.collection("player_sets").doc(setId).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
