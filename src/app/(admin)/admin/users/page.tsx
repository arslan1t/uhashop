"use client";

import { useState, useEffect } from "react";
import { Shield, Mail, Phone, Send, Search, GraduationCap, Users, RefreshCw, Loader2, ShoppingBag, AlertCircle, Megaphone, CheckCircle2 } from "lucide-react";
import { useAcademyStore } from "@/store/academy";
import { POSITION_SHORT, STATUS_LABELS, STATUS_COLORS, formatDateRu } from "@/data/academy";
import { getAdminToken } from "@/store/admin";

type UserTab = "shop" | "admins" | "athletes" | "parents" | "broadcast";

const ADMINS = [
  { id: "1", name: "UHA Admin", email: "admin@uhashop.uz", role: "super_admin", lastLogin: "2025-05-26 14:30" },
];

interface ShopUser {
  id: string;
  name: string;
  email: string;
  telegram?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in?: string;
  source?: "email" | "telegram";
  chatId?: number;
  phone?: string;
}

export default function AdminUsersPage() {
  const { athletes, parents } = useAcademyStore();
  const [tab, setTab] = useState<UserTab>("shop");
  const [search, setSearch] = useState("");
  const [shopUsers, setShopUsers] = useState<ShopUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Broadcast state
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [reachable, setReachable] = useState<number | null>(null);

  const fetchShopUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-token": getAdminToken() },
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setShopUsers(data.users || []);
      }
    } catch {
      setError("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const fetchReachable = async () => {
    try {
      const res = await fetch("/api/admin/telegram-broadcast", {
        headers: { "x-admin-token": getAdminToken() },
      });
      const data = await res.json();
      setReachable(data.reachable ?? 0);
    } catch {
      setReachable(0);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim() || broadcasting) return;
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await fetch("/api/admin/telegram-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
        body: JSON.stringify({ message: broadcastMsg }),
      });
      const data = await res.json();
      setBroadcastResult(data);
      if (data.sent > 0) setBroadcastMsg("");
    } catch {
      setBroadcastResult({ sent: 0, failed: 0, total: 0 });
    } finally {
      setBroadcasting(false);
    }
  };

  useEffect(() => {
    fetchShopUsers();
    fetchReachable();
  }, []);

  const q = search.toLowerCase();
  const filteredShop = shopUsers.filter(u => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  const filteredAthletes = athletes.filter(a => !q || a.name.toLowerCase().includes(q));
  const filteredParents = parents.filter(p => !q || p.name.toLowerCase().includes(q) || p.phone.includes(q));
  const filteredAdmins = ADMINS.filter(a => !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));

  const totalUsers = shopUsers.length + ADMINS.length + athletes.length + parents.length;

  const tgReachable = reachable ?? shopUsers.filter(u => u.chatId).length;

  const TABS: { key: UserTab; label: string; count: number; icon: typeof Users; color: string }[] = [
    { key: "shop", label: "UHA Shop", count: shopUsers.length, icon: ShoppingBag, color: "text-red-400" },
    { key: "admins", label: "Администраторы", count: ADMINS.length, icon: Shield, color: "text-red-400" },
    { key: "athletes", label: "Спортсмены", count: athletes.length, icon: GraduationCap, color: "text-blue-400" },
    { key: "parents", label: "Родители", count: parents.length, icon: Users, color: "text-purple-400" },
    { key: "broadcast", label: "Рассылка", count: tgReachable, icon: Megaphone, color: "text-sky-400" },
  ];

  const formatDate = (str?: string) => {
    if (!str) return "—";
    try {
      const d = new Date(str);
      return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" }) +
        " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    } catch { return "—"; }
  };

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" /> Пользователи
          </h1>
          <p className="text-[#555] text-xs mt-0.5">{totalUsers} пользователей в системе</p>
        </div>
        <button onClick={fetchShopUsers} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#222] rounded-xl text-sm text-[#888] hover:text-white hover:border-[#333] transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Обновить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "UHA Shop", value: shopUsers.length, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          { label: "Администраторы", value: ADMINS.length, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
          { label: "Спортсмены", value: athletes.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Родители", value: parents.length, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.bg}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[#555] text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 overflow-x-auto flex-1">
          {TABS.map(({ key, label, count, icon: Icon, color }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                tab === key
                  ? "bg-red-800/15 text-red-500 border border-red-800/25"
                  : "text-[#666] hover:text-white hover:bg-[#141414] border border-transparent"
              }`}>
              <Icon className={`w-3.5 h-3.5 ${tab === key ? "text-red-500" : color}`} />
              {label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === key ? "bg-red-800/30 text-red-400" : "bg-[#222] text-[#555]"}`}>{count}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
            className="w-full h-9 pl-9 pr-4 bg-[#141414] border border-[#222] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-500/50 transition-colors" />
        </div>
      </div>

      {/* ─── UHA SHOP USERS ─── */}
      {tab === "shop" && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16 border border-[#1a1a1a] rounded-2xl">
              <Loader2 className="w-6 h-6 text-[#555] animate-spin" />
              <span className="text-[#555] text-sm ml-3">Загрузка...</span>
            </div>
          ) : error === "table_not_found" ? (
            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-amber-400 font-semibold text-sm mb-2">Нужно настроить базу данных</h3>
                  <p className="text-amber-400/70 text-xs leading-relaxed mb-4">
                    Таблица <code className="bg-amber-500/20 px-1.5 py-0.5 rounded">profiles</code> не найдена в Supabase.
                    Выполни SQL-миграцию чтобы увидеть зарегистрированных пользователей.
                  </p>
                  <div className="space-y-2 text-xs text-amber-400/60">
                    <p className="font-bold text-amber-400/80">Инструкция:</p>
                    <p>1. Открой Supabase Dashboard → SQL Editor</p>
                    <p>2. Выполни файл <code className="bg-amber-500/20 px-1 py-0.5 rounded">supabase-profiles.sql</code> из корня проекта</p>
                    <p>3. Нажми «Обновить» здесь</p>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 text-sm font-semibold">Ошибка загрузки</p>
                <p className="text-red-400/60 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          ) : filteredShop.length === 0 ? (
            <div className="py-16 text-center border border-[#1a1a1a] border-dashed rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-[#333] mx-auto mb-3" />
              <p className="text-[#555] text-sm">
                {search ? `По запросу "${search}" ничего нет` : "Зарегистрированных пользователей пока нет"}
              </p>
            </div>
          ) : (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#1a1a1a] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-red-500" />
                <h3 className="text-white font-semibold text-sm">Пользователи UHA Shop</h3>
                <span className="text-[10px] font-bold bg-red-800/15 text-red-500 px-2 py-0.5 rounded-full border border-red-800/25">{shopUsers.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1a1a]">
                      {["Пользователь", "Контакт", "Telegram", "Источник", "Дата регистрации"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161616]">
                    {filteredShop.map(u => (
                      <tr key={u.id} className="hover:bg-[#141414] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center flex-shrink-0">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                              ) : (
                                <span className="text-red-400 text-[10px] font-bold">
                                  {(u.name || u.email || "?").charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{u.name || "—"}</p>
                              {u.phone && <p className="text-[#555] text-[10px] flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{u.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {u.email && !u.email.endsWith("@telegram.local") ? (
                            <span className="text-[#888] text-xs flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {u.email}
                            </span>
                          ) : <span className="text-[#444] text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {u.telegram ? (
                            <a href={`https://t.me/${u.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                              className="text-[#2AABEE] text-xs flex items-center gap-1 hover:underline">
                              <Send className="w-3 h-3" /> {u.telegram}
                            </a>
                          ) : <span className="text-[#444] text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {u.source === "telegram" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
                              Telegram {u.chatId ? "✓" : ""}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Email</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#666] text-xs whitespace-nowrap">
                          {formatDate((u as unknown as { createdAt?: string }).createdAt || u.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ADMINS ─── */}
      {tab === "admins" && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1a1a1a] flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" />
            <h3 className="text-white font-semibold text-sm">Администраторы</h3>
            <span className="text-[10px] font-bold bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/25">{ADMINS.length}</span>
          </div>
          <div className="divide-y divide-[#161616]">
            {filteredAdmins.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#141414] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-red-800/20 border border-red-800/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-500 font-bold">{u.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{u.name}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-800/15 text-red-500 border border-red-800/25">Super Admin</span>
                  </div>
                  <span className="text-[#555] text-xs flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" /> {u.email}
                  </span>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[#555] text-[10px]">Последний вход</p>
                  <p className="text-[#888] text-xs">{u.lastLogin}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ATHLETES ─── */}
      {tab === "athletes" && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1a1a1a] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <h3 className="text-white font-semibold text-sm">Спортсмены Академии</h3>
            <span className="text-[10px] font-bold bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/25">{athletes.length}</span>
          </div>
          {filteredAthletes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Спортсмен", "Группа", "Позиция", "Статус", "Родитель", "PIN"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]">
                  {filteredAthletes.map(a => {
                    const par = parents.find(p => p.id === a.parentId);
                    return (
                      <tr key={a.id} className="hover:bg-[#141414] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-400 text-[10px] font-bold">{a.name.split(" ").map(n => n[0]).join("")}</span>
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{a.name}</p>
                              {a.joinedAt && <p className="text-[#555] text-[10px]">с {formatDateRu(a.joinedAt)}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-blue-400 text-xs font-bold">{a.ageGroup}</span></td>
                        <td className="px-4 py-3 text-white text-sm">{POSITION_SHORT[a.position]}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${STATUS_COLORS[a.status]}`}>{STATUS_LABELS[a.status]}</span>
                        </td>
                        <td className="px-4 py-3">
                          {par ? <div><p className="text-white text-xs">{par.name}</p><p className="text-[#555] text-[10px]">{par.phone}</p></div> : <span className="text-[#555] text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3"><span className="text-[#555] text-xs font-mono">{a.pin}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-[#555] text-sm">Ничего не найдено</div>
          )}
        </div>
      )}

      {/* ─── PARENTS ─── */}
      {tab === "parents" && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1a1a1a] flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <h3 className="text-white font-semibold text-sm">Родители</h3>
            <span className="text-[10px] font-bold bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/25">{parents.length}</span>
          </div>
          {filteredParents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Родитель", "Телефон", "Telegram", "Дети", "PIN"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]">
                  {filteredParents.map(p => {
                    const ch = athletes.filter(a => p.childrenIds.includes(a.id));
                    return (
                      <tr key={p.id} className="hover:bg-[#141414] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-400 text-[10px] font-bold">{p.name.split(" ").map(n => n[0]).join("")}</span>
                            </div>
                            <span className="text-white text-sm font-medium">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#888] text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</span>
                        </td>
                        <td className="px-4 py-3">
                          {p.telegram ? (
                            <a href={`https://t.me/${p.telegram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                              className="text-[#2AABEE] text-xs hover:underline flex items-center gap-1">
                              <Send className="w-3 h-3" /> {p.telegram}
                            </a>
                          ) : <span className="text-[#555] text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {ch.map(c => (
                              <span key={c.id} className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">{c.name.split(" ")[0]} ({c.ageGroup})</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-[#555] text-xs font-mono">{p.pin}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-[#555] text-sm">Ничего не найдено</div>
          )}
        </div>
      )}

      {/* ─── BROADCAST ─── */}
      {tab === "broadcast" && (
        <div className="space-y-4">
          {/* Stats card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border bg-sky-500/10 border-sky-500/20">
              <div className="text-2xl font-bold text-sky-400">{tgReachable}</div>
              <div className="text-[#555] text-xs mt-0.5">Telegram пользователей</div>
            </div>
            <div className="p-4 rounded-2xl border bg-[#111] border-[#1a1a1a]">
              <div className="text-2xl font-bold text-white">{shopUsers.length}</div>
              <div className="text-[#555] text-xs mt-0.5">Всего в базе</div>
            </div>
            <div className="p-4 rounded-2xl border bg-[#111] border-[#1a1a1a]">
              <div className="text-2xl font-bold text-emerald-400">
                {tgReachable > 0 ? Math.round(tgReachable / Math.max(shopUsers.length, 1) * 100) : 0}%
              </div>
              <div className="text-[#555] text-xs mt-0.5">Охват через Telegram</div>
            </div>
          </div>

          {/* Compose */}
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-sky-400" />
              <h3 className="text-white font-semibold text-sm">Отправить рассылку</h3>
            </div>

            <textarea
              value={broadcastMsg}
              onChange={e => setBroadcastMsg(e.target.value)}
              placeholder="Текст сообщения... (поддерживает HTML: <b>жирный</b>, <i>курсив</i>)"
              rows={5}
              className="w-full px-4 py-3 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-[#555] text-xs">{broadcastMsg.length} символов · получат {tgReachable} человек</span>
              <button
                onClick={sendBroadcast}
                disabled={!broadcastMsg.trim() || broadcasting || tgReachable === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {broadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {broadcasting ? "Отправка..." : "Отправить"}
              </button>
            </div>

            {broadcastResult && (
              <div className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-sm ${
                broadcastResult.sent > 0
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Отправлено: {broadcastResult.sent} · Ошибки: {broadcastResult.failed} · Всего: {broadcastResult.total}
              </div>
            )}
          </div>

          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
            <p className="text-[#555] text-xs">
              Рассылка работает через Telegram Bot API. Получат сообщение только те пользователи,
              которые авторизовались через Telegram-бота (UhaAuthenticationbot).
              Пользователи с email-регистрацией не получат сообщение.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
        <p className="text-[#555] text-xs">
          UHA Shop — зарегистрированные через email или Telegram бота.
          Спортсмены и родители — аккаунты академии с PIN-авторизацией.
        </p>
      </div>
    </div>
  );
}
