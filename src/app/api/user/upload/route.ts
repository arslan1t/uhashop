/**
 * User media upload (avatars, set images). Requires a valid user session token;
 * files are always stored under the AUTHENTICATED user's path
 * (user-uploads/{userId}/{uuid}.{ext}) — a client cannot write to another
 * user's folder by passing a different userId.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminStorage } from "@/lib/firebase/admin";
import { getAuthUserId, unauthorizedUser } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    if (!userId) return unauthorizedUser();

    const formData = await req.formData();
    const files   = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "files required" }, { status: 400 });
    }

    const storage = getAdminStorage();
    const bucket  = storage.bucket();
    const urls: string[] = [];

    for (const file of files) {
      const ext   = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const token = randomUUID();
      const path  = `user-uploads/${userId}/${token}.${ext}`;
      const buf   = Buffer.from(await file.arrayBuffer());

      await bucket.file(path).save(buf, {
        metadata: {
          contentType: file.type || "image/jpeg",
          metadata: { firebaseStorageDownloadTokens: token },
        },
      });

      const encoded = encodeURIComponent(path);
      urls.push(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${token}`);
    }

    return NextResponse.json({ paths: urls });
  } catch (e) {
    console.error("User upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
