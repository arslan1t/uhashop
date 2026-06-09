"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Upload, Trash2, Check, ImageIcon, GripVertical, CheckCircle2 } from "lucide-react";
import type { AdminProduct } from "@/data/adminData";
import { useProductOverrides } from "@/store/productOverrides";
import { useCustomBrands } from "@/store/customBrands";

const CLS = "w-full h-10 px-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors";

const SHOE_SIZES = [36, 37, 38, 39, 40, 40.5, 41, 42, 42.5, 43, 44, 44.5, 45, 46, 47];
const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BRANDS = ["Nike", "Jordan", "Adidas", "Travis Scott", "UHA", "Fear of God", "Stussy", "Supreme", "Vlone", "KAWS", "Li-Ning", "Anta"];

type Tab = "info" | "media" | "sizes" | "pricing";

interface GalleryImage {
  id: string;
  src: string;
  isMain: boolean;
  isLocal?: boolean;
  file?: File;
}

interface Props {
  product?: AdminProduct;
  onClose: () => void;
  onSave?: (data: Partial<AdminProduct>) => void;
}

export function ProductFormModal({ product, onClose, onSave }: Props) {
  const isEdit = !!product;
  const [tab, setTab] = useState<Tab>("info");

  // Info state
  const [nameRu, setNameRu] = useState(product?.nameRu ?? "");
  const [nameUz, setNameUz] = useState(product?.nameUz ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "Nike");
  const [category, setCategory] = useState(product?.category ?? "shoes");
  const [type, setType] = useState(product?.type ?? "preorder");
  const [status, setStatus] = useState(product?.status ?? "published");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [style, setStyle] = useState<"" | "basketball" | "lifestyle">((product as { style?: "basketball" | "lifestyle" })?.style ?? "");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [delivery, setDelivery] = useState(product?.estimatedDelivery ?? "7–14 дней");
  const [descRu, setDescRu] = useState(product?.descriptionRu ?? "");
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed)) { setTagInput(""); return; }
    setTags(prev => [...prev, trimmed]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  // Override store
  const { setOverride } = useProductOverrides();

  // Custom brands store
  const { brands: customBrandsList, addBrand: saveNewBrand } = useCustomBrands();
  const allBrands = [...BRANDS, ...customBrandsList.filter(b => !BRANDS.includes(b))];
  const [addingBrand, setAddingBrand] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState("");

  // Build full gallery for a product, reading overrides directly from store state
  const buildGallery = (
    prod: NonNullable<typeof product>,
    currentOverrides: Record<string, { mainImage?: string; imageOrder?: string[] }>
  ): GalleryImage[] => {
    // Use actual image paths from product data (preserves correct extensions: .jpg, .png, .webp, .jpeg)
    const basePaths = prod.images?.length
      ? prod.images
      : [prod.image].filter(Boolean);

    const override = currentOverrides[prod.slug];
    const savedOrder  = override?.imageOrder ?? basePaths;
    const savedMain   = override?.mainImage  ?? basePaths[0] ?? "";

    return savedOrder.map((src, i) => ({
      id: `img-${i}-${src}`,
      src,
      isMain: src === savedMain,
    }));
  };

  // Initialize gallery once on mount with current store state
  const [gallery, setGallery] = useState<GalleryImage[]>(() =>
    product ? buildGallery(product, useProductOverrides.getState().overrides) : []
  );
  const [dragging, setDragging] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragSrcId = useRef<string | null>(null);

  // Sizes state
  const [shoeSizes, setShoeSizes] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    SHOE_SIZES.forEach(s => { init[s] = true; }); // default all available
    return init;
  });
  const [apparelSizes, setApparelSizes] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    APPAREL_SIZES.forEach(s => { init[s] = true; });
    return init;
  });

  // Pricing state
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [replicaPrice, setReplicaPrice] = useState(String(product?.replicaPrice ?? ""));
  const [replicaDelivery, setReplicaDelivery] = useState(product?.replicaDelivery ?? "7–14 дней");
  const [stock, setStock] = useState(String(product?.stock ?? ""));

  // ── Media handlers ──
  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    const newImgs: GalleryImage[] = arr.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      src: URL.createObjectURL(file),
      isMain: gallery.length === 0 && i === 0,
      isLocal: true,
      file,
    }));
    setGallery(prev => {
      const combined = [...prev, ...newImgs];
      // If no main, set first as main
      if (!combined.some(img => img.isMain) && combined.length > 0) {
        combined[0].isMain = true;
      }
      return combined;
    });
  }, [gallery]);

  const setMain = (id: string) => {
    setGallery(prev => prev.map(img => ({ ...img, isMain: img.id === id })));
  };

  const removeImg = (id: string) => {
    setGallery(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // If removed main and there are others, promote first
      if (prev.find(img => img.id === id)?.isMain && filtered.length > 0) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  // ── Gallery drag-and-drop reorder ──
  const onCardDragStart = (e: React.DragEvent, id: string) => {
    dragSrcId.current = id;
    e.dataTransfer.effectAllowed = "move";
    // ghost image
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
  };

  const onCardDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragSrcId.current) setDragOverId(id);
  };

  const onCardDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const srcId = dragSrcId.current;
    if (!srcId || srcId === targetId) { setDragOverId(null); return; }
    setGallery(prev => {
      const arr = [...prev];
      const srcIdx = arr.findIndex(img => img.id === srcId);
      const tgtIdx = arr.findIndex(img => img.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) return prev;
      const [moved] = arr.splice(srcIdx, 1);
      arr.splice(tgtIdx, 0, moved);
      return arr;
    });
    dragSrcId.current = null;
    setDragOverId(null);
  };

  const onCardDragEnd = () => {
    dragSrcId.current = null;
    setDragOverId(null);
  };

  // Upload-zone drop (files from OS)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    const currentSlug = slug || product?.slug || `product-${Date.now()}`;
    setUploading(true);

    // ── Upload any new local files to server ──
    let finalGallery = gallery;
    const localFiles = gallery.filter(img => img.isLocal && img.file);

    if (localFiles.length > 0) {
      try {
        const fd = new FormData();
        fd.append("slug", currentSlug);
        fd.append("category", category);

        // Reorder: put main image first among locals
        const orderedLocals = [
          ...localFiles.filter(img => img.isMain),
          ...localFiles.filter(img => !img.isMain),
        ];
        orderedLocals.forEach(img => fd.append("files", img.file!));

        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();

        if (data.paths?.length) {
          // Replace blob URLs with real server paths
          let pathIdx = 0;
          finalGallery = gallery.map(img => {
            if (img.isLocal && img.file) {
              return { ...img, src: data.paths[pathIdx++] ?? img.src, isLocal: false };
            }
            return img;
          });
        }
      } catch (e) {
        console.error("Upload failed:", e);
      }
    }

    // ── Persist image order & main to shared override store ──
    if (currentSlug && finalGallery.length > 0) {
      const mainImg = finalGallery.find(img => img.isMain)?.src ?? finalGallery[0].src;
      const order = finalGallery.map(img => img.src);
      setOverride(currentSlug, { mainImage: mainImg, imageOrder: order });
    }

    setUploading(false);

    onSave?.({
      nameRu, nameUz, slug: currentSlug,
      brand: brand as AdminProduct["brand"],
      category, type: type as AdminProduct["type"],
      status: status as AdminProduct["status"],
      badge: badge as AdminProduct["badge"],
      style: style || undefined,
      isFeatured, estimatedDelivery: delivery,
      price: Number(price),
      replicaPrice: replicaPrice ? Number(replicaPrice) : undefined,
      replicaDelivery,
      stock: stock ? Number(stock) : undefined,
      descriptionRu: descRu,
      tags,
      shoeSizes,
      apparelSizes,
      // pass the first uploaded image as the main image for new products
      image: finalGallery.find(img => img.isMain)?.src ?? finalGallery[0]?.src,
    } as Partial<AdminProduct>);

    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "info",    label: "Основное" },
    { id: "media",   label: `Фото (${gallery.length})` },
    { id: "sizes",   label: "Размеры" },
    { id: "pricing", label: "Цены" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#111] border border-[#1f1f1f] rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] flex-shrink-0">
          <div className="flex items-center gap-3">
            {product?.image && (
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] flex-shrink-0">
                <Image src={product.image} alt="" fill className="object-cover" sizes="36px" />
              </div>
            )}
            <div>
              <h2 className="text-white font-semibold text-sm">
                {isEdit ? "Редактировать товар" : "Новый товар"}
              </h2>
              {isEdit && <p className="text-[#444] text-[11px]">{product.slug}</p>}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#555] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 px-5 pt-3 border-b border-[#1a1a1a] flex-shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                tab === t.id
                  ? "text-red-500 border-red-800"
                  : "text-[#555] border-transparent hover:text-[#999]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {tab === "info" && (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Название RU">
                    <input value={nameRu} onChange={e => setNameRu(e.target.value)}
                      placeholder="Air Jordan 1 High..." className={CLS} />
                  </Field>
                  <Field label="Название UZ">
                    <input value={nameUz} onChange={e => setNameUz(e.target.value)}
                      placeholder="Air Jordan 1 High..." className={CLS} />
                  </Field>
                </div>
                <Field label="Slug (URL)">
                  <input value={slug} onChange={e => setSlug(e.target.value)}
                    placeholder="jordan-1-lucky-green" className={CLS} />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Бренд">
                    {addingBrand ? (
                      <div className="flex gap-1.5">
                        <input
                          autoFocus
                          value={newBrandInput}
                          onChange={e => setNewBrandInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const v = newBrandInput.trim();
                              if (v) { saveNewBrand(v); setBrand(v); }
                              setAddingBrand(false); setNewBrandInput("");
                            }
                            if (e.key === "Escape") { setAddingBrand(false); setNewBrandInput(""); }
                          }}
                          placeholder="Wilson"
                          className={CLS}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const v = newBrandInput.trim();
                            if (v) { saveNewBrand(v); setBrand(v); }
                            setAddingBrand(false); setNewBrandInput("");
                          }}
                          className="h-10 px-3 bg-[rgb(var(--accent))] text-white rounded-xl text-xs font-bold shrink-0 hover:opacity-90"
                        >OK</button>
                        <button
                          type="button"
                          onClick={() => { setAddingBrand(false); setNewBrandInput(""); }}
                          className="h-10 px-3 bg-[#2a2a2a] text-white/50 rounded-xl text-xs shrink-0"
                        >✕</button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <select value={brand} onChange={e => setBrand(e.target.value)} className={`${CLS} flex-1`}>
                          {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <button
                          type="button"
                          title="Добавить новый бренд"
                          onClick={() => setAddingBrand(true)}
                          className="h-10 px-3 bg-[#2a2a2a] hover:bg-[#333] text-white/60 hover:text-white rounded-xl text-lg font-bold shrink-0 transition-colors"
                        >+</button>
                      </div>
                    )}
                  </Field>
                  <Field label="Категория">
                    <select value={category} onChange={e => setCategory(e.target.value)} className={CLS}>
                      <option value="shoes">👟 Кроссовки</option>
                      <option value="apparel">🧤 Одежда</option>
                      <option value="accessories">💎 Аксессуары</option>
                      <option value="backpacks">🎒 Рюкзаки</option>
                      <option value="jerseys">🏀 Джерси</option>
                      <option value="socks">🧦 Носки</option>
                      <option value="sets">📦 Комплекты</option>
                      <option value="thermals">🌡️ Термо бельё</option>
                    </select>
                  </Field>
                  <Field label="Тип">
                    <select value={type} onChange={e => setType(e.target.value as 'preorder' | 'in_stock')} className={CLS}>
                      <option value="preorder">Предзаказ</option>
                      <option value="in_stock">В наличии</option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Статус">
                    <select value={status} onChange={e => setStatus(e.target.value as 'published' | 'draft' | 'archived')} className={CLS}>
                      <option value="published">Опубликован</option>
                      <option value="draft">Черновик</option>
                      <option value="archived">Архив</option>
                    </select>
                  </Field>
                  <Field label="Бейдж">
                    <select value={badge} onChange={e => setBadge(e.target.value)} className={CLS}>
                      <option value="">Без бейджа</option>
                      <option value="new">New</option>
                      <option value="popular">Popular</option>
                      <option value="limited">Limited</option>
                      <option value="sale">Sale</option>
                    </select>
                  </Field>
                  <Field label="Стиль">
                    <select value={style} onChange={e => setStyle(e.target.value as "" | "basketball" | "lifestyle")} className={CLS}>
                      <option value="">Не указан</option>
                      <option value="basketball">🏀 Баскетбол</option>
                      <option value="lifestyle">👟 Лайфстайл</option>
                    </select>
                  </Field>
                  <Field label="Доставка">
                    <input value={delivery} onChange={e => setDelivery(e.target.value)}
                      placeholder="7–14 дней" className={CLS} />
                  </Field>
                </div>
                <Field label="Описание RU">
                  <textarea value={descRu} onChange={e => setDescRu(e.target.value)}
                    rows={3} placeholder="Описание товара..."
                    className={`${CLS} h-auto py-2.5 resize-none`} />
                </Field>
                {/* Tags */}
                <Field label="Теги (для поиска)">
                  <div className="space-y-2">
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-[11px] text-[#bbb]">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)}
                              className="text-[#555] hover:text-red-400 transition-colors ml-0.5">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      placeholder="Введите тег → Enter или запятая"
                      className={CLS}
                    />
                  </div>
                </Field>
                {/* Featured toggle */}
                <button onClick={() => setIsFeatured(!isFeatured)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border w-full text-left transition-all ${
                    isFeatured
                      ? "border-amber-500/40 bg-amber-500/8 text-amber-400"
                      : "border-[#2a2a2a] text-[#666] hover:border-[#3a3a3a]"
                  }`}>
                  <Star className={`w-4 h-4 ${isFeatured ? "fill-amber-400" : ""}`} />
                  <div>
                    <p className="text-sm font-semibold">Показывать на главной</p>
                    <p className="text-xs opacity-60">Featured — попадёт в блок «Хиты сезона»</p>
                  </div>
                  {isFeatured && <Check className="w-4 h-4 ml-auto" />}
                </button>
              </motion.div>
            )}

            {tab === "media" && (
              <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                {/* Upload zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                    dragging
                      ? "border-red-800 bg-red-800/5"
                      : "border-[#2a2a2a] hover:border-red-800/40 hover:bg-[#161616]"
                  }`}>
                  <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#555]" />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">Загрузить фотографии</p>
                    <p className="text-[#555] text-xs mt-0.5">Перетащи или нажми · PNG, JPG, WEBP до 10MB</p>
                  </div>
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                    onChange={e => e.target.files && handleFiles(e.target.files)} />
                </div>

                {/* Gallery drag-and-drop grid */}
                {gallery.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-[#444]" />
                        <p className="text-[#555] text-xs font-semibold uppercase tracking-wider">
                          Галерея · {gallery.length} фото
                        </p>
                      </div>
                      <p className="text-[#444] text-xs">
                        Тяни ≡ для сортировки · ★ главное
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5">
                      {gallery.map((img, idx) => {
                        const isOver = dragOverId === img.id;
                        const isDraggingSrc = dragSrcId.current === img.id;
                        return (
                          <div
                            key={img.id}
                            draggable
                            onDragStart={e => onCardDragStart(e, img.id)}
                            onDragOver={e => onCardDragOver(e, img.id)}
                            onDrop={e => onCardDrop(e, img.id)}
                            onDragEnd={onCardDragEnd}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all select-none cursor-grab active:cursor-grabbing ${
                              isDraggingSrc
                                ? "opacity-40 scale-95"
                                : isOver
                                ? "border-red-500 shadow-lg shadow-red-800/30 scale-[1.02]"
                                : img.isMain
                                ? "border-red-800 shadow-md shadow-red-800/20"
                                : "border-[#2a2a2a] hover:border-[#444]"
                            }`}
                          >
                            <Image
                              src={img.src}
                              alt={`Photo ${idx + 1}`}
                              fill
                              className="object-cover pointer-events-none"
                              sizes="120px"
                              onError={e => {
                                (e.target as HTMLImageElement).src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%231a1a1a' width='120' height='120'/%3E%3Ctext fill='%23333' font-size='11' font-family='monospace' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3Eno img%3C/text%3E%3C/svg%3E";
                              }}
                            />

                            {/* Drag handle hint (top-right) */}
                            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-1">
                                <GripVertical className="w-3 h-3 text-white/70" />
                              </div>
                            </div>

                            {/* Main badge */}
                            {img.isMain && (
                              <div className="absolute top-1.5 left-1.5 bg-red-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide z-10 shadow">
                                Главное
                              </div>
                            )}

                            {/* Drop-here indicator */}
                            {isOver && !isDraggingSrc && (
                              <div className="absolute inset-0 bg-red-800/15 flex items-center justify-center z-20 pointer-events-none">
                                <div className="w-8 h-8 rounded-full bg-red-800/80 flex items-center justify-center">
                                  <GripVertical className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}

                            {/* Hover actions */}
                            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                              {!img.isMain && (
                                <button
                                  onClick={e => { e.stopPropagation(); setMain(img.id); }}
                                  title="Сделать главным"
                                  className="w-8 h-8 rounded-lg bg-red-800/90 flex items-center justify-center text-white hover:bg-red-800 transition-colors"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); removeImg(img.id); }}
                                title="Удалить"
                                className="w-8 h-8 rounded-lg bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Position number */}
                            <div className="absolute bottom-1 left-1.5 text-[#ffffff55] text-[9px] font-bold z-10">
                              {idx + 1}
                            </div>
                          </div>
                        );
                      })}

                      {/* Add more */}
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-[#2a2a2a] flex flex-col items-center justify-center gap-1.5 text-[#444] hover:border-red-800/40 hover:text-[#666] hover:bg-[#161616] transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-[9px] uppercase tracking-wide font-semibold">Добавить</span>
                      </button>
                    </div>

                    <div className="mt-3 p-3 bg-[#181818] rounded-xl border border-[#242424]">
                      <p className="text-[#555] text-xs leading-relaxed">
                        <span className="text-[#777]">Тяни карточки</span> чтобы изменить порядок ·{" "}
                        <span className="text-red-500">★ Главное</span> — фото для каталога и главной ·{" "}
                        Остальные — в галерее на странице товара
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <ImageIcon className="w-8 h-8 text-[#333] mx-auto mb-2" />
                    <p className="text-[#555] text-sm">Фотографии не добавлены</p>
                    <p className="text-[#333] text-xs mt-1">Загрузи фото через зону выше</p>
                  </div>
                )}
              </motion.div>
            )}

            {tab === "sizes" && (
              <motion.div key="sizes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6">

                {/* No-size categories: accessories, backpacks, socks, sets */}
                {["accessories", "backpacks", "socks", "sets"].includes(category) && (
                  <div className="py-12 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
                      {{ accessories: "💎", backpacks: "🎒", socks: "🧦", sets: "📦" }[category] ?? "📦"}
                    </div>
                    <p className="text-white font-semibold">Размеры не требуются</p>
                    <p className="text-[#555] text-sm max-w-xs">
                      Для этой категории размеры не нужны. Перейди на вкладку Цены.
                    </p>
                  </div>
                )}

                {/* Shoes + Apparel sizes — hidden for no-size categories */}
                {!["accessories", "backpacks", "socks", "sets"].includes(category) && (
                  <>
                    {/* Shoe sizes */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white text-sm font-semibold">Размеры обуви (EU)</p>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            const all: Record<number, boolean> = {};
                            SHOE_SIZES.forEach(s => { all[s] = true; });
                            setShoeSizes(all);
                          }} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold uppercase tracking-wider">
                            Все
                          </button>
                          <span className="text-[#333]">·</span>
                          <button onClick={() => {
                            const none: Record<number, boolean> = {};
                            SHOE_SIZES.forEach(s => { none[s] = false; });
                            setShoeSizes(none);
                          }} className="text-[10px] text-red-500 hover:text-red-400 font-semibold uppercase tracking-wider">
                            Сбросить
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SHOE_SIZES.map(size => {
                          const avail = shoeSizes[size] ?? true;
                          return (
                            <button key={size}
                              onClick={() => setShoeSizes(prev => ({ ...prev, [size]: !prev[size] }))}
                              className={`w-14 h-10 rounded-xl text-sm font-semibold border-2 transition-all ${
                                avail
                                  ? "bg-red-800/10 border-red-800/50 text-red-500 hover:bg-red-800/20"
                                  : "bg-[#1a1a1a] border-[#252525] text-[#444] hover:border-[#333] line-through"
                              }`}>
                              {size}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[#444] text-xs mt-2">
                        Оранжевый = в наличии · Серый = нет в наличии (перечёркнуто)
                      </p>
                    </div>

                    {/* Apparel sizes */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white text-sm font-semibold">Размеры одежды</p>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            const all: Record<string, boolean> = {};
                            APPAREL_SIZES.forEach(s => { all[s] = true; });
                            setApparelSizes(all);
                          }} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold uppercase tracking-wider">
                            Все
                          </button>
                          <span className="text-[#333]">·</span>
                          <button onClick={() => {
                            const none: Record<string, boolean> = {};
                            APPAREL_SIZES.forEach(s => { none[s] = false; });
                            setApparelSizes(none);
                          }} className="text-[10px] text-red-500 hover:text-red-400 font-semibold uppercase tracking-wider">
                            Сбросить
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {APPAREL_SIZES.map(size => {
                          const avail = apparelSizes[size] ?? true;
                          return (
                            <button key={size}
                              onClick={() => setApparelSizes(prev => ({ ...prev, [size]: !prev[size] }))}
                              className={`w-16 h-10 rounded-xl text-sm font-semibold border-2 transition-all ${
                                avail
                                  ? "bg-red-800/10 border-red-800/50 text-red-500 hover:bg-red-800/20"
                                  : "bg-[#1a1a1a] border-[#252525] text-[#444] hover:border-[#333] line-through"
                              }`}>
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-[#181818] rounded-xl border border-[#222]">
                      <p className="text-[#888] text-xs mb-2 font-semibold uppercase tracking-wider">Активные размеры обуви</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SHOE_SIZES.filter(s => shoeSizes[s]).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-red-800/10 border border-red-800/25 text-red-500 text-xs rounded-lg font-medium">
                            EU {s}
                          </span>
                        ))}
                        {SHOE_SIZES.filter(s => shoeSizes[s]).length === 0 && (
                          <span className="text-[#444] text-xs">Нет активных размеров</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {tab === "pricing" && (
              <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Цена оригинала ($)">
                    <input type="number" value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="189" className={CLS} />
                  </Field>
                  <Field label="Цена реплики ($)">
                    <input type="number" value={replicaPrice}
                      onChange={e => setReplicaPrice(e.target.value)}
                      placeholder="89" className={CLS} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Доставка (оригинал)">
                    <input value={delivery} onChange={e => setDelivery(e.target.value)}
                      placeholder="7–14 дней" className={CLS} />
                  </Field>
                  <Field label="Доставка (реплика)">
                    <input value={replicaDelivery} onChange={e => setReplicaDelivery(e.target.value)}
                      placeholder="7–14 дней" className={CLS} />
                  </Field>
                </div>

                {type === "in_stock" && (
                  <Field label="Количество в наличии">
                    <input type="number" value={stock}
                      onChange={e => setStock(e.target.value)}
                      placeholder="10" className={CLS} />
                  </Field>
                )}

                {/* Price preview */}
                {price && (
                  <div className="p-4 bg-[#181818] border border-[#222] rounded-xl">
                    <p className="text-[#555] text-xs font-semibold uppercase tracking-wider mb-3">Предпросмотр цены</p>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Original</p>
                        <p className="text-white text-2xl font-bold">${price}</p>
                      </div>
                      {replicaPrice && (
                        <>
                          <div className="w-px h-10 bg-[#2a2a2a]" />
                          <div>
                            <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Replica</p>
                            <p className="text-red-500 text-2xl font-bold">${replicaPrice}</p>
                          </div>
                          <div className="w-px h-10 bg-[#2a2a2a]" />
                          <div>
                            <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Скидка</p>
                            <p className="text-emerald-400 text-xl font-bold">
                              -{Math.round((1 - Number(replicaPrice) / Number(price)) * 100)}%
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <Field label="Теги (через запятую)">
                  <input placeholder="jordan, basketball, og, fire red" className={CLS} />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1a1a1a] flex-shrink-0">
          <button onClick={onClose}
            className="h-10 px-5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#777] hover:text-white rounded-xl text-sm transition-colors">
            Отмена
          </button>
          <div className="flex gap-2">
            <button className="h-10 px-5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#777] hover:text-white rounded-xl text-sm transition-colors">
              Черновик
            </button>
            <button onClick={handleSave} disabled={uploading}
              className={`h-10 px-6 font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2 disabled:opacity-70 ${
                saved
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-red-800 hover:bg-red-900 text-white shadow-red-800/20"
              }`}>
              {uploading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Загрузка...</>
              ) : saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Сохранено!</>
              ) : (
                isEdit ? "Сохранить" : "Опубликовать"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-[0.15em] mb-1.5">{label}</label>
      {children}
    </div>
  );
}
