/**
 * Admin product-image overrides API — uses Firebase Admin SDK (bypasses
 * Firestore security rules). Collection: shop_overrides (one doc per slug).
 *
 * Client-side writes to this collection are blocked by security rules, so
 * main-image / image-order changes MUST go through this server route to sync
 * across devices. The public site still READS via the client onSnapshot.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const body = (await req.json()) as {
      slug?: string;
      mainImage?: string;
      imageOrder?: string[];
    };
    const { slug, mainImage, imageOrder } = body;

    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    // Drop blob: previews and empties — only persist real uploaded URLs.
    const clean: Record<string, unknown> = { slug };
    if (mainImage && !mainImage.startsWith("blob:")) clean.mainImage = mainImage;
    if (Array.isArray(imageOrder)) {
      const valid = imageOrder.filter(u => !!u && !u.startsWith("blob:"));
      if (valid.length > 0) clean.imageOrder = valid;
    }

    const db = getAdminDb();
    await db.collection("shop_overrides").doc(slug).set(clean, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Admin POST override:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
