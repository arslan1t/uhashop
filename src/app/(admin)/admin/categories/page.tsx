"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Upload, Check, Loader2 } from "lucide-react";
import { useCategoryImages } from "@/store/categoryImages";

const DEFAULT_CATS = [
  { id: "1", name: "Кроссовки",  nameUz: "Krossovkalar", slug: "shoes",       defaultImage: "/images/products/shoes/jordan-4-fire-red/1.jpg",        count: 20 },
  { id: "2", name: "Одежда",     nameUz: "Kiyim",         slug: "apparel",     defaultImage: "/images/products/apparel/fog-tee-1/1.jpg",               count: 7  },
  { id: "3", name: "Аксессуары", nameUz: "Aksessuarlar",  slug: "accessories", defaultImage: "/images/products/shoes/adidas-samba-black/1.jpg",         count: 0  },
  { id: "4", name: "UHA Мерч",   nameUz: "UHA Merch",     slug: "merch",       defaultImage: "/images/products/shoes/jordan-1-lucky-green/1.jpg",       count: 1  },
];

export default function AdminCategoriesPage() {
  const { images, setImage } = useCategoryImages();
  const [uploading, setUploading] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (slug: string, file: File) => {
    setUploading(slug);
    try {
      const fd = new FormData();
      // Use slug as the folder name so files don't overwrite each other
      fd.append("slug", `category-${slug}`);
      fd.append("category", "categories");
      fd.append("files", file);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
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

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#555] text-sm">{DEFAULT_CATS.length} категории</p>
        <button className="h-9 px-5 bg-red-800 text-white text-xs font-bold rounded-xl hover:bg-red-900 transition-colors flex items-center gap-2 uppercase tracking-wide">
          <Plus className="w-3.5 h-3.5" /> Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DEFAULT_CATS.map((cat) => {
          const img = images[cat.slug] ?? cat.defaultImage;
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

                {/* Upload button — always visible */}
                <button
                  onClick={() => fileRefs.current[cat.slug]?.click()}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                    isDone
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      : isLoading
                      ? "bg-[#1a1a1a] text-[#555] cursor-wait border border-[#2a2a2a]"
                      : "bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-red-800/15 hover:border-red-800/30 border border-[#2a2a2a]"
                  }`}>
                  {isLoading ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Загрузка...</>
                  ) : isDone ? (
                    <><Check className="w-3 h-3" /> Сохранено</>
                  ) : (
                    <><Upload className="w-3 h-3" /> Сменить фото</>
                  )}
                </button>

                <input
                  ref={el => { fileRefs.current[cat.slug] = el; }}
                  type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(cat.slug, f);
                    // Reset input so same file can be re-selected
                    e.target.value = "";
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
