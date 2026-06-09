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

// Server-only env vars (no NEXT_PUBLIC_ prefix → not in JS bundle)
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@uhashop.uz";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "uha2024admin";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "uha-admin-secret-2024";

/** Deterministic session token derived from env-only secret */
function buildToken(): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update("uha-admin-session-v1")
    .digest("hex");
}

/** POST — validate email + password, return token */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Constant-time comparison to prevent timing attacks
    const emailOk    = crypto.timingSafeEqual(Buffer.from(email    ?? ""), Buffer.from(ADMIN_EMAIL));
    const passwordOk = crypto.timingSafeEqual(Buffer.from(password ?? ""), Buffer.from(ADMIN_PASSWORD));

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
