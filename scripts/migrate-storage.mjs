/**
 * One-way migration: Firebase Cloud Storage → Cloudflare R2.
 *
 * Every photo uploaded through the admin panel or by a user lives in the
 * Firebase bucket, which answers 402 ("billing account ... disabled in state
 * closed") for every *download*. Listing still works, which is how we know the
 * 779 objects (150MB) are intact — but the bytes cannot be read until billing
 * is restored. Firestore is unaffected and still holds every URL.
 *
 * ORDER MATTERS: restore Firebase billing (Blaze) before running this.
 * Downloads fail with 402 otherwise and the script stops rather than writing
 * half-migrated documents.
 *
 * Covers EVERY collection, not just the catalogue — an audit found Storage
 * URLs in seven of them, and shop_overrides (the admin's main-image picks,
 * which ProductCard prefers over product.image) holds more of them than
 * shop_products does. Each document is walked recursively, so a URL nested in
 * an array or a sub-object is migrated too; non-plain Firestore values
 * (Timestamp, GeoPoint, DocumentReference) are passed through untouched.
 *
 * Each photo: download via the Admin SDK (no public token needed) → sharp to
 * ≤1200px WebP → PUT to R2 → URL swapped in the document.
 *
 * Safe to re-run. scripts/.migration-log.json maps every source URL to its R2
 * replacement, so an interrupted run resumes and finished documents are left
 * alone.
 *
 *   node scripts/migrate-storage.mjs --dry      # report only, writes nothing
 *   node scripts/migrate-storage.mjs --limit 1  # one document, end to end
 *   node scripts/migrate-storage.mjs            # the real run
 */
import fs from "node:fs";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// ── env ──────────────────────────────────────────────────────────────────────
for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const i = line.indexOf("=");
    if (i < 1 || line.trimStart().startsWith("#")) continue;
    const k = line.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = line.slice(i + 1).trim().replace(/^"|"$/g, "");
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
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
];
const missing = need.filter(k => !process.env[k]);
if (missing.length) {
  console.error("Не заданы переменные окружения:\n  " + missing.join("\n  "));
  process.exit(1);
}

const MAX_EDGE = 1200;
const QUALITY = 78;
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
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
const bucket = getStorage().bucket();

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
const done = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : {};
const saveLog = () => fs.writeFileSync(LOG, JSON.stringify(done, null, 1));

const FB_RE = /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?]+)/;
const isFirebaseUrl = v => typeof v === "string" && FB_RE.test(v);

/** Storage object path encoded inside a Firebase download URL. */
const pathFromUrl = url => decodeURIComponent(url.match(FB_RE)[1]);

const stats = { photos: 0, docs: 0, bytesIn: 0, bytesOut: 0, failed: 0 };
const failures = [];
let billingStopped = false;

/** Download → compress → upload. Returns the new public URL. */
async function migrateUrl(url) {
  if (done[url]) return done[url];

  const srcPath = pathFromUrl(url);
  let original;
  try {
    [original] = await bucket.file(srcPath).download();
  } catch (e) {
    if (/billing account/i.test(e.message)) billingStopped = true;
    throw e;
  }

  const webp = await sharp(original)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  // Keep the Storage layout so paths stay recognisable, swap the extension.
  const key = srcPath.replace(/\.[^./]+$/, "") + ".webp";

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
  stats.photos++;
  return newUrl;
}

/**
 * Recursively copy a value, replacing Firebase URLs. Only plain objects and
 * arrays are walked — Timestamp, GeoPoint and DocumentReference are returned
 * as-is so Firestore types survive the round trip.
 */
async function transform(value) {
  if (isFirebaseUrl(value)) return { changed: true, value: await migrateUrl(value) };
  if (Array.isArray(value)) {
    let changed = false;
    const out = [];
    for (const item of value) {
      const r = await transform(item);
      changed ||= r.changed;
      out.push(r.value);
    }
    return { changed, value: out };
  }
  if (value && value.constructor === Object) {
    let changed = false;
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const r = await transform(v);
      changed ||= r.changed;
      out[k] = r.value;
    }
    return { changed, value: out };
  }
  return { changed: false, value };
}

// ── run ──────────────────────────────────────────────────────────────────────
const collections = await db.listCollections();
console.log(`Коллекций: ${collections.length}${DRY ? "   [ПРОБНЫЙ ЗАПУСК — ничего не пишется]" : ""}\n`);

let handled = 0;
outer:
for (const col of collections) {
  const snap = await col.get();
  let colDocs = 0;

  for (const doc of snap.docs) {
    if (handled >= LIMIT) break outer;
    const data = doc.data();
    if (!JSON.stringify(data).includes("firebasestorage.googleapis.com")) continue;

    handled++;
    try {
      const { changed, value } = await transform(data);
      if (changed && !DRY) await doc.ref.set(value);
      if (changed) { stats.docs++; colDocs++; }
    } catch (e) {
      stats.failed++;
      failures.push(`${col.id}/${doc.id}: ${e.message.slice(0, 120)}`);
      if (billingStopped) {
        console.error("\n⛔ Firebase отдаёт 402 — биллинг выключен.");
        console.error("   Включите Blaze и запустите снова: перенесённое пропустится.");
        break outer;
      }
    }
  }
  if (colDocs) console.log(`  ${col.id.padEnd(26)} документов обновлено: ${colDocs}`);
}

const mb = n => (n / 1048576).toFixed(1);
console.log(`\n${DRY ? "[ПРОБНЫЙ ЗАПУСК] " : ""}документов: ${stats.docs}, фото перенесено: ${stats.photos}, ошибок: ${stats.failed}`);
if (stats.bytesIn) {
  console.log(`объём: ${mb(stats.bytesIn)}MB → ${mb(stats.bytesOut)}MB  (-${(100 - stats.bytesOut / stats.bytesIn * 100).toFixed(1)}%)`);
}
if (failures.length) console.log("\nНе удалось:\n  " + failures.slice(0, 10).join("\n  "));
if (!DRY && stats.photos) console.log(`\nЖурнал: ${LOG}`);
