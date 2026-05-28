"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Send, MapPin, User, Phone, Tag, X, Package, ShoppingBag, Copy, CheckCheck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { usePromoStore, calcDiscount } from "@/store/promoCodes";
import { useAuthStore } from "@/store/auth";
import type { PromoCode } from "@/store/promoCodes";
import { formatPrice } from "@/lib/utils";

interface FormData {
  name: string;
  telegram: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const { items, totalPrice, clearCart } = useCartStore();
  const { validate, applyUse } = usePromoStore();
  const { user } = useAuthStore();
  const [form, setForm] = useState<FormData>({
    name: "", telegram: "", phone: "", city: "", address: "", notes: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoStatus, setPromoStatus] = useState<"idle" | "ok" | "error">("idle");

  const rawTotal = totalPrice();
  const discount = appliedPromo ? calcDiscount(appliedPromo, rawTotal) : 0;
  const finalTotal = rawTotal - discount;

  const validate_ = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = t("required_field");
    if (!form.telegram.trim()) e.telegram = t("required_field");
    if (!form.city.trim()) e.city = t("required_field");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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
      if (result.error === "min_order" && result.code) {
        setPromoError(`${t("promo_min_order")}: $${result.code.minOrder}`);
      } else if (result.error === "expired") {
        setPromoError(t("promo_expired"));
      } else {
        setPromoError(t("promo_invalid"));
      }
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError(null);
    setPromoStatus("idle");
  };

