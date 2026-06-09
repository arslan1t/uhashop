/**
 * Admin users API — reads from Firestore shop_users via Admin SDK.
 * Protected by x-admin-token header.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const db   = getAdminDb();
    const snap = await db
      .collection("shop_users")
      .orderBy("createdAt", "desc")
      .get();

    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json(
      { users: [], error: e instanceof Error ? e.message : String(e) }
    );
  }
}
