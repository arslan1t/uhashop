/**
 * Stateless signed session tokens for end-user API authorization.
 *
 * A token is `base64url(userId.expiry.HMAC-SHA256(secret, "userId.expiry"))`.
 * It cannot be forged without the server secret, encodes the userId, and
 * expires — so user routes can trust the userId from the token instead of from
 * client-supplied request bodies (which can be spoofed).
 *
 * Server-only. Never import from client code.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Fallback chain: dedicated user secret → admin secret (already in Vercel) →
// Firebase private key (always present, stable) → empty (fail-closed).
// FIREBASE_PRIVATE_KEY is the last-resort so tokens always mint even if the
// admin secret is rotated, and the final "" ensures we fail-closed rather than
// sign with an undefined key.
const SECRET =
  process.env.USER_SESSION_SECRET ??
  process.env.ADMIN_SESSION_SECRET ??
  process.env.FIREBASE_PRIVATE_KEY ??
  "";

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}
function unb64url(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

/** Mint a session token for a userId. Returns null if no secret is configured. */
export function mintUserToken(userId: string): string | null {
  if (!SECRET || !userId) return null;
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}.${exp}`;
  return b64url(`${payload}.${sign(payload)}`);
}

/** Verify a token and return its userId, or null if invalid/expired. */
export function verifyUserToken(token: string | null | undefined): string | null {
  if (!SECRET || !token) return null;
  try {
    const decoded = unb64url(token);
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot < 0) return null;
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = sign(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const sep = payload.lastIndexOf(".");
    if (sep < 0) return null;
    const userId = payload.slice(0, sep);
    const exp = Number(payload.slice(sep + 1));
    if (!userId || !Number.isFinite(exp) || exp < Date.now()) return null;
    return userId;
  } catch {
    return null;
  }
}

/** Extract the authenticated userId from a request, or null. */
export function getAuthUserId(req: NextRequest): string | null {
  const header =
    req.headers.get("x-user-token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;
  return verifyUserToken(header);
}

export function unauthorizedUser(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
