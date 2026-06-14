/**
 * Shared utility for validating admin API requests.
 * Checks the x-admin-token header against the server-derived token.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Secret resolution must be DETERMINISTIC and identical everywhere — a random
// fallback makes the issuing and validating code paths disagree (→ 401 on every
// admin write). No publicly-known hardcoded default: if ADMIN_SESSION_SECRET is
// unset we derive a stable secret from FIREBASE_PRIVATE_KEY (server-only, always
// present, not guessable) so auth keeps working without a weak default.
export function adminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.FIREBASE_PRIVATE_KEY || "";
}

export function buildAdminToken(): string {
  return crypto
    .createHmac("sha256", adminSessionSecret())
    .update("uha-admin-session-v1")
    .digest("hex");
}

export function isAdminAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  if (!token) return false;
  // Constant-time compare to avoid leaking the token via timing.
  const a = Buffer.from(token);
  const b = Buffer.from(buildAdminToken());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
