/**
 * Product / media image upload — uses Firebase Admin Storage SDK.
 * Returns permanent Firebase Storage download URLs (token-based, no public ACL needed).
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminStorage } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const slug     = formData.get("slug") as string | null;
    const files    = formData.getAll("files") as File[];

    if (!slug || !files.length) {
      return NextResponse.json(
        { error: "slug and files are required" },
        { status: 400 }
      );
    }

    const storage = getAdminStorage();
    const bucket  = storage.bucket();
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file   = files[i];
      const ext    = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      // Generate a permanent download token — this works regardless of bucket
      // access policy (Uniform or Fine-grained) and without Firebase Storage rules changes.
      const downloadToken = randomUUID();
      // Unique filename per file (token-based) so uploads never overwrite each
      // other — important now that the client uploads one file per request.
      const path   = `product-images/${slug}/${downloadToken}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const fileRef = bucket.file(path);
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type || "image/jpeg",
          // Embedding token makes the file permanently accessible via Firebase URL
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      // Permanent Firebase Storage download URL (no expiry, no public ACL required)
      const encodedPath = encodeURIComponent(path);
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
      urls.push(url);
    }

    return NextResponse.json({ paths: urls });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
