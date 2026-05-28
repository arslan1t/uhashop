"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Star, StarOff, Eye, Edit2, Trash2,
  Package, CheckCircle2, Clock, EyeOff
} from "lucide-react";
import { adminProducts, type AdminProduct } from "@/data/adminData";
import { formatPrice } from "@/lib/utils";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { useProductOverrides } from "@/store/productOverrides";
import { useProductVisibility } from "@/store/productVisibility";
import { useCustomProducts, buildProductFromForm } from "@/store/customProducts";
import type { Product } from "@/types";
import { useProductMeta } from "@/store/productMeta";

type FilterType = "all" | "published" | "draft" | "preorder" | "in_stock";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  draft: "bg-[#2a2a2a] text-[#666] border-[#333]",
  archived: "bg-red-500/10 text-red-500 border-red-500/20",
};
const BADGE_STYLES: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400",
  popular: "bg-emerald-500/15 text-emerald-400",
  limited: "bg-purple-500/15 text-purple-400",
};

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const savedMeta = useProductMeta(s => s.meta);
  const [staticProducts, setStaticProducts] = useState(() =>
    adminProducts.map(p => ({
      ...p,
      isFeatured: savedMeta[p.id]?.isFeatured ?? p.isFeatured,
      status: (savedMeta[p.id]?.status ?? p.status) as typeof p.status,
    }))
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const overrides = useProductOverrides(s => s.overrides);
  const { isHidden, toggleHidden } = useProductVisibility();
  const { products: customProds, addProduct, removeProduct: removeCustom, updateProduct: updateCustom } = useCustomProducts();
  const { setFeatured, setStatus, setDeleted, getMeta } = useProductMeta();

  // Merge static + custom products for display
  const customAsAdmin: AdminProduct[] = customProds.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    nameRu: p.nameRu,
    nameUz: p.nameRu,
    brand: p.brand,
    category: p.category,
    price: p.price,
    replicaPrice: p.replicaPrice,
    status: "published" as const,
    type: p.type,
    isFeatured: p.isFeatured ?? false,
    stock: p.inStock,
    estimatedDelivery: p.estimatedDelivery ?? "14–21 дней",
    image: p.image,
    images: p.images,
    imageCount: p.images.length || 1,
    createdAt: new Date().toISOString().split("T")[0],
    badge: p.badge,
  }));

  // Deduplicate: custom product with same ID overrides static
  // Also filter out products marked as deleted in meta
  const customIds = new Set(customProds.map(c => c.id));
  const deletedIds = new Set(Object.entries(savedMeta).filter(([, m]) => m.isDeleted).map(([id]) => id));
  const products = [
    ...customAsAdmin,
    ...staticProducts.filter(p => !customIds.has(p.id) && !deletedIds.has(p.id)),
  ];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.nameRu.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ? true :
      filter === "published" ? p.status === "published" :
      filter === "draft" ? p.status === "draft" :
      filter === "preorder" ? p.type === "preorder" :
      p.type === "in_stock";
    return matchSearch && matchFilter;
  });

  const toggleFeatured = (id: string) => {
    const isCustom = customProds.some(c => c.id === id);
    const curCustom = isCustom ? customProds.find(c => c.id === id) : null;
    const curStatic = staticProducts.find(p => p.id === id);
    const currentVal = getMeta(id).isFeatured ?? curCustom?.isFeatured ?? curStatic?.isFeatured ?? false;
    const newVal = !currentVal;

    // ALWAYS write to shop_meta (Firestore) — single source of truth for all devices
    setFeatured(id, newVal);

    // Also update the local display
    if (isCustom) {
      updateCustom(id, { isFeatured: newVal });
    } else {
      setStaticProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: newVal } : p));
    }
  };

  const toggleStatus = (id: string) => {
    if (customProds.some(c => c.id === id)) return; // custom products always published for now
    const cur = staticProducts.find(p => p.id === id);
    const newStatus = cur?.status === "published" ? "draft" as const : "published" as const;
    setStatus(id, newStatus);
    setStaticProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const handleSaveNew = (data: Partial<AdminProduct> & {
    shoeSizes?: Record<number, boolean>;
    apparelSizes?: Record<string, boolean>;
    descriptionRu?: string;
    replicaDelivery?: string;
    image?: string; // uploaded main image path
  }) => {
    const product = buildProductFromForm({
      nameRu: data.nameRu ?? "",
      slug: data.slug ?? `product-${Date.now()}`,
      brand: data.brand ?? "Nike",
      category: data.category ?? "shoes",
      type: data.type ?? "preorder",
      status: data.status ?? "published",
      badge: data.badge ?? "",
      isFeatured: data.isFeatured ?? false,
      estimatedDelivery: data.estimatedDelivery ?? "14–21 дней",
      price: data.price ?? 0,
      replicaPrice: data.replicaPrice,
      replicaDelivery: data.replicaDelivery,
      stock: data.stock,
      descriptionRu: data.descriptionRu ?? "",
      shoeSizes: data.shoeSizes ?? {},
      apparelSizes: data.apparelSizes ?? {},
      image: data.image, // ← was missing — the uploaded image path
    });
    addProduct(product);
    setShowAddModal(false);
  };

  // Handler for EDITING any product (custom or static)
  const handleSaveEdit = (data: Partial<AdminProduct> & {
    shoeSizes?: Record<number, boolean>;
    apparelSizes?: Record<string, boolean>;
    descriptionRu?: string;
    replicaDelivery?: string;
    image?: string;
  }) => {
    if (!selectedProduct) return;

    const isCustom = customProds.some(c => c.id === selectedProduct.id);

    if (isCustom) {
      // Update existing custom product — all fields from modal
      const cur = customProds.find(c => c.id === selectedProduct.id)!;
      updateCustom(selectedProduct.id, {
        nameRu:           data.nameRu           ?? cur.nameRu,
        name:             data.nameRu           ?? cur.nameRu,
        slug:             data.slug             ?? cur.slug,
        brand:            (data.brand as Product["brand"]) ?? cur.brand,
        category:         (data.category as Product["category"]) ?? cur.category,
        type:             (data.type as Product["type"]) ?? cur.type,
        price:            data.price            ?? cur.price,
        replicaPrice:     data.replicaPrice     ?? cur.replicaPrice,
        estimatedDelivery:data.estimatedDelivery?? cur.estimatedDelivery,
        replicaDelivery:  data.replicaDelivery  ?? cur.replicaDelivery,
        isFeatured:       data.isFeatured       ?? cur.isFeatured ?? false,
        badge:            (data.badge as Product["badge"]) ?? cur.badge,
        descriptionRu:    data.descriptionRu    ?? cur.descriptionRu,
        ...(data.image && !data.image.startsWith("blob:") ? { image: data.image, images: [data.image] } : {}),
      });
    } else {
      // Static product → convert to custom with same ID (overrides static)
      const staticProd = staticProducts.find(p => p.id === selectedProduct.id);
      if (!staticProd) { setSelectedProduct(null); return; }

      const updatedImage = (data.image && !data.image.startsWith("blob:"))
        ? data.image
        : (staticProd.images?.[0] ?? staticProd.image);

      const updatedImages = (data.image && !data.image.startsWith("blob:"))
        ? [data.image]
        : (staticProd.images ?? [staticProd.image]);

      const product = buildProductFromForm({
        nameRu:            data.nameRu           ?? staticProd.nameRu,
        slug:              data.slug             ?? staticProd.slug,
        brand:             data.brand            ?? staticProd.brand,
        category:          data.category         ?? staticProd.category,
        type:              (data.type as string) ?? staticProd.type,
        status:            "published",
        badge:             data.badge            ?? staticProd.badge ?? "",
        isFeatured:        data.isFeatured       ?? staticProd.isFeatured ?? false,
        estimatedDelivery: data.estimatedDelivery?? staticProd.estimatedDelivery,
        price:             data.price            ?? staticProd.price,
        replicaPrice:      data.replicaPrice     ?? staticProd.replicaPrice,
        replicaDelivery:   data.replicaDelivery,
        descriptionRu:     data.descriptionRu    ?? "",
        shoeSizes:         data.shoeSizes        ?? {},
        apparelSizes:      data.apparelSizes     ?? {},
        image:             updatedImage,
      }, staticProd.id); // ← keep same ID so it overrides the static entry

      // Manually attach correct images array (buildProductFromForm only sets single image)
      product.images = updatedImages;

      addProduct(product);
    }

    setSelectedProduct(null);
  };

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск товара, бренда..."
            className="w-full h-10 pl-10 pr-4 bg-[#141414] border border-[#222] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "published", "draft", "preorder", "in_stock"] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`h-10 px-4 rounded-xl text-xs font-semibold uppercase tracking-wide transition-colors ${
                filter === f
                  ? "bg-red-800 text-white"
                  : "bg-[#141414] border border-[#222] text-[#666] hover:text-white hover:border-[#333]"
              }`}>
              {f === "all" ? "Все" : f === "published" ? "Опублик." : f === "draft" ? "Черновик" : f === "preorder" ? "Предзаказ" : "В наличии"}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button onClick={() => setShowAddModal(true)}
          className="h-10 px-5 bg-red-800 text-white text-xs font-bold rounded-xl hover:bg-red-900 transition-colors flex items-center gap-2 uppercase tracking-wide flex-shrink-0">
          <Plus className="w-4 h-4" />
          Добавить товар
        </button>
      </div>

      {/* Count */}
      <p className="text-[#444] text-xs mb-4">
        {filtered.length} товар{filtered.length !== 1 ? "а" : ""}
      </p>

      {/* Table */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["Товар", "Бренд", "Цена", "Тип", "Статус", "Избр.", "Скрыт", "Действия"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              <AnimatePresence>
                {filtered.map((product) => (
                  <motion.tr key={product.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className={`hover:bg-[#141414] transition-colors group ${isHidden(product.slug) ? "opacity-50" : ""}`}>
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#222] flex-shrink-0">
                          <Image
                            src={overrides[product.slug]?.mainImage ?? product.image}
                            alt={product.name}
                            fill className="object-cover" sizes="40px"
                            key={overrides[product.slug]?.mainImage ?? product.image}
                          />
                          {product.imageCount > 1 && (
                            <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] px-1 rounded-tl">
                              +{product.imageCount - 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">{product.nameRu}</span>
                            {product.badge && (
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${BADGE_STYLES[product.badge] ?? ""}`}>
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[#555] text-[11px]">{product.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="px-4 py-3 text-[#888] text-sm whitespace-nowrap">{product.brand}</td>

                    {/* Price */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-white text-sm font-semibold">{formatPrice(product.price)}</div>
                      {product.replicaPrice && (
                        <div className="text-[#444] text-[11px]">Rep: {formatPrice(product.replicaPrice)}</div>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {product.type === "preorder"
                          ? <Clock className="w-3 h-3 text-amber-400" />
                          : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        <span className="text-[#888] text-xs">
                          {product.type === "preorder" ? "Предзаказ" : "В наличии"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(product.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${STATUS_STYLES[product.status]}`}>
                        {product.status === "published" ? "Опубликован" : "Черновик"}
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeatured(product.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#1a1a1a] transition-colors">
                        {product.isFeatured
                          ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          : <StarOff className="w-4 h-4 text-[#444]" />}
                      </button>
                    </td>

                    {/* Hidden (Coming Soon on Merch) */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleHidden(product.slug)}
                        title={isHidden(product.slug) ? "Скрытый — показывается на Merch как Coming Soon" : "Видимый — кликни чтобы скрыть"}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isHidden(product.slug)
                            ? "bg-purple-500/15 border border-purple-500/30 text-purple-400"
                            : "text-[#333] hover:text-[#666] hover:bg-[#1a1a1a]"
                        }`}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedProduct(product)}
                          className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-white transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Link href={`/product/${product.slug}`} target="_blank"
                          className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-white transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (!confirm(`Удалить «${product.nameRu}»?`)) return;
                            // ALWAYS mark as deleted in shop_meta (Firestore)
                            // This prevents the static version from resurfacing
                            setDeleted(product.id, true);
                            // Also remove from customProducts if it's a custom product
                            if (customProds.some(c => c.id === product.id)) {
                              removeCustom(product.id);
                            }
                          }}
                          className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-red-500 transition-colors"
                          title="Удалить товар">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-[#333] mx-auto mb-3" />
            <p className="text-[#555] text-sm">Товары не найдены</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <ProductFormModal
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveNew as (data: Partial<AdminProduct>) => void}
          />
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductFormModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onSave={handleSaveEdit as (data: Partial<AdminProduct>) => void}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
