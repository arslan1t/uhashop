/**
 * User media upload (avatars, set images) → Cloudflare R2.
 *
 * Requires a valid user session token; files are always stored under the
 * AUTHENTICATED user's prefix (user-uploads/{userId}/…) — a client cannot write
 * to another user's folder by passing a different userId.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAuthUserId, unauthorizedUser } from "@/lib/user-auth";
import { uploadToR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    if (!userId) return unauthorizedUser();

    const formData = await req.formData();
    const files    = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "files required" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const key = `user-uploads/${userId}/${randomUUID()}.${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      urls.push(await uploadToR2(key, buf, file.type || "image/jpeg"));
    }

    return NextResponse.json({ paths: urls });
  } catch (e) {
    console.error("User upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
