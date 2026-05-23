"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Eye, Clock, Check, Heart } from "lucide-react";
import { Badge } from "./Badge";
import { useCartStore } from "@/store/cart";
import { useProductOverrides } from "@/store/productOverrides";
import { useWishlist } from "@/store/wishlist";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
  product: Product;
  priority?: boolean;
  /** When set, shows price for this version prominently */
  displayVersion?: "original" | "replica";
}

/**
 * Rotating UHA logo mark using the real logo PNG.
 * Slow spin, subtle glow — premium authentication feel.
 */
function UhaLogoMark() {
  return (
    <div
      className="absolute bottom-2.5 right-2.5 z-10 w-8 h-8 animate-spin-slow"
      style={{ filter: "drop-shadow(0 0 4px rgba(255,102,0,0.35))" }}
    >
      <Image
        src="/images/branding/logo-on-dark.png"
        alt="UHA"
        fill
        className="object-contain opacity-75"
        sizes="32px"
      />
    </div>
  );
}

export function ProductCard({ product, priority = false, displayVersion }: Props) {
  const { addItem } = useCartStore();
  // Subscribe to overrides object directly so React re-renders when admin saves new main image
  const overrides = useProductOverrides(s => s.overrides);
  const { has: isLiked, toggle: toggleLike } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  const liked = isLiked(product.slug);

  // Main image: admin override wins only if it's a real URL (not a stale blob:)
  const overrideMain = overrides[product.slug]?.mainImage;
  const displayImage =
    overrideMain && !overrideMain.startsWith("blob:") ? overrideMain : product.image;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(product.slug);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
  };

  const defaultSize = (() => {
    const s = product.sizes[0];
    if (!s) return "";
    return "eu" in s ? `EU ${s.eu}` : s.label;
  })();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, defaultSize, "original");
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group bg-[rgb(var(--card-bg))] border border-[rgb(var(--card-border))] rounded-2xl overflow-hidden product-card-hover">
      <Link href={`/product/${product.slug}`}>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[rgb(var(--surface-2))]">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Rotating real UHA logo mark */}
          <UhaLogoMark />

          {/* Badges */}
          {(product.badge || product.type === "preorder") && (
            <div className="absolute top-2.5 left-2.5 z-10">
              {product.badge
                ? <Badge variant={product.badge} />
                : <Badge variant="preorder" />}
            </div>
          )}

          {/* ── Like button (always visible, top-right) ── */}
          <button
            onClick={handleLike}
            className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: liked ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              border: liked ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <motion.div
              animate={likeAnim ? { scale: [1, 1.5, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.45 }}
            >
              <Heart
                className="w-3.5 h-3.5 transition-colors"
                style={{ color: liked ? "#ef4444" : "rgba(255,255,255,0.8)" }}
                fill={liked ? "#ef4444" : "none"}
              />
            </motion.div>
          </button>

          {/* Hover actions — кнопки, не ссылки (карточка сама является ссылкой) */}
          <motion.div
            initial={false}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/25 flex items-center justify-center gap-2.5">
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-black hover:bg-white transition-colors shadow-lg"
              title="Просмотр товара"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={handleAdd}
              className={`w-9 h-9 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors shadow-lg ${
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))]"
              }`}>
              {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-3.5">
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

          <h3 className="text-sm font-semibold leading-snug mb-2.5 line-clamp-2 group-hover:text-[rgb(var(--accent))] transition-colors">
            {product.nameRu}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              {displayVersion === "replica" && product.replicaPrice ? (
                <>
                  <span className="text-base font-bold text-purple-400">{formatPrice(product.replicaPrice)}</span>
                  <span className="ml-1.5 text-[10px] font-bold text-purple-400/60 uppercase tracking-wider">Replica</span>
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
            <button onClick={handleAdd}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all ${
                added
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                  : "bg-[rgb(var(--accent)/0.08)] text-[rgb(var(--accent))] border border-[rgb(var(--accent)/0.25)] hover:bg-[rgb(var(--accent))] hover:text-white hover:border-[rgb(var(--accent))]"
              }`}>
              <ShoppingBag className="w-3 h-3" />
              {added ? "✓" : "+"}
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
