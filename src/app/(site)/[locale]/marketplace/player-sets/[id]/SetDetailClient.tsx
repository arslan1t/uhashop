"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft, Users, Package,
  ChevronLeft, ChevronRight,
  Maximize2, X, ShoppingBag,
  Instagram, Youtube, Link as LinkIcon, Send,
} from "lucide-react";
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
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

/* ─── Fullscreen lightbox ──────────────────────────────────────────── */
function Lightbox({
  photos, activeIdx, onClose, onNav,
}: {
  photos: string[];
  activeIdx: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onNav(Math.max(0, activeIdx - 1));
      if (e.key === "ArrowRight")  onNav(Math.min(photos.length - 1, activeIdx + 1));
    };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [activeIdx, onClose, onNav, photos.length]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        aria-label="Закрыть"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-[11px] font-mono tracking-[0.2em] select-none">
        {activeIdx + 1} / {photos.length}
      </div>

      {/* Image */}
      <div
        className="relative w-full h-full max-w-5xl mx-12"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={photos[activeIdx]}
          alt=""
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {/* Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onNav(Math.max(0, activeIdx - 1)); }}
            disabled={activeIdx === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onNav(Math.min(photos.length - 1, activeIdx + 1)); }}
            disabled={activeIdx === photos.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-20 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10"
          onClick={e => e.stopPropagation()}
        >
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => onNav(i)}
              className={`relative w-12 h-[60px] rounded overflow-hidden border transition-all ${
                i === activeIdx ? "border-white opacity-100" : "border-white/20 opacity-40 hover:opacity-70"
              }`}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="48px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────── */
export function SetDetailClient({ id }: { id: string }) {
  const sets       = usePlayerSets(s => s.sets);
  const setSets    = usePlayerSets(s => s.setSets);
  const customProds = useCustomProducts(s => s.products);
  const metaMap    = useProductMeta(s => s.meta);

  const [activeIdx,      setActiveIdx]      = useState(0);
  const [lightboxOpen,   setLightboxOpen]   = useState(false);
  const [fetchedCreator, setFetchedCreator] = useState<string | null>(null);
  const [syncing,        setSyncing]        = useState(true);

  // Sync the latest Firestore state so a direct URL visit always shows current data.
  useEffect(() => {
    fetch("/api/user/sets")
      .then(r => r.json())
      .then(({ sets: fresh }) => { if (Array.isArray(fresh)) setSets(fresh); })
      .catch(() => {})
      .finally(() => setSyncing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touchStartX = useRef<number | null>(null);

  const set = sets.find(s => s.id === id);

  // Fetch creator name from profile if not stored on the set
  useEffect(() => {
    if (!set?.createdBy || set.creatorName) return;
    fetch(`/api/user/profile?userId=${set.createdBy}`)
      .then(r => r.json())
      .then(({ profile }) => { if (profile?.name) setFetchedCreator(profile.name); })
      .catch(() => {});
  }, [set?.createdBy, set?.creatorName]);

  const photos = useMemo(() => {
    if (!set) return [];
    if (set.heroImages?.length) return set.heroImages;
    if (set.heroImage)          return [set.heroImage];
    return [];
  }, [set]);

  const activePhoto = photos[activeIdx] ?? null;

  const goTo = useCallback((i: number) => {
    if (i >= 0 && i < photos.length) setActiveIdx(i);
  }, [photos.length]);

  const allProducts: Product[] = useMemo(() => {
    const customIds   = new Set(customProds.map(p => p.id));
    const customSlugs = new Set(customProds.map(p => p.slug));
    const deletedIds  = new Set(
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
      .map(pid => allProducts.find(p => p.id === pid))
      .filter(Boolean) as Product[];
  }, [set, allProducts]);

  const totalOriginal = setProducts.reduce((sum, p) => sum + p.price, 0);
  const totalReplica  = setProducts.reduce((sum, p) => sum + (p.replicaPrice ?? p.price), 0);

  /* Loading skeleton while API syncs */
  if (syncing && !set) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))]">
        <div className="animate-pulse">
          <div className="w-full bg-[rgb(var(--surface))]" style={{ height: "clamp(420px, 78vh, 720px)" }} />
          <div className="container-uha pt-6 pb-5 space-y-4">
            <div className="h-4 w-24 bg-[rgb(var(--surface))] rounded" />
            <div className="h-8 w-64 bg-[rgb(var(--surface))] rounded" />
            <div className="h-4 w-32 bg-[rgb(var(--surface))] rounded" />
          </div>
        </div>
      </div>
    );
  }

  /* 404 state */
  if (!set) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🏀</div>
        <h1 className="text-xl font-bold">Сет не найден</h1>
        <Link
          href="/marketplace"
          className="text-[rgb(var(--accent))] text-sm hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Назад в маркетплейс
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen lightbox */}
      {lightboxOpen && activePhoto && (
        <Lightbox
          photos={photos}
          activeIdx={activeIdx}
          onClose={() => setLightboxOpen(false)}
          onNav={goTo}
        />
      )}

      <div className="bg-[rgb(var(--background))] min-h-screen">

        {/* ═══════════════════════════════════════════════════════════
            HERO GALLERY
            Desktop: [thumbnail rail 88px] + [hero flex-1]
            Mobile:  full-width swipe carousel
        ═══════════════════════════════════════════════════════════ */}
        <div className="relative">

          {/* Back nav */}
          <div className="absolute top-4 left-4 z-20">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-black/55 backdrop-blur-md border border-white/10 rounded-xl text-white text-xs font-semibold hover:bg-black/75 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Маркетплейс
            </Link>
          </div>

          {/* Gallery row */}
          <div className="flex">

            {/* ── Left thumbnail rail (md+) ───────────────────────── */}
            {photos.length > 1 && (
              <div className="hidden md:flex flex-col gap-1.5 p-2 bg-black/30 flex-shrink-0"
                style={{ width: 88 }}>
                {photos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    title={`Фото ${i + 1}`}
                    className={`relative w-full rounded-lg overflow-hidden transition-all duration-150 ${
                      i === activeIdx
                        ? "opacity-100 ring-2 ring-white ring-offset-0"
                        : "opacity-35 hover:opacity-65"
                    }`}
                    style={{ aspectRatio: "3/4" }}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="88px" />
                  </button>
                ))}
              </div>
            )}

            {/* ── Hero image ──────────────────────────────────────── */}
            <div
              className="relative flex-1 overflow-hidden group bg-[rgb(var(--surface))]"
              style={{ height: "clamp(420px, 78vh, 720px)" }}
              onClick={() => activePhoto && setLightboxOpen(true)}
              onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={e => {
                if (touchStartX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(dx) > 40) dx < 0 ? goTo(activeIdx + 1) : goTo(activeIdx - 1);
                touchStartX.current = null;
              }}
            >
              {activePhoto ? (
                <Image
                  key={activePhoto}
                  src={activePhoto}
                  alt={set.name}
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, calc(100vw - 88px)"
                  style={{ cursor: "zoom-in" }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent)/0.2)] via-[rgb(var(--surface))] to-[rgb(var(--background))]" />
              )}

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

              {/* Expand icon — appears on hover (desktop) */}
              {activePhoto && (
                <div className="absolute top-14 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Photo counter — bottom-right */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 right-4 text-white/55 text-[11px] font-mono tracking-[0.15em] select-none pointer-events-none">
                  {activeIdx + 1} / {photos.length}
                </div>
              )}

              {/* Arrow nav — bottom-left (desktop only) */}
              {photos.length > 1 && (
                <div className="hidden md:flex absolute bottom-4 left-4 gap-2 z-10">
                  <button
                    onClick={e => { e.stopPropagation(); goTo(activeIdx - 1); }}
                    disabled={activeIdx === 0}
                    className="w-9 h-9 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-20 hover:bg-black/80 transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); goTo(activeIdx + 1); }}
                    disabled={activeIdx === photos.length - 1}
                    className="w-9 h-9 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-20 hover:bg-black/80 transition-all active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile dots — bottom-center */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden pointer-events-none select-none">
                  {photos.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all ${
                        i === activeIdx ? "w-4 h-1 bg-white" : "w-1 h-1 bg-white/35"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile thumbnail strip ─────────────────────────── */}
          {photos.length > 1 && (
            <div className="flex md:hidden gap-2 px-4 py-3 overflow-x-auto bg-[rgb(var(--background))]"
              style={{ scrollbarWidth: "none" }}>
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeIdx ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                  }`}
                  style={{ width: 52, height: 68 }}
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="52px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SET INFO + CTA
        ═══════════════════════════════════════════════════════════ */}
        <div className="container-uha pt-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

            {/* Left: identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[rgb(var(--accent))]">
                  Сет игрока
                </span>
                {set.type && set.type !== "player" && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">
                    {set.type}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide mb-2 leading-tight">
                {set.name}
              </h1>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                {set.createdBy ? (
                  <Link
                    href={`/profile/${set.createdBy}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-sm font-semibold hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] transition-all"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {set.creatorName || fetchedCreator || "Игрок"}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-sm font-semibold text-[rgb(var(--muted))]">
                    <Users className="w-3.5 h-3.5" />
                    {set.creatorName || fetchedCreator || "UHA"}
                  </span>
                )}

                {set.socialLinks?.instagram && (
                  <a href={`https://instagram.com/${set.socialLinks.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] flex items-center justify-center hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] transition-all">
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                )}
                {set.socialLinks?.tiktok && (
                  <a href={`https://tiktok.com/${set.socialLinks.tiktok.replace("@", "@")}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] flex items-center justify-center hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] transition-all">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {set.socialLinks?.youtube && (
                  <a href={`https://youtube.com/@${set.socialLinks.youtube.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] flex items-center justify-center hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] transition-all">
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                )}
                {set.socialLinks?.telegram && (
                  <a href={`https://t.me/${set.socialLinks.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] flex items-center justify-center hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] transition-all">
                    <Send className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {set.description && (
                <p className="text-[rgb(var(--muted))] text-sm leading-relaxed max-w-xl">
                  {set.description}
                </p>
              )}
            </div>

            {/* Right: stats + CTA */}
            <div className="flex flex-col sm:items-end gap-3 flex-shrink-0 w-full sm:w-auto">
              {/* Item count */}
              <div className="flex items-center gap-1 text-[rgb(var(--muted))] text-xs">
                <Package className="w-3 h-3" />
                <span>Товаров: <strong className="text-[rgb(var(--foreground))]">{setProducts.length}</strong></span>
              </div>

              {/* Price table */}
              {totalOriginal > 0 && (
                <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl px-5 py-4 space-y-2.5 w-full sm:min-w-[220px] sm:w-auto">
                  {/* Original */}
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-xs text-[rgb(var(--muted))] uppercase tracking-wide">Оригинал</span>
                    <div className="text-right">
                      <div className="text-[11px] text-[rgb(var(--muted))] line-through">{formatPrice(totalOriginal)}</div>
                      <div className="text-base font-bold text-[rgb(var(--accent))]">{formatPrice(Math.round(totalOriginal * 0.9))}</div>
                    </div>
                  </div>
                  {/* Replica */}
                  {totalReplica < totalOriginal && (
                    <div className="flex items-center justify-between gap-6 border-t border-[rgb(var(--border))] pt-2.5">
                      <span className="text-xs text-[rgb(var(--muted))] uppercase tracking-wide">Реплика</span>
                      <div className="text-right">
                        <div className="text-[11px] text-[rgb(var(--muted))] line-through">{formatPrice(totalReplica)}</div>
                        <div className="text-base font-bold text-emerald-400">{formatPrice(Math.round(totalReplica * 0.9))}</div>
                      </div>
                    </div>
                  )}
                  <div className="text-[10px] text-[rgb(var(--muted))] text-right">скидка 10% на сет</div>
                </div>
              )}

              {/* Primary CTA */}
              {setProducts.length > 0 && (
                <a
                  href="#set-products"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white text-sm font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-[rgb(var(--accent)/0.2)] whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Купить сет
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgb(var(--border))]" />

        {/* ═══════════════════════════════════════════════════════════
            PRODUCTS GRID
        ═══════════════════════════════════════════════════════════ */}
        <div className="container-uha pt-8 pb-20" id="set-products">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[rgb(var(--muted))]">
              Товары в сете
            </h2>
            {setProducts.length > 0 && (
              <span className="text-[11px] font-bold text-[rgb(var(--muted))]">
                {setProducts.length} {setProducts.length === 1 ? "товар" : "товара"}
              </span>
            )}
          </div>

          {setProducts.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
            >
              {setProducts.map(product => (
                <motion.div key={product.id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-[rgb(var(--muted))]">
              <div className="text-4xl mb-3">📦</div>
              <p>Товары ещё не добавлены в этот сет</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
