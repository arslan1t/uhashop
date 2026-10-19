/**
 * Token parsing for the public Academy session — reuses the same signed
 * token scheme as user-auth (HMAC, server secret) with a role-prefixed id
 * so one signing implementation serves both shop users and academy accounts.
 */
import { NextRequest } from "next/server";
import { verifyUserToken } from "@/lib/user-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export interface AcademyAuth {
  role: "athlete" | "parent";
  id: string;
}

/** Dedicated academy token (`x-academy-token`, payload `academy:role:id`). */
export function getAcademyAuth(req: NextRequest): AcademyAuth | null {
  const header = req.headers.get("x-academy-token");
  const decoded = verifyUserToken(header);
  if (!decoded) return null;
  const parts = decoded.split(":");
  if (parts.length !== 3 || parts[0] !== "academy") return null;
  const role = parts[1];
  if (role !== "athlete" && role !== "parent") return null;
  return { role, id: parts[2] };
}

/**
 * Resolves academy access from EITHER a dedicated academy token OR the unified
 * shop session token (`x-user-token`). With the unified token we look up the
 * account's academy link on its user_profiles doc — so one login grants both
 * the shop and the academy kabinet (true single account).
 */
export async function resolveAcademyAuth(req: NextRequest): Promise<AcademyAuth | null> {
  const direct = getAcademyAuth(req);
  if (direct) return direct;

  const shopToken = req.headers.get("x-user-token");
  const userId = verifyUserToken(shopToken);
  if (!userId) return null;
  try {
    const snap = await getAdminDb().collection("user_profiles").doc(userId).get();
    const academy = snap.data()?.academy;
    if (academy?.academyId && (academy.role === "athlete" || academy.role === "parent")) {
      return { role: academy.role, id: academy.academyId };
    }
  } catch { /* ignore */ }
  return null;
}
