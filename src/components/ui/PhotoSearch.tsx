"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Search, Loader2, ImageIcon } from "lucide-react";
import { products } from "@/data/products";

type SearchState = "idle" | "dragging" | "preview" | "searching" | "results";

// Mock: return 3 random shoes that "match"
function mockSearch() {
  return products
    .filter((p) => p.category === "shoes")
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
}

interface Props {
  onClose: () => void;
}

export function PhotoSearchModal({ onClose }: Props) {
  const [state, setState] = useState<SearchState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<typeof products>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setState("preview");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSearch = async () => {
    setState("searching");
    await new Promise((r) => setTimeout(r, 1800));
    setResults(mockSearch());
    setState("results");
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResults([]);
    setState("idle");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.2)] flex items-center justify-center">
              <Camera className="w-4 h-4 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Поиск по фото</h2>
              <p className="text-xs text-[rgb(var(--muted))] font-normal">Загрузи фото — найдём похожее</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-2))] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Idle / Drag zone */}
            {(state === "idle" || state === "dragging") && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
                  onDragLeave={() => setState("idle")}
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                    state === "dragging"
                      ? "border-pink-400 bg-pink-500/5"
                      : "border-[rgb(var(--border))] hover:border-[rgb(var(--accent)/0.5)] hover:bg-[rgb(var(--accent)/0.03)]"
                  }`}>
                  <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--surface-2))] flex items-center justify-center">
                    <Upload className="w-7 h-7 text-[rgb(var(--muted))]" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm mb-1">
                      {state === "dragging" ? "Отпусти файл здесь" : "Перетащи или нажми"}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted))]">PNG, JPG, WEBP до 10MB</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </div>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[rgb(var(--border))]" />
                  <span className="text-xs text-[rgb(var(--muted))]">или</span>
                  <div className="flex-1 h-px bg-[rgb(var(--border))]" />
                </div>

                <button onClick={() => fileRef.current?.click()}
                  className="w-full py-3 border border-[rgb(var(--border))] rounded-xl text-sm font-medium text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground)/0.3)] transition-colors flex items-center justify-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Выбрать из галереи
                </button>
              </motion.div>
            )}

            {/* Preview */}
            {state === "preview" && previewUrl && (
              <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-5 bg-[rgb(var(--surface-2))]">
                  <Image src={previewUrl} alt="Preview" fill className="object-contain" sizes="400px" />
                  <button onClick={reset}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-xl flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={handleSearch}
                  className="w-full py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Найти похожие товары
                </button>
              </motion.div>
            )}

            {/* Searching */}
            {state === "searching" && (
              <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center py-10 gap-4">
                <div className="w-16 h-16 rounded-full bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.2)] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[rgb(var(--accent))] animate-spin" />
                </div>
                <p className="font-semibold">Анализируем изображение...</p>
                <p className="text-sm text-[rgb(var(--muted))] text-center">
                  Ищем похожие кроссовки и одежду в каталоге
                </p>
                <div className="flex gap-1.5 mt-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results */}
            {state === "results" && (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold">
                    Найдено <span className="text-[rgb(var(--accent))]">{results.length}</span> похожих
                  </p>
                  <button onClick={reset}
                    className="text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
                    Новый поиск
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {results.map((p) => (
                    <Link key={p.id} href={`/product/${p.slug}`} onClick={onClose}
                      className="group bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden hover:border-[rgb(var(--accent)/0.4)] transition-colors">
                      <div className="relative aspect-square bg-[rgb(var(--surface-2))]">
                        <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="160px" />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold leading-snug line-clamp-2 mb-1">{p.nameRu}</p>
                        <p className="text-xs font-bold text-[rgb(var(--accent))]">${p.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
