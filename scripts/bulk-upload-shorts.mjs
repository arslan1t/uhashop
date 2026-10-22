/**
 * Bulk product creator — shorts from local folders.
 *
 * Usage:
 *   ADMIN_PASSWORD="<admin password>" node scripts/bulk-upload-shorts.mjs
 *
 * Creates one product per image file: uploads the photo to Firebase Storage
 * via the admin API, then creates the product record.
 * Names are auto-numbered (e.g. "Eric Emanuel Shorts #1").
 * You can rename them in the admin panel once created.
 */

import { readFileSync, readdirSync } from "fs";
import { join, extname } from "path";

const BASE_URL = "https://frontend-designswipe.vercel.app";
const ADMIN_EMAIL = "admin@uhashop.uz";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

if (!ADMIN_PASSWORD) {
  console.error("Set ADMIN_PASSWORD env var, e.g.:\n  ADMIN_PASSWORD='...' node scripts/bulk-upload-shorts.mjs");
  process.exit(1);
}

// ── Login ────────────────────────────────────────────────────────────────────
console.log("Logging in...");
const loginRes = await fetch(`${BASE_URL}/api/admin/auth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});
const loginData = await loginRes.json();
if (!loginData.ok || !loginData.token) {
  console.error("Login failed:", loginData);
  process.exit(1);
}
const token = loginData.token;
console.log("✓ Authenticated\n");

// ── Folder definitions ───────────────────────────────────────────────────────
const FOLDERS = [
  {
    dir: "/Users/arslanshipulin/Downloads/Новая папка/Шорты Eric Emanuel Shorts ",
    brand: "Eric Emanuel",
    namePrefix: "Eric Emanuel Shorts",
    slugPrefix: "eric-emanuel-shorts",
  },
  {
    dir: "/Users/arslanshipulin/Downloads/Новая папка/Шорты Jordan Shorts ",
    brand: "Jordan",
    namePrefix: "Jordan Shorts",
    slugPrefix: "jordan-shorts",
  },
];

// Shared product defaults
const DEFAULTS = {
  category: "apparel",
  type: "preorder",
  status: "published",
  badge: "popular",
  style: "basketball",
  isFeatured: false,
  estimatedDelivery: "7–14 дней",
  price: 120,
  replicaPrice: 25,
  currency: "USD",
};

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
let created = 0;
let failed = 0;

for (const folder of FOLDERS) {
  let files;
  try {
    files = readdirSync(folder.dir)
      .filter(f => IMAGE_EXTS.has(extname(f).toLowerCase()))
      .sort();
  } catch {
    console.error(`Cannot read folder: ${folder.dir}`);
    continue;
  }

  console.log(`📂 ${folder.namePrefix} — ${files.length} images`);

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filepath = join(folder.dir, filename);
    const num = i + 1;
    const nameRu = `${folder.namePrefix} #${num}`;
    const slug = `${folder.slugPrefix}-${num}`;

    // ── Upload image ─────────────────────────────────────────────────────────
    let imageUrl;
    try {
      const buf = readFileSync(filepath);
      const blob = new Blob([buf], { type: "image/jpeg" });
      const fd = new FormData();
      fd.append("slug", slug);
      fd.append("category", DEFAULTS.category);
      fd.append("files", blob, filename);

      const uploadRes = await fetch(`${BASE_URL}/api/admin/upload`, {
        method: "POST",
        headers: { "x-admin-token": token },
        body: fd,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        throw new Error(`HTTP ${uploadRes.status}: ${err}`);
      }

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.paths?.[0];
      if (!imageUrl) throw new Error("No URL returned");
    } catch (e) {
      console.error(`  ✗ [${num}/${files.length}] Upload failed for ${filename}: ${e.message}`);
      failed++;
      continue;
    }

    // ── Create product ───────────────────────────────────────────────────────
    try {
      const product = {
        id: `custom-${slug}`,
        slug,
        name: nameRu,
        nameRu,
        brand: folder.brand,
        ...DEFAULTS,
        image: imageUrl,
        images: [imageUrl],
        descriptionRu: nameRu,
        descriptionUz: nameRu,
        sizes: [],
        tags: [folder.brand.toLowerCase(), "shorts", "apparel", "basketball"],
        sku: `UHA-${slug.toUpperCase().replace(/-/g, "").slice(0, 8)}`,
        isNew: false,
        inStock: undefined,
        replicaDelivery: "7–14 дней",
      };

      const productRes = await fetch(`${BASE_URL}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(product),
      });

      if (!productRes.ok) {
        const err = await productRes.text();
        throw new Error(`HTTP ${productRes.status}: ${err}`);
      }

      created++;
      console.log(`  ✓ [${num}/${files.length}] ${nameRu}`);
    } catch (e) {
      console.error(`  ✗ [${num}/${files.length}] Product creation failed: ${e.message}`);
      failed++;
    }
  }

  console.log();
}

console.log(`\n✅ Done: ${created} products created, ${failed} failed`);
if (failed > 0) {
  console.log("Re-run the script to retry failed items — the slug uniqueness check will skip already-created ones.");
}
