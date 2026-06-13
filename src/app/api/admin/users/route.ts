/**
 * Admin users API — reads from BOTH shop_users (email auth) and user_profiles
 * (Telegram bot users). Protected by x-admin-token header.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

  try {
    const db = getAdminDb();

    const [shopSnap, profileSnap] = await Promise.all([
      db.collection("shop_users").orderBy("createdAt", "desc").get().catch(() => null),
      db.collection("user_profiles").orderBy("createdAt", "desc").get().catch(() => null),
    ]);

    const shopUsers = (shopSnap?.docs ?? []).map((d) => ({
      id: d.id,
      source: "email" as const,
      ...d.data(),
    }));

    const tgUsers = (profileSnap?.docs ?? []).map((d) => ({
      id: d.id,
      source: "telegram" as const,
      ...d.data(),
    }));

    // Merge — deduplicate by email (a user who linked email + Telegram shows once)
    const emailSet = new Set(shopUsers.map((u) => (u as Record<string, unknown>).email as string).filter(Boolean));
    const dedupedTg = tgUsers.filter((u) => {
      const email = (u as Record<string, unknown>).email as string | undefined;
      return !email || !emailSet.has(email) || email.endsWith("@telegram.local");
    });

    const users = [...shopUsers, ...dedupedTg].sort((a, b) => {
      const aDate = String((a as Record<string, unknown>).createdAt ?? "");
      const bDate = String((b as Record<string, unknown>).createdAt ?? "");
      return bDate.localeCompare(aDate);
    });

    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json(
      { users: [], error: e instanceof Error ? e.message : String(e) }
    );
  }
}
