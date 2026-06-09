"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, StarOff, Save, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { adminProducts } from "@/data/adminData";
import { useProductMeta } from "@/store/productMeta";
import { useProductOverrides } from "@/store/productOverrides";
import { useCustomProducts } from "@/store/customProducts";
import { useHeroContent } from "@/store/heroContent";

const inputCls = "w-full h-10 px-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors";

export default function AdminHomepagePage() {
  const { featuredOrder, setFeaturedOrder, setFeatured, meta: savedMeta } = useProductMeta();
  const overrides = useProductOverrides(s => s.overrides);
  const customProds = useCustomProducts(s => s.products);
  const { hero, setHero, setStat } = useHeroContent();

  // Local draft so hero changes only persist on Save
  const [heroDraft, setHeroDraft] = useState({ ...hero });
  const setHeroField =
    (key: keyof typeof heroDraft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setHeroDraft((prev) => ({ ...prev, [key]: e.target.value }));
  const setStatDraft = (i: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const stats = [...heroDraft.stats] as typeof heroDraft.stats;
      stats[i as 0 | 1 | 2 | 3] = e.target.value;
      setHeroDraft((prev) => ({ ...prev, stats }));
    };

  // Convert custom products to AdminProduct-like shape for display
  const customAsAdmin = customProds.map(p => ({
    id: p.id, slug: p.slug, name: p.name, nameRu: p.nameRu, nameUz: p.nameRu,
    brand: p.brand, category: p.category, price: p.price, replicaPrice: p.replicaPrice,
    status: "published" as const, type: p.type, isFeatured: p.isFeatured ?? false,
    stock: p.inStock, estimatedDelivery: p.estimatedDelivery ?? "14–21 дней",
    image: p.image, imageCount: 1, createdAt: "", badge: p.badge,
  }));

  // All products (static + custom)
  const allAdminProducts = [...customAsAdmin, ...adminProducts];

  // Init: use saved order if exists, otherwise use isFeatured (with meta overrides)
  const initialList = featuredOrder.length > 0
    ? featuredOrder
        .map(id => allAdminProducts.find(p => p.id === id))
        .filter(Boolean) as typeof adminProducts
    : allAdminProducts.filter(p => {
        const m = savedMeta[p.id];
        return m?.isFeatured !== undefined ? m.isFeatured : p.isFeatured;
      });

  const [featuredList, setFeaturedList] = useState(initialList);
  const [saved, setSaved] = useState(false);

  const moveUp = (i: number) => {
    if (i === 0) return;
    const arr = [...featuredList];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    setFeaturedList(arr);
  };
  const moveDown = (i: number) => {
    if (i === featuredList.length - 1) return;
    const arr = [...featuredList];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    setFeaturedList(arr);
  };
  const remove = (id: string) => setFeaturedList(prev => prev.filter(p => p.id !== id));

  const handleSave = () => {
    const featuredIds = new Set(featuredList.map(f => f.id));
    // Save ordered IDs to persistent store
    setFeaturedOrder(featuredList.map(p => p.id));
    // Sync isFeatured meta for ALL products (static + custom) — M-14 fix
    allAdminProducts.forEach(p => {
      setFeatured(p.id, featuredIds.has(p.id));
    });
    // Persist hero content (H-4 fix)
    setHero(heroDraft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="space-y-5">

        {/* Hero section */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Hero секция</h3>
              <p className="text-[#444] text-xs mt-0.5">Главный заголовок и описание</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400">
              <Eye className="w-3.5 h-3.5" /> Предпросмотр
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Бейдж (RU)</label>
                <input value={heroDraft.badgeRu} onChange={setHeroField("badgeRu")} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Бейдж (UZ)</label>
                <input value={heroDraft.badgeUz} onChange={setHeroField("badgeUz")} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Заголовок (RU)</label>
              <input value={heroDraft.titleRu} onChange={setHeroField("titleRu")} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Заголовок (UZ)</label>
              <input value={heroDraft.titleUz} onChange={setHeroField("titleUz")} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Описание (RU)</label>
                <textarea rows={3} value={heroDraft.descRu} onChange={setHeroField("descRu")}
                  className={`${inputCls} resize-none h-auto py-2.5`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Описание (UZ)</label>
                <textarea rows={3} value={heroDraft.descUz} onChange={setHeroField("descUz")}
                  className={`${inputCls} resize-none h-auto py-2.5`} />
              </div>
            </div>
          </div>
        </div>

        {/* Featured products */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <h3 className="text-white font-semibold text-sm">Избранные товары</h3>
            <p className="text-[#444] text-xs mt-0.5">Товары на главной странице · Порядок меняет drag</p>
          </div>
          <div className="p-5">
            <div className="space-y-2">
              {featuredList.map((p, i) => (
                <motion.div key={p.id} layout
                  className="flex items-center gap-3 p-3 bg-[#181818] border border-[#222] rounded-xl">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#222] flex-shrink-0">
                    <Image src={overrides[p.slug]?.mainImage ?? p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.nameRu}</p>
                    <p className="text-[#555] text-xs">{p.brand} · ${p.price}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveUp(i)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-30"
                      disabled={i === 0}>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveDown(i)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-30"
                      disabled={i === featuredList.length - 1}>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(p.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-red-500 hover:bg-red-500/10 transition-colors">
                      <StarOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add from catalog */}
            <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
              <p className="text-[#555] text-xs mb-2">Добавить товар</p>
              <select className={inputCls}
                onChange={(e) => {
                  const found = allAdminProducts.find(p => p.id === e.target.value);
                  if (found && !featuredList.find(p => p.id === found.id)) {
                    setFeaturedList(prev => [...prev, found]);
                  }
                }}>
                <option value="">— Выбрать из каталога —</option>
                {allAdminProducts.filter(p => !featuredList.find(f => f.id === p.id)).map(p => (
                  <option key={p.id} value={p.id}>{p.nameRu}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats block */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <h3 className="text-white font-semibold text-sm">Блок статистики (Hero)</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            {heroDraft.stats.map((stat, i) => (
              <input key={i} value={stat} onChange={setStatDraft(i)} className={inputCls} />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl text-sm uppercase tracking-widest transition-all ${
              saved ? "bg-emerald-500 text-white" : "bg-red-800 text-white hover:bg-red-900"
            }`}>
            <Save className="w-4 h-4" />
            {saved ? "Сохранено ✓" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
