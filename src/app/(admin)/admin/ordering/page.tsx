"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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

/** Editable position badge — click to type a new position, Enter/blur confirms */
function PositionInput({
  position, total, onMove,
}: { position: number; total: number; onMove: (newPos: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(position));
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1 && n <= total && n !== position) {
      onMove(n);
    }
    setEditing(false);
  };

  useEffect(() => {
    if (editing) {
      setVal(String(position));
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, position]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number" min={1} max={total}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className="w-10 h-7 text-center bg-[#2a2a2a] border border-red-800/60 rounded-lg text-white text-xs font-mono font-bold focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Нажмите чтобы ввести позицию"
      className="w-10 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors text-xs font-mono font-bold cursor-text"
    >
      {position}
    </button>
  );
}

export default function AdminOrderingPage() {
  const customProds = useCustomProducts(s => s.products);
  const { getOrder, saveToServer, loadFromServer } = useProductOrder();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  useEffect(() => { loadFromServer(); }, [loadFromServer]);

  useEffect(() => {
    const savedOrder = getOrder(activeCategory);
    if (savedOrder.length === 0) {
      const sorted = [...categoryProducts].sort((a, b) =>
        (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      );
      setLocalOrder(sorted.map(p => p.id));
    } else {
      const savedSet = new Set(savedOrder);
      const inOrder = savedOrder.filter(id => categoryProducts.some(p => p.id === id));
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

  /** Move item from `fromIndex` to `toPosition` (1-based) */
  const moveToPosition = (fromIndex: number, toPosition: number) => {
    const toIndex = toPosition - 1;
    if (toIndex === fromIndex) return;
    const ids = [...localOrder];
    const [item] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, item);
    setLocalOrder(ids);
  };

  const pin = (id: string) => {
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
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-white font-bold text-xl">Порядок товаров</h1>
          <p className="text-[#555] text-sm mt-0.5">Управляйте порядком в маркетплейсе</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`flex items-center gap-2 h-10 px-5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-60 ${
            saved ? "bg-emerald-500 text-white" : "bg-red-800 text-white hover:bg-red-900"
          }`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Сохраняем..." : saved ? "Сохранено" : "Сохранить порядок"}
        </button>
      </div>

      <p className="text-[#444] text-xs mb-5">
        Номер позиции кликабелен — нажмите и введите нужный номер, чтобы быстро переместить товар в любое место списка
      </p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
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
        {orderedProducts.length} товар{orderedProducts.length !== 1 ? "а" : ""} ·
        категория «{CATEGORIES.find(c => c.value === activeCategory)?.label}»
      </p>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="divide-y divide-[#161616]">
          {orderedProducts.map((p, i) => (
            <div key={p.id}
              className="flex items-center gap-2 px-3 py-2.5 hover:bg-[#141414] transition-colors group">

              {/* Editable position number */}
              <PositionInput
                position={i + 1}
                total={orderedProducts.length}
                onMove={(newPos) => moveToPosition(i, newPos)}
              />

              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#222] flex-shrink-0">
                <Image src={p.image} alt={p.nameRu} fill className="object-cover" sizes="36px" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-medium truncate">{p.nameRu}</span>
                  {p.isFeatured && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0">
                      Избр.
                    </span>
                  )}
                </div>
                <span className="text-[#444] text-[10px]">{p.brand}</span>
              </div>

              {/* Action buttons — visible on hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => pin(p.id)} title="В начало списка"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-amber-400 hover:bg-[#1a1a1a] transition-colors">
                  <Pin className="w-3 h-3" />
                </button>
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1a1a1a] disabled:opacity-20 transition-colors">
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === orderedProducts.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#444] hover:text-white hover:bg-[#1a1a1a] disabled:opacity-20 transition-colors">
                  <ChevronDown className="w-3 h-3" />
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
