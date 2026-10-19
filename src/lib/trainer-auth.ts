/**
 * Auth for the dedicated trainer/coach panel (/trainer) — scoped to academy
 * management only. Reuses the same signed-token scheme as user-auth (role
 * prefix + id) so there's one signing implementation for the whole app.
 *
 * Server-only. Never import from client code.
 */
import { NextRequest } from "next/server";
import { mintUserToken, verifyUserToken } from "@/lib/user-auth";
export { hashPassword, verifyPassword } from "@/lib/password";

export function mintTrainerToken(coachId: string): string | null {
  return mintUserToken(`coach:${coachId}`);
}

/** Trainer tokens travel in the same header as the admin token — the two
 *  signing schemes are unambiguous, so one route can accept either. */
export function getTrainerId(req: NextRequest): string | null {
  const header = req.headers.get("x-admin-token");
  const decoded = verifyUserToken(header);
  if (!decoded) return null;
  const sep = decoded.indexOf(":");
  if (sep < 0 || decoded.slice(0, sep) !== "coach") return null;
  return decoded.slice(sep + 1);
}

export function isTrainerAuthorized(req: NextRequest): boolean {
  return getTrainerId(req) !== null;
}
