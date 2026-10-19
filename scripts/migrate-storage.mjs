/**
 * One-way migration: Firebase Cloud Storage → Cloudflare R2.
 *
 * Every product photo uploaded through the admin panel lives in the Firebase
 * bucket, which now answers 402 ("billing account ... disabled in state
 * closed") for every object. Firestore is untouched and still holds the URLs,
 * so once Firebase billing is restored this script can walk those URLs,
 * re-host the bytes on R2 and rewrite the documents.
 *
 * ORDER MATTERS: Firebase billing must be active while this runs. Downloads
 * fail with 402 otherwise and the script will tell you so and stop.
 *
 * What each photo goes through:
 *   download from Firebase → sharp (≤1200px, WebP q78) → PUT to R2 →
 *   new URL collected → Firestore document rewritten once all its photos are done
 *
 * Safe to re-run. A journal at scripts/.migration-log.json records every
 * source URL already migrated, so an interrupted run resumes where it stopped
 * and finished documents are not touched again.
 *
 *   node scripts/migrate-storage.mjs --dry           # report only, writes nothing
 *   node scripts/migrate-storage.mjs --limit 1       # migrate one product end-to-end
 *   node scripts/migrate-storage.mjs                 # the real run
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ── env ──────────────────────────────────────────────────────────────────────
for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const i = line.indexOf("=");
    if (i < 1 || line.trimStart().startsWith("#")) continue;
    const k = line.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = line.slice(i + 1).trim();
  }
}

const DRY = process.argv.includes("--dry");
const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i > -1 ? Number(process.argv[i + 1]) : Infinity;
})();

const need = [
  "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET", "NEXT_PUBLIC_R2_PUBLIC_URL",
  "FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY",
];
const missing = need.filter(k => !process.env[k]);
if (missing.length) {
  console.error("Не заданы переменные окружения:\n  " + missing.join("\n  "));
  console.error("\nR2_* берутся из Cloudflare, FIREBASE_* — из Vercel → Settings → Environment Variables.");
  process.exit(1);
}

const MAX_EDGE = 1200;
const QUALITY = 78;
const COLLECTION = "shop_products";
const LOG = "scripts/.migration-log.json";
const PUBLIC_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/+$/, "");

// ── clients ──────────────────────────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

// ── journal ──────────────────────────────────────────────────────────────────
/** @type {Record<string,string>} source Firebase URL → new R2 URL */
const done = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : {};
const saveLog = () => fs.writeFileSync(LOG, JSON.stringify(done, null, 1));

const isFirebaseUrl = u => typeof u === "string" && u.includes("firebasestorage.googleapis.com");

/** Download → compress → upload. Returns the new public URL. */
async function migrateOne(url, slug, index) {
  if (done[url]) return done[url];

  const res = await fetch(url);
  if (!res.ok) {
    const hint = res.status === 402
      ? " — биллинг Firebase выключен, включите его и запустите снова"
      : "";
    throw new Error(`скачивание вернуло HTTP ${res.status}${hint}`);
  }

  const original = Buffer.from(await res.arrayBuffer());
  const webp = await sharp(original)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  const key = `product-images/${slug}/${index}.webp`;
  if (!DRY) {
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: webp,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }));
  }

  const newUrl = `${PUBLIC_BASE}/${key.split("/").map(encodeURIComponent).join("/")}`;
  if (!DRY) { done[url] = newUrl; saveLog(); }

  stats.bytesIn += original.length;
  stats.bytesOut += webp.length;
  return newUrl;
}

// ── run ──────────────────────────────────────────────────────────────────────
const stats = { photos: 0, docs: 0, skipped: 0, failed: 0, bytesIn: 0, bytesOut: 0 };
const failures = [];

const snap = await db.collection(COLLECTION).get();
console.log(`Товаров в Firestore: ${snap.size}${DRY ? "   [ПРОБНЫЙ ЗАПУСК — ничего не пишется]" : ""}\n`);

let handled = 0;
for (const doc of snap.docs) {
  if (handled >= LIMIT) break;
  const data = doc.data();
  const slug = data.slug || doc.id;

  const main = isFirebaseUrl(data.image) ? data.image : null;
  const gallery = Array.isArray(data.images) ? data.images.filter(isFirebaseUrl) : [];
  if (!main && !gallery.length) { stats.skipped++; continue; }

  handled++;
  const label = (data.nameRu || data.name || slug).slice(0, 44);

  try {
    const update = {};
    let n = 0;

    if (main) {
      update.image = await migrateOne(main, slug, ++n);
      stats.photos++;
    }
    if (gallery.length) {
      const moved = [];
      for (const u of data.images) {
        moved.push(isFirebaseUrl(u) ? await migrateOne(u, slug, ++n) : u);
        if (isFirebaseUrl(u)) stats.photos++;
      }
      update.images = moved;
    }

    if (!DRY) await doc.ref.update(update);
    stats.docs++;
    console.log(`✓ ${label.padEnd(46)} ${String(n).padStart(2)} фото`);
  } catch (e) {
    stats.failed++;
    failures.push(`${label}: ${e.message}`);
    console.log(`✗ ${label.padEnd(46)} ${e.message}`);
    // A 402 means billing is off — every later download fails the same way.
    if (e.message.includes("402")) {
      console.error("\nОстановлено: Firebase отдаёт 402. Включите биллинг и запустите снова —\nуже перенесённое пропустится автоматически.");
      break;
    }
  }
}

const mb = n => (n / 1048576).toFixed(1);
console.log(`\n${DRY ? "[ПРОБНЫЙ ЗАПУСК] " : ""}товаров обновлено: ${stats.docs}, фото перенесено: ${stats.photos}`);
console.log(`без Firebase-фото: ${stats.skipped}, с ошибкой: ${stats.failed}`);
if (stats.bytesIn) {
  console.log(`объём: ${mb(stats.bytesIn)}MB → ${mb(stats.bytesOut)}MB  (-${(100 - stats.bytesOut / stats.bytesIn * 100).toFixed(1)}%)`);
}
if (failures.length) console.log("\nНе удалось:\n  " + failures.join("\n  "));
if (!DRY && stats.photos) console.log(`\nЖурнал: ${LOG} (повторный запуск пропустит перенесённое)`);
