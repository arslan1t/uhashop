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

  let featured;

  if (featuredOrder.length > 0) {
    // Admin saved a specific order — use it
    const staticById = Object.fromEntries(allStatic.map(p => [p.id, p]));
    const customById = Object.fromEntries(customProducts.map(p => [p.id, p]));
    featured = featuredOrder
      .map(id => staticById[id] ?? customById[id])
      .filter(Boolean)
      .slice(0, 5);
  } else {
    // No saved order — use defaults: custom featured + static featured
    const customFeatured = customProducts.filter(p => p.isFeatured);
    const staticFeatured = allStatic.filter(p => {
      const m = meta[p.id];
      return m?.isFeatured !== undefined ? m.isFeatured : p.isFeatured;
    });
    featured = [...customFeatured, ...staticFeatured].slice(0, 5);
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
