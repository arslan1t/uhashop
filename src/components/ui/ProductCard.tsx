"use client";

import { memo, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Eye, Clock, Check, Heart, X } from "lucide-react";
import { Badge } from "./Badge";
import { useCartStore } from "@/store/cart";
import { useProductOverrides } from "@/store/productOverrides";
import { useWishlist } from "@/store/wishlist";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
  product: Product;
  priority?: boolean;
  displayVersion?: "original" | "replica";
}

// Hidden on mobile (pointer:coarse) — saves 12-24 concurrent GPU animation threads
function UhaLogoMark() {
  return (
    <div
      className="absolute bottom-2.5 right-2.5 z-10 w-8 h-8 animate-spin-slow hidden sm:block"
      style={{ filter: "drop-shadow(0 0 6px rgba(153,27,27,0.55)) drop-shadow(0 0 12px rgba(153,27,27,0.25))" }}
    >
      <Image src="/images/branding/logo-spinning.png" alt="UHA" fill className="object-contain" sizes="32px" />
    </div>
  );
}

export const ProductCard = memo(function ProductCard({ product, priority = false, displayVersion }: Props) {
  const { addItem } = useCartStore();
  const overrides = useProductOverrides(s => s.overrides);
  const { has: isLiked, toggle: toggleLike } = useWishlist();

  const [added, setAdded] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<"original" | "replica">("original");
  const pickerRef = useRef<HTMLDivElement>(null);

  const liked = isLiked(product.slug);
  const overrideMain = overrides[product.slug]?.mainImage;
  const displayImage = overrideMain && !overrideMain.startsWith("blob:") ? overrideMain : product.image;
  const hasReplica = !!product.replicaPrice;
  const hasSizes = product.sizes.length > 0;

  // Close picker on outside click/touch
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showPicker]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(product.slug);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
  };

  const openPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker(true);
  };

  const handlePickSize = (e: React.MouseEvent, sizeLabel: string) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, sizeLabel, selectedVersion);
    setShowPicker(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const getSizeLabel = (s: Product["sizes"][0]) =>
    "eu" in s ? `EU ${s.eu}` : s.label;

  return (
    // Buttons are SIBLINGS of Link, not children — fixes iOS double-tap (button-in-a is invalid HTML)
    <article className="group bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] rounded-2xl overflow-hidden product-card-hover relative">

      {/* ── Clickable area: image + info → product page ── */}
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[rgb(var(--surface-2))]">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 [@media(hover:hover)]:group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <UhaLogoMark />

          {(product.badge || product.type === "preorder") && (
            <div className="absolute top-2.5 left-2.5 z-10">
              {product.badge ? <Badge variant={product.badge} /> : <Badge variant="preorder" />}
            </div>
          )}

          {/* Desktop-only hover overlay — hidden on touch via CSS media query */}
          <div className="[@media(hover:none)]:hidden absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center gap-2.5 pointer-events-none group-hover:pointer-events-auto">
            <Link
              href={`/product/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-black hover:bg-white transition-colors shadow-lg"
              title="Открыть товар">
              <Eye className="w-4 h-4" />
            </Link>
            <button onClick={openPicker}
              className={`w-9 h-9 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors shadow-lg ${
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))]"
              }`}>
              {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Info — right padding reserves space for the cart button */}
        <div className="p-3.5 pr-12">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[rgb(var(--accent))] uppercase tracking-wider">
              {product.brand}
            </span>
            {product.type === "preorder" && product.estimatedDelivery && (
              <div className="flex items-center gap-1 text-[9px] text-[rgb(var(--muted))]">
                <Clock className="w-2.5 h-2.5" />
                <span>{product.estimatedDelivery}</span>
              </div>
            )}
          </div>

          <h3 className="text-sm font-semibold leading-snug mb-2.5 line-clamp-2 [@media(hover:hover)]:group-hover:text-[rgb(var(--accent))] transition-colors">
            {product.nameRu}
          </h3>

          <div className="mt-1">
            {displayVersion === "replica" && product.replicaPrice ? (
              <>
                <span className="text-base font-bold text-purple-400">{formatPrice(product.replicaPrice)}</span>
                <span className="ml-1.5 text-[10px] font-bold text-purple-400/60 uppercase tracking-wider">Реплика</span>
              </>
            ) : (
              <>
                <span className="text-base font-bold">{formatPrice(product.price)}</span>
                {product.replicaPrice && product.replicaPrice !== product.price && !displayVersion && (
                  <span className="ml-1.5 text-[11px] text-[rgb(var(--muted))]">
                    / {formatPrice(product.replicaPrice)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Link>

      {/* ── Like button — outside Link, fires on first tap ── */}
      <button
        onClick={handleLike}
        className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
        style={{
          background: liked ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
          border: liked ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)",
        }}>
        <motion.div animate={likeAnim ? { scale: [1, 1.5, 0.9, 1.1, 1] } : {}} transition={{ duration: 0.45 }}>
          <Heart
            className="w-3.5 h-3.5 transition-colors"
            style={{ color: liked ? "#ef4444" : "rgba(255,255,255,0.8)" }}
            fill={liked ? "#ef4444" : "none"}
          />
        </motion.div>
      </button>

      {/* ── Cart button — outside Link, fires on first tap ── */}
      <button
        onClick={openPicker}
        className={`absolute bottom-3.5 right-3 z-20 flex items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all active:scale-95 ${
          added
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
            : "bg-[rgb(var(--accent)/0.08)] text-[rgb(var(--accent))] border border-[rgb(var(--accent)/0.25)] [@media(hover:hover)]:hover:bg-[rgb(var(--accent))] [@media(hover:hover)]:hover:text-white [@media(hover:hover)]:hover:border-[rgb(var(--accent))]"
        }`}>
        <ShoppingBag className="w-3 h-3" />
        {added ? "✓" : "+"}
      </button>

      {/* ── Size Picker Popup ── */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-30 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl p-4"
            style={{ boxShadow: "0 -4px 32px rgba(0,0,0,0.35)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))]">
                Выберите размер
              </p>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPicker(false); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-[rgb(var(--muted))] transition-colors active:bg-[rgb(var(--surface-2))]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Version toggle */}
            {hasReplica && (
              <div className="flex gap-1.5 mb-3">
                {(["original", "replica"] as const).map(v => (
                  <button key={v}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedVersion(v); }}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-colors active:scale-95 ${
                      selectedVersion === v
                        ? v === "replica"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent))] border border-[rgb(var(--accent)/0.3)]"
                        : "bg-[rgb(var(--surface-2))] text-[rgb(var(--muted))] border border-[rgb(var(--border))]"
                    }`}>
                    {v === "original" ? `Оригинал ${formatPrice(product.price)}` : `Реплика ${formatPrice(product.replicaPrice!)}`}
                  </button>
                ))}
              </div>
            )}

            {/* Size grid */}
            {hasSizes ? (
              <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
                {product.sizes.map((s) => {
                  const label = getSizeLabel(s);
                  const inStock = "inStock" in s ? s.inStock !== false : true;
                  return (
                    <button
                      key={label}
                      disabled={!inStock}
                      onClick={(e) => inStock && handlePickSize(e, label)}
                      className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                        !inStock
                          ? "opacity-30 cursor-not-allowed line-through text-[rgb(var(--muted))] border border-[rgb(var(--border))]"
                          : "bg-[rgb(var(--surface-2))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] active:scale-95 active:bg-[rgb(var(--accent))] active:text-white active:border-[rgb(var(--accent))] [@media(hover:hover)]:hover:bg-[rgb(var(--accent))] [@media(hover:hover)]:hover:text-white [@media(hover:hover)]:hover:border-[rgb(var(--accent))]"
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                onClick={(e) => handlePickSize(e, "One Size")}
                className="w-full py-2.5 bg-[rgb(var(--accent))] text-white font-bold rounded-xl text-sm transition-colors active:scale-95 [@media(hover:hover)]:hover:bg-[rgb(var(--accent-hover))]">
                В корзину
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
});