  const [orderError, setOrderError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto-fill form from user profile
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.name || "",
        telegram: f.telegram || user.telegram || "",
      }));
    }
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate_()) return;
    setLoading(true);
    setOrderError("");

    try {
      const orderItems = items.map((item) => ({
        name: item.product.name,
        size: item.size,
        qty: item.quantity,
        price: item.version === "replica" && item.product.replicaPrice
          ? item.product.replicaPrice
          : item.product.price,
        version: item.version,
        image: item.product.image,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          total: finalTotal,
          customer_name: form.name,
          telegram: form.telegram,
          phone: form.phone || undefined,
          city: form.city,
          address: form.address || undefined,
          notes: form.notes || undefined,
          promo_code: appliedPromo?.code || undefined,
          discount: discount || 0,
          user_id: user?.id || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Order failed");
      }

      if (appliedPromo) applyUse(appliedPromo.id);
      setOrderNumber(data.order?.order_number || data.order_number || "");
      clearCart();
      setSubmitted(true);
    } catch (err) {
      console.error("Order error:", err);
      setOrderError("Не удалось оформить заказ. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleCopyOrder = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (submitted) {
    return (
      <div className="bg-[rgb(var(--background))] min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          {/* Success card */}
          <div className="text-center p-8 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl mb-4">
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-emerald-400" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h1 className="font-display text-3xl tracking-wide mb-2">{t("success_title")}</h1>
              <p className="text-[rgb(var(--muted))] text-sm mb-6">{t("success_subtitle")}</p>

              {/* Order number */}
              {orderNumber && (
                <button
                  onClick={handleCopyOrder}
                  className="group inline-flex items-center gap-2.5 px-5 py-3 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-2xl mb-6 hover:border-[rgb(var(--accent)/0.4)] transition-all"
                >
                  <Package className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <span className="font-mono font-bold tracking-widest text-sm">{orderNumber}</span>
                  {copied
                    ? <CheckCheck className="w-4 h-4 text-emerald-400" />
                    : <Copy className="w-4 h-4 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--foreground))] transition-colors" />
                  }
                </button>
              )}

              {/* Telegram info */}
              <div className="p-4 bg-[#2AABEE]/5 border border-[#2AABEE]/15 rounded-2xl text-left mb-6">
                <div className="flex items-start gap-3">
                  <Send className="w-4 h-4 text-[#2AABEE] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#2AABEE] mb-1">Уведомление отправлено</p>
                    <p className="text-xs text-[rgb(var(--muted))] leading-relaxed">
                      Менеджер свяжется с вами в Telegram в течение нескольких минут для подтверждения заказа.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-2 gap-3"
          >
            {user && (
              <Link href="/profile"
                className="flex items-center justify-center gap-2 py-3.5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-sm font-semibold rounded-2xl hover:border-[rgb(var(--foreground)/0.2)] transition-all">
                <Package className="w-4 h-4 text-[rgb(var(--accent))]" />
                Мои заказы
              </Link>
            )}
            <Link href="/marketplace"
              className={`flex items-center justify-center gap-2 py-3.5 bg-[rgb(var(--accent))] text-white text-sm font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-colors ${!user ? "col-span-2" : ""}`}>
              <ShoppingBag className="w-4 h-4" />
              Продолжить покупки
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen py-10">
      <div className="container-uha max-w-5xl">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/cart" className="p-2 rounded-xl border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-wide">{t("title")}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            {/* Contact */}
            <div className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl space-y-5">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-4 h-4 text-[rgb(var(--accent))]" />
                {t("contact")}
              </h2>
              <Field label={t("name")} error={errors.name}>
                <input placeholder="Имя Фамилия" value={form.name} onChange={set("name")}
                  className={inputCls(!!errors.name)} />
              </Field>
              <Field label={t("telegram")} error={errors.telegram}>
                <div className="relative">
                  <Send className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted))]" />
                  <input placeholder={t("telegram_placeholder")} value={form.telegram} onChange={set("telegram")}
                    className={`${inputCls(!!errors.telegram)} pl-10`} />
                </div>
              </Field>
              <Field label={t("phone")}>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted))]" />
                  <input placeholder="+998 90 000 00 00" value={form.phone} onChange={set("phone")}
                    className={`${inputCls(false)} pl-10`} />
                </div>
              </Field>
            </div>

            {/* Address */}
            <div className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl space-y-5">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[rgb(var(--accent))]" />
                {t("address")}
              </h2>
              <Field label={t("city")} error={errors.city}>
                <input placeholder="Ташкент" value={form.city} onChange={set("city")}
                  className={inputCls(!!errors.city)} />
              </Field>
              <Field label={t("address")}>
                <input placeholder="Улица, дом, квартира" value={form.address} onChange={set("address")}
                  className={inputCls(false)} />
              </Field>
              <Field label={t("notes")}>
                <textarea placeholder={t("notes_placeholder")} value={form.notes}
                  onChange={set("notes")} rows={3}
                  className={`${inputCls(false)} resize-none`} />
              </Field>
            </div>

            {/* Promo code */}
            <div className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl space-y-4">
              <h2 className="font-semibold text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-[rgb(var(--accent))]" />
                {t("promo_code")}
              </h2>

              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold text-emerald-400 tracking-widest text-sm">{appliedPromo.code}</span>
                    <span className="text-emerald-400/70 text-xs">
                      — {t("promo_discount")}: −{appliedPromo.discountType === "percent" ? `${appliedPromo.discountValue}%` : formatPrice(appliedPromo.discountValue)}
                    </span>
                  </div>
                  <button type="button" onClick={handleRemovePromo}
                    className="text-[rgb(var(--muted))] hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col xs:flex-row gap-2">
                  <input
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus("idle"); setPromoError(null); }}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleApplyPromo())}
                    placeholder={t("promo_placeholder")}
                    className={`flex-1 h-11 px-4 bg-[rgb(var(--background))] border rounded-xl text-sm font-mono tracking-widest text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted))] placeholder:tracking-normal focus:outline-none transition-colors ${
                      promoStatus === "error"
                        ? "border-red-500/50 focus:border-red-500"
                        : promoStatus === "ok"
                        ? "border-emerald-500/50"
                        : "border-[rgb(var(--border))] focus:border-[rgb(var(--accent))]"
                    }`}
                  />
                  <button type="button" onClick={handleApplyPromo}
                    className="h-11 px-5 bg-[rgb(var(--accent))] text-white font-bold rounded-xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm uppercase tracking-wide whitespace-nowrap w-full xs:w-auto">
                    {t("promo_apply")}
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <X className="w-3 h-3" /> {promoError}
                </p>
              )}
            </div>

            {orderError && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {orderError}
              </div>
            )}

            <button type="submit" disabled={loading || items.length === 0}
              className="w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-all disabled:opacity-50 uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl shadow-[rgb(var(--accent)/0.25)]">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : t("place_order")}
            </button>
          </form>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl">
              <h3 className="font-display text-2xl tracking-wide mb-5">{t("summary")}</h3>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[rgb(var(--surface-2))] flex-shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-[rgb(var(--muted))]">{item.size} · ×{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-[rgb(var(--border))]">
                <div className="flex justify-between text-sm">
                  <span className="text-[rgb(var(--muted))]">Подытог</span>
                  <span>{formatPrice(rawTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {appliedPromo?.code}
                    </span>
                    <span className="text-emerald-400 font-semibold">−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[rgb(var(--border))]">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl text-[rgb(var(--accent))]">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full h-11 px-4 bg-[rgb(var(--background))] border rounded-xl text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted))] focus:outline-none transition-colors ${
    hasError
      ? "border-red-500/50 focus:border-red-500"
      : "border-[rgb(var(--border))] focus:border-[rgb(var(--accent))]"
  }`;
}
