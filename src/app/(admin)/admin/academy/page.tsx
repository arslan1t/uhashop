"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Users, Calendar, Dumbbell, CreditCard,
  ArrowUpRight, Plus, Search, Send, XCircle, Trash2,
  TrendingUp, AlertTriangle, CheckCircle2, Edit3,
  CalendarDays, Medal, Camera, Image as ImageIcon, Play,
  ClipboardList, MessageCircle, UserCheck, UserX, ChevronDown,
} from "lucide-react";
import {
  subscribeToApplications, updateApplicationStatus,
  type AcademyApplication, type ApplicationStatus,
} from "@/lib/firebase/academyApplications";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { useAcademyStore } from "@/store/academy";
import {
  POSITION_SHORT, STATUS_LABELS, STATUS_COLORS,
  SESSION_TYPE_LABELS, SESSION_TYPE_COLORS,
  PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS,
  EXERCISE_CATEGORY_ICONS, EXERCISE_CATEGORY_LABELS,
  EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, EVENT_TYPE_ICONS,
  BADGE_RARITY_LABELS, BADGE_RARITY_COLORS,
  PROGRESS_METRIC_LABELS, PROGRESS_METRIC_ICONS, PROGRESS_METRIC_UNITS,
  formatDateRu, isToday, formatCurrency, formatMonthRu,
  type AcademyAthlete, type AcademyParent, type TrainingSession,
  type Exercise, type Payment, type AcademyEvent, type AcademyBadge, type ProgressEntry, type MediaItem,
  type AgeGroup, type Position, type AthleteStatus, type SessionType, type ExerciseCategory, type PaymentStatus,
  type EventType, type BadgeRarity, type ProgressMetric,
} from "@/data/academy";

type Tab = "applications" | "overview" | "athletes" | "parents" | "schedule" | "exercises" | "payments" | "events" | "badges" | "progress" | "media";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const INP = "w-full h-10 px-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-blue-500/50 transition-colors";

