/**
 * Shared utility for validating admin API requests.
 * Checks the x-admin-token header against the server-derived token.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// No insecure default — if ADMIN_SESSION_SECRET is unset the token becomes a
// random per-process value that matches nothing, so admin auth fails closed
// instead of accepting a publicly known default secret.
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString("hex");

export function buildAdminToken(): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
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
