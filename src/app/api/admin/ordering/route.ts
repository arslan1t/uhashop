/**
 * Admin Ordering API — stores custom product display order per category.
 * Firestore document: marketplace_config/product_order
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

const DOC_PATH = { collection: "marketplace_config", doc: "product_order" };

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();
  try {
    const db = getAdminDb();
    const snap = await db.collection(DOC_PATH.collection).doc(DOC_PATH.doc).get();
    const orders = snap.exists ? (snap.data() as Record<string, string[]>) : {};
    return NextResponse.json({ orders });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();
  try {
    const { category, ids } = (await req.json()) as { category: string; ids: string[] };
    if (!category || !Array.isArray(ids)) {
      return NextResponse.json({ error: "category and ids required" }, { status: 400 });
    }
    const db = getAdminDb();
    await db.collection(DOC_PATH.collection).doc(DOC_PATH.doc).set(
      { [category]: ids },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
