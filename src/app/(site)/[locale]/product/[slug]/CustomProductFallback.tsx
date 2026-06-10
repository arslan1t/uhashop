"use client";

import { useCustomProducts } from "@/store/customProducts";
import { useProductMeta } from "@/store/productMeta";
import { ProductDetailClient } from "./ProductDetailClient";

export function CustomProductFallback({ slug }: { slug: string }) {
  const products  = useCustomProducts(s => s.products);
  const hydrated  = useCustomProducts(s => s._hydrated);
  const meta      = useProductMeta(s => s.meta);

  // Normalize slug: decode %20 → space, trim
  const normalized = decodeURIComponent(slug).trim();

  // Still waiting for localStorage to load
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Case-insensitive slug match, skip deleted products.
  // If duplicates share a slug (from repeated re-adds), prefer the most
  // complete one — the copy with the most images — so the visitor never
  // lands on an empty/single-photo duplicate.
  const matches = products.filter(
    p => p.slug.toLowerCase() === normalized.toLowerCase() && !meta[p.id]?.isDeleted
  );
  const product = matches
    .slice()
    .sort((a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0))[0];

  if (product) {
    return <ProductDetailClient product={product} />;
  }

  // Genuinely not found or deleted
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="text-6xl">🔍</div>
      <h1 className="font-display text-3xl">Товар не найден</h1>
      <p className="text-[rgb(var(--muted))]">
        Возможно, он был удалён или ссылка устарела.
      </p>
      <a href="/marketplace"
        className="mt-4 px-6 py-3 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm uppercase tracking-widest">
        В маркетплейс
      </a>
    </div>
  );
}
