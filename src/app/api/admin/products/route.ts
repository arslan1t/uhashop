/**
 * Admin Products API — uses Firebase Admin SDK (bypasses Firestore rules).
 * Collection: shop_products
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * Recursively drop values Firestore rejects:
 *  - NaN / Infinity numbers (e.g. a price field cleared to "" → Number("") chains to NaN)
 *  - undefined (also handled by ignoreUndefinedProperties, dropped here for safety)
 * Invalid fields are removed so .set({merge:true}) keeps the existing valid value
 * instead of throwing "Cannot use NaN as a Firestore value" and failing the whole save.
 */
function sanitizeForFirestore<T>(value: T): T {
  if (typeof value === "number") {
    return (Number.isFinite(value) ? value : undefined) as T;
  }
  if (Array.isArray(value)) {
    return value
      .map(sanitizeForFirestore)
      .filter(v => v !== undefined) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const clean = sanitizeForFirestore(v);
      if (clean !== undefined) out[k] = clean;
    }
    return out as T;
  }
  return value;
}

// ── GET — list all products ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const db      = getAdminDb();
    const snap    = await db.collection("shop_products").get();
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ products });
  } catch (e) {
    console.error("Admin GET products:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── POST — create / upsert a product ────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { id, ...rest } = body as { id?: string } & Record<string, unknown>;

    if (!id) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }

    const db = getAdminDb();
    const clean = sanitizeForFirestore(rest);
    await db.collection("shop_products").doc(id).set({ id, ...clean }, { merge: true });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("Admin POST product:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── DELETE — remove a product ────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("shop_products").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin DELETE product:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
