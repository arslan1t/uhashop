"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Zap, Star, Lock, Clock, Bell } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getMerchProducts, products } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useProductVisibility } from "@/store/productVisibility";
import { useProductOverrides } from "@/store/productOverrides";

export function MerchClient() {
  const t = useTranslations("merch");
  const merch = getMerchProducts();
  const { addItem } = useCartStore();
  const { isHidden } = useProductVisibility();
  const overrides = useProductOverrides(s => s.overrides);

  // Hidden (coming soon) products from the full catalog
  const comingSoon = products.filter(p => isHidden(p.slug));

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">

      {/* ── Clean split hero: text left / video right ── */}
      <section className="border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
        <div className="container-uha py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: text */}
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}>
              <span className="text-xs font-bold uppercase tracking-[0.35em] text-[rgb(var(--accent))] block mb-6">
                Оригинальная коллекция · В наличии
              </span>
              <h1 className="font-display text-[clamp(2rem,6vw,5rem)] tracking-tight leading-[1.05] text-[rgb(var(--foreground))] mb-6">
                UHA<br />
                <span className="text-[rgb(var(--accent))]">MERCH</span>
              </h1>
              <p className="text-[rgb(var(--muted))] text-xl mb-10 max-w-sm leading-relaxed">
                {t("subtitle")}
              </p>
              <div className="flex flex-wrap gap-5 mb-10">
                {[
                  { icon: Package, label: "Всё в наличии" },
                  { icon: Zap,     label: "Быстрая отправка" },
                  { icon: Star,    label: "UHA Оригинал" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-[rgb(var(--muted))]">
                    <Icon className="w-4 h-4 text-[rgb(var(--accent))]" />
                    {label}
                  </div>
                ))}
              </div>
              <Link href="#products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm uppercase tracking-widest shadow-xl shadow-[rgb(var(--accent)/0.25)]">
                <ShoppingBag className="w-4 h-4" />
                Смотреть коллекцию
              </Link>
            </motion.div>

            {/* Right: clean video showcase */}
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[480px] mx-auto pb-8">
                {/* Clean video container — увеличен */}
                <div className="relative aspect-square rounded-3xl overflow-hidden border border-[rgb(var(--border))] bg-black shadow-2xl">
                  <video
                    autoPlay muted loop playsInline preload="metadata"
                    className="w-full h-full object-cover">
                    <source src="/videos/3d-tee.mov" type="video/quicktime" />
                    <source src="/videos/3d-tee.mov" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
                </div>

                {/* Rotating UHA mark */}
                <div className="absolute -top-3 -right-3 w-12 h-12 animate-spin-slow"
                  style={{ filter: "drop-shadow(0 0 8px rgba(153,27,27,0.6)) drop-shadow(0 0 16px rgba(153,27,27,0.3))" }}>
                  <Image
                    src="/images/branding/logo-spinning.png"
                    alt="UHA"
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>

                {/* Logo pill вместо заглушки */}
                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-xl whitespace-nowrap">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                  <Image
                    src="/images/branding/logo-white.png"
                    alt="UHA SHOP"
                    width={90}
                    height={28}
                    className="h-6 w-auto object-contain"
                  />
                  <span className="text-[11px] font-semibold text-[rgb(var(--muted))] border-l border-[rgb(var(--border))] pl-3">
                    360° Preview
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <div id="products" className="container-uha py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[rgb(var(--accent))] block mb-2">Drop 01</span>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl tracking-wide">{t("title")}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {merch.map((product, i) => (
            <motion.article key={product.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl overflow-hidden hover:border-[rgb(var(--accent)/0.35)] transition-all duration-300">
              <Link href={`/product/${product.slug}`}>
                {/* Video card */}
                <div className="relative aspect-square overflow-hidden bg-black">
                  <video autoPlay muted loop playsInline preload="metadata"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                    <source src="/videos/3d-tee.mov" type="video/quicktime" />
                    <source src="/videos/3d-tee.mov" type="video/mp4" />
                  </video>

                  {/* UHA rotating badge */}
                  <div className="absolute bottom-3 right-3 w-9 h-9 animate-spin-slow z-10"
                    style={{ filter: "drop-shadow(0 0 6px rgba(153,27,27,0.55)) drop-shadow(0 0 14px rgba(153,27,27,0.25))" }}>
                    <Image
                      src="/images/branding/logo-spinning.png"
                      alt="UHA"
                      fill
                      className="object-contain"
                      sizes="36px"
                    />
                  </div>

                  {product.badge && (
                    <div className="absolute top-3 left-3">
                      <Badge variant={product.badge} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="in_stock" label={t("in_stock")} size="sm" />
                    {product.inStock && (
                      <span className="text-xs text-[rgb(var(--muted))]">
                        {product.inStock} шт.
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-2 group-hover:text-[rgb(var(--accent))] transition-colors">
                    {product.nameRu}
                  </h3>
                  <p className="text-sm text-[rgb(var(--muted))] mb-4 leading-relaxed line-clamp-2">
                    {product.descriptionRu}
                  </p>

                  {/* Sizes */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(product.sizes ?? []).map((s) => {
                      const label = "label" in s ? s.label : `${s.eu}`;
                      return (
                        <span key={label}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            s.available
                              ? "border-[rgb(var(--border))] hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))] cursor-pointer"
                              : "border-[rgb(var(--border)/0.4)] text-[rgb(var(--muted)/0.4)] line-through"
                          }`}>{label}</span>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl tracking-wide">{formatPrice(product.price)}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const s = (product.sizes ?? []).find((s) => s.available);
                        const size = s ? ("label" in s ? s.label : `EU ${s.eu}`) : "";
                        addItem(product, size, "original");
                      }}
                      className="flex items-center gap-2 px-5 py-3 bg-[rgb(var(--accent))] text-white font-bold rounded-xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm uppercase tracking-wide">
                      <ShoppingBag className="w-4 h-4" />
                      В корзину
                    </button>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>

      {/* ── Coming Soon section ── */}
      {comingSoon.length > 0 && (
        <div className="container-uha py-16 border-t border-[rgb(var(--border))]">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[rgb(var(--accent))]">
                  Upcoming
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl md:text-5xl tracking-wide leading-none">
                Coming Soon
              </h2>
              <p className="text-[rgb(var(--muted))] text-sm mt-2">
                Скоро в продаже
              </p>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 border border-[rgb(var(--border))] text-sm font-semibold text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground)/0.3)] rounded-xl transition-all">
              <Bell className="w-4 h-4" />
              Уведомить обо всех
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {comingSoon.map((product, i) => {
              const img = overrides[product.slug]?.mainImage ?? product.image;
              return (
                <motion.div key={product.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="group bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden">

                  {/* Blurred image */}
                  <div className="relative aspect-square overflow-hidden bg-[rgb(var(--surface-2))]">
                    <Image src={img} alt={product.name} fill
                      className="object-cover scale-110 blur-[6px] brightness-50 transition-all duration-500 group-hover:blur-[4px]"
                      sizes="(max-width: 640px) 50vw, 25vw" />

                    {/* Lock + Soon overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                      <span className="bg-[rgb(var(--accent))] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        Soon
                      </span>
                    </div>

                    {/* Notify on hover */}
                    <motion.div
                      className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                        <Bell className="w-3 h-3" />
                        Уведомить
                      </button>
                    </motion.div>
                  </div>

                  {/* Info */}
                  <div className="p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[rgb(var(--accent))] uppercase tracking-wider">
                        {product.brand}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] text-[rgb(var(--muted))]">
                        <Clock className="w-2.5 h-2.5" />
                        <span>TBA</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug mb-2 text-[rgb(var(--foreground))]">
                      {product.nameRu}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[rgb(var(--muted))]">
                        from {formatPrice(product.price)}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))] border border-[rgb(var(--accent)/0.2)] rounded-full">
                        Preview
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
