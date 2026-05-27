"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, itemPrice } from "@/store/cart";
import { usePromoStore, calcDiscount } from "@/store/promoCodes";
import type { PromoCode } from "@/store/promoCodes";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const t = useTranslations("cart");
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();
  const { validate } = usePromoStore();

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoStatus, setPromoStatus] = useState<"idle" | "ok" | "error">("idle");

  const rawTotal = totalPrice();
  const discount = appliedPromo ? calcDiscount(appliedPromo, rawTotal) : 0;
  const total = rawTotal - discount;

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const result = validate(promoInput, rawTotal);
    if (result.valid && result.code) {
      setAppliedPromo(result.code);
      setPromoError(null);
      setPromoStatus("ok");
    } else {
      setAppliedPromo(null);
      setPromoStatus("error");
      setPromoError(
        result.error === "min_order" ? `Минимальный заказ: ${formatPrice(result.code?.minOrder || 0)}` :
        result.error === "expired" ? "Промокод истёк" : "Неверный промокод"
      );
    }
  };

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
                            {formatPrice(itemPrice(item) * item.quantity)}
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

                {/* Promo code */}
                {appliedPromo ? (
                  <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-mono font-bold text-emerald-400 text-sm tracking-widest">{appliedPromo.code}</span>
                      <span className="text-emerald-400/70 text-xs">
                        −{appliedPromo.discountType === "percent" ? `${appliedPromo.discountValue}%` : formatPrice(appliedPromo.discountValue)}
                      </span>
                    </div>
                    <button onClick={() => { setAppliedPromo(null); setPromoInput(""); setPromoStatus("idle"); setPromoError(null); }}
                      className="text-[rgb(var(--muted))] hover:text-red-400 transition-colors ml-2">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--muted))]" />
                        <input
                          value={promoInput}
                          onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus("idle"); setPromoError(null); }}
                          onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
                          placeholder="Промокод"
                          className={`w-full h-9 pl-9 pr-3 bg-[rgb(var(--background))] border rounded-xl text-xs font-mono tracking-widest text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted))] placeholder:tracking-normal focus:outline-none transition-colors ${
                            promoStatus === "error" ? "border-red-500/40" : "border-[rgb(var(--border))] focus:border-[rgb(var(--accent)/0.5)]"
                          }`}
                        />
                      </div>
                      <button onClick={handleApplyPromo}
                        className="h-9 px-3.5 bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] text-xs font-bold rounded-xl hover:bg-[rgb(var(--border))] transition-colors whitespace-nowrap">
                        Применить
                      </button>
                    </div>
                    {promoError && <p className="text-[10px] text-red-400">{promoError}</p>}
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(var(--muted))]">{t("subtotal")}</span>
                    <span className="font-semibold">{formatPrice(rawTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-400 text-xs">Скидка по промокоду</span>
                      <span className="text-emerald-400 font-semibold">−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(var(--muted))]">{t("shipping")}</span>
                    <span className="text-[rgb(var(--muted))]">{t("shipping_value")}</span>
                  </div>
                  <div className="pt-2 border-t border-[rgb(var(--border))] flex items-center justify-between">
                    <span className="font-semibold">{t("total")}</span>
                    <span className="font-bold text-xl text-[rgb(var(--accent))]">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link href="/checkout" onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm uppercase tracking-widest">
                  {t("checkout")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button onClick={closeCart}
                  className="w-full py-2.5 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
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
