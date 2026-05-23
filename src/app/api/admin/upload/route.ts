import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const slug     = formData.get("slug") as string;
    const category = formData.get("category") as string; // "shoes" | "apparel" | "merch"
    const files    = formData.getAll("files") as File[];

    if (!slug || !files.length) {
      return NextResponse.json({ error: "slug and files required" }, { status: 400 });
    }

    const folder = category === "apparel" || category === "merch" ? "apparel" : "shoes";
    const dir = path.join(process.cwd(), "public", "images", "products", folder, slug);

    // Create directory if it doesn't exist
    await mkdir(dir, { recursive: true });

    const saved: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${i + 1}.${ext}`;
      await writeFile(path.join(dir, filename), buffer);
      saved.push(`/images/products/${folder}/${slug}/${filename}`);
    }

    return NextResponse.json({ paths: saved });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
