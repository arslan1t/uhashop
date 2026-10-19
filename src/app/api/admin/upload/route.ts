/**
 * Product / media image upload → Cloudflare R2.
 *
 * Was Firebase Cloud Storage until that bucket started returning 402
 * ("billing account ... disabled in state closed"), which killed every
 * uploaded photo on the site at once. R2 has no such cliff: 10GB free and
 * zero egress charges.
 *
 * Returns permanent public URLs — the bucket is served through its public
 * development URL / custom domain, so no signing or token is needed on read.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { uploadToR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorizedResponse();

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

    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      // Unique name per file so concurrent uploads never overwrite each other
      // — the client uploads one file per request.
      const key = `product-images/${slug}/${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      urls.push(await uploadToR2(key, buffer, file.type || "image/jpeg"));
    }

    return NextResponse.json({ paths: urls });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
