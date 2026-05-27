"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Package, ShoppingCart, TrendingUp, Star, Clock,
  ArrowUpRight, DollarSign, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import { adminProducts } from "@/data/adminData";
import { useOrdersStore } from "@/store/orders";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  processing: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  ordered: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  cancelled: "bg-red-500/15 text-red-500 border-red-500/25",
};
const STATUS_LABEL: Record<string, string> = {
  new: "Новый", processing: "В работе", ordered: "Заказан",
  delivered: "Доставлен", cancelled: "Отменён",
};

export default function AdminDashboard() {
  const orders = useOrdersStore(s => s.orders);
  const fetched = useOrdersStore(s => s.fetched);
  const fetchOrders = useOrdersStore(s => s.fetchOrders);

  useEffect(() => {
    if (!fetched) fetchOrders();
  }, [fetched, fetchOrders]);

  const recentOrders = orders.slice(0, 5);
  const recentProducts = adminProducts.filter(p => p.status === "published").slice(0, 4);

  const STATS = {
    totalProducts: adminProducts.length,
    publishedProducts: adminProducts.length,
    totalOrders: orders.length,
    newOrders: orders.filter(o => o.status === "new").length,
    revenue: orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
    featuredProducts: adminProducts.filter(p => p.isFeatured).length,
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Добро пожаловать 👋</h2>
          <p className="text-[#555] text-sm mt-0.5">UHA SHOP Admin Dashboard</p>
        </div>
        <Link href="/" target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#222] rounded-xl text-sm text-[#888] hover:text-white hover:border-[#333] transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5" />
          Открыть сайт
        </Link>
      </div>

      {/* Stats grid */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Всего товаров", value: STATS.totalProducts, sub: `${STATS.publishedProducts} опубликовано`, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Новых заказов", value: STATS.newOrders, sub: `${STATS.totalOrders} всего`, icon: ShoppingCart, color: "text-red-500", bg: "bg-red-800/10 border-red-800/20" },
          { label: "Выручка", value: `$${STATS.revenue}`, sub: "За всё время", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Избранных", value: STATS.featuredProducts, sub: "На главной", icon: Star, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <motion.div key={label} variants={fadeUp}
            className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5 hover:border-[#262626] transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bg}`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
            </div>
            <div className="text-white text-2xl font-bold mb-0.5">{value}</div>
            <div className="text-[#444] text-xs">{label}</div>
            <div className="text-[#333] text-[11px] mt-0.5">{sub}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent orders */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-3 bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <h3 className="text-white font-semibold text-sm">Последние заказы</h3>
            <Link href="/admin/orders" className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1">
              Все заказы <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#161616]">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#141414] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white text-sm font-medium">{order.customer}</span>
                    <span className="text-[#444] text-[11px]">{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#555] text-xs">{order.telegram}</span>
                    <span className="text-[#333]">·</span>
                    <span className="text-[#555] text-xs">{order.city}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white text-sm font-semibold mb-1">${order.total}</div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent products */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <h3 className="text-white font-semibold text-sm">Товары</h3>
            <Link href="/admin/products" className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1">
              Все <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#161616]">
            {recentProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#141414] transition-colors">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-[#222]">
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{p.nameRu}</p>
                  <p className="text-[#555] text-[11px]">{p.brand} · ${p.price}</p>
                </div>
                <div className="flex-shrink-0">
                  {p.isFeatured && (
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Добавить товар", href: "/admin/products", icon: Package, color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
          { label: "Просмотр заказов", href: "/admin/orders", icon: ShoppingCart, color: "bg-red-800/10 border-red-800/20 text-red-500" },
          { label: "Загрузить медиа", href: "/admin/media", icon: AlertCircle, color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
          { label: "Настройки сайта", href: "/admin/settings", icon: CheckCircle2, color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={label} href={href}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${color} hover:opacity-80 transition-opacity`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
