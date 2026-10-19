/**
 * Renames all "Eric Emanuel Shorts #N" products to "Шорты Eric Emanuel Shorts #N".
 *
 * Usage:
 *   ADMIN_PASSWORD="t-SXLP5DZq-8tuP5" node scripts/rename-eric-emanuel.mjs
 */

const BASE_URL = "https://frontend-designswipe.vercel.app";
const ADMIN_EMAIL = "admin@uhashop.uz";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

if (!ADMIN_PASSWORD) {
  console.error("Set ADMIN_PASSWORD env var");
  process.exit(1);
}

// ── Login ────────────────────────────────────────────────────────────────────
const loginRes = await fetch(`${BASE_URL}/api/admin/auth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});
const { ok, token } = await loginRes.json();
if (!ok || !token) { console.error("Login failed"); process.exit(1); }
console.log("✓ Authenticated\n");

// ── Fetch all products ───────────────────────────────────────────────────────
const listRes = await fetch(`${BASE_URL}/api/admin/products`, {
  headers: { "x-admin-token": token },
});
const { products } = await listRes.json();

const targets = products.filter(p =>
  typeof p.name === "string" && /^Eric Emanuel Shorts #\d+$/.test(p.name.trim())
);
console.log(`Found ${targets.length} products to rename\n`);

// ── Rename each ──────────────────────────────────────────────────────────────
let updated = 0, failed = 0;
for (const p of targets) {
  const newName = `Шорты ${p.name.trim()}`;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ id: p.id, name: newName, nameRu: newName }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`  ✓ ${p.name} → ${newName}`);
    updated++;
  } catch (e) {
    console.error(`  ✗ ${p.name}: ${e.message}`);
    failed++;
  }
}

console.log(`\n✅ Done: ${updated} renamed, ${failed} failed`);
