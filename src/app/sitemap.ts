import type { MetadataRoute } from "next";
import { products } from "@/data/products";

const BASE_URL = "https://uhashop.uz";
const LOCALES = ["ru", "uz", "en"] as const;

// Static pages (path segments after the locale)
const STATIC_PAGES = [
  "",            // home
  "/marketplace",
  "/merch",
  "/academy",
  "/uha",
  "/cart",
  "/checkout",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      // "ru" is the default locale (localePrefix: "as-needed") — no prefix
      const localePath = locale === "ru" ? "" : `/${locale}`;
      const url = `${BASE_URL}${localePath}${page}`;
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
      });
    }
  }

  // Product pages for each locale
  for (const locale of LOCALES) {
    const localePath = locale === "ru" ? "" : `/${locale}`;
    for (const product of products) {
      entries.push({
        url: `${BASE_URL}${localePath}/product/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
