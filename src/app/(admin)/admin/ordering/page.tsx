"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, Save, Check, Loader2, Pin } from "lucide-react";
import { useCustomProducts } from "@/store/customProducts";
import { useProductOrder } from "@/store/productOrder";
import { adminProducts } from "@/data/adminData";
import type { Product, ProductCategory } from "@/types";

const CATEGORIES: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "Все товары" },
  { value: "sets", label: "Комплекты" },
  { value: "shoes", label: "Кроссовки" },
  { value: "apparel", label: "Одежда" },
  { value: "accessories", label: "Мячи" },
  { value: "backpacks", label: "Рюкзаки" },
  { value: "jerseys", label: "Джерси" },
  { value: "thermals", label: "Термо бельё" },
];

export default function AdminOrderingPage() {
  const customProds = useCustomProducts(s => s.products);
  const { getOrder, saveToServer, loadFromServer } = useProductOrder();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Merge static + custom products (same logic as marketplace)
  const allProducts: Product[] = useMemo(() => {
    const customIds = new Set(customProds.map(p => p.id));
    return [
      ...customProds,
      ...adminProducts
        .filter(p => !customIds.has(p.id))
        .map(p => ({
          id: p.id, slug: p.slug, name: p.name, nameRu: p.nameRu,
          brand: p.brand, category: p.category as ProductCategory,
          price: p.price, replicaPrice: p.replicaPrice,
          currency: "USD" as const, image: p.image,
          images: p.images ?? [p.image],
          sizes: [] as Product["sizes"], tags: p.tags ?? [],
          descriptionRu: p.nameRu, descriptionUz: p.nameRu,
          sku: p.id, type: p.type, isFeatured: p.isFeatured,
        })),
    ];
  }, [customProds]);

  const categoryProducts = useMemo(() =>
    activeCategory === "all"
      ? allProducts
      : allProducts.filter(p => p.category === activeCategory),
  [allProducts, activeCategory]);

  // Load server orders on mount
  useEffect(() => { loadFromServer(); }, [loadFromServer]);

  // When category changes, build sorted product list using saved order
  useEffect(() => {
    const saved = getOrder(activeCategory);
    if (saved.length === 0) {
      // No custom order: default order (featured first)
      const sorted = [...categoryProducts].sort((a, b) =>
        (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      );
      setLocalOrder(sorted.map(p => p.id));
    } else {
      // Merge: saved order first, then any new products not yet in order
      const savedSet = new Set(saved);
      const inOrder = saved.filter(id => categoryProducts.some(p => p.id === id));
      const newProds = categoryProducts.filter(p => !savedSet.has(p.id)).map(p => p.id);
      setLocalOrder([...inOrder, ...newProds]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, allProducts]);

  const orderedProducts = useMemo(() =>
    localOrder
      .map(id => categoryProducts.find(p => p.id === id))
      .filter(Boolean) as Product[],
  [localOrder, categoryProducts]);

  const move = (index: number, dir: -1 | 1) => {
    const ids = [...localOrder];
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setLocalOrder(ids);
  };

  const pin = (id: string) => {
    // Move to top
    setLocalOrder(prev => [id, ...prev.filter(x => x !== id)]);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveToServer(activeCategory, localOrder);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="p-6 max-w-[900px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-xl">Порядок товаров</h1>
          <p className="text-[#555] text-sm mt-0.5">Управляйте порядком отображения в маркетплейсе</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`flex items-center gap-2 h-10 px-5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-60 ${
            saved ? "bg-emerald-500 text-white" : "bg-red-800 text-white hover:bg-red-900"
          }`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Сохраняем..." : saved ? "Сохранено" : "Сохранить порядок"}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setActiveCategory(c.value)}
            className={`h-9 px-4 rounded-xl text-xs font-semibold uppercase tracking-wide transition-colors ${
              activeCategory === c.value
                ? "bg-red-800 text-white"
                : "bg-[#141414] border border-[#222] text-[#666] hover:text-white hover:border-[#333]"
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-[#444] text-xs mb-4">
        {orderedProducts.length} товаров в категории «{CATEGORIES.find(c => c.value === activeCategory)?.label}»
      </p>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="divide-y divide-[#161616]">
          {orderedProducts.map((p, i) => (
            <div key={p.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#141414] transition-colors group">
              <span className="w-6 text-center text-[#333] text-xs font-mono font-bold flex-shrink-0">
                {i + 1}
              </span>

              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#222] flex-shrink-0">
                <Image src={p.image} alt={p.nameRu} fill className="object-cover" sizes="40px" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium truncate">{p.nameRu}</span>
                  {p.isFeatured && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0">
                      Избранное
                    </span>
                  )}
                </div>
                <span className="text-[#444] text-[11px]">{p.brand} · {p.category}</span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => pin(p.id)} title="Закрепить наверху"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-amber-400 hover:bg-[#1a1a1a] transition-colors">
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1a1a1a] disabled:opacity-20 transition-colors">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === orderedProducts.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1a1a1a] disabled:opacity-20 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {orderedProducts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[#555] text-sm">Товаров в этой категории нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
