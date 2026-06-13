"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, ChevronUp, ChevronDown, X,
  Users, Save, Search, Check, Loader2, Upload,
} from "lucide-react";
import { usePlayerSets } from "@/store/playerSets";
import { useCustomProducts } from "@/store/customProducts";
import { adminProducts } from "@/data/adminData";
import { formatPrice } from "@/lib/utils";
import type { PlayerSet, Product, ProductCategory } from "@/types";

const inputCls = "w-full h-10 px-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors";
const areaCls = "w-full px-3.5 py-2.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors resize-none";

type SetForm = {
  name: string;
  description: string;
  creatorName: string;
  heroImage: string;
  productIds: string[];
  type: PlayerSet["type"];
};

const EMPTY_FORM: SetForm = {
  name: "", description: "", creatorName: "", heroImage: "", productIds: [], type: "player",
};

export default function AdminSetsPage() {
  const { sets, addSet, updateSet, removeSet } = usePlayerSets();
  const customProds = useCustomProducts(s => s.products);

  const [editing, setEditing] = useState<PlayerSet | "new" | null>(null);
  const [form, setForm] = useState<SetForm>(EMPTY_FORM);
  const [productSearch, setProductSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Merge static + custom products for the picker
  const allProducts: Product[] = useMemo(() => {
    const customIds = new Set(customProds.map(p => p.id));
    return [
      ...customProds,
      ...adminProducts
        .filter(p => !customIds.has(p.id))
        .map(p => ({
          id: p.id, slug: p.slug, name: p.name, nameRu: p.nameRu,
          brand: p.brand, category: p.category as ProductCategory, price: p.price,
          replicaPrice: p.replicaPrice, currency: "USD" as const,
          image: p.image, images: p.images ?? [p.image],
          sizes: [] as Product["sizes"], tags: p.tags ?? [],
          descriptionRu: p.nameRu, descriptionUz: p.nameRu,
          sku: p.id, type: p.type, isFeatured: p.isFeatured,
        })),
    ];
  }, [customProds]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return allProducts;
    const q = productSearch.toLowerCase();
    return allProducts.filter(p =>
      p.nameRu.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  }, [allProducts, productSearch]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing("new");
  };

  const openEdit = (s: PlayerSet) => {
    setForm({
      name: s.name, description: s.description,
      creatorName: s.creatorName, heroImage: s.heroImage,
      productIds: [...s.productIds], type: s.type ?? "player",
    });
    setEditing(s);
  };

  const handleUploadHero = async (file: File) => {
    setUploading(true);
    try {
      const token = localStorage.getItem("uha-admin-token") ?? "";
      const fd = new FormData();
      fd.append("slug", "player-sets");   // API requires slug field
      fd.append("files", file);           // API expects "files" (plural)
      const res = await fetch("/api/admin/upload", {
        method: "POST", headers: { "x-admin-token": token }, body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `HTTP ${res.status}`);
      }
      const { paths } = await res.json();  // API returns paths[], not url
      setForm(f => ({ ...f, heroImage: paths[0] }));
    } catch (e) {
      alert(`Ошибка загрузки: ${e}`);
    } finally {
      setUploading(false);
    }
  };

  const toggleProduct = (id: string) => {
    setForm(f => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter(p => p !== id)
        : [...f.productIds, id],
    }));
  };

  const moveProduct = (index: number, dir: -1 | 1) => {
    const ids = [...form.productIds];
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setForm(f => ({ ...f, productIds: ids }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();

    if (editing === "new") {
      const newSet: PlayerSet = {
        id: `set-${Date.now()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        creatorName: form.creatorName.trim(),
        heroImage: form.heroImage,
        productIds: form.productIds,
        displayOrder: sets.length,
        createdAt: now,
        type: form.type,
        isActive: true,
      };
      addSet(newSet);
    } else if (editing) {
      updateSet(editing.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        creatorName: form.creatorName.trim(),
        heroImage: form.heroImage,
        productIds: form.productIds,
        type: form.type,
      });
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditing(null); }, 900);
  };

  const moveSet = (index: number, dir: -1 | 1) => {
    const sorted = [...sets].sort((a, b) => a.displayOrder - b.displayOrder);
    const target = index + dir;
    if (target < 0 || target >= sorted.length) return;
    // Swap displayOrder values
    const aId = sorted[index].id;
    const bId = sorted[target].id;
    const aOrder = sorted[index].displayOrder;
    const bOrder = sorted[target].displayOrder;
    updateSet(aId, { displayOrder: bOrder });
    updateSet(bId, { displayOrder: aOrder });
  };

  const sortedSets = [...sets].sort((a, b) => a.displayOrder - b.displayOrder);

  const getSetProducts = (productIds: string[]) =>
    productIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean) as Product[];

  return (
    <div className="p-6 max-w-[1100px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-xl">Сеты игроков</h1>
          <p className="text-[#555] text-sm mt-0.5">Кураторские подборки от игроков и создателей</p>
        </div>
        <button onClick={openNew}
          className="h-10 px-5 bg-red-800 text-white text-xs font-bold rounded-xl hover:bg-red-900 transition-colors flex items-center gap-2 uppercase tracking-wide">
          <Plus className="w-4 h-4" /> Новый сет
        </button>
      </div>

      {/* Sets list */}
      <div className="space-y-3">
        {sortedSets.map((s, i) => {
          const prods = getSetProducts(s.productIds);
          const total = prods.reduce((sum, p) => sum + p.price, 0);
          return (
            <motion.div key={s.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* Hero image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#222] flex-shrink-0">
                  {s.heroImage ? (
                    <Image src={s.heroImage} alt={s.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏀</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-semibold text-sm">{s.name}</span>
                    {s.type && s.type !== "player" && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400">
                        {s.type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[#555] text-xs">
                    <Users className="w-3 h-3" />
                    <span>{s.creatorName || "—"}</span>
                    <span>·</span>
                    <span>{s.productIds.length} товар{s.productIds.length !== 1 ? "а" : ""}</span>
                    {total > 0 && <><span>·</span><span className="text-red-400 font-semibold">{formatPrice(total)}</span></>}
                  </div>
                  {s.description && (
                    <p className="text-[#444] text-xs mt-0.5 line-clamp-1">{s.description}</p>
                  )}
                </div>

                {/* Ordering + actions */}
                <div className="flex items-center gap-1">
                  <button onClick={() => moveSet(i, -1)} disabled={i === 0}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1a1a1a] disabled:opacity-20 transition-colors">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveSet(i, 1)} disabled={i === sortedSets.length - 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1a1a1a] disabled:opacity-20 transition-colors">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => openEdit(s)}
                    className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-white transition-colors ml-1">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Удалить «${s.name}»?`)) removeSet(s.id); }}
                    className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {sets.length === 0 && (
          <div className="py-16 text-center bg-[#111] border border-[#1a1a1a] rounded-2xl">
            <div className="text-4xl mb-3">🏀</div>
            <p className="text-[#555] text-sm">Сетов пока нет. Создайте первый!</p>
          </div>
        )}
      </div>

      {/* Edit / Create modal */}
      <AnimatePresence>
        {editing !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40" onClick={() => setEditing(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-8 bottom-8 max-w-3xl mx-auto z-50 bg-[#111] border border-[#222] rounded-2xl overflow-hidden flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
                <h2 className="text-white font-bold text-base">
                  {editing === "new" ? "Создать сет" : "Редактировать сет"}
                </h2>
                <button onClick={() => setEditing(null)}
                  className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1.5">Название сета *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Arslan's Court Essentials" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1.5">Создатель / Игрок</label>
                    <input value={form.creatorName} onChange={e => setForm(f => ({ ...f, creatorName: e.target.value }))}
                      placeholder="Arslan Shipulin" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1.5">Тип подборки</label>
                    <select value={form.type ?? "player"}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as PlayerSet["type"] }))}
                      className={inputCls + " appearance-none"}>
                      <option value="player">Игрок</option>
                      <option value="creator">Создатель</option>
                      <option value="athlete">Атлет</option>
                      <option value="featured">Рекомендуем</option>
                      <option value="seasonal">Сезонная</option>
                      <option value="sponsored">Sponsored</option>
                      <option value="campaign">Кампания</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1.5">Описание</label>
                    <textarea value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={2} placeholder="Для вечерних игр на площадке..."
                      className={areaCls} />
                  </div>
                </div>

                {/* Hero image */}
                <div>
                  <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1.5">Главное фото</label>
                  <div className="flex gap-3 items-start">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] flex-shrink-0">
                      {form.heroImage ? (
                        <Image src={form.heroImage} alt="hero" fill className="object-cover" sizes="96px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#444] text-3xl">🏀</div>
                      )}
                    </div>
                    <label className="flex-1 border-2 border-dashed border-[#2a2a2a] rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-red-800/40 transition-colors">
                      {uploading ? (
                        <Loader2 className="w-5 h-5 text-[#555] animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-[#555]" />
                      )}
                      <span className="text-[#666] text-xs">{uploading ? "Загрузка..." : "Загрузить фото"}</span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => { if (e.target.files?.[0]) handleUploadHero(e.target.files[0]); }} />
                    </label>
                  </div>
                </div>

                {/* Product picker */}
                <div>
                  <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-2">
                    Товары в сете ({form.productIds.length})
                  </label>

                  {/* Selected products (ordered) */}
                  {form.productIds.length > 0 && (
                    <div className="mb-3 space-y-1.5">
                      {form.productIds.map((id, idx) => {
                        const p = allProducts.find(x => x.id === id);
                        if (!p) return null;
                        return (
                          <div key={id} className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#222] flex-shrink-0">
                              <Image src={p.image} alt={p.nameRu} fill className="object-cover" sizes="32px" />
                            </div>
                            <span className="flex-1 text-white text-xs font-medium truncate">{p.nameRu}</span>
                            <span className="text-red-400 text-xs font-bold flex-shrink-0">{formatPrice(p.price)}</span>
                            <div className="flex gap-0.5">
                              <button onClick={() => moveProduct(idx, -1)} disabled={idx === 0}
                                className="w-6 h-6 flex items-center justify-center text-[#444] hover:text-white disabled:opacity-20 transition-colors">
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button onClick={() => moveProduct(idx, 1)} disabled={idx === form.productIds.length - 1}
                                className="w-6 h-6 flex items-center justify-center text-[#444] hover:text-white disabled:opacity-20 transition-colors">
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <button onClick={() => toggleProduct(id)}
                                className="w-6 h-6 flex items-center justify-center text-[#444] hover:text-red-500 transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Product search + add */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
                    <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                      placeholder="Поиск товаров для добавления..."
                      className="w-full h-9 pl-9 pr-4 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-xs placeholder:text-[#444] focus:outline-none focus:border-red-800/50 transition-colors" />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredProducts
                      .filter(p => !form.productIds.includes(p.id))
                      .slice(0, 30)
                      .map(p => (
                        <button key={p.id} onClick={() => toggleProduct(p.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left group">
                          <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-[#222] flex-shrink-0">
                            <Image src={p.image} alt={p.nameRu} fill className="object-cover" sizes="28px" />
                          </div>
                          <span className="flex-1 text-[#888] group-hover:text-white text-xs truncate transition-colors">
                            {p.nameRu}
                          </span>
                          <span className="text-[#555] text-xs">{formatPrice(p.price)}</span>
                          <Check className="w-3 h-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#1a1a1a] flex justify-end gap-3">
                <button onClick={() => setEditing(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#222] text-[#666] text-sm hover:text-white hover:border-[#333] transition-colors">
                  Отмена
                </button>
                <button onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    saved ? "bg-emerald-500 text-white" : "bg-red-800 text-white hover:bg-red-900"
                  }`}>
                  {saved ? <><Check className="w-4 h-4" /> Сохранено</> : <><Save className="w-4 h-4" /> Сохранить</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
