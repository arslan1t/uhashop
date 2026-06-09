import type { MetadataRoute } from "next";
import { products as staticProducts } from "@/data/products";

const BASE_URL = "https://uhashop.uz";
const LOCALES  = ["ru", "uz", "en"] as const;

// Static pages (path segments after the locale)
const STATIC_PAGES = [
  "",             // home
  "/marketplace",
  "/merch",
  "/academy",
  "/uha",
  "/cart",
  "/checkout",
];

/** Fetch all product slugs from Firestore via REST API (server-side). */
async function fetchFirestoreSlugs(): Promise<string[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return [];

  try {
    const url =
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/shop_products?pageSize=200`;
    const res = await fetch(url, {
      // Use no-store so the sitemap is always fresh when regenerated
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const docs: { fields?: { slug?: { stringValue?: string } } }[] =
      data.documents ?? [];

    return docs
      .map((d) => d.fields?.slug?.stringValue ?? "")
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      const localePath = locale === "ru" ? "" : `/${locale}`;
      entries.push({
        url:             `${BASE_URL}${localePath}${page}`,
        lastModified:    new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority:        page === "" ? 1 : 0.8,
      });
    }
  }

  // Static product slugs (always included)
  const staticSlugs = staticProducts.map((p) => p.slug);

  // Firestore product slugs (M-13 fix: include Firestore-only products)
  const firestoreSlugs = await fetchFirestoreSlugs();

  // Union — deduplicate so static products aren't listed twice
  const allSlugs = Array.from(new Set([...staticSlugs, ...firestoreSlugs]));

  for (const locale of LOCALES) {
    const localePath = locale === "ru" ? "" : `/${locale}`;
    for (const slug of allSlugs) {
      entries.push({
        url:             `${BASE_URL}${localePath}/product/${slug}`,
        lastModified:    new Date(),
        changeFrequency: "weekly",
        priority:        0.7,
      });
    }
  }

  return entries;
}
