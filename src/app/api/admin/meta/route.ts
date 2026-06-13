/**
 * Admin product-metadata API (isFeatured / status / isDeleted) — Admin SDK.
 * Collection: shop_meta (one doc per product id).
 *
 * Client writes to shop_meta are blocked by security rules, so feature/archive/
 * delete toggles MUST go through this server route to sync across devices. The
 * public site still READS via the client onSnapshot.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const body = (await req.json()) as {
      id?: string;
      isFeatured?: boolean;
      status?: "published" | "draft" | "archived";
      isDeleted?: boolean;
    };
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const clean: Record<string, unknown> = { id };
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) clean[k] = v;
    }

    const db = getAdminDb();
    await db.collection("shop_meta").doc(id).set(clean, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin POST meta:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
