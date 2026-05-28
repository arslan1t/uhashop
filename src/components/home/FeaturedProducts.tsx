"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getMarketplaceProducts } from "@/data/products";
import { useCustomProducts } from "@/store/customProducts";
import { useProductMeta } from "@/store/productMeta";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function FeaturedProducts() {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  const customProducts  = useCustomProducts(s => s.products);
  const meta            = useProductMeta(s => s.meta);
  const featuredOrder   = useProductMeta(s => s.featuredOrder);

  const allStatic = getMarketplaceProducts();

  // Build merged product pool (custom overrides static with same ID)
  const customIds = new Set(customProducts.map(p => p.id));
  const allProducts = [...customProducts, ...allStatic.filter(p => !customIds.has(p.id))];

  let featured;

  if (featuredOrder.length > 0) {
    // Admin saved a specific order — use it
    const byId = Object.fromEntries(allProducts.map(p => [p.id, p]));
    featured = featuredOrder.map(id => byId[id]).filter(Boolean).slice(0, 5);
  } else {
    // meta is single source of truth for isFeatured (synced via Firestore shop_meta)
    // Fallback to p.isFeatured if meta doesn't have an entry yet
    const deletedIds = new Set(Object.entries(meta).filter(([, m]) => m.isDeleted).map(([id]) => id));
    featured = allProducts
      .filter(p => {
        if (deletedIds.has(p.id)) return false;
        const m = meta[p.id];
        return m?.isFeatured !== undefined ? m.isFeatured : p.isFeatured;
      })
      .slice(0, 5);
  }

  return (
    <section className="py-20 md:py-28 bg-[rgb(var(--background))]">
      <div className="container-uha">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <SectionHeader
            label="Catalog"
            title={t("featured_title")}
            subtitle={t("featured_subtitle")}
          />
          <Link
            href="/marketplace"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--muted))] hover:text-[rgb(var(--accent))] transition-colors flex-shrink-0"
          >
            {tc("view_all")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
        >
          {featured.map((product, i) => (
            <motion.div key={product.id} variants={fadeUp}>
              <ProductCard product={product} priority={i < 2} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
