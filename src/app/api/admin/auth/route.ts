/**
 * Admin Authentication API
 *
 * POST /api/admin/auth  — validate credentials, return session token
 * GET  /api/admin/auth  — validate existing token
 *
 * Credentials come from server-only env vars (ADMIN_EMAIL, ADMIN_PASSWORD).
 * They are NEVER shipped to the browser bundle.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { buildAdminToken } from "@/lib/admin-auth";

// Server-only env vars (no NEXT_PUBLIC_ prefix → not in JS bundle).
// No insecure defaults — credentials MUST be configured in the environment.
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

// Single source of truth for the session token — shared with isAdminAuthorized
// so issuing and validating can never disagree.
const buildToken = buildAdminToken;

/** Length-safe constant-time compare (timingSafeEqual throws on unequal lengths). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** POST — validate email + password, return token */
export async function POST(req: NextRequest) {
  try {
    // Fail closed if admin credentials aren't configured.
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: "Admin not configured" }, { status: 503 });
    }

    const { email, password } = await req.json();

    const emailOk    = safeEqual(String(email ?? ""), ADMIN_EMAIL);
    const passwordOk = safeEqual(String(password ?? ""), ADMIN_PASSWORD);

    if (!emailOk || !passwordOk) {
      // Artificial delay on failure to slow brute-force attempts
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, token: buildToken() });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}

/** GET — check if provided token is valid */
export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const valid = token === buildToken();
  return NextResponse.json({ ok: valid }, { status: valid ? 200 : 401 });
}
