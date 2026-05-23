"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Heart, Package, Clock, Send, ChevronRight,
  ShoppingBag, CheckCircle2, Truck, Box, XCircle, Loader2, X
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { formatPrice } from "@/lib/utils";

// ── Order status config ──────────────────────────────────────────────
type OrderStatus = "new" | "processing" | "ordered" | "delivered" | "cancelled";

const ORDER_STEPS: { key: OrderStatus; label: string; icon: React.ElementType; color: string }[] = [
  { key: "new",        label: "Принят",       icon: ShoppingBag,  color: "#60a5fa" },
  { key: "processing", label: "В обработке",   icon: Loader2,      color: "#f59e0b" },
  { key: "ordered",    label: "Заказан",       icon: Box,          color: "#a78bfa" },
  { key: "delivered",  label: "Доставлен",     icon: CheckCircle2, color: "#34d399" },
];

const ORDER_STATUS_INFO: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  new:        { label: "Принят",       color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  processing: { label: "В обработке",  color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  ordered:    { label: "Заказан",      color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
  delivered:  { label: "Доставлен",    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  cancelled:  { label: "Отменён",      color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
};

const STEP_INDEX: Record<OrderStatus, number> = {
  new: 0, processing: 1, ordered: 2, delivered: 3, cancelled: -1,
};

interface MockOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: { name: string; size: string; qty: number; price: number; version: string }[];
  estimatedDelivery?: string;
  notes?: string;
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: "1", orderNumber: "UHA-2024-001", date: "10 февраля 2024",
    status: "delivered", total: 189,
    estimatedDelivery: "Доставлен 18 февраля 2024",
    items: [{ name: "Air Jordan 1 High «Lucky Green»", size: "EU 42", qty: 1, price: 189, version: "original" }],
  },
  {
    id: "2", orderNumber: "UHA-2024-008", date: "15 мая 2026",
    status: "processing", total: 380,
    estimatedDelivery: "Ожидается 5–7 июня 2026",
    notes: "Предзаказ · Оригинал",
    items: [
      { name: "Travis Scott × Jordan 1 Low «Mocha»", size: "EU 43", qty: 1, price: 380, version: "original" },
    ],
  },
];

// ── Order Status Tracker ─────────────────────────────────────────────
function OrderTracker({ order, onClose }: { order: MockOrder; onClose: () => void }) {
  const stepIdx = STEP_INDEX[order.status];
  const statusInfo = ORDER_STATUS_INFO[order.status];
  const isCancelled = order.status === "cancelled";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgb(var(--border))]">
          <div>
            <p className="font-bold text-base">{order.orderNumber}</p>
            <p className="text-[rgb(var(--muted))] text-xs mt-0.5">{order.date}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${statusInfo.color} ${statusInfo.bg} ${statusInfo.border}`}>
              {statusInfo.label}
            </span>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-2))] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status stepper */}
          {!isCancelled ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-5">
                Статус заказа
              </p>
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[rgb(var(--border))]" />
                <div
                  className="absolute left-5 top-5 w-0.5 bg-gradient-to-b from-[rgb(var(--accent))] to-emerald-500 transition-all duration-700"
                  style={{ height: `${(stepIdx / (ORDER_STEPS.length - 1)) * 100}%` }}
                />

                <div className="space-y-5">
                  {ORDER_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const done = i <= stepIdx;
                    const active = i === stepIdx;
                    return (
                      <div key={step.key} className="flex items-center gap-4 relative">
                        {/* Circle */}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                          done
                            ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.15)]"
                            : "border-[rgb(var(--border))] bg-[rgb(var(--surface))]"
                        } ${active ? "shadow-lg shadow-[rgb(var(--accent)/0.25)]" : ""}`}>
                          <Icon className={`w-4 h-4 ${done ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted))]"} ${active && step.key === "processing" ? "animate-spin" : ""}`} />
                          {done && i < stepIdx && (
                            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-[rgb(var(--accent))]">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${done ? "text-[rgb(var(--foreground))]" : "text-[rgb(var(--muted))]"}`}>
                            {step.label}
                          </p>
                          {active && order.estimatedDelivery && (
                            <p className="text-xs text-[rgb(var(--accent))] mt-0.5">
                              {order.estimatedDelivery}
                            </p>
                          )}
                          {done && i < stepIdx && (
                            <p className="text-xs text-[rgb(var(--muted))] mt-0.5">Выполнено</p>
                          )}
                        </div>

                        {active && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[rgb(var(--accent))] animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-400">Заказ отменён</p>
                {order.notes && <p className="text-xs text-[rgb(var(--muted))] mt-0.5">{order.notes}</p>}
              </div>
            </div>
          )}

          {/* Order items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-3">
              Состав заказа
            </p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[rgb(var(--surface-2))] rounded-xl">
                  <div>
                    <p className="text-sm font-medium leading-snug">{item.name}</p>
                    <p className="text-xs text-[rgb(var(--muted))] mt-0.5">
                      {item.size} · ×{item.qty} · {item.version === "original" ? "Оригинал" : "Реплика"}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-[rgb(var(--foreground))] flex-shrink-0 ml-3">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total + Support */}
          <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--border))]">
            <div>
              <p className="text-[rgb(var(--muted))] text-xs">Итого</p>
              <p className="font-bold text-xl text-[rgb(var(--accent))]">{formatPrice(order.total)}</p>
            </div>
            <a
              href="https://t.me/hooper_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2AABEE]/10 border border-[#2AABEE]/20 text-[#2AABEE] text-sm font-semibold rounded-xl hover:bg-[#2AABEE]/20 transition-colors"
            >
              <Send className="w-4 h-4" />
              Написать в поддержку
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Profile Page ─────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const { slugs: wishlistSlugs } = useWishlist();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/auth/login");
  }, [isAuthenticated]);

  if (!user) return null;

  const wishlistProducts = products.filter(p => wishlistSlugs.includes(p.slug));
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <div className="bg-[rgb(var(--background))] min-h-screen">
        {/* Header */}
        <div className="bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))]">
          <div className="container-uha py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--accent)/0.15)] border border-[rgb(var(--accent)/0.3)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[rgb(var(--accent))] font-bold text-xl">{initials}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {user.email && !user.email.includes("@telegram.local") && (
                    <p className="text-[rgb(var(--muted))] text-sm mt-0.5">{user.email}</p>
                  )}
                  {user.telegram && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Send className="w-3 h-3 text-[#2AABEE]" />
                      <span className="text-[#2AABEE] text-xs font-medium">{user.telegram}</span>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => { logout(); router.replace("/"); }}
                className="flex items-center gap-2 px-5 py-2.5 border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-red-400 hover:border-red-500/30 rounded-xl text-sm font-medium transition-all">
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { icon: Package, label: "Заказов",    value: MOCK_ORDERS.length },
                { icon: Heart,   label: "Сохранено",  value: wishlistSlugs.length },
                { icon: ShoppingBag, label: "В корзине", value: items.length },
                { icon: Clock,   label: "Предзаказов", value: MOCK_ORDERS.filter(o => o.status === "processing" || o.status === "ordered").length },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-2xl">
                  <Icon className="w-4 h-4 text-[rgb(var(--accent))] mb-2" />
                  <div className="text-xl font-bold">{value}</div>
                  <div className="text-xs text-[rgb(var(--muted))] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-uha py-10 space-y-10">
          {/* ── Orders ── */}
          <section>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Package className="w-5 h-5 text-[rgb(var(--accent))]" />
              Мои заказы
            </h2>
            <div className="space-y-3">
              {MOCK_ORDERS.map(order => {
                const info = ORDER_STATUS_INFO[order.status];
                const stepIdx = STEP_INDEX[order.status];
                const totalSteps = ORDER_STEPS.length;
                const progress = order.status === "cancelled" ? 0 : ((stepIdx + 1) / totalSteps) * 100;
                return (
                  <motion.div key={order.id}
                    whileHover={{ scale: 1.005 }}
                    className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden hover:border-[rgb(var(--foreground)/0.12)] transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-sm font-mono">{order.orderNumber}</span>
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${info.color} ${info.bg} ${info.border}`}>
                            {info.label}
                          </span>
                        </div>
                        <p className="text-[rgb(var(--muted))] text-xs">
                          {order.date} · {order.items.length} {order.items.length === 1 ? "товар" : "товара"}
                        </p>
                        {order.estimatedDelivery && (
                          <p className="text-xs text-[rgb(var(--accent))] mt-1 flex items-center gap-1.5">
                            <Truck className="w-3 h-3" />
                            {order.estimatedDelivery}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                        <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                        <ChevronRight className="w-4 h-4 text-[rgb(var(--muted))]" />
                      </div>
                    </div>

                    {/* Progress bar */}
                    {order.status !== "cancelled" && (
                      <div className="h-1 bg-[rgb(var(--surface-2))]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                          className={`h-full ${
                            order.status === "delivered"
                              ? "bg-emerald-400"
                              : "bg-[rgb(var(--accent))]"
                          }`}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {MOCK_ORDERS.length === 0 && (
                <div className="py-12 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                  <Package className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                  <p className="text-[rgb(var(--muted))]">Заказов пока нет</p>
                  <Link href="/marketplace" className="text-[rgb(var(--accent))] text-sm mt-1 inline-block hover:underline">
                    Перейти в каталог
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* ── Wishlist ── */}
          <section>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[rgb(var(--accent))]" />
              Сохранённые товары
              {wishlistSlugs.length > 0 && (
                <span className="text-xs font-normal text-[rgb(var(--muted))]">· {wishlistSlugs.length} шт.</span>
              )}
            </h2>
            {wishlistProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlistProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="py-10 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                <Heart className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                <p className="text-[rgb(var(--muted))] text-sm">Нет сохранённых товаров</p>
                <Link href="/marketplace" className="text-[rgb(var(--accent))] text-sm mt-1 inline-block hover:underline">
                  Добавить из каталога
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Order tracker modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderTracker order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