export default function AdminAcademyPage() {
  const store = useAcademyStore();
  const { athletes, parents, schedule, exercises, payments, events, badges, athleteBadges, progress, media } = store;

  const [tab, setTab] = useState<Tab>("applications");
  const [applications, setApplications] = useState<AcademyApplication[]>([]);
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Subscribe to academy applications from Firestore
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const unsub = subscribeToApplications(setApplications);
    return unsub;
  }, []);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"athlete" | "parent" | "session" | "exercise" | "payment" | "event" | "badge" | "progress" | "media" | null>(null);

  // Stats
  const activeAthletes = athletes.filter(a => a.status === "active").length;
  const todaySessions = schedule.filter(s => isToday(s.date)).length;
  const pendingPayments = payments.filter(p => p.status === "pending" || p.status === "overdue");
  const totalRevenue = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const upcomingEvents = events.filter(e => e.date >= new Date().toISOString().slice(0, 10)).length;

  const newAppsCount = applications.filter(a => a.status === "new").length;

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    setUpdatingId(id);
    try { await updateApplicationStatus(id, status); }
    catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const APP_STATUS_STYLES: Record<ApplicationStatus, string> = {
    new:       "bg-blue-500/15 text-blue-400 border-blue-500/25",
    contacted: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    enrolled:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    rejected:  "bg-red-500/15 text-red-400 border-red-500/25",
  };
  const APP_STATUS_LABELS: Record<ApplicationStatus, string> = {
    new: "Новая", contacted: "Связались", enrolled: "Зачислен", rejected: "Отказ",
  };
  const SKILL_LABELS: Record<string, string> = {
    beginner: "Начинающий", intermediate: "Любитель",
    advanced: "Продвинутый", pro: "Профессионал",
  };

  const filteredApps = applications.filter(a => {
    const matchStatus = appStatusFilter === "all" || a.status === appStatusFilter;
    const q = appSearch.toLowerCase();
    const matchSearch = !q ||
      a.parentName.toLowerCase().includes(q) ||
      a.parentTg.toLowerCase().includes(q) ||
      (a.athleteName ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const TABS: { key: Tab; label: string; icon: typeof GraduationCap; badge?: number }[] = [
    { key: "applications", label: "Заявки", icon: ClipboardList, badge: newAppsCount || undefined },
    { key: "overview", label: "Обзор", icon: GraduationCap },
    { key: "athletes", label: "Спортсмены", icon: Users, badge: athletes.length },
    { key: "parents", label: "Родители", icon: Users, badge: parents.length },
    { key: "schedule", label: "Расписание", icon: Calendar, badge: todaySessions || undefined },
    { key: "exercises", label: "Задания", icon: Dumbbell, badge: exercises.length },
    { key: "payments", label: "Оплата", icon: CreditCard, badge: pendingPayments.length || undefined },
    { key: "events", label: "События", icon: CalendarDays, badge: upcomingEvents || undefined },
    { key: "badges", label: "Бейджи", icon: Medal, badge: badges.length },
    { key: "progress", label: "Прогресс", icon: TrendingUp, badge: progress.length },
    { key: "media", label: "Медиа", icon: Camera, badge: media.length },
  ];

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" /> UHA Academy
          </h1>
          <p className="text-[#555] text-xs mt-0.5">Управление академией</p>
        </div>
        <Link href="/academy" target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#222] rounded-xl text-sm text-[#888] hover:text-white hover:border-[#333] transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5" /> Открыть
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              tab === key ? "bg-blue-500/15 text-blue-400 border border-blue-500/25" : "text-[#666] hover:text-white hover:bg-[#141414] border border-transparent"
            }`}>
            <Icon className="w-4 h-4" />
            {label}
            {badge !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === key ? "bg-blue-500/30 text-blue-300" : "bg-[#222] text-[#666]"}`}>{badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ APPLICATIONS ═══ */}
      {tab === "applications" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input value={appSearch} onChange={e => setAppSearch(e.target.value)}
                placeholder="Поиск по имени или Telegram..."
                className="w-full h-10 pl-10 pr-4 bg-[#141414] border border-[#222] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div className="flex gap-2">
              {(["all","new","contacted","enrolled","rejected"] as const).map(s => (
                <button key={s} onClick={() => setAppStatusFilter(s)}
                  className={`h-10 px-3 rounded-xl text-xs font-semibold uppercase tracking-wide transition-colors ${
                    appStatusFilter === s
                      ? "bg-blue-600 text-white"
                      : "bg-[#141414] border border-[#222] text-[#666] hover:text-white"
                  }`}>
                  {s === "all" ? "Все" : APP_STATUS_LABELS[s as ApplicationStatus]}
                  {s === "new" && newAppsCount > 0 && (
                    <span className="ml-1.5 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{newAppsCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Applications list */}
          {filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-[#555] text-sm">
                {applications.length === 0 ? "Заявок пока нет" : "Нет заявок по фильтру"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map(app => (
                <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Left: info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide ${APP_STATUS_STYLES[app.status]}`}>
                          {APP_STATUS_LABELS[app.status]}
                        </span>
                        <span className="text-[#444] text-xs">
                          {app.createdAt
                            ? (() => {
                                const d = typeof app.createdAt === "string"
                                  ? new Date(app.createdAt)
                                  : typeof app.createdAt === "object" && "toDate" in (app.createdAt as object)
                                    ? (app.createdAt as { toDate: () => Date }).toDate()
                                    : null;
                                return d ? d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }) : "—";
                              })()
                            : "—"
                          }
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div>
                          <span className="text-[#555]">Родитель: </span>
                          <span className="text-white font-medium">{app.parentName}</span>
                        </div>
                        <div>
                          <span className="text-[#555]">Telegram: </span>
                          <a href={`https://t.me/${app.parentTg.replace("@","")}`} target="_blank"
                            className="text-blue-400 hover:text-blue-300 transition-colors font-mono">
                            {app.parentTg}
                          </a>
                        </div>
                        <div>
                          <span className="text-[#555]">Возраст: </span>
                          <span className="text-white">{app.age} лет</span>
                        </div>
                        {app.athleteName && (
                          <div>
                            <span className="text-[#555]">Спортсмен: </span>
                            <span className="text-white">{app.athleteName}</span>
                          </div>
                        )}
                        {app.skillLevel && (
                          <div>
                            <span className="text-[#555]">Уровень: </span>
                            <span className="text-white">{SKILL_LABELS[app.skillLevel] ?? app.skillLevel}</span>
                          </div>
                        )}
                        {app.height && (
                          <div>
                            <span className="text-[#555]">Рост / Вес: </span>
                            <span className="text-white">{app.height} см {app.weight ? `/ ${app.weight} кг` : ""}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <a href={`https://t.me/${app.parentTg.replace("@","")}`} target="_blank"
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-xl hover:bg-blue-500/20 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" /> Написать
                      </a>
                      {app.status !== "enrolled" && (
                        <button disabled={updatingId === app.id}
                          onClick={() => handleStatusChange(app.id!, "enrolled")}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                          <UserCheck className="w-3.5 h-3.5" /> Зачислить
                        </button>
                      )}
                      {app.status !== "contacted" && app.status !== "enrolled" && (
                        <button disabled={updatingId === app.id}
                          onClick={() => handleStatusChange(app.id!, "contacted")}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl hover:bg-amber-500/20 transition-colors disabled:opacity-50">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Связались
                        </button>
                      )}
                      {app.status !== "rejected" && (
                        <button disabled={updatingId === app.id}
                          onClick={() => handleStatusChange(app.id!, "rejected")}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50">
                          <UserX className="w-3.5 h-3.5" /> Отказ
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ OVERVIEW ═══ */}
      {tab === "overview" && (
        <div className="space-y-6">
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Спортсменов", value: athletes.length, sub: `${activeAthletes} активных`, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "Тренировок сегодня", value: todaySessions, sub: `${schedule.length} всего`, icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
              { label: "Ожидает оплаты", value: pendingPayments.length, sub: formatCurrency(pendingPayments.reduce((s, p) => s + p.amount, 0)), icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              { label: "Оплачено", value: formatCurrency(totalRevenue), sub: "За все время", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            ].map(({ label, value, sub, icon: Icon, color, bg }) => (
              <motion.div key={label} variants={fadeUp} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <div className="text-white text-xl font-bold mb-0.5">{value}</div>
                <div className="text-[#444] text-xs">{label}</div>
                <div className="text-[#333] text-[11px] mt-0.5">{sub}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
                <h3 className="text-white font-semibold text-sm">Спортсмены</h3>
                <button onClick={() => setTab("athletes")} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">Все <ArrowUpRight className="w-3 h-3" /></button>
              </div>
              <div className="divide-y divide-[#161616]">
                {athletes.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#141414] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 text-[10px] font-bold">{a.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{a.name}</p>
                      <p className="text-[#555] text-[11px]">{a.ageGroup} · {POSITION_SHORT[a.position]}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[a.status]}`}>{STATUS_LABELS[a.status]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
                <h3 className="text-white font-semibold text-sm">Ближайшие события</h3>
                <button onClick={() => setTab("events")} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">Все <ArrowUpRight className="w-3 h-3" /></button>
              </div>
              <div className="divide-y divide-[#161616]">
                {events.filter(e => e.date >= new Date().toISOString().slice(0, 10)).slice(0, 4).map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#141414] transition-colors">
                    <span className="text-lg">{EVENT_TYPE_ICONS[ev.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{ev.title}</p>
                      <p className="text-[#555] text-[10px]">{formatDateRu(ev.date)} · {ev.location}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[ev.type]}`}>{EVENT_TYPE_LABELS[ev.type]}</span>
                  </div>
                ))}
                {events.filter(e => e.date >= new Date().toISOString().slice(0, 10)).length === 0 && (
                  <div className="py-8 text-center text-[#555] text-sm">Нет предстоящих событий</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ATHLETES ═══ */}
      {tab === "athletes" && (
        <div>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени..."
                className="w-full h-10 pl-10 pr-4 bg-[#141414] border border-[#222] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <button onClick={() => setModal("athlete")} className="h-10 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Спортсмен
            </button>
          </div>
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#1a1a1a]">
                {["Спортсмен", "Группа", "Позиция", "Рост/Вес", "Родитель", "Статус", "PIN", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#161616]">
                {athletes.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase())).map(a => {
                  const par = parents.find(p => p.id === a.parentId);
                  return (
                    <tr key={a.id} className="hover:bg-[#141414] transition-colors">
                      <td className="px-4 py-3"><div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 text-[10px] font-bold">{a.name.split(" ").map(n => n[0]).join("")}</span>
                        </div>
                        <span className="text-white text-sm font-medium">{a.name}</span>
                      </div></td>
                      <td className="px-4 py-3"><span className="text-blue-400 text-xs font-bold">{a.ageGroup}</span></td>
                      <td className="px-4 py-3 text-white text-sm">{POSITION_SHORT[a.position]}</td>
                      <td className="px-4 py-3 text-[#888] text-xs">{a.height || "—"} / {a.weight || "—"}</td>
                      <td className="px-4 py-3">{par ? <div><p className="text-white text-xs">{par.name}</p><p className="text-[#555] text-[10px]">{par.telegram || par.phone}</p></div> : <span className="text-[#555] text-xs">—</span>}</td>
                      <td className="px-4 py-3">
                        <select value={a.status} onChange={e => store.updateAthlete(a.id, { status: e.target.value as AthleteStatus })}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer bg-transparent focus:outline-none ${STATUS_COLORS[a.status]}`}>
                          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#111] text-white normal-case">{l}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3"><span className="text-[#555] text-xs font-mono">{a.pin}</span></td>
                      <td className="px-4 py-3"><button onClick={() => store.removeAthlete(a.id)} className="text-[#555] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {athletes.length === 0 && <div className="py-12 text-center text-[#555] text-sm">Спортсмены не добавлены</div>}
          </div>
        </div>
      )}

      {/* ═══ PARENTS ═══ */}
      {tab === "parents" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setModal("parent")} className="h-10 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Родитель
            </button>
          </div>
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#1a1a1a]">
                {["Родитель", "Телефон", "Telegram", "Email", "Дети", "PIN"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#161616]">
                {parents.map(p => {
                  const ch = athletes.filter(a => p.childrenIds.includes(a.id));
                  return (
                    <tr key={p.id} className="hover:bg-[#141414] transition-colors">
                      <td className="px-4 py-3 text-white text-sm font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-[#888] text-sm">{p.phone}</td>
                      <td className="px-4 py-3">{p.telegram ? <a href={`https://t.me/${p.telegram.replace("@","")}`} target="_blank" className="text-[#2AABEE] text-sm hover:underline flex items-center gap-1"><Send className="w-3 h-3" /> {p.telegram}</a> : <span className="text-[#555]">—</span>}</td>
                      <td className="px-4 py-3 text-[#888] text-xs">{p.email || "—"}</td>
                      <td className="px-4 py-3">{ch.map(c => <span key={c.id} className="inline-block text-xs bg-[#1a1a1a] text-white px-2 py-0.5 rounded mr-1 mb-0.5">{c.name} ({c.ageGroup})</span>)}</td>
                      <td className="px-4 py-3 text-[#555] text-xs font-mono">{p.pin}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ SCHEDULE ═══ */}
      {tab === "schedule" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setModal("session")} className="h-10 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Тренировка
            </button>
          </div>
          <div className="space-y-4">
            {(() => {
              const byDate = schedule.reduce<Record<string, typeof schedule>>((acc, s) => { if (!acc[s.date]) acc[s.date] = []; acc[s.date].push(s); return acc; }, {});
              return Object.keys(byDate).sort().map(date => (
                <div key={date}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isToday(date) ? "text-blue-400" : "text-[#555]"}`}>
                    {isToday(date) ? "Сегодня" : formatDateRu(date)}
                  </p>
                  <div className="space-y-2">
                    {byDate[date].sort((a, b) => a.timeStart.localeCompare(b.timeStart)).map(s => (
                      <div key={s.id} className="flex items-center gap-4 p-4 bg-[#111] border border-[#1a1a1a] rounded-2xl hover:border-[#262626] transition-colors group">
                        <div className="w-16 text-center flex-shrink-0">
                          <p className="text-white text-sm font-bold">{s.timeStart}</p>
                          <p className="text-[#444] text-[10px]">{s.timeEnd}</p>
                        </div>
                        <div className="w-px h-10 bg-[#1a1a1a]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{s.title}</p>
                          <p className="text-[#555] text-xs">{s.location} · {s.coach}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {s.ageGroup && <span className="text-blue-400 text-[10px] font-bold">{s.ageGroup}</span>}
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${SESSION_TYPE_COLORS[s.type]}`}>{SESSION_TYPE_LABELS[s.type]}</span>
                          <button onClick={() => store.removeSession(s.id)} className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-red-400 transition-all ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
            {schedule.length === 0 && <div className="py-12 text-center text-[#555] text-sm border border-[#1a1a1a] border-dashed rounded-2xl">Расписание пусто</div>}
          </div>
        </div>
      )}

      {/* ═══ EXERCISES ═══ */}
      {tab === "exercises" && (
        <div>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
                className="w-full h-10 pl-10 pr-4 bg-[#141414] border border-[#222] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <button onClick={() => setModal("exercise")} className="h-10 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Задание
            </button>
          </div>
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#1a1a1a]">
                {["Задание", "Спортсмен", "Категория", "Параметры", "Дата", "Статус", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#161616]">
                {exercises.filter(e => { if (!search) return true; const q = search.toLowerCase(); const ath = athletes.find(a => a.id === e.athleteId); return e.title.toLowerCase().includes(q) || ath?.name.toLowerCase().includes(q); })
                  .sort((a, b) => b.assignedDate.localeCompare(a.assignedDate)).map(ex => {
                    const ath = athletes.find(a => a.id === ex.athleteId);
                    return (
                      <tr key={ex.id} className="hover:bg-[#141414] transition-colors">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-base">{EXERCISE_CATEGORY_ICONS[ex.category]}</span><div><p className="text-white text-sm font-medium">{ex.title}</p><p className="text-[#555] text-[10px] max-w-[200px] truncate">{ex.description}</p></div></div></td>
                        <td className="px-4 py-3">{ath ? <span className="text-white text-xs">{ath.name} <span className="text-blue-400">({ath.ageGroup})</span></span> : <span className="text-[#555]">—</span>}</td>
                        <td className="px-4 py-3"><span className="text-[10px] text-[#888] bg-[#1a1a1a] px-2 py-0.5 rounded-full">{EXERCISE_CATEGORY_LABELS[ex.category]}</span></td>
                        <td className="px-4 py-3 text-[#888] text-xs whitespace-nowrap">{ex.sets ? `${ex.sets} подх.` : ""} {ex.reps ? `${ex.reps} повт.` : ""} {ex.duration || ""}</td>
                        <td className="px-4 py-3 text-[#888] text-xs whitespace-nowrap">{isToday(ex.assignedDate) ? <span className="text-blue-400 font-bold">Сегодня</span> : formatDateRu(ex.assignedDate)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => store.toggleExercise(ex.id)} className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${ex.completed ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25"}`}>
                            {ex.completed ? "Выполнено" : "В процессе"}
                          </button>
                        </td>
                        <td className="px-4 py-3"><button onClick={() => store.removeExercise(ex.id)} className="text-[#555] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {exercises.length === 0 && <div className="py-12 text-center text-[#555] text-sm">Задания не добавлены</div>}
          </div>
        </div>
      )}

      {/* ═══ PAYMENTS ═══ */}
      {tab === "payments" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setModal("payment")} className="h-10 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Платёж
            </button>
          </div>
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#1a1a1a]">
                {["Родитель", "Спортсмен", "Месяц", "Сумма", "Статус", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#161616]">
                {payments.sort((a, b) => b.month.localeCompare(a.month)).map(p => {
                  const par = parents.find(x => x.id === p.parentId);
                  const ath = athletes.find(a => a.id === p.athleteId);
                  return (
                    <tr key={p.id} className="hover:bg-[#141414] transition-colors">
                      <td className="px-4 py-3 text-white text-sm">{par?.name || "—"}</td>
                      <td className="px-4 py-3 text-white text-sm">{ath?.name || "—"}</td>
                      <td className="px-4 py-3 text-[#888] text-xs">{formatMonthRu(p.month)}</td>
                      <td className="px-4 py-3 text-white text-sm font-semibold">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3">
                        <select value={p.status} onChange={e => store.updatePaymentStatus(p.id, e.target.value as PaymentStatus)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer bg-transparent focus:outline-none ${PAYMENT_STATUS_COLORS[p.status]}`}>
                          {Object.entries(PAYMENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#111] text-white normal-case">{l}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">{par?.telegram && <a href={`https://t.me/${par.telegram.replace("@","")}`} target="_blank" className="text-[#555] hover:text-[#2AABEE] transition-colors"><Send className="w-3.5 h-3.5" /></a>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {payments.length === 0 && <div className="py-12 text-center text-[#555] text-sm">Платежи не добавлены</div>}
          </div>
        </div>
      )}

      {/* ═══ EVENTS ═══ */}
      {tab === "events" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setModal("event")} className="h-10 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Событие
            </button>
          </div>
          <div className="space-y-3">
            {events.sort((a, b) => a.date.localeCompare(b.date)).map(ev => (
              <div key={ev.id} className="flex items-start gap-4 p-5 bg-[#111] border border-[#1a1a1a] rounded-2xl hover:border-[#262626] transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-[#1a1a1a] border border-[#222] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{EVENT_TYPE_ICONS[ev.type]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-semibold text-sm">{ev.title}</h3>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[ev.type]}`}>{EVENT_TYPE_LABELS[ev.type]}</span>
                    {ev.date < new Date().toISOString().slice(0, 10) && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#222] text-[#666] border border-[#333]">Прошло</span>}
                  </div>
                  <p className="text-[#888] text-xs mb-2">{ev.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#666]">
                    <span>{formatDateRu(ev.date)}</span>
                    <span>{ev.timeStart} - {ev.timeEnd}</span>
                    <span>{ev.location}</span>
                    {ev.fee && <span className="text-amber-400">{formatCurrency(ev.fee)}</span>}
                    {ev.maxParticipants && <span>Макс: {ev.maxParticipants} | Записано: {ev.registeredIds?.length || 0}</span>}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {ev.ageGroups.map(ag => <span key={ag} className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{ag}</span>)}
                  </div>
                </div>
                <button onClick={() => store.removeEvent(ev.id)} className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-red-400 transition-all flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {events.length === 0 && <div className="py-12 text-center text-[#555] text-sm border border-[#1a1a1a] border-dashed rounded-2xl">События не добавлены</div>}
          </div>
        </div>
      )}

      {/* ═══ BADGES ═══ */}
      {tab === "badges" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setModal("badge")} className="h-10 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Бейдж
            </button>
          </div>

          {/* All badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {badges.map(badge => {
              const holders = athleteBadges.filter(ab => ab.badgeId === badge.id).length;
              return (
                <div key={badge.id} className={`p-4 rounded-2xl border text-center ${BADGE_RARITY_COLORS[badge.rarity]}`}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h4 className="font-bold text-sm mb-0.5">{badge.name}</h4>
                  <p className="text-[10px] opacity-70 mb-2">{badge.description}</p>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${BADGE_RARITY_COLORS[badge.rarity]}`}>{BADGE_RARITY_LABELS[badge.rarity]}</span>
                  <p className="text-[10px] mt-2 opacity-60">{holders} спортсменов</p>
                </div>
              );
            })}
          </div>

          {/* Award badge */}
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Выдать бейдж</h3>
            <AwardBadgeForm athletes={athletes} badges={badges} athleteBadges={athleteBadges}
              onAward={(athleteId, badgeId) => store.awardBadge(athleteId, badgeId)}
              onRemove={(athleteId, badgeId) => store.removeBadgeFromAthlete(athleteId, badgeId)} />
          </div>
        </div>
      )}

      {/* ═══ PROGRESS ═══ */}
      {tab === "progress" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setModal("progress")} className="h-10 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Замер
            </button>
          </div>
          <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#1a1a1a]">
                {["Спортсмен", "Метрика", "Значение", "Дата", "Заметка", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#555] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#161616]">
                {progress.sort((a, b) => b.date.localeCompare(a.date)).map(pr => {
                  const ath = athletes.find(a => a.id === pr.athleteId);
                  return (
                    <tr key={pr.id} className="hover:bg-[#141414] transition-colors">
                      <td className="px-4 py-3 text-white text-sm">{ath?.name || "—"}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1.5"><span>{PROGRESS_METRIC_ICONS[pr.metric]}</span><span className="text-[#888] text-xs">{PROGRESS_METRIC_LABELS[pr.metric]}</span></div></td>
                      <td className="px-4 py-3 text-white text-sm font-bold">{pr.value}{PROGRESS_METRIC_UNITS[pr.metric]}</td>
                      <td className="px-4 py-3 text-[#888] text-xs">{formatDateRu(pr.date)}</td>
                      <td className="px-4 py-3 text-[#555] text-xs">{pr.notes || "—"}</td>
                      <td className="px-4 py-3"><button onClick={() => store.removeProgress(pr.id)} className="text-[#555] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {progress.length === 0 && <div className="py-12 text-center text-[#555] text-sm">Замеры не добавлены</div>}
          </div>
        </div>
      )}

      {/* ═══ MEDIA ═══ */}
      {tab === "media" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setModal("media")} className="h-10 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Медиа
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.sort((a, b) => b.date.localeCompare(a.date)).map(item => (
              <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-[#1a1a1a] bg-[#111]">
                {item.type === "photo" ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#333]" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center">
                    <Play className="w-8 h-8 text-[#333]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-medium line-clamp-2">{item.caption}</p>
                  <p className="text-white/50 text-[10px] mt-1">{formatDateRu(item.date)}</p>
                  <button onClick={() => store.removeMedia(item.id)} className="absolute top-2 right-2 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                {item.type === "video" && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center group-hover:hidden"><Play className="w-3 h-3 text-white fill-white" /></div>
                )}
              </div>
            ))}
          </div>
          {media.length === 0 && <div className="py-12 text-center text-[#555] text-sm border border-[#1a1a1a] border-dashed rounded-2xl">Медиа не добавлены</div>}
        </div>
      )}

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {modal === "athlete" && <AddAthleteModal parents={parents} onAdd={a => { store.addAthlete(a); setModal(null); }} onClose={() => setModal(null)} />}
        {modal === "parent" && <AddParentModal onAdd={p => { store.addParent(p); setModal(null); }} onClose={() => setModal(null)} />}
        {modal === "session" && <AddSessionModal onAdd={s => { store.addSession(s); setModal(null); }} onClose={() => setModal(null)} />}
        {modal === "exercise" && <AddExerciseModal athletes={athletes} onAdd={e => { store.addExercise(e); setModal(null); }} onClose={() => setModal(null)} />}
        {modal === "payment" && <AddPaymentModal parents={parents} athletes={athletes} onAdd={p => { store.addPayment(p); setModal(null); }} onClose={() => setModal(null)} />}
        {modal === "event" && <AddEventModal onAdd={ev => { store.addEvent(ev); setModal(null); }} onClose={() => setModal(null)} />}
        {modal === "badge" && <AddBadgeModal onAdd={b => { store.addBadge(b); setModal(null); }} onClose={() => setModal(null)} />}
        {modal === "progress" && <AddProgressModal athletes={athletes} onAdd={p => { store.addProgress(p); setModal(null); }} onClose={() => setModal(null)} />}
        {modal === "media" && <AddMediaModal athletes={athletes} onAdd={m => { store.addMedia(m); setModal(null); }} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MODALS & COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
        className="bg-[#111] border border-[#1f1f1f] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] sticky top-0 bg-[#111] z-10">
          <h2 className="text-white font-semibold">{title}</h2>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors"><XCircle className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function AddAthleteModal({ parents, onAdd, onClose }: { parents: AcademyParent[]; onAdd: (a: AcademyAthlete) => void; onClose: () => void }) {
  const [f, set] = useState({ name: "", ageGroup: "U-14" as AgeGroup, position: "PG" as Position, height: "", weight: "", parentId: parents[0]?.id || "", pin: "" });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(p => ({ ...p, [k]: e.target.value }));
  return (
    <ModalShell title="Новый спортсмен" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); if (!f.name || !f.pin) return; onAdd({ id: `a_${Date.now()}`, name: f.name, birthDate: "2010-01-01", ageGroup: f.ageGroup, position: f.position, height: f.height ? +f.height : undefined, weight: f.weight ? +f.weight : undefined, parentId: f.parentId, status: "trial", joinedAt: new Date().toISOString().slice(0, 10), pin: f.pin }); }} className="p-6 space-y-4">
        <input value={f.name} onChange={up("name")} placeholder="Имя Фамилия *" className={INP} />
        <div className="grid grid-cols-2 gap-3">
          <select value={f.ageGroup} onChange={up("ageGroup")} className={INP}>{["U-10","U-12","U-14","U-16","U-18"].map(g => <option key={g} value={g}>{g}</option>)}</select>
          <select value={f.position} onChange={up("position")} className={INP}>{(["PG","SG","SF","PF","C"] as Position[]).map(p => <option key={p} value={p}>{p}</option>)}</select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={f.height} onChange={up("height")} placeholder="Рост (см)" className={INP} />
          <input type="number" value={f.weight} onChange={up("weight")} placeholder="Вес (кг)" className={INP} />
        </div>
        <select value={f.parentId} onChange={up("parentId")} className={INP}>{parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <input value={f.pin} onChange={up("pin")} placeholder="PIN (4 цифры) *" maxLength={4} className={INP} />
        <button type="submit" className="w-full h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm">Добавить</button>
      </form>
    </ModalShell>
  );
}

function AddParentModal({ onAdd, onClose }: { onAdd: (p: AcademyParent) => void; onClose: () => void }) {
  const [f, set] = useState({ name: "", phone: "", telegram: "", email: "", pin: "" });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => set(p => ({ ...p, [k]: e.target.value }));
  return (
    <ModalShell title="Новый родитель" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); if (!f.name || !f.phone || !f.pin) return; onAdd({ id: `p_${Date.now()}`, name: f.name, phone: f.phone, telegram: f.telegram || undefined, email: f.email || undefined, childrenIds: [], pin: f.pin, createdAt: new Date().toISOString().slice(0, 10) }); }} className="p-6 space-y-4">
        <input value={f.name} onChange={up("name")} placeholder="Имя Фамилия *" className={INP} />
        <input value={f.phone} onChange={up("phone")} placeholder="Телефон *" className={INP} />
        <input value={f.telegram} onChange={up("telegram")} placeholder="Telegram (@username)" className={INP} />
        <input value={f.email} onChange={up("email")} placeholder="Email" className={INP} />
        <input value={f.pin} onChange={up("pin")} placeholder="PIN (4 цифры) *" maxLength={4} className={INP} />
        <button type="submit" className="w-full h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm">Добавить</button>
      </form>
    </ModalShell>
  );
}

function AddSessionModal({ onAdd, onClose }: { onAdd: (s: TrainingSession) => void; onClose: () => void }) {
  const [f, set] = useState({ title: "", date: new Date().toISOString().slice(0, 10), timeStart: "09:00", timeEnd: "10:30", type: "training" as SessionType, location: "Зал UHA Arena", coach: "Тренер Исмаилов", ageGroup: "U-14" as AgeGroup, description: "" });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(p => ({ ...p, [k]: e.target.value }));
  return (
    <ModalShell title="Новая тренировка" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); if (!f.title) return; onAdd({ id: `s_${Date.now()}`, ...f, ageGroup: f.ageGroup || undefined }); }} className="p-6 space-y-4">
        <input value={f.title} onChange={up("title")} placeholder="Название *" className={INP} />
        <div className="grid grid-cols-3 gap-3">
          <input type="date" value={f.date} onChange={up("date")} className={INP} />
          <input type="time" value={f.timeStart} onChange={up("timeStart")} className={INP} />
          <input type="time" value={f.timeEnd} onChange={up("timeEnd")} className={INP} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={f.type} onChange={up("type")} className={INP}>{Object.entries(SESSION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select value={f.ageGroup} onChange={up("ageGroup")} className={INP}><option value="">Все группы</option>{["U-10","U-12","U-14","U-16","U-18"].map(g => <option key={g} value={g}>{g}</option>)}</select>
        </div>
        <input value={f.location} onChange={up("location")} placeholder="Место" className={INP} />
        <input value={f.coach} onChange={up("coach")} placeholder="Тренер" className={INP} />
        <textarea value={f.description} onChange={up("description")} placeholder="Описание" rows={2} className={`${INP} resize-none`} />
        <button type="submit" className="w-full h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm">Добавить</button>
      </form>
    </ModalShell>
  );
}

function AddExerciseModal({ athletes, onAdd, onClose }: { athletes: AcademyAthlete[]; onAdd: (e: Exercise) => void; onClose: () => void }) {
  const [f, set] = useState({ athleteId: athletes[0]?.id || "", title: "", description: "", category: "shooting" as ExerciseCategory, sets: "", reps: "", duration: "", assignedDate: new Date().toISOString().slice(0, 10) });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(p => ({ ...p, [k]: e.target.value }));
  return (
    <ModalShell title="Новое задание" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); if (!f.title || !f.athleteId) return; onAdd({ id: `e_${Date.now()}`, athleteId: f.athleteId, title: f.title, description: f.description, category: f.category, sets: f.sets ? +f.sets : undefined, reps: f.reps ? +f.reps : undefined, duration: f.duration || undefined, assignedDate: f.assignedDate, completed: false }); }} className="p-6 space-y-4">
        <select value={f.athleteId} onChange={up("athleteId")} className={INP}>{athletes.map(a => <option key={a.id} value={a.id}>{a.name} ({a.ageGroup})</option>)}</select>
        <input value={f.title} onChange={up("title")} placeholder="Название *" className={INP} />
        <textarea value={f.description} onChange={up("description")} placeholder="Описание" rows={2} className={`${INP} resize-none`} />
        <div className="grid grid-cols-2 gap-3">
          <select value={f.category} onChange={up("category")} className={INP}>{Object.entries(EXERCISE_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{EXERCISE_CATEGORY_ICONS[v as ExerciseCategory]} {l}</option>)}</select>
          <input type="date" value={f.assignedDate} onChange={up("assignedDate")} className={INP} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input type="number" value={f.sets} onChange={up("sets")} placeholder="Подходы" className={INP} />
          <input type="number" value={f.reps} onChange={up("reps")} placeholder="Повторения" className={INP} />
          <input value={f.duration} onChange={up("duration")} placeholder="Время" className={INP} />
        </div>
        <button type="submit" className="w-full h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm">Добавить</button>
      </form>
    </ModalShell>
  );
}

function AddPaymentModal({ parents, athletes, onAdd, onClose }: { parents: AcademyParent[]; athletes: AcademyAthlete[]; onAdd: (p: Payment) => void; onClose: () => void }) {
  const [f, set] = useState({ parentId: parents[0]?.id || "", athleteId: athletes[0]?.id || "", amount: "500000", month: new Date().toISOString().slice(0, 7), status: "pending" as PaymentStatus });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(p => ({ ...p, [k]: e.target.value }));
  const parentChildren = athletes.filter(a => a.parentId === f.parentId);
  return (
    <ModalShell title="Новый платёж" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); if (!f.parentId || !f.athleteId || !f.amount) return; onAdd({ id: `pay_${Date.now()}`, parentId: f.parentId, athleteId: f.athleteId, amount: +f.amount, month: f.month, status: f.status }); }} className="p-6 space-y-4">
        <select value={f.parentId} onChange={e => { up("parentId")(e); const ch = athletes.filter(a => a.parentId === e.target.value); if (ch.length) set(p => ({ ...p, athleteId: ch[0].id })); }} className={INP}>{parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select value={f.athleteId} onChange={up("athleteId")} className={INP}>{parentChildren.map(a => <option key={a.id} value={a.id}>{a.name} ({a.ageGroup})</option>)}{parentChildren.length === 0 && <option value="">Нет детей</option>}</select>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={f.amount} onChange={up("amount")} placeholder="Сумма *" className={INP} />
          <input type="month" value={f.month} onChange={up("month")} className={INP} />
        </div>
        <select value={f.status} onChange={up("status")} className={INP}>{Object.entries(PAYMENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button type="submit" className="w-full h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm">Добавить</button>
      </form>
    </ModalShell>
  );
}

function AddEventModal({ onAdd, onClose }: { onAdd: (ev: AcademyEvent) => void; onClose: () => void }) {
  const [f, set] = useState({ title: "", description: "", type: "tournament_3x3" as EventType, date: new Date().toISOString().slice(0, 10), timeStart: "10:00", timeEnd: "16:00", location: "Площадка UHA Court", ageGroups: ["U-14"] as AgeGroup[], maxParticipants: "", fee: "" });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(p => ({ ...p, [k]: e.target.value }));
  const toggleAgeGroup = (ag: AgeGroup) => set(p => ({ ...p, ageGroups: p.ageGroups.includes(ag) ? p.ageGroups.filter(a => a !== ag) : [...p.ageGroups, ag] }));
  return (
    <ModalShell title="Новое событие" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); if (!f.title) return; onAdd({ id: `ev_${Date.now()}`, title: f.title, description: f.description, type: f.type, date: f.date, timeStart: f.timeStart, timeEnd: f.timeEnd, location: f.location, ageGroups: f.ageGroups, maxParticipants: f.maxParticipants ? +f.maxParticipants : undefined, fee: f.fee ? +f.fee : undefined }); }} className="p-6 space-y-4">
        <input value={f.title} onChange={up("title")} placeholder="Название *" className={INP} />
        <textarea value={f.description} onChange={up("description")} placeholder="Описание" rows={2} className={`${INP} resize-none`} />
        <select value={f.type} onChange={up("type")} className={INP}>{Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{EVENT_TYPE_ICONS[v as EventType]} {l}</option>)}</select>
        <div className="grid grid-cols-3 gap-3">
          <input type="date" value={f.date} onChange={up("date")} className={INP} />
          <input type="time" value={f.timeStart} onChange={up("timeStart")} className={INP} />
          <input type="time" value={f.timeEnd} onChange={up("timeEnd")} className={INP} />
        </div>
        <input value={f.location} onChange={up("location")} placeholder="Место" className={INP} />
        <div>
          <p className="text-[#888] text-xs mb-2">Возрастные группы</p>
          <div className="flex gap-2 flex-wrap">
            {(["U-10","U-12","U-14","U-16","U-18"] as AgeGroup[]).map(ag => (
              <button key={ag} type="button" onClick={() => toggleAgeGroup(ag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${f.ageGroups.includes(ag) ? "bg-blue-500 text-white" : "bg-[#1a1a1a] text-[#666] border border-[#2a2a2a]"}`}>{ag}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={f.maxParticipants} onChange={up("maxParticipants")} placeholder="Макс. участников" className={INP} />
          <input type="number" value={f.fee} onChange={up("fee")} placeholder="Стоимость (сум)" className={INP} />
        </div>
        <button type="submit" className="w-full h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm">Добавить</button>
      </form>
    </ModalShell>
  );
}

function AddBadgeModal({ onAdd, onClose }: { onAdd: (b: AcademyBadge) => void; onClose: () => void }) {
  const [f, set] = useState({ name: "", description: "", icon: "🏀", rarity: "common" as BadgeRarity, criteria: "" });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(p => ({ ...p, [k]: e.target.value }));
  const ICONS = ["🏀", "🎯", "🔥", "💪", "🏆", "⭐", "📅", "🤝", "⚡", "🛡️", "🎖️", "💎"];
  return (
    <ModalShell title="Новый бейдж" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); if (!f.name) return; onAdd({ id: `b_${Date.now()}`, name: f.name, description: f.description, icon: f.icon, rarity: f.rarity, criteria: f.criteria }); }} className="p-6 space-y-4">
        <input value={f.name} onChange={up("name")} placeholder="Название *" className={INP} />
        <input value={f.description} onChange={up("description")} placeholder="Описание" className={INP} />
        <div>
          <p className="text-[#888] text-xs mb-2">Иконка</p>
          <div className="flex gap-2 flex-wrap">
            {ICONS.map(icon => (
              <button key={icon} type="button" onClick={() => set(p => ({ ...p, icon }))}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-colors ${f.icon === icon ? "bg-blue-500/20 border border-blue-500/40" : "bg-[#1a1a1a] border border-[#2a2a2a]"}`}>{icon}</button>
            ))}
          </div>
        </div>
        <select value={f.rarity} onChange={up("rarity")} className={INP}>{Object.entries(BADGE_RARITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <input value={f.criteria} onChange={up("criteria")} placeholder="Критерий получения" className={INP} />
        <button type="submit" className="w-full h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm">Добавить</button>
      </form>
    </ModalShell>
  );
}

function AddProgressModal({ athletes, onAdd, onClose }: { athletes: AcademyAthlete[]; onAdd: (p: ProgressEntry) => void; onClose: () => void }) {
  const [f, set] = useState({ athleteId: athletes[0]?.id || "", metric: "shooting_pct" as ProgressMetric, value: "", date: new Date().toISOString().slice(0, 10), notes: "" });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(p => ({ ...p, [k]: e.target.value }));
  return (
    <ModalShell title="Новый замер" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); if (!f.athleteId || !f.value) return; onAdd({ id: `pr_${Date.now()}`, athleteId: f.athleteId, metric: f.metric, value: +f.value, date: f.date, notes: f.notes || undefined }); }} className="p-6 space-y-4">
        <select value={f.athleteId} onChange={up("athleteId")} className={INP}>{athletes.map(a => <option key={a.id} value={a.id}>{a.name} ({a.ageGroup})</option>)}</select>
        <select value={f.metric} onChange={up("metric")} className={INP}>{Object.entries(PROGRESS_METRIC_LABELS).map(([v, l]) => <option key={v} value={v}>{PROGRESS_METRIC_ICONS[v as ProgressMetric]} {l}</option>)}</select>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" step="0.1" value={f.value} onChange={up("value")} placeholder={`Значение (${PROGRESS_METRIC_UNITS[f.metric]}) *`} className={INP} />
          <input type="date" value={f.date} onChange={up("date")} className={INP} />
        </div>
        <input value={f.notes} onChange={up("notes")} placeholder="Заметка" className={INP} />
        <button type="submit" className="w-full h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm">Добавить</button>
      </form>
    </ModalShell>
  );
}

function AddMediaModal({ athletes, onAdd, onClose }: { athletes: AcademyAthlete[]; onAdd: (m: MediaItem) => void; onClose: () => void }) {
  const [f, set] = useState({ url: "", type: "photo" as "photo" | "video", caption: "", date: new Date().toISOString().slice(0, 10), ageGroup: "" as AgeGroup | "", athleteIds: [] as string[] });
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(p => ({ ...p, [k]: e.target.value }));
  const toggleAthlete = (id: string) => set(p => ({ ...p, athleteIds: p.athleteIds.includes(id) ? p.athleteIds.filter(a => a !== id) : [...p.athleteIds, id] }));
  return (
    <ModalShell title="Новое медиа" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); if (!f.url) return; onAdd({ id: `m_${Date.now()}`, url: f.url, type: f.type, caption: f.caption || undefined, date: f.date, ageGroup: f.ageGroup || undefined, athleteIds: f.athleteIds.length > 0 ? f.athleteIds : undefined }); }} className="p-6 space-y-4">
        <input value={f.url} onChange={up("url")} placeholder="URL изображения/видео *" className={INP} />
        <select value={f.type} onChange={up("type")} className={INP}><option value="photo">Фото</option><option value="video">Видео</option></select>
        <input value={f.caption} onChange={up("caption")} placeholder="Подпись" className={INP} />
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={f.date} onChange={up("date")} className={INP} />
          <select value={f.ageGroup} onChange={up("ageGroup")} className={INP}><option value="">Без группы</option>{["U-10","U-12","U-14","U-16","U-18"].map(g => <option key={g} value={g}>{g}</option>)}</select>
        </div>
        <div>
          <p className="text-[#888] text-xs mb-2">Спортсмены на фото</p>
          <div className="flex gap-2 flex-wrap">
            {athletes.map(a => (
              <button key={a.id} type="button" onClick={() => toggleAthlete(a.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${f.athleteIds.includes(a.id) ? "bg-blue-500 text-white" : "bg-[#1a1a1a] text-[#666] border border-[#2a2a2a]"}`}>{a.name.split(" ")[0]}</button>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm">Добавить</button>
      </form>
    </ModalShell>
  );
}

// Award badge inline component
function AwardBadgeForm({ athletes, badges, athleteBadges, onAward, onRemove }: {
  athletes: AcademyAthlete[]; badges: AcademyBadge[];
  athleteBadges: { badgeId: string; athleteId: string; earnedAt: string }[];
  onAward: (athleteId: string, badgeId: string) => void;
  onRemove: (athleteId: string, badgeId: string) => void;
}) {
  const [selAthlete, setSelAthlete] = useState(athletes[0]?.id || "");
  const [selBadge, setSelBadge] = useState(badges[0]?.id || "");

  const currentBadges = athleteBadges.filter(ab => ab.athleteId === selAthlete);
  const hasBadge = currentBadges.some(ab => ab.badgeId === selBadge);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <select value={selAthlete} onChange={e => setSelAthlete(e.target.value)} className={INP}>
          {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={selBadge} onChange={e => setSelBadge(e.target.value)} className={INP}>
          {badges.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { if (!hasBadge) onAward(selAthlete, selBadge); }} disabled={hasBadge}
          className={`flex-1 h-9 rounded-xl text-sm font-bold transition-colors ${hasBadge ? "bg-[#1a1a1a] text-[#555] cursor-not-allowed" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}>
          {hasBadge ? "Уже выдан" : "Выдать"}
        </button>
        {hasBadge && (
          <button onClick={() => onRemove(selAthlete, selBadge)}
            className="h-9 px-4 rounded-xl text-sm font-bold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors">
            Забрать
          </button>
        )}
      </div>
      {currentBadges.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {currentBadges.map(ab => {
            const badge = badges.find(b => b.id === ab.badgeId);
            return badge ? (
              <span key={ab.badgeId} className={`text-xs px-2.5 py-1 rounded-full border ${BADGE_RARITY_COLORS[badge.rarity]}`}>
                {badge.icon} {badge.name}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
