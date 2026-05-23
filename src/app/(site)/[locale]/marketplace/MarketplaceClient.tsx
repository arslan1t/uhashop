"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { getMarketplaceProducts } from "@/data/products";
import { useCustomProducts } from "@/store/customProducts";

const staticProducts = getMarketplaceProducts();

type VersionFilter = "all" | "original" | "replica";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const TG_URL = "https://t.me/hooper_manager";

export function MarketplaceClient() {
  const t = useTranslations("marketplace");
  const customProds = useCustomProducts(s => s.products);

  // Merge: custom products first (newest), then static catalog
  const allProducts = useMemo(
    () => [...customProds, ...staticProducts],
    [customProds]
  );
  const BRANDS = useMemo(() => [...new Set(allProducts.map(p => p.brand))].sort(), [allProducts]);
  const CATEGORIES = useMemo(() => [...new Set(allProducts.map(p => p.category))].filter(c => c !== "merch"), [allProducts]);

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("popular");
  const [version, setVersion] = useState<VersionFilter>("all");

  const hasActiveFilters = !!(search || brand || category || version !== "all");

  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.includes(q))
      );
    }
    if (brand) result = result.filter((p) => p.brand === brand);
    if (category) result = result.filter((p) => p.category === category);

    // Version filter: replica = only products that have replicaPrice
    if (version === "replica") result = result.filter((p) => !!p.replicaPrice);
    // original: show all (originals always exist)

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => {
          const aPrice = version === "replica" && a.replicaPrice ? a.replicaPrice : a.price;
          const bPrice = version === "replica" && b.replicaPrice ? b.replicaPrice : b.price;
          return aPrice - bPrice;
        });
        break;
      case "price_desc":
        result.sort((a, b) => {
          const aPrice = version === "replica" && a.replicaPrice ? a.replicaPrice : a.price;
          const bPrice = version === "replica" && b.replicaPrice ? b.replicaPrice : b.price;
          return bPrice - aPrice;
        });
        break;
      case "new":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [search, brand, category, sort, version]);

  const tgHintUrl = `${TG_URL}?text=${encodeURIComponent("Привет! Не нашёл нужный товар в каталоге, помогите с заказом.")}`;

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">
      {/* Header */}
      <div className="bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))]">
        <div className="container-uha py-12 md:py-16">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[rgb(var(--accent))]">
              Preorder Marketplace
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide text-[rgb(var(--foreground))] mb-3">
            {t("title")}
          </h1>
          <p className="text-[rgb(var(--muted))] text-lg max-w-2xl">
            {t("subtitle")}
          </p>

          {/* Preorder note + TG hint */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-start">
            <div className="inline-flex items-start gap-3 bg-[rgb(var(--accent)/0.08)] border border-[rgb(var(--accent)/0.2)] rounded-2xl px-5 py-3">
              <p className="text-sm text-[rgb(var(--foreground)/0.8)]">
                {t("preorder_note")}
              </p>
            </div>
            <a
              href={tgHintUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#2AABEE]/10 border border-[#2AABEE]/25 rounded-2xl text-sm text-[#2AABEE] font-medium hover:bg-[#2AABEE]/20 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              {t("subtitle_tg_hint")}
            </a>
          </div>
        </div>
      </div>

      <div className="container-uha py-8">
        {/* Filters */}
        <div className="mb-8">
          <FilterBar
            search={search}
            onSearch={setSearch}
            selectedBrand={brand}
            onBrand={setBrand}
            selectedCategory={category}
            onCategory={setCategory}
            sort={sort}
            onSort={setSort}
            brands={BRANDS}
            categories={CATEGORIES}
            version={version}
            onVersion={(v) => setVersion(v as VersionFilter)}
            onClear={() => {
              setSearch("");
              setBrand("");
              setCategory("");
              setVersion("all");
            }}
            hasActiveFilters={hasActiveFilters}
            total={filtered.length}
          />
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="text-5xl mb-5">🔍</div>
              <h3 className="font-semibold text-xl mb-2">{t("no_results")}</h3>
              <p className="text-[rgb(var(--muted))] mb-3 max-w-sm">
                {t("no_results_subtitle")}
              </p>
              <p className="text-sm text-[rgb(var(--muted))] mb-6 max-w-sm">
                {t("no_results_tg")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`${TG_URL}?text=${encodeURIComponent("Привет! Ищу товар: " + search)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2AABEE] text-white font-bold rounded-xl hover:bg-[#1a9ad7] transition-colors text-sm uppercase tracking-wide"
                >
                  <Send className="w-4 h-4" />
                  {t("no_results_tg_btn")}
                </a>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setSearch(""); setBrand(""); setCategory(""); setVersion("all"); }}
                    className="px-6 py-3 border border-[rgb(var(--border))] text-[rgb(var(--muted))] font-semibold rounded-xl hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground)/0.3)] transition-colors text-sm"
                  >
                    {t("clear_filters")}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${version}`}
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
            >
              {filtered.map((product) => (
                <motion.div key={product.id} variants={fadeUp} layout>
                  <ProductCard
                    product={product}
                    displayVersion={version === "all" ? undefined : version}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
