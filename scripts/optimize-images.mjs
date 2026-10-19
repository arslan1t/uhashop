/**
 * One-off (re-runnable) optimizer for everything under public/images.
 *
 * Why this exists: next.config.ts sets `images.unoptimized = true` (the Vercel
 * optimizer was returning 402 on quota), so whatever sits in public/images is
 * what the browser downloads — byte for byte. Before this script that was 278MB
 * of 1100–4600px PNG/JPEG, including a 1254x1254 244KB logo rendered at 32x32.
 *
 * What it does, in place:
 *   - copies the untouched original to public/images-original/ (gitignored)
 *   - downscales to MAX_EDGE and re-encodes as WebP at QUALITY
 *   - keeps the ORIGINAL file extension so no import path or Firestore URL
 *     changes — a .png/.jpg whose bytes are WebP still renders everywhere,
 *     browsers sniff the content type, not the name
 *
 * Files already smaller than MIN_BYTES, and SVGs, are skipped.
 * Re-running is safe: the backup is only written the first time, and an
 * already-WebP file is left alone unless it is still over MAX_EDGE.
 *
 *   node scripts/optimize-images.mjs          # apply
 *   node scripts/optimize-images.mjs --dry    # report only, touch nothing
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SRC = "public/images";
const BACKUP = "public/images-original";
const MAX_EDGE = 1200;   // product grids never render wider than ~600 CSS px
const QUALITY = 78;      // visually lossless for photos at this scale
const MIN_BYTES = 40 * 1024; // below this the rewrite is not worth the churn
const EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const DRY = process.argv.includes("--dry");

/** Icons that are rendered tiny — capped far below MAX_EDGE. */
const SMALL_TARGETS = [
  { match: /branding\/logo-spinning\./, edge: 64 },  // rendered 32x32 on every card
  { match: /branding\/uha-icon\./, edge: 128 },
];

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function targetEdge(file) {
  return SMALL_TARGETS.find(t => t.match.test(file))?.edge ?? MAX_EDGE;
}

const stats = { done: 0, skipped: 0, failed: 0, before: 0, after: 0 };
const failures = [];

for await (const file of walk(SRC)) {
  const ext = path.extname(file).toLowerCase();

  if (path.basename(file) === ".DS_Store") {
    if (!DRY) await fs.rm(file, { force: true });
    continue;
  }
  if (!EXT.has(ext)) { stats.skipped++; continue; }

  const before = (await fs.stat(file)).size;
  if (before < MIN_BYTES) { stats.skipped++; continue; }

  try {
    const edge = targetEdge(file);
    const buf = await sharp(file)
      .rotate()                              // bake in EXIF orientation before stripping it
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    // Never make a file bigger than it already was.
    if (buf.length >= before) { stats.skipped++; continue; }

    stats.before += before;
    stats.after += buf.length;
    stats.done++;

    if (!DRY) {
      const backup = path.join(BACKUP, path.relative(SRC, file));
      // First run only — a second run must not overwrite the true original.
      try {
        await fs.access(backup);
      } catch {
        await fs.mkdir(path.dirname(backup), { recursive: true });
        await fs.copyFile(file, backup);
      }
      await fs.writeFile(file, buf);
    }

    const pct = (100 - (buf.length / before) * 100).toFixed(0);
    console.log(
      `${path.relative(SRC, file).padEnd(58).slice(0, 58)} ` +
      `${(before / 1024).toFixed(0).padStart(6)}KB → ${(buf.length / 1024).toFixed(0).padStart(5)}KB  -${pct}%`
    );
  } catch (err) {
    stats.failed++;
    failures.push(`${file}: ${err.message}`);
  }
}

const mb = n => (n / 1048576).toFixed(1);
console.log(`\n${DRY ? "[ПРОБНЫЙ ЗАПУСК] " : ""}сжато ${stats.done}, пропущено ${stats.skipped}, ошибок ${stats.failed}`);
console.log(`${mb(stats.before)}MB → ${mb(stats.after)}MB  (-${(100 - (stats.after / stats.before) * 100).toFixed(1)}%)`);
if (!DRY && stats.done) console.log(`Оригиналы: ${BACKUP}/`);
if (failures.length) console.log("\nНе удалось:\n" + failures.join("\n"));
