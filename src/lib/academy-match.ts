/** Shared name/PIN normalization for matching academy accounts (PIN login,
 *  Telegram first-time linking) — collapses whitespace and Unicode so a
 *  stray space or accent composition still matches. Server-only. */
export function normalizeName(s: string): string {
  return s.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}
