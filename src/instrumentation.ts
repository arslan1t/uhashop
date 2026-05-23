/**
 * Next.js instrumentation hook — runs before anything else on the server.
 * Node.js 22+ has an experimental localStorage that is NOT a Web Storage API
 * (it exists but lacks getItem/setItem), which breaks next-themes and other libs.
 * We nullify it here so those libs fall back to their SSR-safe code paths.
 */
export async function register() {
  if (
    typeof globalThis.localStorage !== "undefined" &&
    typeof (globalThis.localStorage as Storage).getItem !== "function"
  ) {
    // Nullify the broken Node.js experimental localStorage
    Object.defineProperty(globalThis, "localStorage", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  }
  if (
    typeof globalThis.sessionStorage !== "undefined" &&
    typeof (globalThis.sessionStorage as Storage).getItem !== "function"
  ) {
    Object.defineProperty(globalThis, "sessionStorage", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  }
}
