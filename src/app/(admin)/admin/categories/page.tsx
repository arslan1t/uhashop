"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, Check, Loader2, X, Trash2 } from "lucide-react";
import { useCategoryImages } from "@/store/categoryImages";
import { useCustomCategories, type CustomCategory } from "@/store/customCategories";

/* ── static default categories ─────────────────── */
const DEFAULT_CATS = [
  { id: "1", name: "Кроссовки",  nameUz: "Krossovkalar", slug: "shoes",       defaultImage: "/images/products/shoes/jordan-4-fire-red/1.jpg",  count: 20 },
  { id: "2", name: "Одежда",     nameUz: "Kiyim",         slug: "apparel",     defaultImage: "/images/products/apparel/fog-tee-1/1.jpg",         count: 7  },
  { id: "3", name: "Мячи",       nameUz: "To'plar",        slug: "accessories", defaultImage: "/images/products/shoes/adidas-samba-black/1.jpg",  count: 0  },
  { id: "4", name: "UHA Мерч",   nameUz: "UHA Merch",     slug: "merch",       defaultImage: "/images/products/shoes/jordan-1-lucky-green/1.jpg", count: 1  },
];

/* ── add-category modal ─────────────────────────── */
function AddCategoryModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (cat: Omit<CustomCategory, "id">) => void;
}) {
  const [name,   setName]   = useState("");
  const [nameUz, setNameUz] = useState("");
  const [slug,   setSlug]   = useState("");
  const [error,  setError]  = useState("");

  const autoSlug = (v: string) =>
    v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = () => {
    if (!name.trim())  { setError("Введите название (RU)"); return; }
    if (!slug.trim())  { setError("Введите slug"); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug должен содержать только a-z, 0-9 и дефис");
      return;
    }
    const all = [...DEFAULT_CATS.map(c => c.slug)];
    if (all.includes(slug)) { setError("Такой slug уже существует"); return; }
    onAdd({ name: name.trim(), nameUz: nameUz.trim() || name.trim(), slug: slug.trim() });
    onClose();
  };

  const INP = "w-full h-10 px-3 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-base">Новая категория</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1.5">Название (RU) *</label>
            <input value={name} onChange={e => { setName(e.target.value); setError(""); }}
              placeholder="Например: Аксессуары" className={INP} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1.5">Название (UZ)</label>
            <input value={nameUz} onChange={e => setNameUz(e.target.value)}
              placeholder="Например: Aksessuarlar" className={INP} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1.5">Slug * (URL-идентификатор)</label>
            <input value={slug}
              onChange={e => { setSlug(autoSlug(e.target.value)); setError(""); }}
              placeholder="Например: accessories" className={INP} />
            <p className="text-[#444] text-[10px] mt-1">Только строчные латинские буквы, цифры и дефис</p>
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button onClick={onClose}
            className="h-9 px-4 text-[#888] hover:text-white text-sm transition-colors">
            Отмена
          </button>
          <button onClick={handleSubmit}
            className="h-9 px-5 bg-red-800 hover:bg-red-900 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Добавить
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── main page ──────────────────────────────────── */
export default function AdminCategoriesPage() {
  const { images, setImage }        = useCategoryImages();
  const { categories: customCats, addCategory, removeCategory } = useCustomCategories();
  const [uploading, setUploading]   = useState<string | null>(null);
  const [saved, setSaved]           = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (slug: string, file: File) => {
    setUploading(slug);
    try {
      const fd = new FormData();
      fd.append("slug", `category-${slug}`);
      fd.append("category", "categories");
      fd.append("files", file);
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.paths?.[0]) {
        setImage(slug, data.paths[0]);
        setSaved(slug);
        setTimeout(() => setSaved(null), 2500);
      }
    } catch (e) {
      console.error("Category upload error:", e);
    } finally {
      setUploading(null);
    }
  };

  const allCats = [
    ...DEFAULT_CATS.map(c => ({ ...c, isCustom: false, defaultImage: images[c.slug] ?? c.defaultImage })),
    ...customCats.map(c => ({
      id: c.id, name: c.name, nameUz: c.nameUz, slug: c.slug,
      defaultImage: images[c.slug] ?? "/images/products/shoes/jordan-4-fire-red/1.jpg",
      count: 0, isCustom: true,
    })),
  ];

  return (
    <>
      <div className="p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <p className="text-[#555] text-sm">{allCats.length} категории</p>
          <button
            onClick={() => setShowModal(true)}
            className="h-9 px-5 bg-red-800 text-white text-xs font-bold rounded-xl hover:bg-red-900 transition-colors flex items-center gap-2 uppercase tracking-wide">
            <Plus className="w-3.5 h-3.5" /> Добавить
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allCats.map((cat) => {
            const img       = images[cat.slug] ?? cat.defaultImage;
            const isLoading = uploading === cat.slug;
            const isDone    = saved    === cat.slug;

            return (
              <motion.div key={cat.id} layout
                className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#262626] transition-colors">

                {/* Cover image */}
                <div className="relative h-40 overflow-hidden">
                  <Image src={img} alt={cat.name} fill className="object-cover opacity-80" sizes="400px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <p className="text-white font-bold text-lg">{cat.name}</p>
                    <p className="text-white/60 text-xs">{cat.nameUz}</p>
                  </div>
                  {cat.isCustom && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Custom
                      </span>
                    </div>
                  )}
                </div>

                {/* Controls row */}
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[#555] text-xs font-mono">/{cat.slug}</span>
                    <span className="text-[#888] text-xs">{cat.count} товаров</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Upload button */}
                    <button
                      onClick={() => fileRefs.current[cat.slug]?.click()}
                      disabled={isLoading}
                      className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold transition-all ${
                        isDone
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : isLoading
                          ? "bg-[#1a1a1a] text-[#555] cursor-wait border border-[#2a2a2a]"
                          : "bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-red-800/15 hover:border-red-800/30 border border-[#2a2a2a]"
                      }`}>
                      {isLoading ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Загрузка…</>
                      ) : isDone ? (
                        <><Check className="w-3 h-3" /> Сохранено</>
                      ) : (
                        <><Upload className="w-3 h-3" /> Сменить фото</>
                      )}
                    </button>

                    {/* Delete button (custom only) */}
                    {cat.isCustom && (
                      <button
                        onClick={() => removeCategory(cat.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#555] hover:text-red-500 hover:bg-red-500/10 border border-[#2a2a2a] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    ref={(el) => { fileRefs.current[cat.slug] = el; }}
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(cat.slug, f);
                      e.target.value = "";
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add-category modal */}
      <AnimatePresence>
        {showModal && (
          <AddCategoryModal
            onClose={() => setShowModal(false)}
            onAdd={addCategory}
          />
        )}
      </AnimatePresence>
    </>
  );
}
