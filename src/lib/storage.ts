/**
 * Safe localStorage wrapper — works in SSR (Node.js 25+ has experimental localStorage)
 */
function isRealBrowserStorage(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const s = window.localStorage;
    if (!s || typeof s.getItem !== "function") return false;
    // Test that it actually works (Node.js mock may throw)
    const testKey = "__uha_test__";
    s.setItem(testKey, "1");
    s.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (!isRealBrowserStorage()) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (!isRealBrowserStorage()) return;
      window.localStorage.setItem(key, value);
    } catch {}
  },
  removeItem(key: string): void {
    try {
      if (!isRealBrowserStorage()) return;
      window.localStorage.removeItem(key);
    } catch {}
  },
};
