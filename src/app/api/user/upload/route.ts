/**
 * User media upload (avatars, set images) — no admin token required.
 * Files stored under user-uploads/{userId}/{uuid}.{ext}
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminStorage } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId") as string | null;
    const files   = formData.getAll("files") as File[];

    if (!userId || !files.length) {
      return NextResponse.json({ error: "userId and files required" }, { status: 400 });
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
