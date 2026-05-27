"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Percent, DollarSign, Edit2, X, Check } from "lucide-react";
import { usePromoStore, type PromoCode } from "@/store/promoCodes";
import { formatPrice } from "@/lib/utils";

const inputCls = "w-full h-10 px-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors";

type NewCode = Omit<PromoCode, "id" | "usedCount">;
const emptyForm = (): NewCode => ({
  code: "",
  discountType: "percent",
  discountValue: 10,
  minOrder: undefined,
  maxUses: undefined,
  active: true,
  expiresAt: undefined,
});

export default function AdminPromosPage() {
  const { codes, addCode, updateCode, removeCode, toggleActive } = usePromoStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NewCode>(emptyForm());
  const [saved, setSaved] = useState(false);

  const set = (key: keyof NewCode) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const v = e.target.type === "number" ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value;
      setForm(f => ({ ...f, [key]: v }));
    };

  const handleSubmit = () => {
    if (!form.code.trim() || !form.discountValue) return;
    const upper = { ...form, code: form.code.toUpperCase().trim() };
    if (editId) {
      updateCode(editId, upper);
    } else {
      addCode(upper);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditId(null); setForm(emptyForm()); }, 900);
  };

  const handleEdit = (c: PromoCode) => {
    setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minOrder: c.minOrder, maxUses: c.maxUses, active: c.active, expiresAt: c.expiresAt });
    setEditId(c.id);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">Промокоды</h1>
          <p className="text-[#555] text-sm mt-0.5">{codes.length} кодов · {codes.filter(c => c.active).length} активных</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm()); }}
          className="h-10 px-5 bg-red-800 text-white text-xs font-bold rounded-xl hover:bg-red-900 transition-colors flex items-center gap-2 uppercase tracking-wide">
          <Plus className="w-4 h-4" />
          Новый промокод
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Всего кодов", val: codes.length },
          { label: "Активных", val: codes.filter(c => c.active).length },
          { label: "Использований", val: codes.reduce((s, c) => s + c.usedCount, 0) },
        ].map(s => (
          <div key={s.label} className="p-4 bg-[#111] border border-[#1a1a1a] rounded-2xl">
            <div className="text-2xl font-bold text-white">{s.val}</div>
            <div className="text-[#555] text-xs mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {["Промокод", "Скидка", "Мин. заказ", "Использований", "Статус", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#161616]">
            {codes.map(c => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="hover:bg-[#141414] transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="text-white font-mono font-bold text-sm tracking-widest">{c.code}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {c.discountType === "percent"
                      ? <Percent className="w-3.5 h-3.5 text-emerald-400" />
                      : <DollarSign className="w-3.5 h-3.5 text-blue-400" />}
                    <span className={`font-bold text-sm ${c.discountType === "percent" ? "text-emerald-400" : "text-blue-400"}`}>
                      {c.discountType === "percent" ? `${c.discountValue}%` : `$${c.discountValue}`}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#888] text-sm">
                  {c.minOrder ? `$${c.minOrder}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-white text-sm">{c.usedCount}</span>
                  {c.maxUses && <span className="text-[#555] text-xs"> / {c.maxUses}</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(c.id)}
                    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border transition-all ${
                      c.active
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-[#1a1a1a] text-[#555] border-[#2a2a2a]"
                    }`}>
                    {c.active ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                    {c.active ? "Активен" : "Выкл."}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(c)}
                      className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-white transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeCode(c.id)}
                      className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 && (
          <div className="py-16 text-center text-[#555] text-sm">Промокоды не созданы</div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[#111] border border-[#1f1f1f] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
                <h2 className="text-white font-semibold">{editId ? "Редактировать промокод" : "Новый промокод"}</h2>
                <button onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1.5">Код *</label>
                  <input value={form.code} onChange={set("code")} placeholder="HOOPER20"
                    className={`${inputCls} uppercase`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1.5">Тип скидки</label>
                    <select value={form.discountType} onChange={set("discountType")}
                      className={inputCls}>
                      <option value="percent">Процент (%)</option>
                      <option value="fixed">Фиксированная ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1.5">
                      Размер скидки {form.discountType === "percent" ? "(%)" : "($)"}
                    </label>
                    <input type="number" min="1" max={form.discountType === "percent" ? 100 : undefined}
                      value={form.discountValue} onChange={set("discountValue")}
                      className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1.5">Мин. сумма ($)</label>
                    <input type="number" min="0" value={form.minOrder ?? ""} onChange={set("minOrder")}
                      placeholder="0 = без ограничений"
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1.5">Макс. использований</label>
                    <input type="number" min="1" value={form.maxUses ?? ""} onChange={set("maxUses")}
                      placeholder="∞ = не ограничено"
                      className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1.5">Дата истечения (необязательно)</label>
                  <input type="date" value={form.expiresAt ?? ""} onChange={set("expiresAt")}
                    className={inputCls} />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`relative w-10 h-6 rounded-full transition-colors ${form.active ? "bg-emerald-500" : "bg-[#2a2a2a]"}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.active ? "left-5" : "left-1"}`} />
                  </button>
                  <span className="text-sm text-[#888]">{form.active ? "Активен" : "Отключён"}</span>
                </div>
                <button onClick={handleSubmit}
                  className={`w-full h-11 rounded-xl font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                    saved ? "bg-emerald-500 text-white" : "bg-red-800 hover:bg-red-900 text-white"
                  }`}>
                  {saved ? <><Check className="w-4 h-4" /> Сохранено</> : (editId ? "Сохранить изменения" : "Создать промокод")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
