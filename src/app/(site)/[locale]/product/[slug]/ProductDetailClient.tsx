"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, ChevronRight, Clock, Package, Shield, Check,
  ZoomIn, ChevronLeft, ChevronRight as ChevronRightIcon, X, Heart, Send
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/ui/ProductCard";
import { useCartStore } from "@/store/cart";
import { useProductOverrides } from "@/store/productOverrides";
import { useWishlist } from "@/store/wishlist";
import { getRelatedProducts } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductSize, ApparelSize, ProductVersion } from "@/types";

interface Props { product: Product }

export function ProductDetailClient({ product }: Props) {
  const t = useTranslations("product");
  const { addItem } = useCartStore();
  const { has: isLiked, toggle: toggleLike } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [version, setVersion] = useState<ProductVersion>("original");
  const [activeImg, setActiveImg] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const liked = isLiked(product.slug);
  const handleLike = () => {
    toggleLike(product.slug);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
  };

  const related = getRelatedProducts(product, 4);
  const isShoes = product.category === "shoes";
  // Subscribe to overrides object directly — triggers re-render when admin saves changes
  const overrides = useProductOverrides(s => s.overrides);
  const productOverride = overrides[product.slug];

  // Valid URL = not a blob (session-only), not empty
  const isValidImg = (url?: string) =>
    !!url && !url.startsWith("blob:") && url.trim() !== "";

  // Build gallery — filter out stale blob URLs from overrides
  const defaultGallery = [...new Set([product.image, ...product.images])].filter(isValidImg);
  const overrideOrder = (productOverride?.imageOrder ?? []).filter(isValidImg);
  const gallery = overrideOrder.length > 0 ? overrideOrder : defaultGallery;

  // Put admin-chosen main image first (only if it's a real URL)
  const adminMain = isValidImg(productOverride?.mainImage)
    ? productOverride!.mainImage!
    : gallery[0] ?? product.image;
  const sortedGallery = adminMain && adminMain !== gallery[0]
    ? [adminMain, ...gallery.filter(s => s !== adminMain)]
    : gallery;

  const activePrice = version === "replica" && product.replicaPrice
    ? product.replicaPrice
    : product.price;
  const activeDelivery = version === "replica" && product.replicaDelivery
    ? product.replicaDelivery
    : product.estimatedDelivery ?? "7–14 дней";

  const prev = () => setActiveImg((i) => (i - 1 + sortedGallery.length) % sortedGallery.length);
  const next = () => setActiveImg((i) => (i + 1) % sortedGallery.length);

  const handleAdd = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    addItem(product, selectedSize, version);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">

      {/* Breadcrumb */}
      <div className="container-uha py-4">
        <nav className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted))]">
          <Link href="/" className="hover:text-[rgb(var(--foreground))] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={product.category === "merch" ? "/merch" : "/marketplace"}
            className="hover:text-[rgb(var(--foreground))] transition-colors">
            {product.category === "merch" ? "Merch" : "Marketplace"}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[rgb(var(--foreground))] truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="container-uha pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── Gallery ── */}
          <div className="space-y-3">
            {/* Main viewer */}
            <div
              className="relative aspect-square rounded-3xl overflow-hidden bg-[rgb(var(--surface))] border border-[rgb(var(--border))] cursor-zoom-in group"
              onClick={() => setLightbox(true)}>
              <AnimatePresence mode="wait">
                <motion.div key={activeImg}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0">
                  <Image
                    src={sortedGallery[activeImg] ?? product.image}
                    alt={`${product.name} — view ${activeImg + 1}`}
                    fill priority={activeImg === 0}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Rotating real UHA logo */}
              <div className="absolute bottom-4 right-4 z-10 w-10 h-10 animate-spin-slow"
                style={{ filter: "drop-shadow(0 0 6px rgba(153,27,27,0.55)) drop-shadow(0 0 14px rgba(153,27,27,0.25))" }}>
                <Image src="/images/branding/logo-spinning.png" alt="UHA"
                  fill className="object-contain" sizes="40px" />
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.badge && <Badge variant={product.badge} size="md" />}
                {product.type === "preorder" && <Badge variant="preorder" size="md" />}
              </div>

              {/* Zoom hint */}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-medium">Увеличить</span>
                </div>
              </div>

              {/* Prev/Next arrows */}
              {sortedGallery.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-black/75 transition-colors z-10">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-14 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-black/75 transition-colors z-10">
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Counter */}
              {sortedGallery.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-xs font-medium z-10">
                  {activeImg + 1} / {sortedGallery.length}
                </div>
              )}
            </div>

            {/* Thumbnails row */}
            {sortedGallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sortedGallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImg
                        ? "border-[rgb(var(--accent))] shadow-[0_0_12px_rgb(var(--accent)/0.3)]"
                        : "border-[rgb(var(--border))] opacity-60 hover:opacity-100 hover:border-[rgb(var(--muted))]"
                    }`}>
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ── */}
          <div className="space-y-6">
            {/* Brand + type */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--accent))]">
                {product.brand}
              </span>
              {product.type === "preorder"
                ? <Badge variant="preorder" />
                : <Badge variant="in_stock" />}
            </div>

            {/* Title */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide leading-tight mb-2">
                {product.nameRu}
              </h1>
              <p className="text-xs text-[rgb(var(--muted))] uppercase tracking-widest">
                SKU: {product.sku}
              </p>
            </div>

            {/* ── Replica / Original toggle ── */}
            {product.replicaPrice && product.replicaPrice !== product.price && (
              <div className="p-1 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl flex gap-1">
                {(["original", "replica"] as ProductVersion[]).map((v) => {
                  const active = version === v;
                  const price = v === "original" ? product.price : product.replicaPrice!;
                  const delivery = v === "original"
                    ? product.estimatedDelivery
                    : product.replicaDelivery;
                  return (
                    <button key={v} onClick={() => setVersion(v)}
                      className={`flex-1 flex flex-col items-center py-3.5 px-4 rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-[rgb(var(--foreground))] text-[rgb(var(--background))]"
                          : "text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                      }`}>
                      <span className="text-xs font-bold uppercase tracking-widest mb-1">
                        {v === "original" ? "Original" : "Replica"}
                      </span>
                      <span className="text-xl font-bold">
                        {formatPrice(price)}
                      </span>
                      <span className="text-[10px] mt-1 opacity-60">
                        {delivery ?? "7–14 дней"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active price */}
            <div className="flex items-baseline gap-3">
              <motion.span key={`${activePrice}-${version}`}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="font-display text-3xl md:text-4xl lg:text-5xl">
                {formatPrice(activePrice)}
              </motion.span>
              {version === "replica" && product.replicaPrice && (
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                  -{Math.round((1 - product.replicaPrice / product.price) * 100)}% vs Original
                </span>
              )}
            </div>

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {t("select_size")}
                </span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-[rgb(var(--accent))] hover:underline">
                  {t("size_guide")}
                </button>
              </div>
              {sizeError && (
                <p className="text-xs text-red-400 mb-2">{t("size_required")}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const label = isShoes
                    ? `EU ${(s as ProductSize).eu}`
                    : (s as ApparelSize).label;
                  const avail = s.available;
                  const active = selectedSize === label;
                  return (
                    <button key={label} disabled={!avail}
                      onClick={() => { if (avail) { setSelectedSize(label); setSizeError(false); } }}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        active
                          ? "bg-[rgb(var(--accent))] border-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent)/0.2)]"
                          : avail
                          ? "border-[rgb(var(--border))] hover:border-[rgb(var(--accent)/0.5)]"
                          : "border-[rgb(var(--border)/0.3)] text-[rgb(var(--muted)/0.3)] line-through cursor-not-allowed"
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to cart + Like */}
            <div className="flex gap-3">
              <button onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all ${
                  added
                    ? "bg-emerald-500 text-white"
                    : "bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))] shadow-xl shadow-[rgb(var(--accent)/0.25)]"
                }`}>
                {added
                  ? <><Check className="w-4 h-4" /> Добавлено</>
                  : <><ShoppingBag className="w-4 h-4" /> {t("add_to_cart")}</>}
              </button>

              {/* Like / Wishlist button */}
              <button
                onClick={handleLike}
                className={`w-14 rounded-2xl flex items-center justify-center transition-all border-2 ${
                  liked
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-[rgb(var(--border))] hover:border-red-500/40 hover:bg-red-500/5"
                }`}
                title={liked ? "Убрать из избранного" : "Добавить в избранное"}
              >
                <motion.div
                  animate={likeAnim ? { scale: [1, 1.6, 0.85, 1.1, 1] } : {}}
                  transition={{ duration: 0.45 }}
                >
                  <Heart
                    className="w-5 h-5 transition-colors"
                    style={{ color: liked ? "#ef4444" : "rgb(var(--muted))" }}
                    fill={liked ? "#ef4444" : "none"}
                  />
                </motion.div>
              </button>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Clock,   label: t("delivery"),       value: activeDelivery },
                { icon: Package, label: version === "replica" ? "Replica" : "Original", value: version === "replica" ? "Реплика" : "Оригинал" },
                { icon: Shield,  label: "Гарантия",          value: "Фото при отправке" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}
                  className="flex flex-col items-center gap-1 p-2.5 sm:p-3.5 bg-[rgb(var(--surface))] rounded-2xl border border-[rgb(var(--border))] text-center">
                  <Icon className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <div className="text-[10px] sm:text-xs font-semibold leading-tight">{label}</div>
                  <div className="text-[9px] sm:text-[10px] text-[rgb(var(--muted))] leading-tight">{value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="p-5 bg-[rgb(var(--surface))] rounded-2xl border border-[rgb(var(--border))]">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
                {t("description")}
              </h3>
              <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                {product.descriptionRu}
              </p>
            </div>

            {/* Telegram — ask for another colorway */}
            <a
              href={`https://t.me/uha_manager?text=${encodeURIComponent(`Привет! Хочу уточнить наличие другой расцветки: ${product.nameRu}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-[#2AABEE]/8 border border-[#2AABEE]/20 rounded-2xl hover:bg-[#2AABEE]/14 hover:border-[#2AABEE]/35 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2AABEE]/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-4.5 h-4.5 text-[#2AABEE]" style={{ width: 18, height: 18 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  Нужна другая расцветка?
                </p>
                <p className="text-xs text-[rgb(var(--muted))] mt-0.5">
                  Напишите менеджеру — подберём нужный вариант
                </p>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-[#2AABEE] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl tracking-wide mb-8">{t("related")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}>
            <button
              className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors"
              onClick={() => setLightbox(false)}>
              <X className="w-5 h-5" />
            </button>

            {/* Arrows */}
            {sortedGallery.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </>
            )}

            <motion.div
              key={activeImg}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[85vh] aspect-square mx-6"
              onClick={(e) => e.stopPropagation()}>
              <Image
                src={sortedGallery[activeImg] ?? product.image}
                alt={product.name}
                fill
                className="object-contain"
                sizes="700px"
              />
            </motion.div>

            {/* Thumbnail strip in lightbox */}
            {sortedGallery.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {sortedGallery.map((img, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImg ? "border-[rgb(var(--accent))]" : "border-white/20 opacity-50 hover:opacity-100"
                    }`}>
                    <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Size Guide Modal (M-2 fix) ── */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSizeGuide(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--border))]">
                <h2 className="font-bold text-base">{t("size_guide")}</h2>
                <button onClick={() => setShowSizeGuide(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-2))] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[70vh]">
                {isShoes ? (
                  <>
                    <p className="text-[rgb(var(--muted))] text-sm mb-4">Размеры кроссовок (мужские)</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-[rgb(var(--border))]">
                            {["EU", "US", "UK", "CM"].map(h => (
                              <th key={h} className="text-left py-2 px-3 text-[rgb(var(--muted))] text-xs font-bold uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--border))]">
                          {[
                            ["36", "4", "3.5", "22.5"],
                            ["37", "5", "4",   "23.0"],
                            ["38", "5.5","4.5","23.5"],
                            ["38.5","6", "5",  "24.0"],
                            ["39", "6.5","5.5","24.5"],
                            ["40", "7",  "6",  "25.0"],
                            ["40.5","7.5","6.5","25.5"],
                            ["41", "8",  "7",  "26.0"],
                            ["42", "8.5","7.5","26.5"],
                            ["42.5","9", "8",  "27.0"],
                            ["43", "9.5","8.5","27.5"],
                            ["44", "10", "9",  "28.0"],
                            ["44.5","10.5","9.5","28.5"],
                            ["45", "11", "10", "29.0"],
                            ["45.5","11.5","10.5","29.5"],
                            ["46", "12", "11", "30.0"],
                          ].map(([eu, us, uk, cm]) => (
                            <tr key={eu} className="hover:bg-[rgb(var(--surface-2))] transition-colors">
                              <td className="py-2 px-3 font-semibold">{eu}</td>
                              <td className="py-2 px-3 text-[rgb(var(--muted))]">{us}</td>
                              <td className="py-2 px-3 text-[rgb(var(--muted))]">{uk}</td>
                              <td className="py-2 px-3 text-[rgb(var(--muted))]">{cm}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[rgb(var(--muted))] text-sm mb-4">Размеры одежды</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-[rgb(var(--border))]">
                            {["Размер", "Грудь (см)", "Талия (см)", "Бёдра (см)"].map(h => (
                              <th key={h} className="text-left py-2 px-3 text-[rgb(var(--muted))] text-xs font-bold uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--border))]">
                          {[
                            ["XS", "84–88",  "66–70",  "90–94"],
                            ["S",  "88–92",  "70–74",  "94–98"],
                            ["M",  "92–96",  "74–78",  "98–102"],
                            ["L",  "96–100", "78–82",  "102–106"],
                            ["XL", "100–104","82–86",  "106–110"],
                            ["2XL","104–110","86–92",  "110–116"],
                            ["3XL","110–116","92–98",  "116–122"],
                          ].map(([size, chest, waist, hip]) => (
                            <tr key={size} className="hover:bg-[rgb(var(--surface-2))] transition-colors">
                              <td className="py-2 px-3 font-semibold">{size}</td>
                              <td className="py-2 px-3 text-[rgb(var(--muted))]">{chest}</td>
                              <td className="py-2 px-3 text-[rgb(var(--muted))]">{waist}</td>
                              <td className="py-2 px-3 text-[rgb(var(--muted))]">{hip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                <p className="text-[rgb(var(--muted))] text-xs mt-4">
                  * Размеры являются ориентировочными. При сомнениях рекомендуем заказать размер больше или уточнить у менеджера.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
