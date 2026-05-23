"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, itemPrice } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const t = useTranslations("cart");
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  const total = totalPrice();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-[rgb(var(--surface))] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[rgb(var(--border))]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[rgb(var(--accent))]" />
                <h2 className="font-display text-xl tracking-widest">
                  {t("title")}
                </h2>
                {items.length > 0 && (
                  <span className="bg-[rgb(var(--accent))] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-2))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-[rgb(var(--surface-2))] flex items-center justify-center">
                    <ShoppingBag className="w-9 h-9 text-[rgb(var(--muted))]" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">{t("empty")}</p>
                    <p className="text-sm text-[rgb(var(--muted))]">
                      {t("empty_subtitle")}
                    </p>
                  </div>
                  <Link
                    href="/marketplace"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(var(--accent))] text-white font-semibold rounded-xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm"
                  >
                    {t("go_shopping")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <ul className="p-5 flex flex-col gap-4">
                  {items.map((item) => (
                    <motion.li
                      key={`${item.product.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-4 p-4 bg-[rgb(var(--card-bg))] rounded-2xl border border-[rgb(var(--border))]"
                    >
                      {/* Image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-20 rounded-xl overflow-hidden bg-[rgb(var(--surface-2))] flex-shrink-0"
                      >
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Link
                            href={`/product/${item.product.slug}`}
                            onClick={closeCart}
                            className="text-sm font-semibold leading-tight hover:text-[rgb(var(--accent))] transition-colors truncate"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() =>
                              removeItem(item.product.id, item.size, item.version)
                            }
                            className="p-1 text-[rgb(var(--muted))] hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          <span className="text-xs text-[rgb(var(--muted))]">{item.product.brand}</span>
                          <span className="text-[rgb(var(--border))]">·</span>
                          <span className="text-xs bg-[rgb(var(--surface-2))] px-2 py-0.5 rounded-full font-medium">{item.size}</span>
                          <span className="text-[rgb(var(--border))]">·</span>
                          <span className={`text-xs font-bold ${item.version === "replica" ? "text-purple-400" : "text-emerald-400"}`}>
                            {item.version === "replica" ? "Replica" : "Original"}
                          </span>
                          {item.product.type === "preorder" && (
                            <><span className="text-[rgb(var(--border))]">·</span>
                            <span className="text-xs text-[rgb(var(--accent))] font-medium">Preorder</span></>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Qty */}
                          <div className="flex items-center gap-2 bg-[rgb(var(--surface-2))] rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.version, item.quantity - 1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[rgb(var(--border))] transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.version, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[rgb(var(--border))] transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-[rgb(var(--foreground))]">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-[rgb(var(--border))] space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(var(--muted))]">
                      {t("subtotal")}
                    </span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(var(--muted))]">
                      {t("shipping")}
                    </span>
                    <span className="text-[rgb(var(--muted))]">
                      {t("shipping_value")}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[rgb(var(--border))] flex items-center justify-between">
                    <span className="font-semibold">{t("total")}</span>
                    <span className="font-bold text-xl text-[rgb(var(--accent))]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm uppercase tracking-widest"
                >
                  {t("checkout")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full py-2.5 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
                >
                  {t("continue_shopping")}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
