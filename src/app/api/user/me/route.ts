/**
 * GET /api/user/me — returns the authenticated user's profile.
 * Used by the Telegram deep-link flow: the profile page receives ?t={token}
 * in the URL, calls this endpoint to verify the token and load the profile
 * without requiring the user to go through a second login step.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthUserId, unauthorizedUser } from "@/lib/user-auth";

export async function GET(req: NextRequest) {
  const userId = getAuthUserId(req);
  if (!userId) return unauthorizedUser();

  try {
    const db = getAdminDb();
    const doc = await db.collection("user_profiles").doc(userId).get();

    const data = doc.exists ? doc.data()! : {};
    const profile = {
      id: userId,
      name: data.name ?? "",
      email: data.email ?? `${userId}@telegram.local`,
      avatar: data.avatar ?? null,
      telegram: data.telegram ?? null,
      bio: data.bio ?? null,
      socialLinks: data.socialLinks ?? null,
      createdAt: data.createdAt ?? new Date().toISOString(),
    };
    return NextResponse.json({ profile });
  } catch (e) {
    console.error("[/api/user/me]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
