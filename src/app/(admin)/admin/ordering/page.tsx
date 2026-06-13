"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Save, Check, Loader2, Pin } from "lucide-react";
import { useCustomProducts } from "@/store/customProducts";
import { useProductMeta } from "@/store/productMeta";
import { useProductOrder } from "@/store/productOrder";
import { getMarketplaceProducts } from "@/data/products";
import type { Product, ProductCategory } from "@/types";

const staticProducts = getMarketplaceProducts();

const CATEGORIES: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all",        label: "Все товары" },
  { value: "shoes",      label: "Кроссовки" },
  { value: "apparel",    label: "Одежда" },
  { value: "accessories",label: "Мячи" },
  { value: "backpacks",  label: "Рюкзаки" },
  { value: "jerseys",    label: "Джерси" },
  { value: "thermals",   label: "Термо бельё" },
];

function DraggableRow({
  product, index, total, onPin,
}: { product: Product; index: number; total: number; onPin: () => void }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={product.id}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2.5 px-3 py-2.5 bg-[#111] border-b border-[#161616] last:border-b-0 hover:bg-[#141414] transition-colors select-none"
    >
      {/* Position number */}
      <span className="w-8 text-center text-xs font-mono font-bold text-[#444] flex-shrink-0">
        {index + 1}
      </span>

      {/* Drag handle */}
      <div
        onPointerDown={e => controls.start(e)}
        className="cursor-grab active:cursor-grabbing text-[#333] hover:text-[#666] transition-colors flex-shrink-0 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Thumbnail */}
      <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#222] flex-shrink-0">
        <Image src={product.image} alt={product.nameRu} fill className="object-cover" sizes="36px" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-white text-sm font-medium truncate">{product.nameRu}</span>
          {product.isFeatured && (
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0">
              Избр.
            </span>
          )}
        </div>
        <span className="text-[#444] text-[10px]">{product.brand}</span>
      </div>

      {/* Pin to top */}
      {index > 0 && (
        <button onClick={onPin} title="В начало списка"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#333] hover:text-amber-400 hover:bg-[#1a1a1a] transition-colors flex-shrink-0">
          <Pin className="w-3 h-3" />
        </button>
      )}
    </Reorder.Item>
  );
}

export default function AdminOrderingPage() {
  const customProds = useCustomProducts(s => s.products);
  const metaMap = useProductMeta(s => s.meta);
  const { getOrder, saveToServer, loadFromServer } = useProductOrder();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mirrors exactly what the marketplace renders — same merge + dedup + delete filter
  const allProducts: Product[] = useMemo(() => {
    const customIds   = new Set(customProds.map(p => p.id));
    const customSlugs = new Set(customProds.map(p => p.slug));
    const deletedIds  = new Set(
      Object.entries(metaMap).filter(([, m]) => m.isDeleted).map(([id]) => id)
    );
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const customNorms = customProds.map(p => norm(p.name));
    const isNameDupe = (name: string) => {
      const n = norm(name);
      return n.length > 8 && customNorms.some(cn => cn.length > 8 && (cn.includes(n) || n.includes(cn)));
    };
    return [
      ...customProds.filter(p => !deletedIds.has(p.id)),
      ...staticProducts.filter(p =>
        !customIds.has(p.id) && !customSlugs.has(p.slug) &&
        !isNameDupe(p.name) && !deletedIds.has(p.id)
      ) as Product[],
    ];
  }, [customProds, metaMap]);

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

  const pin = (id: string) =>
    setLocalOrder(prev => [id, ...prev.filter(x => x !== id)]);

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
          <p className="text-[#555] text-sm mt-0.5">Перетащите товары для изменения порядка</p>
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
        Зажмите <GripVertical className="inline w-3 h-3" /> и перетащите — или используйте кнопку <Pin className="inline w-3 h-3 text-amber-400" /> чтобы поднять товар наверх
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
        {orderedProducts.length > 0 ? (
          <Reorder.Group
            axis="y"
            values={localOrder}
            onReorder={setLocalOrder}
            className="divide-y-0"
          >
            {orderedProducts.map((p, i) => (
              <DraggableRow
                key={p.id}
                product={p}
                index={i}
                total={orderedProducts.length}
                onPin={() => pin(p.id)}
              />
            ))}
          </Reorder.Group>
        ) : (
          <div className="py-16 text-center">
            <p className="text-[#555] text-sm">Товаров в этой категории нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
