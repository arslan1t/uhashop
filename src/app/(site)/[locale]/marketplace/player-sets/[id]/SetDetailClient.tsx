"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Users, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePlayerSets } from "@/store/playerSets";
import { useCustomProducts } from "@/store/customProducts";
import { useProductMeta } from "@/store/productMeta";
import { ProductCard } from "@/components/ui/ProductCard";
import { getMarketplaceProducts } from "@/data/products";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

const staticProducts = getMarketplaceProducts();

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function SetDetailClient({ id }: { id: string }) {
  const sets = usePlayerSets(s => s.sets);
  const customProds = useCustomProducts(s => s.products);
  const metaMap = useProductMeta(s => s.meta);
  const [activeIdx, setActiveIdx] = useState(0);

  const set = sets.find(s => s.id === id);

  const photos = useMemo(() => {
    if (!set) return [];
    if (set.heroImages?.length) return set.heroImages;
    if (set.heroImage) return [set.heroImage];
    return [];
  }, [set]);

  const activePhoto = photos[activeIdx] ?? null;

  const allProducts: Product[] = useMemo(() => {
    const customIds = new Set(customProds.map(p => p.id));
    const customSlugs = new Set(customProds.map(p => p.slug));
    const deletedIds = new Set(
      Object.entries(metaMap).filter(([, m]) => m.isDeleted).map(([id]) => id)
    );
    return [
      ...customProds.filter(p => !deletedIds.has(p.id)),
      ...staticProducts.filter(p =>
        !customIds.has(p.id) && !customSlugs.has(p.slug) && !deletedIds.has(p.id)
      ),
    ];
  }, [customProds, metaMap]);

  const setProducts = useMemo(() => {
    if (!set) return [];
    return set.productIds
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean) as Product[];
  }, [set, allProducts]);

  const totalValue = setProducts.reduce((sum, p) => sum + p.price, 0);

  if (!set) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🏀</div>
        <h1 className="text-xl font-bold">Сет не найден</h1>
        <Link href="/marketplace" className="text-[rgb(var(--accent))] text-sm hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Назад в маркетплейс
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[280px] max-h-[480px] overflow-hidden bg-black">
        {activePhoto ? (
          <>
            {/* Blurred background fills letterbox space */}
            <Image src={activePhoto} alt="" fill className="object-cover scale-110 blur-2xl opacity-70 select-none" sizes="100vw" aria-hidden />
            {/* Full photo on top */}
            <Image src={activePhoto} alt={set.name} fill className="object-contain" priority sizes="100vw" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent)/0.3)] via-[rgb(var(--surface))] to-[rgb(var(--background))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--background))] via-black/30 to-transparent" />

        {/* Back nav */}
        <div className="absolute top-4 left-4 z-10">
          <Link href="/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm font-medium hover:bg-black/60 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Маркетплейс
          </Link>
        </div>

        {/* Photo nav arrows */}
        {photos.length > 1 && (
          <>
            <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-20 hover:bg-black/70 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveIdx(i => Math.min(photos.length - 1, i + 1))}
              disabled={activeIdx === photos.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white disabled:opacity-20 hover:bg-black/70 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setActiveIdx(i)}
                  className={`rounded-full transition-all ${i === activeIdx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="container-uha pb-16 -mt-12 relative z-10">
        {/* Set info card */}
        <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--accent))]">Сет игрока</span>
                {set.type && set.type !== "player" && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">
                    {set.type}
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wide mb-2">{set.name}</h1>
              <div className="flex items-center gap-2 text-[rgb(var(--muted))] text-sm mb-3">
                <Users className="w-4 h-4 flex-shrink-0" />
                {set.createdBy ? (
                  <Link href={`/profile/${set.createdBy}`}
                    className="hover:text-[rgb(var(--accent))] transition-colors underline-offset-2 hover:underline">
                    {set.creatorName || "Пользователь"}
                  </Link>
                ) : (
                  <span>{set.creatorName}</span>
                )}
              </div>
              {set.description && (
                <p className="text-[rgb(var(--muted))] text-sm leading-relaxed max-w-xl">{set.description}</p>
              )}
            </div>

            <div className="flex sm:flex-col gap-4 sm:gap-2 text-right flex-shrink-0">
              <div>
                <div className="flex items-center gap-1.5 text-[rgb(var(--muted))] text-xs mb-0.5">
                  <Package className="w-3 h-3" />
                  <span>Товаров</span>
                </div>
                <span className="text-xl font-bold">{setProducts.length}</span>
              </div>
              {totalValue > 0 && (
                <div>
                  <div className="text-[rgb(var(--muted))] text-xs mb-0.5">Итого</div>
                  <span className="text-xl font-bold text-[rgb(var(--accent))]">{formatPrice(totalValue)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail strip (if multiple photos) */}
        {photos.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {photos.map((url, i) => (
              <button key={i} onClick={() => setActiveIdx(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activeIdx ? "border-[rgb(var(--accent))]" : "border-transparent opacity-60 hover:opacity-90"
                }`}>
                <Image src={url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {setProducts.length > 0 ? (
          <>
            <h2 className="font-semibold text-lg mb-4">Товары в сете</h2>
            <motion.div
              variants={stagger} initial="hidden" animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {setProducts.map(product => (
                <motion.div key={product.id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <div className="text-center py-16 text-[rgb(var(--muted))]">
            <div className="text-4xl mb-3">📦</div>
            <p>Товары ещё не добавлены в этот сет</p>
          </div>
        )}
      </div>
    </div>
  );
}
