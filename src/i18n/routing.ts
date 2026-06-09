import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "uz", "en"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
  // Disable browser language detection — always serve Russian for unprefixed URLs.
  // Without this, phones with English system language get redirected to /en/...
  localeDetection: false,
});
