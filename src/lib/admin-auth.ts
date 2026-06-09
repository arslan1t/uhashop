/**
 * Shared utility for validating admin API requests.
 * Checks the x-admin-token header against the server-derived token.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "uha-admin-secret-2024";

export function buildAdminToken(): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update("uha-admin-session-v1")
    .digest("hex");
}

export function isAdminAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  if (!token) return false;
  return token === buildAdminToken();
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
