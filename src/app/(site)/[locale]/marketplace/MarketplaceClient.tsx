"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, Package, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ui/ProductCard";
import { FilterBar, type FilterState } from "@/components/ui/FilterBar";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { getMarketplaceProducts } from "@/data/products";
import { useCustomProducts } from "@/store/customProducts";
import { useProductMeta } from "@/store/productMeta";
import { usePlayerSets } from "@/store/playerSets";
import { useProductOrder } from "@/store/productOrder";
import { formatPrice } from "@/lib/utils";
import type { ProductCategory } from "@/types";

const staticProducts = getMarketplaceProducts();

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const TG_URL = "https://t.me/uha_manager";

export function MarketplaceClient() {
  const t = useTranslations("marketplace");
  const searchParams = useSearchParams();
  const customProds = useCustomProducts(s => s.products);
  const metaMap     = useProductMeta(s => s.meta);
  const playerSets  = usePlayerSets(s => s.sets);
  const getOrder    = useProductOrder(s => s.getOrder);

  const [showSets, setShowSets] = useState(false);

  // Read initial filters from URL params (e.g. ?category=shoes&style=basketball)
  const initCategory = searchParams?.get("category") ?? "";
  const initStyle = (searchParams?.get("style") ?? "") as "" | "basketball" | "lifestyle";

  // Normalize product name for fuzzy deduplication
  // "NikeG.T. Cut 3 Turbo EP College Navy Mystic Navy" → "nikegt3turboepcollegenavy..."
  const normName = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Custom products override static ones with same ID, slug, or similar name; hide deleted products
  const allProducts = useMemo(() => {
    const customIds   = new Set(customProds.map(p => p.id));
    const customSlugs = new Set(customProds.map(p => p.slug));
    const customNorms = customProds.map(p => normName(p.name));
    const deletedIds  = new Set(Object.entries(metaMap).filter(([, m]) => m.isDeleted).map(([id]) => id));

    // Deduplicate customProds itself by slug (keep last occurrence)
    const seenSlugs = new Set<string>();
    const dedupedCustom = [...customProds].reverse().filter(p => {
      if (seenSlugs.has(p.slug)) return false;
      seenSlugs.add(p.slug);
      return true;
    }).reverse();

    // Check if static product name is contained in (or contains) any Firestore product name
    const isNameDuplicate = (name: string) => {
      const norm = normName(name);
      return norm.length > 8 && customNorms.some(cn =>
        cn.length > 8 && (cn.includes(norm) || norm.includes(cn))
      );
    };

    const merged = [
      ...dedupedCustom.filter(p => !deletedIds.has(p.id)),
      ...staticProducts.filter(p =>
        !customIds.has(p.id) &&
        !customSlugs.has(p.slug) &&
        !isNameDuplicate(p.name) &&
        !deletedIds.has(p.id)
      ),
    ];
    // Apply isFeatured overrides from meta + normalize style:
    // every sneaker is either basketball (manually chosen) or lifestyle (the rest).
    return merged.map(p => ({
      ...p,
      isFeatured: metaMap[p.id]?.isFeatured ?? p.isFeatured,
      style: p.category === "shoes"
        ? (p.style === "basketball" ? "basketball" : "lifestyle")
        : p.style,
    }));
  }, [customProds, metaMap]);

  // Derived lists for filter options
  const BRANDS = useMemo(() => [...new Set(allProducts.map(p => p.brand))].sort(), [allProducts]);
  // Always show all standard categories regardless of product availability
  const STANDARD_CATEGORIES: ProductCategory[] = [
    "shoes", "apparel", "accessories", "backpacks", "jerseys", "thermals",
  ];
  const CATEGORIES = useMemo(() => {
    const fromProducts = new Set(allProducts.map(p => p.category));
    // Merge: standard order first, then any extra from products (excl. merch + removed socks)
    const extra = [...fromProducts].filter(c => c !== "merch" && c !== "socks" && !STANDARD_CATEGORIES.includes(c as ProductCategory));
    return [...STANDARD_CATEGORIES, ...extra] as ProductCategory[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts]);

  // All EU sizes across all products
  const ALL_SIZES = useMemo(() => {
    const sizes = new Set<string>();
    allProducts.forEach(p => {
      (p.sizes ?? []).forEach(s => {
        if ("eu" in s) sizes.add(String(s.eu));
      });
    });
    return [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [allProducts]);

  // Price range
  const PRICE_RANGE = useMemo((): [number, number] => {
    const prices = allProducts.map(p => p.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [allProducts]);

  // M-6 fix: use useMemo so defaultFilter is not recreated every render
  const defaultFilter = useMemo<FilterState>(() => ({
    search: "", brand: "",
    category: initCategory,
    style: initStyle,
    version: "all", stockType: "all",
    priceMin: PRICE_RANGE[0], priceMax: PRICE_RANGE[1],
    size: "", sort: "popular",
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [PRICE_RANGE[0], PRICE_RANGE[1]]);

  const [filters, setFilters] = useState<FilterState>(() => defaultFilter);

  const updateFilter = (patch: Partial<FilterState>) =>
    setFilters(f => ({ ...f, ...patch }));

  const clearFilters = () => setFilters(defaultFilter);

  const hasActiveFilters = !!(
    filters.search || filters.brand || filters.category || filters.style ||
    filters.version !== "all" || filters.stockType !== "all" ||
    filters.size ||
    filters.priceMin > PRICE_RANGE[0] || filters.priceMax < PRICE_RANGE[1]
  );

  const filtered = useMemo(() => {
    let result = [...allProducts];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.nameRu?.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags?.some(tag => tag.includes(q))
      );
    }

    // Brand, category, style
    if (filters.brand) result = result.filter(p => p.brand === filters.brand);
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.style) result = result.filter(p => p.style === filters.style);

    // Version
    if (filters.version === "replica") result = result.filter(p => !!p.replicaPrice);

    // Stock type
    if (filters.stockType === "preorder") result = result.filter(p => p.type === "preorder");
    if (filters.stockType === "instock") result = result.filter(p => p.type !== "preorder");

    // Price range
    result = result.filter(p => {
      const price = filters.version === "replica" && p.replicaPrice ? p.replicaPrice : p.price;
      return price >= filters.priceMin && price <= filters.priceMax;
    });

    // Size
    if (filters.size) {
      result = result.filter(p =>
        (p.sizes ?? []).some(s => "eu" in s && String(s.eu) === filters.size)
      );
    }

    // Sort
    switch (filters.sort) {
      case "price_asc":
        result.sort((a, b) => {
          const ap = filters.version === "replica" && a.replicaPrice ? a.replicaPrice : a.price;
          const bp = filters.version === "replica" && b.replicaPrice ? b.replicaPrice : b.price;
          return ap - bp;
        });
        break;
      case "price_desc":
        result.sort((a, b) => {
          const ap = filters.version === "replica" && a.replicaPrice ? a.replicaPrice : a.price;
          const bp = filters.version === "replica" && b.replicaPrice ? b.replicaPrice : b.price;
          return bp - ap;
        });
        break;
      case "new":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default: {
        // Use custom admin-defined order if available for the current category
        const categoryKey = filters.category || "all";
        const customOrder = getOrder(categoryKey);
        if (customOrder.length > 0) {
          const orderMap = new Map(customOrder.map((id, i) => [id, i]));
          result.sort((a, b) => {
            const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : Infinity;
            const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : Infinity;
            if (ai !== bi) return ai - bi;
            return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
          });
        } else {
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        }
      }
    }

    return result;
  }, [filters, allProducts]);

  const tgHintUrl = `${TG_URL}?text=${encodeURIComponent("Привет! Не нашёл нужный товар в каталоге, помогите с заказом.")}`;

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">
      {/* Header */}
      <div className="bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))]">
        <div className="container-uha py-12 md:py-16">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[rgb(var(--accent))]">
              Маркетплейс предзаказов
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide mb-3">
            {t("title")}
          </h1>
          <p className="text-[rgb(var(--muted))] text-lg max-w-2xl">{t("subtitle")}</p>

          <div className="mt-4 flex flex-col gap-3">
            <div className="inline-flex items-start gap-3 bg-[rgb(var(--accent)/0.08)] border border-[rgb(var(--accent)/0.2)] rounded-2xl px-5 py-3">
              <p className="text-sm text-[rgb(var(--foreground)/0.8)]">{t("preorder_note")}</p>
            </div>
            <a href={tgHintUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 bg-[#2AABEE]/10 border border-[#2AABEE]/25 rounded-2xl text-sm text-[#2AABEE] font-medium hover:bg-[#2AABEE]/20 transition-colors text-center">
              <Send className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{t("subtitle_tg_hint")}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="container-uha py-8">

        {/* ── Section label ── */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
            Всё для игры и стиля
          </span>
          <div className="h-px flex-1 bg-[rgb(var(--border))]" />
        </div>

        {/* ── Quick category chips ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: "Все товары",  value: "" },
            { label: "Кроссовки",   value: "shoes" },
            { label: "Одежда",      value: "apparel" },
            { label: "Мячи",        value: "accessories" },
            { label: "Рюкзаки",     value: "backpacks" },
            { label: "Джерси",      value: "jerseys" },
            { label: "Термо бельё", value: "thermals" },
          ].map(chip => {
            const active = !showSets && filters.category === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => { setShowSets(false); updateFilter({ category: chip.value }); }}
                className={`h-9 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  active
                    ? "bg-[rgb(var(--accent))] border-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent)/0.25)]"
                    : "bg-[rgb(var(--surface))] border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--accent)/0.4)]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}

          {/* Player Sets chip */}
          <button
            onClick={() => setShowSets(true)}
            className={`flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold border transition-all ${
              showSets
                ? "bg-[rgb(var(--accent))] border-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent)/0.25)]"
                : "bg-[rgb(var(--surface))] border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--accent)/0.4)]"
            }`}
          >
            <span>Сеты игроков</span>
            {playerSets.length > 0 && (
              <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                showSets ? "bg-white/20" : "bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent))]"
              }`}>
                {playerSets.length}
              </span>
            )}
          </button>
        </div>

        {/* Filters — hidden in sets view */}
        {!showSets && <div className="mb-8">
          <FilterBar
            state={filters}
            onChange={updateFilter}
            onClear={clearFilters}
            brands={BRANDS}
            categories={CATEGORIES}
            allSizes={ALL_SIZES}
            priceRange={PRICE_RANGE}
            total={filtered.length}
          />
        </div>}

        {/* ── Player Sets Grid ── */}
        {showSets && (
          <div>
            {playerSets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-5">🏆</div>
                <h3 className="font-semibold text-xl mb-2">Сеты пока не добавлены</h3>
                <p className="text-[rgb(var(--muted))] max-w-sm text-sm">
                  Скоро здесь появятся кураторские подборки от игроков и атлетов команды.
                </p>
              </div>
            ) : (
              <motion.div
                variants={stagger} initial="hidden" animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...playerSets]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map(s => (
                      <motion.div key={s.id} variants={fadeUp}>
                        <Link href={`/marketplace/player-sets/${s.id}`}
                          className="group block bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] rounded-2xl overflow-hidden product-card-hover">
                          {/* Hero image */}
                          <div className="relative aspect-[16/9] overflow-hidden bg-[rgb(var(--surface-2))]">
                            {s.heroImage ? (
                              <Image src={s.heroImage} alt={s.name} fill className="object-cover transition-transform duration-500 [@media(hover:hover)]:group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent)/0.2)] to-[rgb(var(--surface))] flex items-center justify-center text-5xl">
                                🏀
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            {s.type && s.type !== "player" && (
                              <span className="absolute top-3 left-3 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
                                {s.type}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <div className="flex items-center gap-1.5 text-[rgb(var(--muted))] text-xs mb-1.5">
                              <Users className="w-3 h-3" />
                              <span>{s.creatorName}</span>
                            </div>
                            <h3 className="font-semibold text-base mb-1 [@media(hover:hover)]:group-hover:text-[rgb(var(--accent))] transition-colors">
                              {s.name}
                            </h3>
                            {s.description && (
                              <p className="text-[rgb(var(--muted))] text-xs line-clamp-2 mb-3">
                                {s.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[rgb(var(--muted))] text-xs">
                                <Package className="w-3 h-3" />
                                <span>{s.productIds.length} товар{s.productIds.length !== 1 ? "а" : ""}</span>
                              </div>
                              <span className="text-[rgb(var(--accent))] text-xs font-semibold flex items-center gap-1">
                                Смотреть <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                  ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Grid */}
        {!showSets && <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-5">🔍</div>
              <h3 className="font-semibold text-xl mb-2">{t("no_results")}</h3>
              <p className="text-[rgb(var(--muted))] mb-3 max-w-sm">{t("no_results_subtitle")}</p>
              <p className="text-sm text-[rgb(var(--muted))] mb-6 max-w-sm">{t("no_results_tg")}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={`${TG_URL}?text=${encodeURIComponent("Привет! Ищу: " + filters.search)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2AABEE] text-white font-bold rounded-xl hover:bg-[#1a9ad7] transition-colors text-sm uppercase tracking-wide">
                  <Send className="w-4 h-4" /> {t("no_results_tg_btn")}
                </a>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="px-6 py-3 border border-[rgb(var(--border))] text-[rgb(var(--muted))] font-semibold rounded-xl hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground)/0.3)] transition-colors text-sm">
                    {t("clear_filters")}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key={`grid-${filters.version}`}
              variants={stagger} initial="hidden" animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {filtered.map(product => (
                <motion.div key={product.id} variants={fadeUp} layout>
                  <ProductCard product={product}
                    displayVersion={filters.version === "all" ? undefined : filters.version} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>}
      </div>
    </div>
  );
}
