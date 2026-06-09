"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Upload, Plus, Edit2, Eye, Save } from "lucide-react";
import { adminProducts, type AdminProduct } from "@/data/adminData";
import { formatPrice } from "@/lib/utils";
import { useProductOverrides } from "@/store/productOverrides";
import { useCustomProducts, buildProductFromForm } from "@/store/customProducts";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import type { Product } from "@/types";

const inputCls = "w-full h-10 px-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors";

export default function AdminMerchPage() {
  const [saved, setSaved] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const overrides    = useProductOverrides(s => s.overrides);
  const { products: customProds, addProduct, updateProduct: updateCustom } = useCustomProducts();
  const [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set());

  // Save handler for Add modal (preset to merch category)
  const handleSaveNew = (data: Partial<AdminProduct> & {
    shoeSizes?: Record<number, boolean>;
    apparelSizes?: Record<string, boolean>;
    descriptionRu?: string;
    replicaDelivery?: string;
    image?: string;
    style?: "basketball" | "lifestyle";
  }) => {
    const product = buildProductFromForm({
      nameRu: data.nameRu ?? "",
      slug: data.slug ?? `merch-${Date.now()}`,
      brand: data.brand ?? "UHA",
      category: "merch",
      type: data.type ?? "in_stock",
      status: "published",
      badge: data.badge ?? "",
      isFeatured: data.isFeatured ?? false,
      estimatedDelivery: data.estimatedDelivery ?? "В наличии",
      price: data.price ?? 0,
      replicaPrice: data.replicaPrice,
      stock: data.stock,
      descriptionRu: data.descriptionRu ?? "",
      shoeSizes: {},
      apparelSizes: data.apparelSizes ?? {},
      image: data.image,
    });
    addProduct(product);
    setShowAddModal(false);
  };

  // Save handler for Edit modal
  const handleSaveEdit = (data: Partial<AdminProduct> & {
    shoeSizes?: Record<number, boolean>;
    apparelSizes?: Record<string, boolean>;
    descriptionRu?: string;
    replicaDelivery?: string;
    image?: string;
  }) => {
    if (!editProduct) return;
    const isCustom = customProds.some(c => c.id === editProduct.id);
    if (isCustom) {
      const cur = customProds.find(c => c.id === editProduct.id)!;
      updateCustom(editProduct.id, {
        nameRu:           data.nameRu           ?? cur.nameRu,
        name:             data.nameRu           ?? cur.nameRu,
        price:            data.price            ?? cur.price,
        replicaPrice:     data.replicaPrice     ?? cur.replicaPrice,
        estimatedDelivery:data.estimatedDelivery?? cur.estimatedDelivery,
        isFeatured:       data.isFeatured       ?? cur.isFeatured ?? false,
        badge:            (data.badge as Product["badge"]) ?? cur.badge,
        descriptionRu:    data.descriptionRu    ?? cur.descriptionRu,
        ...(data.image && !data.image.startsWith("blob:") ? { image: data.image, images: [data.image] } : {}),
      });
    }
    setEditProduct(null);
  };

  // Merge static merch + custom merch
  const staticMerch  = adminProducts.filter(p => p.category === "merch");
  const customMerch  = customProds.filter(p => p.category === "merch").map(p => ({
    id: p.id, slug: p.slug, name: p.name, nameRu: p.nameRu, nameUz: p.nameRu,
    brand: p.brand, category: p.category, price: p.price, replicaPrice: p.replicaPrice,
    status: "published" as const, type: p.type, isFeatured: p.isFeatured ?? false,
    stock: p.inStock, estimatedDelivery: p.estimatedDelivery ?? "7–14 дней",
    image: p.image, images: p.images ?? [], imageCount: p.images?.length || 1, createdAt: "", badge: p.badge,
  }));
  const allMerch = [...customMerch, ...staticMerch];

  const getImage = (p: AdminProduct) =>
    overrides[p.slug]?.mainImage ?? p.image;

  return (
    <div className="p-6 max-w-4xl space-y-5">

      {/* Merch products */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div>
            <h3 className="text-white font-semibold text-sm">Merch товары</h3>
            <p className="text-[#444] text-xs">{allMerch.length} товаров</p>
          </div>
          {/* + Добавить → открывает модалку с preset category=merch */}
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 bg-red-800 text-white text-xs font-bold rounded-xl hover:bg-red-900 transition-colors flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Добавить
          </button>
        </div>

        <div className="divide-y divide-[#161616]">
          {allMerch.map(p => {
            const img = getImage(p);
            return (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#141414] transition-colors group">
                {/* Product image */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#222] flex-shrink-0">
                  {img && !brokenImgs.has(p.id) ? (
                    <Image src={img} alt={p.name} fill className="object-cover" sizes="56px"
                      key={img}
                      onError={() => setBrokenImgs(prev => new Set([...prev, p.id]))} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#444] text-[10px] font-mono text-center px-1">нет фото</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold">{p.nameRu}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-red-500 text-sm font-bold">{formatPrice(p.price)}</span>
                    {p.stock !== undefined && (
                      <span className="text-[#555] text-xs">{p.stock} шт. в наличии</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditProduct(p)}
                    className="w-8 h-8 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-[#666] hover:text-white transition-colors"
                    title="Редактировать">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <a href={`/product/${p.slug}`} target="_blank"
                    className="w-8 h-8 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-[#666] hover:text-white transition-colors"
                    title="Открыть на сайте">
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}

          {allMerch.length === 0 && (
            <div className="py-10 text-center text-[#555] text-sm">Мерч товары не добавлены</div>
          )}
        </div>
      </div>

      {/* Showcase Video */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <h3 className="text-white font-semibold text-sm">3D Showcase видео</h3>
          <p className="text-[#444] text-xs mt-0.5">Используется на hero странице Merch</p>
        </div>
        <div className="p-5 flex items-start gap-5">
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-black border border-[#2a2a2a] flex-shrink-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src="/videos/3d-tee.mov" type="video/quicktime" />
              <source src="/videos/3d-tee.mov" type="video/mp4" />
            </video>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm font-semibold">3d-tee.mov</span>
            </div>
            <p className="text-[#555] text-xs mb-4">MOV · 12.4 MB · Текущее видео</p>
            <div className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-red-800/40 transition-colors">
              <Upload className="w-6 h-6 text-[#555]" />
              <p className="text-[#888] text-sm">Перетащи или нажми для замены</p>
              <p className="text-[#444] text-xs">MOV, MP4 до 50MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Merch page content settings */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <h3 className="text-white font-semibold text-sm">Контент страницы Merch</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Заголовок (RU)</label>
              <input defaultValue="UHA MERCH" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Заголовок (UZ)</label>
              <input defaultValue="UHA MERCH" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Подзаголовок (RU)</label>
              <input defaultValue="Собственная линейка одежды бренда" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">Подзаголовок (UZ)</label>
              <input defaultValue="Brendning o'z kiyim liniyasi" className={inputCls} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl text-sm uppercase tracking-widest transition-all ${
            saved ? "bg-emerald-500 text-white" : "bg-red-800 text-white hover:bg-red-900"
          }`}>
          <Save className="w-4 h-4" />
          {saved ? "Сохранено ✓" : "Сохранить"}
        </button>
      </div>

      {/* Add new merch modal */}
      <AnimatePresence>
        {showAddModal && (
          <ProductFormModal
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveNew as (data: Partial<AdminProduct>) => void}
          />
        )}
      </AnimatePresence>

      {/* Edit merch product modal */}
      <AnimatePresence>
        {editProduct && (
          <ProductFormModal
            product={editProduct}
            onClose={() => setEditProduct(null)}
            onSave={handleSaveEdit as (data: Partial<AdminProduct>) => void}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
