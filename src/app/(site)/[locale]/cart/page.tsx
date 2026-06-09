"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const t = useTranslations("cart");
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const total = totalPrice();

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen py-10">
      <div className="container-uha max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/marketplace"
            className="p-2 rounded-xl border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-wide">
            {t("title")}
          </h1>
          {items.length > 0 && (
            <span className="bg-[rgb(var(--accent))] text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-[rgb(var(--surface))] flex items-center justify-center mb-6">
              <ShoppingBag className="w-11 h-11 text-[rgb(var(--muted))]" />
            </div>
            <h2 className="font-semibold text-2xl mb-2">{t("empty")}</h2>
            <p className="text-[rgb(var(--muted))] mb-8">{t("empty_subtitle")}</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-colors uppercase tracking-widest text-sm"
            >
              {t("go_shopping")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={`${item.product.id}-${item.size}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, height: 0 }}
                    className="flex gap-4 p-5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl"
                  >
                    <Link href={`/product/${item.product.slug}`} className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[rgb(var(--surface-2))] flex-shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="96px" />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <Link href={`/product/${item.product.slug}`} className="font-semibold text-base hover:text-[rgb(var(--accent))] transition-colors pr-2 leading-snug">
                          {item.product.name}
                        </Link>
                        <button onClick={() => removeItem(item.product.id, item.size, item.version)} className="p-1.5 text-[rgb(var(--muted))] hover:text-red-500 transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-sm text-[rgb(var(--muted))]">
                        <span>{item.product.brand}</span>
                        <span className="text-[rgb(var(--border))]">·</span>
                        <span className="bg-[rgb(var(--surface-2))] px-2 py-0.5 rounded-lg text-xs font-medium text-[rgb(var(--foreground))]">{item.size}</span>
                        {item.product.type === "preorder" && (
                          <>
                            <span className="text-[rgb(var(--border))]">·</span>
                            <span className="text-xs text-[rgb(var(--accent))] font-medium">Preorder • {item.product.estimatedDelivery}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-[rgb(var(--surface-2))] rounded-xl p-1">
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.version, item.quantity - 1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[rgb(var(--border))] transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.version, item.quantity + 1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[rgb(var(--border))] transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-lg">{formatPrice(
                          (item.version === "replica" && item.product.replicaPrice
                            ? item.product.replicaPrice
                            : item.product.price) * item.quantity
                        )}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl space-y-5">
                <h3 className="font-display text-2xl tracking-wide">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">{t("subtotal")}</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgb(var(--muted))]">{t("shipping")}</span>
                    <span className="text-[rgb(var(--muted))]">{t("shipping_value")}</span>
                  </div>
                  <div className="pt-3 border-t border-[rgb(var(--border))] flex justify-between">
                    <span className="font-semibold">{t("total")}</span>
                    <span className="font-bold text-xl text-[rgb(var(--accent))]">{formatPrice(total)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="flex items-center justify-center gap-2 w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm uppercase tracking-widest">
                  {t("checkout")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/marketplace" className="flex items-center justify-center text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
                  {t("continue_shopping")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
