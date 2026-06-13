/**
 * POST /api/auth/session
 *
 * Exchanges a Firebase ID token (from client-side email/password auth) for a
 * server-signed session token used to authorize /api/user/* routes. The ID
 * token is verified with the Admin SDK, so the returned session token is bound
 * to a real, server-verified uid — the client can't forge a userId.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { mintUserToken } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) return NextResponse.json({ error: "idToken required" }, { status: 400 });

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const token = mintUserToken(decoded.uid);
    if (!token) return NextResponse.json({ error: "session secret not configured" }, { status: 500 });

    return NextResponse.json({ ok: true, token, userId: decoded.uid });
  } catch {
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}
