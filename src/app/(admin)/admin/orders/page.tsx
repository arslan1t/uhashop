"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, XCircle, MessageCircle, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { type AdminOrder } from "@/data/adminData";
import { useOrdersStore } from "@/store/orders";

type OrderStatus = AdminOrder["status"] | "all";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  processing: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  ordered: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  cancelled: "bg-red-500/15 text-red-500 border-red-500/25",
};
const STATUS_LABELS: Record<string, string> = {
  new: "Новый", processing: "В работе", ordered: "Заказан",
  delivered: "Доставлен", cancelled: "Отменён",
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  // ── Zustand store — fetches from Supabase ────────────────────────────
  const orders = useOrdersStore(s => s.orders);
  const loading = useOrdersStore(s => s.loading);
  const fetched = useOrdersStore(s => s.fetched);
  const fetchOrders = useOrdersStore(s => s.fetchOrders);
  const updateStatus = useOrdersStore(s => s.updateStatus);

  useEffect(() => {
    if (!fetched) fetchOrders();
  }, [fetched, fetchOrders]);

  const handleUpdateStatus = (id: string, status: AdminOrder["status"]) => {
    updateStatus(id, status);
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleRefresh = () => {
    useOrdersStore.getState().resetOrders();
    fetchOrders();
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      o.customer.toLowerCase().includes(q) ||
      o.telegram.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {(["all", "new", "processing", "ordered", "delivered"] as OrderStatus[]).map(s => {
          const count = s === "all"
            ? orders.length
            : orders.filter(o => o.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-3 rounded-2xl border text-left transition-all ${
                statusFilter === s
                  ? "border-red-800/50 bg-red-800/10"
                  : "border-[#1a1a1a] bg-[#111] hover:border-[#262626]"
              }`}>
              <div className={`text-lg font-bold ${statusFilter === s ? "text-red-500" : "text-white"}`}>
                {count}
              </div>
              <div className="text-[#555] text-[11px] uppercase tracking-wider">
                {s === "all" ? "Всего" : STATUS_LABELS[s]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search + Refresh */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по клиенту, Telegram, номеру заказа..."
            className="w-full h-10 pl-10 pr-4 bg-[#141414] border border-[#222] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/50 transition-colors"
          />
        </div>
        <button onClick={handleRefresh} disabled={loading}
          className="h-10 px-3 bg-[#141414] border border-[#222] rounded-xl text-[#666] hover:text-white hover:border-red-800/50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Orders table */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["Заказ", "Клиент", "Товары", "Сумма", "Тип", "Статус", "Дата", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {filtered.map((order) => (
                <motion.tr key={order.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-[#141414] transition-colors group cursor-pointer"
                  onClick={() => setSelected(order)}>
                  <td className="px-4 py-3">
                    <span className="text-white text-sm font-mono font-semibold">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white text-sm font-medium">{order.customer}</div>
                    <div className="text-[#555] text-xs flex items-center gap-1">
                      <Send className="w-2.5 h-2.5" />
                      {order.telegram}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white text-sm">{order.products.length} поз.</div>
                    <div className="text-[#555] text-xs truncate max-w-[160px]">
                      {order.products.map(p => p.name).join(", ")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-semibold text-sm">${order.total}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      order.type === "preorder"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {order.type === "preorder" ? "Предзаказ" : "В наличии"}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value as AdminOrder["status"])}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer bg-transparent focus:outline-none ${STATUS_STYLES[order.status]}`}>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v} className="bg-[#111] text-white normal-case">{l}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#555] text-xs whitespace-nowrap">{order.createdAt}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/${order.telegram.replace("@", "")}`, "_blank"); }}
                      className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#555] hover:text-[#2AABEE] transition-colors opacity-0 group-hover:opacity-100">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && !fetched && (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto mb-3" />
            <p className="text-[#555] text-sm">Загрузка заказов...</p>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-[#555] text-sm">
            Заказы не найдены
          </div>
        )}
      </div>

      {/* Order detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
            <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
              className="bg-[#111] border border-[#1f1f1f] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">

              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
                <div>
                  <h2 className="text-white font-semibold">{selected.orderNumber}</h2>
                  <p className="text-[#555] text-xs">{selected.createdAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${STATUS_STYLES[selected.status]}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-white transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Customer */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#1a1a1a] rounded-xl">
                    <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Клиент</p>
                    <p className="text-white text-sm font-medium">{selected.customer}</p>
                  </div>
                  <div className="p-3 bg-[#1a1a1a] rounded-xl">
                    <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Telegram</p>
                    <a href={`https://t.me/${selected.telegram.replace("@", "")}`} target="_blank"
                      className="text-[#2AABEE] text-sm font-medium hover:underline flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      {selected.telegram}
                    </a>
                  </div>
                  {selected.phone && (
                    <div className="p-3 bg-[#1a1a1a] rounded-xl">
                      <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Телефон</p>
                      <p className="text-white text-sm">{selected.phone}</p>
                    </div>
                  )}
                  <div className="p-3 bg-[#1a1a1a] rounded-xl">
                    <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Город</p>
                    <p className="text-white text-sm">{selected.city}</p>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <p className="text-[#555] text-[10px] uppercase tracking-wider mb-2">Состав заказа</p>
                  <div className="space-y-2">
                    {selected.products.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl">
                        <div>
                          <p className="text-white text-sm">{p.name}</p>
                          <p className="text-[#555] text-xs">{p.size} · ×{p.qty} · {p.version}</p>
                        </div>
                        <span className="text-white font-semibold text-sm">${p.price * p.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between p-4 bg-red-800/10 rounded-xl border border-red-800/20">
                  <span className="text-red-500 font-semibold">Итого</span>
                  <span className="text-white text-xl font-bold">${selected.total}</span>
                </div>

                {selected.notes && (
                  <div className="p-3 bg-[#1a1a1a] rounded-xl">
                    <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Примечание</p>
                    <p className="text-white text-sm">{selected.notes}</p>
                  </div>
                )}

                {/* Status update */}
                <div className="flex items-center gap-2">
                  <select value={selected.status}
                    onChange={(e) => handleUpdateStatus(selected.id, e.target.value as AdminOrder["status"])}
                    className="flex-1 h-10 px-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm focus:outline-none focus:border-red-800/60">
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <a href={`https://t.me/${selected.telegram.replace("@", "")}`} target="_blank"
                    className="h-10 px-5 bg-[#2AABEE] text-white font-bold rounded-xl hover:bg-[#1a9ad7] transition-colors text-sm flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Telegram
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
