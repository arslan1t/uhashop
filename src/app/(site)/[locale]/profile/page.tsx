"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Heart, Package, Clock, Send, ChevronRight,
  ShoppingBag, CheckCircle2, Truck, Box, XCircle, Loader2, X, RefreshCw, Copy, CheckCheck,
  Camera, Trophy, Edit2, Trash2, Plus, Search, ChevronUp, ChevronDown,
  Instagram, Youtube, Twitter, Link as LinkIcon, ImageIcon, Upload, Save, Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useCustomProducts } from "@/store/customProducts";
import { usePlayerSets } from "@/store/playerSets";
import { products as staticProducts } from "@/data/products";
import { getMarketplaceProducts } from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { formatPrice } from "@/lib/utils";
import { compressImage } from "@/lib/image";
import type { PlayerSet, Product } from "@/types";

const mktProducts = getMarketplaceProducts();

// ── Order types & helpers ─────────────────────────────────────────────
type OrderStatus = "new" | "processing" | "ordered" | "delivered" | "cancelled";

const ORDER_STEPS: { key: OrderStatus; label: string; icon: React.ElementType; color: string }[] = [
  { key: "new",        label: "Принят",     icon: ShoppingBag,  color: "#60a5fa" },
  { key: "processing", label: "В обработке", icon: Loader2,      color: "#f59e0b" },
  { key: "ordered",    label: "Заказан",    icon: Box,          color: "#a78bfa" },
  { key: "delivered",  label: "Доставлен",  icon: CheckCircle2, color: "#34d399" },
];

