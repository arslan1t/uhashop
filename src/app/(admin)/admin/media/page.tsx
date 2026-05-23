"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upload, Trash2, Copy, Grid, List, Image as ImgIcon, Film, Check } from "lucide-react";

const MOCK_MEDIA = [
  { id: "1", src: "/images/products/shoes/jordan-1-lucky-green/1.jpg", name: "jordan-1-lucky-green-1.jpg", type: "image", size: "245 KB", date: "2024-01-15" },
  { id: "2", src: "/images/products/shoes/jordan-4-fire-red/1.jpg", name: "jordan-4-fire-red-1.jpg", type: "image", size: "312 KB", date: "2024-01-16" },
  { id: "3", src: "/images/products/shoes/travis-dunk-sb/1.jpg", name: "travis-dunk-sb-1.jpg", type: "image", size: "289 KB", date: "2024-01-17" },
  { id: "4", src: "/images/products/shoes/nike-dunk-low-panda/1.jpg", name: "nike-dunk-low-panda-1.jpg", type: "image", size: "198 KB", date: "2024-01-18" },
  { id: "5", src: "/images/products/shoes/yeezy-350-v2-carbon/1.jpg", name: "yeezy-350-v2-carbon-1.jpg", type: "image", size: "267 KB", date: "2024-01-19" },
  { id: "6", src: "/images/products/apparel/fog-tee-1/1.jpg", name: "fog-tee-1.jpg", type: "image", size: "156 KB", date: "2024-01-20" },
  { id: "7", src: "/images/products/apparel/travis-tee-1/1.jpg", name: "travis-tee-1.jpg", type: "image", size: "178 KB", date: "2024-01-21" },
  { id: "8", src: "/images/products/apparel/supreme-tee-1/1.jpg", name: "supreme-tee-1.jpg", type: "image", size: "134 KB", date: "2024-01-22" },
  { id: "9", src: "/images/branding/logo-on-dark.png", name: "uha-logo-dark.png", type: "image", size: "45 KB", date: "2024-01-10" },
  { id: "10", src: "/images/branding/logo-on-light.png", name: "uha-logo-light.png", type: "image", size: "43 KB", date: "2024-01-10" },
  { id: "v1", src: "", name: "3d-tee.mov", type: "video", size: "12.4 MB", date: "2024-01-25" },
];

export default function AdminMediaPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const copyPath = (id: string, src: string) => {
    navigator.clipboard.writeText(src).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Upload zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-2xl p-8 mb-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${
          dragging
            ? "border-orange-500 bg-orange-500/5"
            : "border-[#2a2a2a] hover:border-orange-500/40 hover:bg-orange-500/3"
        }`}>
        <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
          <Upload className="w-6 h-6 text-[#555]" />
        </div>
        <div className="text-center">
          <p className="text-white font-medium">Перетащи файлы или нажми</p>
          <p className="text-[#555] text-sm mt-1">PNG, JPG, WEBP, MOV, MP4 · До 50MB</p>
        </div>
        <input type="file" multiple accept="image/*,video/*" className="hidden" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[#555] text-sm">{MOCK_MEDIA.length} файлов</span>
          {selected.length > 0 && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Удалить {selected.length}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-[#141414] border border-[#222] rounded-xl p-1">
          {[["grid", Grid], ["list", List]].map(([v, Icon]) => (
            <button key={v as string} onClick={() => setView(v as "grid" | "list")}
              className={`p-1.5 rounded-lg transition-colors ${view === v ? "bg-[#2a2a2a] text-white" : "text-[#555] hover:text-white"}`}>
              {/* @ts-ignore */}
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {MOCK_MEDIA.map((item) => {
            const isSel = selected.includes(item.id);
            const isCopied = copiedId === item.id;
            return (
              <motion.div key={item.id} layout
                className={`group relative rounded-2xl overflow-hidden bg-[#111] border cursor-pointer transition-all ${
                  isSel ? "border-orange-500 ring-1 ring-orange-500/30" : "border-[#1a1a1a] hover:border-[#262626]"
                }`}
                onClick={() => toggleSelect(item.id)}>
                <div className="aspect-square relative">
                  {item.type === "video" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
                      <Film className="w-8 h-8 text-[#444]" />
                      <span className="text-[#555] text-[10px]">Video</span>
                    </div>
                  ) : (
                    <Image src={item.src} alt={item.name} fill className="object-cover" sizes="160px" />
                  )}
                  {/* Checkbox */}
                  <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSel ? "bg-orange-500 border-orange-500" : "border-white/40 bg-black/30 opacity-0 group-hover:opacity-100"
                  }`}>
                    {isSel && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-[#888] text-[10px] truncate">{item.name}</p>
                  <p className="text-[#444] text-[9px]">{item.size}</p>
                </div>
                {/* Copy button */}
                <button
                  onClick={(e) => { e.stopPropagation(); copyPath(item.id, item.src); }}
                  className="absolute bottom-8 right-1.5 w-6 h-6 bg-black/70 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white" />}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List */}
      {view === "list" && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["", "Файл", "Тип", "Размер", "Дата", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {MOCK_MEDIA.map((item) => (
                <tr key={item.id} className="hover:bg-[#141414] transition-colors group cursor-pointer">
                  <td className="px-4 py-3 w-12">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#1a1a1a]">
                      {item.type === "image" && <Image src={item.src} alt="" fill className="object-cover" sizes="32px" />}
                      {item.type === "video" && <Film className="w-4 h-4 text-[#555] m-auto mt-2" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white text-sm">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.type === "image" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                    }`}>{item.type}</span>
                  </td>
                  <td className="px-4 py-3 text-[#555] text-sm">{item.size}</td>
                  <td className="px-4 py-3 text-[#555] text-sm">{item.date}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => copyPath(item.id, item.src)}
                      className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[#555] hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <Copy className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
