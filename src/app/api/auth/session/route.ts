/**
 * POST /api/auth/session
 *
 * Exchanges a Firebase ID token (from client-side email/password auth) for a
 * server-signed session token used to authorize /api/user/* routes.
 *
 * The ID token is verified against Google's Identity Toolkit REST endpoint
 * (accounts:lookup). This deliberately avoids firebase-admin/auth, whose
 * jwks-rsa→jose dependency is ESM-only and crashes Vercel's CommonJS serverless
 * runtime (ERR_REQUIRE_ESM) when bundled into the shared admin module.
 */
import { NextRequest, NextResponse } from "next/server";
import { mintUserToken } from "@/lib/user-auth";

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) return NextResponse.json({ error: "idToken required" }, { status: 400 });
    if (!API_KEY) return NextResponse.json({ error: "auth not configured" }, { status: 503 });

    // Google validates the ID token's signature/expiry and returns the account.
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    const data = await res.json();
    const uid = data?.users?.[0]?.localId as string | undefined;
    if (!res.ok || !uid) {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
    }

    const token = mintUserToken(uid);
    if (!token) return NextResponse.json({ error: "session secret not configured" }, { status: 500 });

    return NextResponse.json({ ok: true, token, userId: uid });
  } catch {
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}