const ORDER_STATUS_INFO: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  new:        { label: "Принят",      color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  processing: { label: "В обработке", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  ordered:    { label: "Заказан",     color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
  delivered:  { label: "Доставлен",   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  cancelled:  { label: "Отменён",     color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
};

const STEP_INDEX: Record<OrderStatus, number> = { new: 0, processing: 1, ordered: 2, delivered: 3, cancelled: -1 };

interface MockOrder {
  id: string; orderNumber: string; date: string; status: OrderStatus;
  total: number; items: { name: string; size: string; qty: number; price: number; version: string }[];
  estimatedDelivery?: string; notes?: string;
}

function mapOrderFromApi(row: Record<string, unknown>): MockOrder {
  const addr = (row.shipping_address || {}) as Record<string, string>;
  const items = (row.items || []) as { name: string; size: string; qty: number; price: number; version?: string }[];
  return {
    id: row.id as string,
    orderNumber: (row.order_number as string) || `UHA-${(row.id as string).slice(0, 8)}`,
    date: new Date(row.created_at as string).toLocaleDateString("ru-RU"),
    status: (row.status === "pending" ? "new" : row.status) as OrderStatus,
    total: row.total as number,
    items: items.map(i => ({ name: i.name, size: i.size, qty: i.qty, price: i.price, version: i.version || "original" })),
    notes: addr.notes,
  };
}

// ── Input class helpers ───────────────────────────────────────────────
const inp = "w-full h-10 px-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors";
const area = "w-full px-3.5 py-2.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors resize-none";

// ── Order Tracker modal ───────────────────────────────────────────────
function OrderTracker({ order, onClose }: { order: MockOrder; onClose: () => void }) {
  const stepIdx = STEP_INDEX[order.status];
  const statusInfo = ORDER_STATUS_INFO[order.status];
  const { addItem, openCart } = useCartStore();
  const [copied, setCopied] = useState(false);
  const [repeating, setRepeating] = useState(false);
  const customProdsLocal = useCustomProducts(s => s.products);
  const products = [...customProdsLocal, ...staticProducts.filter(sp => !customProdsLocal.some(cp => cp.id === sp.id))];
  const isCancelled = order.status === "cancelled";

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRepeatOrder = () => {
    setRepeating(true);
    order.items.forEach(item => {
      const product = products.find(p =>
        p.name.toLowerCase() === item.name.toLowerCase() ||
        p.name.toLowerCase().includes(item.name.toLowerCase().split(" ")[0])
      );
      if (product) addItem(product, item.size, (item.version === "replica" ? "replica" : "original") as "original" | "replica");
    });
    setTimeout(() => { setRepeating(false); onClose(); openCart(); }, 500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgb(var(--border))]">
          <div>
            <button onClick={handleCopyOrderNumber} className="group flex items-center gap-2 hover:opacity-80 transition-opacity">
              <p className="font-bold text-base font-mono">{order.orderNumber}</p>
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
            <p className="text-[rgb(var(--muted))] text-xs mt-0.5">{order.date}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${statusInfo.color} ${statusInfo.bg} ${statusInfo.border}`}>{statusInfo.label}</span>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-2))] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!isCancelled ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-5">Статус заказа</p>
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[rgb(var(--border))]" />
                <div className="absolute left-5 top-5 w-0.5 bg-gradient-to-b from-[rgb(var(--accent))] to-emerald-500 transition-all duration-700"
                  style={{ height: `${(stepIdx / (ORDER_STEPS.length - 1)) * 100}%` }} />
                <div className="space-y-5">
                  {ORDER_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const done = i <= stepIdx;
                    const active = i === stepIdx;
                    return (
                      <div key={step.key} className="flex items-center gap-4 relative">
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${done ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.15)]" : "border-[rgb(var(--border))] bg-[rgb(var(--surface))]"} ${active ? "shadow-lg shadow-[rgb(var(--accent)/0.25)]" : ""}`}>
                          <Icon className={`w-4 h-4 ${done ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted))]"} ${active && step.key === "processing" ? "animate-spin" : ""}`} />
                          {done && i < stepIdx && (
                            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-[rgb(var(--accent))]">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${done ? "text-[rgb(var(--foreground))]" : "text-[rgb(var(--muted))]"}`}>{step.label}</p>
                          {active && order.estimatedDelivery && <p className="text-xs text-[rgb(var(--accent))] mt-0.5">{order.estimatedDelivery}</p>}
                          {done && i < stepIdx && <p className="text-xs text-[rgb(var(--muted))] mt-0.5">Выполнено</p>}
                        </div>
                        {active && <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[rgb(var(--accent))] animate-pulse" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-400">Заказ отменён</p>
                {order.notes && <p className="text-xs text-[rgb(var(--muted))] mt-0.5">{order.notes}</p>}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-3">Состав заказа</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[rgb(var(--surface-2))] rounded-xl">
                  <div>
                    <p className="text-sm font-medium leading-snug">{item.name}</p>
                    <p className="text-xs text-[rgb(var(--muted))] mt-0.5">{item.size} · ×{item.qty} · {item.version === "original" ? "Оригинал" : "Реплика"}</p>
                  </div>
                  <span className="font-bold text-sm text-[rgb(var(--foreground))] flex-shrink-0 ml-3">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--border))]">
            <div>
              <p className="text-[rgb(var(--muted))] text-xs">Итого</p>
              <p className="font-bold text-xl text-[rgb(var(--accent))]">{formatPrice(order.total)}</p>
            </div>
            <a href="https://t.me/uha_manager" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2AABEE]/10 border border-[#2AABEE]/20 text-[#2AABEE] text-sm font-semibold rounded-xl hover:bg-[#2AABEE]/20 transition-colors">
              <Send className="w-4 h-4" /> Поддержка
            </a>
          </div>

          <button onClick={handleRepeatOrder} disabled={repeating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] text-sm font-semibold rounded-2xl hover:bg-[rgb(var(--border))] hover:border-[rgb(var(--accent)/0.3)] transition-all disabled:opacity-60">
            {repeating ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <RefreshCw className="w-4 h-4 text-[rgb(var(--accent))]" />}
            {repeating ? "Добавляем в корзину..." : "Повторить заказ"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Edit Profile modal ────────────────────────────────────────────────
type ProfileForm = {
  name: string;
  bio: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
};

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState<ProfileForm>({
    name:      user?.name ?? "",
    bio:       user?.bio ?? "",
    instagram: user?.socialLinks?.instagram ?? "",
    tiktok:    user?.socialLinks?.tiktok ?? "",
    youtube:   user?.socialLinks?.youtube ?? "",
    twitter:   user?.socialLinks?.twitter ?? "",
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);

  const avatar = user?.avatar ?? null;
  const initials = (user?.name ?? "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;
    setUploadingAvatar(true);
    try {
      const compressed = await compressImage(file, 800, 0.85); // avatars don't need to be large
      const fd = new FormData();
      fd.append("userId", user.id);
      fd.append("files", compressed);
      const res = await fetch("/api/user/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { paths } = await res.json();
      updateProfile({ avatar: paths[0] });
    } catch (e) { alert(`Ошибка загрузки: ${e}`); }
    finally { setUploadingAvatar(false); }
  };

  const handleSave = () => {
    updateProfile({
      name: form.name.trim() || user?.name,
      bio: form.bio.trim() || undefined,
      socialLinks: {
        instagram: form.instagram.trim() || undefined,
        tiktok:    form.tiktok.trim() || undefined,
        youtube:   form.youtube.trim() || undefined,
        twitter:   form.twitter.trim() || undefined,
      },
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const socialFields: { key: keyof ProfileForm; label: string; icon: React.ElementType; placeholder: string }[] = [
    { key: "instagram", label: "Instagram",  icon: Instagram, placeholder: "@username" },
    { key: "tiktok",    label: "TikTok",     icon: LinkIcon,  placeholder: "@username" },
    { key: "youtube",   label: "YouTube",    icon: Youtube,   placeholder: "Канал или @handle" },
    { key: "twitter",   label: "X / Twitter",icon: Twitter,   placeholder: "@username" },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.2 }}
        className="fixed inset-x-4 top-8 bottom-8 max-w-md mx-auto z-50 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
          <h2 className="font-bold text-base text-[rgb(var(--foreground))]">Редактировать профиль</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[rgb(var(--surface-2))] flex items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[rgb(var(--accent)/0.15)] border-2 border-[rgb(var(--accent)/0.3)] flex items-center justify-center">
                {avatar ? (
                  <Image src={avatar} alt="Avatar" fill className="object-cover" sizes="80px" />
                ) : (
                  <span className="text-[rgb(var(--accent))] font-bold text-xl">{initials}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-[rgb(var(--accent))] rounded-full flex items-center justify-center cursor-pointer hover:bg-red-900 transition-colors shadow-lg">
                {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0]); }} />
              </label>
            </div>
            <p className="text-[rgb(var(--muted))] text-xs">Фото профиля (квадратное, 1:1)</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold text-[rgb(var(--muted))] uppercase tracking-wider mb-1.5">Имя</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ваше имя" className={inp} />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[10px] font-bold text-[rgb(var(--muted))] uppercase tracking-wider mb-1.5">О себе</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3} placeholder="Расскажите о себе..." className={area} />
          </div>

          {/* Social links */}
          <div>
            <label className="block text-[10px] font-bold text-[rgb(var(--muted))] uppercase tracking-wider mb-2">Социальные сети</label>
            <div className="space-y-2">
              {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-8 h-10 flex items-center justify-center text-[rgb(var(--muted))] flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={`${label}: ${placeholder}`}
                    className="flex-1 h-10 px-3 bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-xl text-[rgb(var(--foreground))] text-sm placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent)/0.5)] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[rgb(var(--border))] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[rgb(var(--border))] text-[rgb(var(--muted))] text-sm hover:text-[rgb(var(--foreground))] transition-colors">
            Отмена
          </button>
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${saved ? "bg-emerald-500 text-white" : "bg-[rgb(var(--accent))] text-white hover:bg-red-900"}`}>
            {saved ? <><Check className="w-4 h-4" /> Сохранено</> : <><Save className="w-4 h-4" /> Сохранить</>}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ── User Set editor modal ─────────────────────────────────────────────
type SetForm = { name: string; description: string; heroImages: string[]; productIds: string[] };
const EMPTY_SET: SetForm = { name: "", description: "", heroImages: [], productIds: [] };

function UserSetModal({
  userId, editing, onClose,
}: { userId: string; editing: PlayerSet | "new"; onClose: () => void }) {
  const { addSet, updateSet } = usePlayerSets();
  const customProds = useCustomProducts(s => s.products);
  const [form, setForm] = useState<SetForm>(() => {
    if (editing === "new") return EMPTY_SET;
    return {
      name:        editing.name,
      description: editing.description,
      heroImages:  editing.heroImages?.length ? editing.heroImages : (editing.heroImage ? [editing.heroImage] : []),
      productIds:  [...editing.productIds],
    };
  });
  const [productSearch, setProductSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const allProducts: Product[] = useMemo(() => {
    const customIds = new Set(customProds.map(p => p.id));
    return [
      ...customProds,
      ...mktProducts.filter(p => !customIds.has(p.id)).map(p => p as Product),
    ];
  }, [customProds]);

  const filtered = useMemo(() => {
    if (!productSearch) return allProducts;
    const q = productSearch.toLowerCase();
    return allProducts.filter(p => p.nameRu.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }, [allProducts, productSearch]);

  const uploadPhotos = async (files: FileList) => {
    setUploading(true);
    try {
      const results: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file); // keep set photos under the upload size limit
        const fd = new FormData();
        fd.append("userId", userId);
        fd.append("files", compressed);
        const res = await fetch("/api/user/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { paths } = await res.json();
        results.push(paths[0]);
      }
      setForm(f => ({ ...f, heroImages: [...f.heroImages, ...results] }));
    } catch (e) { alert(`Ошибка загрузки: ${e}`); }
    finally { setUploading(false); }
  };

  const removePhoto = (idx: number) =>
    setForm(f => ({ ...f, heroImages: f.heroImages.filter((_, i) => i !== idx) }));

  const toggleProduct = (id: string) =>
    setForm(f => ({
      ...f,
      productIds: f.productIds.includes(id) ? f.productIds.filter(p => p !== id) : [...f.productIds, id],
    }));

  const moveProduct = (index: number, dir: -1 | 1) => {
    const ids = [...form.productIds];
    const t = index + dir;
    if (t < 0 || t >= ids.length) return;
    [ids[index], ids[t]] = [ids[t], ids[index]];
    setForm(f => ({ ...f, productIds: ids }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const isNew = editing === "new";
    const id = isNew ? `uset-${Date.now()}` : editing.id;
    const primaryImage = form.heroImages[0] ?? "";
    const payload: Partial<PlayerSet> & { userId: string } = {
      userId,
      id,
      name:        form.name.trim(),
      description: form.description.trim(),
      creatorName: "",
      heroImage:   primaryImage,
      heroImages:  form.heroImages,
      productIds:  form.productIds,
      displayOrder: isNew ? 999 : (editing as PlayerSet).displayOrder,
      createdAt:   isNew ? new Date().toISOString() : (editing as PlayerSet).createdAt,
      type:        "player",
      isActive:    true,
    };
    try {
      const res = await fetch("/api/user/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (isNew) {
        addSet({ ...payload, createdBy: userId } as PlayerSet);
      } else {
        updateSet(id, { name: payload.name, description: payload.description, heroImage: primaryImage, heroImages: form.heroImages, productIds: form.productIds });
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 700);
    } catch (e) {
      alert(`Ошибка сохранения: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.2 }}
        className="fixed inset-x-4 top-8 bottom-8 max-w-2xl mx-auto z-50 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]">
          <h2 className="font-bold text-base text-[rgb(var(--foreground))]">
            {editing === "new" ? "Создать сет" : "Редактировать сет"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[rgb(var(--surface-2))] flex items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name & description */}
          <div>
            <label className="block text-[10px] font-bold text-[rgb(var(--muted))] uppercase tracking-wider mb-1.5">Название *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Мой сет для игры" className={inp} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[rgb(var(--muted))] uppercase tracking-wider mb-1.5">Описание</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Расскажите о своём сете..." className={area} />
          </div>

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-[rgb(var(--muted))] uppercase tracking-wider">
                Фото — квадратные (1:1)
              </label>
              <span className="text-[10px] text-amber-400/80 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Соотношение 1:1
              </span>
            </div>

            {form.heroImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.heroImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[rgb(var(--border))]">
                      <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                    </div>
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 text-[8px] font-bold bg-[rgb(var(--accent))] text-white px-1 rounded">Главное</span>
                    )}
                    <button onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center gap-3 border-2 border-dashed border-[rgb(var(--border))] rounded-xl p-4 cursor-pointer hover:border-[rgb(var(--accent)/0.4)] transition-colors">
              {uploading ? <Loader2 className="w-5 h-5 text-[rgb(var(--muted))] animate-spin flex-shrink-0" /> : <Upload className="w-5 h-5 text-[rgb(var(--muted))] flex-shrink-0" />}
              <div>
                <p className="text-[rgb(var(--muted))] text-xs">{uploading ? "Загрузка..." : "Загрузить фото (можно несколько)"}</p>
                <p className="text-[rgb(var(--muted))] text-[10px] mt-0.5 opacity-60">Квадратные фото 1:1 · JPG, PNG, WEBP</p>
              </div>
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={e => { if (e.target.files?.length) uploadPhotos(e.target.files); }} />
            </label>
          </div>

          {/* Products */}
          <div>
            <label className="block text-[10px] font-bold text-[rgb(var(--muted))] uppercase tracking-wider mb-2">
              Товары ({form.productIds.length})
            </label>

            {form.productIds.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {form.productIds.map((id, idx) => {
                  const p = allProducts.find(x => x.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-xl px-3 py-2">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[rgb(var(--border))] flex-shrink-0">
                        <Image src={p.image} alt={p.nameRu} fill className="object-cover" sizes="32px" />
                      </div>
                      <span className="flex-1 text-[rgb(var(--foreground))] text-xs font-medium truncate">{p.nameRu}</span>
                      <span className="text-[rgb(var(--accent))] text-xs font-bold flex-shrink-0">{formatPrice(p.price)}</span>
                      <div className="flex gap-0.5">
                        {([-1, 1] as const).map(d => (
                          <button key={d} onClick={() => moveProduct(idx, d)}
                            disabled={(d === -1 && idx === 0) || (d === 1 && idx === form.productIds.length - 1)}
                            className="w-6 h-6 flex items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] disabled:opacity-20 transition-colors">
                            {d === -1 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        ))}
                        <button onClick={() => toggleProduct(id)}
                          className="w-6 h-6 flex items-center justify-center text-[rgb(var(--muted))] hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--muted))]" />
              <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                placeholder="Поиск товаров для добавления..."
                className="w-full h-9 pl-9 pr-3 bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] rounded-xl text-[rgb(var(--foreground))] text-xs placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent)/0.5)] transition-colors" />
            </div>

            <div className="max-h-44 overflow-y-auto space-y-0.5">
              {filtered.filter(p => !form.productIds.includes(p.id)).slice(0, 30).map(p => (
                <button key={p.id} onClick={() => toggleProduct(p.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[rgb(var(--surface-2))] transition-colors text-left group">
                  <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-[rgb(var(--border))] flex-shrink-0">
                    <Image src={p.image} alt={p.nameRu} fill className="object-cover" sizes="28px" />
                  </div>
                  <span className="flex-1 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--foreground))] text-xs truncate transition-colors">{p.nameRu}</span>
                  <span className="text-[rgb(var(--muted))] text-xs">{formatPrice(p.price)}</span>
                  <Plus className="w-3 h-3 text-[rgb(var(--accent))] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[rgb(var(--border))] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[rgb(var(--border))] text-[rgb(var(--muted))] text-sm hover:text-[rgb(var(--foreground))] transition-colors">
            Отмена
          </button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${saved ? "bg-emerald-500 text-white" : "bg-[rgb(var(--accent))] text-white hover:bg-red-900"}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Сохранено</> : <><Save className="w-4 h-4" /> Сохранить</>}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const { slugs: wishlistSlugs } = useWishlist();
  const customProds = useCustomProducts(s => s.products);
  const products = [...customProds, ...staticProducts.filter(sp => !customProds.some(cp => cp.id === sp.id))];
  const allSets = usePlayerSets(s => s.sets);
  const { removeSet } = usePlayerSets();
  const router = useRouter();

  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [setEditing, setSetEditing] = useState<PlayerSet | "new" | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/auth/login");
  }, [isAuthenticated]);

  useEffect(() => {
    if (!user?.id) return;
    setOrdersLoading(true);
    fetch(`/api/orders?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => { if (data.orders) setOrders(data.orders.map(mapOrderFromApi)); })
      .catch(console.error)
      .finally(() => setOrdersLoading(false));
  }, [user?.id]);

  if (!user) return null;

  const wishlistProducts = products.filter(p => wishlistSlugs.includes(p.slug));
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const userSets = allSets.filter(s => s.createdBy === user.id);

  const handleDeleteSet = async (s: PlayerSet) => {
    if (!confirm(`Удалить «${s.name}»?`)) return;
    try {
      const res = await fetch("/api/user/sets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, setId: s.id }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "error"); }
      removeSet(s.id);
    } catch (e) { alert(`Ошибка: ${e}`); }
  };

  return (
    <>
      <div className="bg-[rgb(var(--background))] min-h-screen">
        {/* Header */}
        <div className="bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))]">
          <div className="container-uha py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[rgb(var(--accent)/0.15)] border border-[rgb(var(--accent)/0.3)] flex items-center justify-center flex-shrink-0">
                  {user.avatar
                    ? <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="64px" />
                    : <span className="text-[rgb(var(--accent))] font-bold text-xl">{initials}</span>}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {user.email && !user.email.includes("@telegram.local") && (
                    <p className="text-[rgb(var(--muted))] text-sm mt-0.5">{user.email}</p>
                  )}
                  {user.bio && <p className="text-[rgb(var(--muted))] text-xs mt-1 max-w-xs line-clamp-2">{user.bio}</p>}
                  {/* Social links */}
                  {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {user.socialLinks.instagram && (
                        <a href={`https://instagram.com/${user.socialLinks.instagram.replace("@","")}`} target="_blank" rel="noopener"
                          className="flex items-center gap-1 text-[10px] text-pink-400 hover:text-pink-300 transition-colors">
                          <Instagram className="w-3 h-3" /> {user.socialLinks.instagram}
                        </a>
                      )}
                      {user.socialLinks.tiktok && (
                        <a href={`https://tiktok.com/${user.socialLinks.tiktok.replace("@","@")}`} target="_blank" rel="noopener"
                          className="flex items-center gap-1 text-[10px] text-[rgb(var(--muted))] hover:text-white transition-colors">
                          <LinkIcon className="w-3 h-3" /> {user.socialLinks.tiktok}
                        </a>
                      )}
                      {user.socialLinks.youtube && (
                        <a href={`https://youtube.com/@${user.socialLinks.youtube.replace("@","")}`} target="_blank" rel="noopener"
                          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors">
                          <Youtube className="w-3 h-3" /> {user.socialLinks.youtube}
                        </a>
                      )}
                      {user.socialLinks.twitter && (
                        <a href={`https://x.com/${user.socialLinks.twitter.replace("@","")}`} target="_blank" rel="noopener"
                          className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 transition-colors">
                          <Twitter className="w-3 h-3" /> {user.socialLinks.twitter}
                        </a>
                      )}
                    </div>
                  )}
                  {user.telegram && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Send className="w-3 h-3 text-[#2AABEE]" />
                      <span className="text-[#2AABEE] text-xs font-medium">{user.telegram}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setEditProfileOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--accent)/0.4)] rounded-xl text-sm font-medium transition-all">
                  <Edit2 className="w-3.5 h-3.5" /> Редактировать
                </button>
                <button onClick={() => { logout(); router.replace("/"); }}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-red-400 hover:border-red-500/30 rounded-xl text-sm font-medium transition-all">
                  <LogOut className="w-4 h-4" /> Выйти
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { icon: Package,     label: "Заказов",    value: orders.length },
                { icon: Trophy,      label: "Мои сеты",   value: userSets.length },
                { icon: Heart,       label: "Сохранено",  value: wishlistSlugs.length },
                { icon: ShoppingBag, label: "В корзине",  value: items.length },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-2xl">
                  <Icon className="w-4 h-4 text-[rgb(var(--accent))] mb-2" />
                  <div className="text-xl font-bold">{value}</div>
                  <div className="text-xs text-[rgb(var(--muted))] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-uha py-10 space-y-10">
          {/* ── Orders ── */}
          <section>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Package className="w-5 h-5 text-[rgb(var(--accent))]" /> Мои заказы
            </h2>
            <div className="space-y-3">
              {ordersLoading && (
                <div className="py-8 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[rgb(var(--accent))]" />
                  <p className="text-sm text-[rgb(var(--muted))]">Загрузка заказов...</p>
                </div>
              )}
              {!ordersLoading && orders.map(order => {
                const info = ORDER_STATUS_INFO[order.status];
                const stepIdx = STEP_INDEX[order.status];
                const progress = order.status === "cancelled" ? 0 : ((stepIdx + 1) / ORDER_STEPS.length) * 100;
                return (
                  <motion.div key={order.id} whileHover={{ scale: 1.005 }}
                    className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden hover:border-[rgb(var(--foreground)/0.12)] transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(order)}>
                    <div className="flex items-center justify-between p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-sm font-mono">{order.orderNumber}</span>
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${info.color} ${info.bg} ${info.border}`}>{info.label}</span>
                        </div>
                        <p className="text-[rgb(var(--muted))] text-xs">{order.date} · {order.items.length} {order.items.length === 1 ? "товар" : "товара"}</p>
                        {order.estimatedDelivery && (
                          <p className="text-xs text-[rgb(var(--accent))] mt-1 flex items-center gap-1.5">
                            <Truck className="w-3 h-3" /> {order.estimatedDelivery}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                        <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                        <ChevronRight className="w-4 h-4 text-[rgb(var(--muted))]" />
                      </div>
                    </div>
                    {order.status !== "cancelled" && (
                      <div className="h-1 bg-[rgb(var(--surface-2))]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                          className={`h-full ${order.status === "delivered" ? "bg-emerald-400" : "bg-[rgb(var(--accent))]"}`} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {!ordersLoading && orders.length === 0 && (
                <div className="py-12 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                  <Package className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                  <p className="text-[rgb(var(--muted))]">Заказов пока нет</p>
                  <Link href="/marketplace" className="text-[rgb(var(--accent))] text-sm mt-1 inline-block hover:underline">Перейти в каталог</Link>
                </div>
              )}
            </div>
          </section>

          {/* ── My Sets ── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[rgb(var(--accent))]" /> Мои сеты
                {userSets.length > 0 && <span className="text-xs font-normal text-[rgb(var(--muted))]">· {userSets.length} шт.</span>}
              </h2>
              <button onClick={() => setSetEditing("new")}
                className="h-9 px-4 bg-[rgb(var(--accent))] text-white text-xs font-bold rounded-xl hover:bg-red-900 transition-colors flex items-center gap-1.5 uppercase tracking-wide">
                <Plus className="w-3.5 h-3.5" /> Создать
              </button>
            </div>

            {userSets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userSets.map(s => {
                  const thumb = s.heroImages?.[0] ?? s.heroImage;
                  const extraPhotos = (s.heroImages?.length ?? 0) - 1;
                  return (
                    <div key={s.id} className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden group">
                      <div className="relative aspect-square bg-[rgb(var(--surface-2))]">
                        {thumb
                          ? <Image src={thumb} alt={s.name} fill className="object-contain" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
                          : <div className="w-full h-full flex items-center justify-center text-4xl">🏀</div>}
                        {extraPhotos > 0 && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            +{extraPhotos}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm text-[rgb(var(--foreground))] mb-1 truncate">{s.name}</h3>
                        {s.description && <p className="text-[rgb(var(--muted))] text-xs line-clamp-2 mb-3">{s.description}</p>}
                        <div className="flex items-center justify-between">
                          <span className="text-[rgb(var(--muted))] text-xs">{s.productIds.length} товар{s.productIds.length !== 1 ? "а" : ""}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSetEditing(s)}
                              className="w-8 h-8 rounded-lg bg-[rgb(var(--surface-2))] flex items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteSet(s)}
                              className="w-8 h-8 rounded-lg bg-[rgb(var(--surface-2))] flex items-center justify-center text-[rgb(var(--muted))] hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                <p className="text-[rgb(var(--muted))] text-sm">Создайте свой первый сет</p>
                <button onClick={() => setSetEditing("new")}
                  className="text-[rgb(var(--accent))] text-sm mt-2 inline-block hover:underline">
                  Создать сет
                </button>
              </div>
            )}
          </section>

          {/* ── Wishlist ── */}
          <section>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[rgb(var(--accent))]" /> Сохранённые товары
              {wishlistSlugs.length > 0 && <span className="text-xs font-normal text-[rgb(var(--muted))]">· {wishlistSlugs.length} шт.</span>}
            </h2>
            {wishlistProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlistProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="py-10 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                <Heart className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                <p className="text-[rgb(var(--muted))] text-sm">Нет сохранённых товаров</p>
                <Link href="/marketplace" className="text-[rgb(var(--accent))] text-sm mt-1 inline-block hover:underline">Добавить из каталога</Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedOrder && <OrderTracker order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        {editProfileOpen && <EditProfileModal onClose={() => setEditProfileOpen(false)} />}
        {setEditing !== null && (
          <UserSetModal userId={user.id} editing={setEditing} onClose={() => setSetEditing(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
