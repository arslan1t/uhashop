"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Upload, Trash2, Copy, Grid, List, Film, Check, Loader2, RefreshCw,
} from "lucide-react";
import {
  getStorage, ref as storageRef, listAll, getDownloadURL,
  getMetadata, deleteObject,
} from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/config";
import { getAdminToken } from "@/store/admin";

/* ── helpers ─────────────────────────────────────── */
interface MediaItem {
  id: string;       // fullPath in Storage (used as unique key)
  src: string;      // download URL
  name: string;
  type: "image" | "video";
  size: string;
  date: string;
  fullPath: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const VIDEO_EXTS = new Set(["mp4", "mov", "webm", "avi", "mkv"]);

/* ── component ───────────────────────────────────── */
export default function AdminMediaPage() {
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [selected, setSelected]   = useState<string[]>([]);
  const [dragging, setDragging]   = useState(false);
  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [media, setMedia]         = useState<MediaItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  /* ── load from Firebase Storage ─── */
  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const storage = getStorage(getFirebaseApp());
      const root    = storageRef(storage, "product-images");
      const items: MediaItem[] = [];

      const traverse = async (dir: ReturnType<typeof storageRef>) => {
        const result = await listAll(dir);
        await Promise.all(result.prefixes.map(traverse));
        await Promise.all(result.items.map(async (itemRef) => {
          try {
            const [url, meta] = await Promise.all([
              getDownloadURL(itemRef),
              getMetadata(itemRef),
            ]);
            const ext = itemRef.name.split(".").pop()?.toLowerCase() ?? "";
            items.push({
              id:       itemRef.fullPath,
              src:      url,
              name:     itemRef.name,
              type:     VIDEO_EXTS.has(ext) ? "video" : "image",
              size:     formatBytes(meta.size),
              date:     new Date(meta.timeCreated).toLocaleDateString("ru-RU"),
              fullPath: itemRef.fullPath,
            });
          } catch { /* skip inaccessible file */ }
        }));
      };

      await traverse(root);
      items.sort((a, b) => b.date.localeCompare(a.date));
      setMedia(items);
    } catch (e) {
      console.error("Failed to load media:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  /* ── upload via /api/admin/upload ─── */
  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        setUploadMsg(`Загрузка ${i + 1} / ${arr.length}: ${file.name}`);
        const fd = new FormData();
        fd.append("slug", `media-${Date.now()}-${i}`);
        fd.append("files", file);
        await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "x-admin-token": getAdminToken() },
          body: fd,
        });
      }
      setUploadMsg("Обновление списка…");
      await loadMedia();
    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setUploading(false);
      setUploadMsg(null);
    }
  };

  /* ── delete selected ─── */
  const handleDelete = async () => {
    if (!selected.length) return;
    setDeleting(true);
    try {
      const storage = getStorage(getFirebaseApp());
      await Promise.all(
        selected.map(path => deleteObject(storageRef(storage, path)))
      );
      setMedia(prev => prev.filter(m => !selected.includes(m.id)));
      setSelected([]);
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const copyUrl = (id: string, src: string) => {
    navigator.clipboard.writeText(src).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  /* ── render ─── */
  return (
    <div className="p-6 max-w-[1400px]">

      {/* Upload zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 mb-6 flex flex-col items-center gap-3 cursor-pointer transition-all select-none ${
          dragging
            ? "border-red-800 bg-red-800/5"
            : "border-[#2a2a2a] hover:border-red-800/40 hover:bg-red-800/3"
        }`}>
        <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
          {uploading
            ? <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            : <Upload className="w-6 h-6 text-[#555]" />}
        </div>
        <div className="text-center">
          <p className="text-white font-medium">
            {uploading ? (uploadMsg ?? "Загрузка…") : "Перетащи файлы или нажми"}
          </p>
          <p className="text-[#555] text-sm mt-1">PNG, JPG, WEBP, MOV, MP4 · До 50 MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file" multiple accept="image/*,video/*"
          className="hidden"
          onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[#555] text-sm">
            {loading ? "Загрузка…" : `${media.length} файлов`}
          </span>

          {selected.length > 0 && (
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50">
              {deleting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />}
              Удалить {selected.length}
            </button>
          )}

          <button onClick={loadMedia} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] text-xs font-semibold rounded-xl hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </button>
        </div>

        <div className="flex items-center gap-1 bg-[#141414] border border-[#222] rounded-xl p-1">
          {(["grid", "list"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`p-1.5 rounded-lg transition-colors ${view === v ? "bg-[#2a2a2a] text-white" : "text-[#555] hover:text-white"}`}>
              {v === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-20 text-[#555]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Загрузка медиафайлов из Firebase Storage…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && media.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-[#555]">
          <Upload className="w-10 h-10" />
          <p className="text-sm">Нет загруженных файлов</p>
          <p className="text-xs text-[#444]">Перетащи файлы в зону выше или нажми для выбора</p>
        </div>
      )}

      {/* Grid view */}
      {!loading && view === "grid" && media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {media.map((item) => {
            const isSel    = selected.includes(item.id);
            const isCopied = copiedId === item.id;
            return (
              <motion.div key={item.id} layout
                className={`group relative rounded-2xl overflow-hidden bg-[#111] border cursor-pointer transition-all ${
                  isSel ? "border-red-800 ring-1 ring-red-800/30" : "border-[#1a1a1a] hover:border-[#262626]"
                }`}
                onClick={() => toggleSelect(item.id)}>
                <div className="aspect-square relative">
                  {item.type === "video" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
                      <Film className="w-8 h-8 text-[#444]" />
                      <span className="text-[#555] text-[10px]">Video</span>
                    </div>
                  ) : (
                    <Image
                      src={item.src} alt={item.name} fill
                      className="object-cover" sizes="160px"
                      unoptimized={item.src.startsWith("https://firebasestorage")}
                    />
                  )}
                  {/* Selection checkbox */}
                  <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSel ? "bg-red-800 border-red-800" : "border-white/40 bg-black/30 opacity-0 group-hover:opacity-100"
                  }`}>
                    {isSel && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-[#888] text-[10px] truncate">{item.name}</p>
                  <p className="text-[#444] text-[9px]">{item.size}</p>
                </div>
                {/* Copy URL button */}
                <button
                  onClick={(e) => { e.stopPropagation(); copyUrl(item.id, item.src); }}
                  className="absolute bottom-8 right-1.5 w-6 h-6 bg-black/70 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCopied
                    ? <Check className="w-3 h-3 text-emerald-400" />
                    : <Copy className="w-3 h-3 text-white" />}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {!loading && view === "list" && media.length > 0 && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["", "Файл", "Тип", "Размер", "Дата", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {media.map((item) => {
                const isSel    = selected.includes(item.id);
                const isCopied = copiedId === item.id;
                return (
                  <tr key={item.id} onClick={() => toggleSelect(item.id)}
                    className={`hover:bg-[#141414] transition-colors group cursor-pointer ${isSel ? "bg-red-900/10" : ""}`}>
                    <td className="px-4 py-3 w-12">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#1a1a1a]">
                        {item.type === "image" ? (
                          <Image
                            src={item.src} alt="" fill className="object-cover" sizes="32px"
                            unoptimized={item.src.startsWith("https://firebasestorage")}
                          />
                        ) : (
                          <Film className="w-4 h-4 text-[#555] m-auto mt-2" />
                        )}
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
                      <button onClick={(e) => { e.stopPropagation(); copyUrl(item.id, item.src); }}
                        className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[#555] hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
