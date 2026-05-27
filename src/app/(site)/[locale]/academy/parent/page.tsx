"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  LogOut, Calendar, CreditCard, User, Send,
  Clock, MapPin, CheckCircle2, AlertTriangle, ChevronRight,
  Medal, TrendingUp, CalendarDays, Camera, Image as ImageIcon,
  Play, ArrowUp, ArrowDown, Minus, Trophy
} from "lucide-react";
import { useAcademyAuth, useAcademyStore } from "@/store/academy";
import {
  POSITION_SHORT, STATUS_COLORS,
  SESSION_TYPE_COLORS,
  PAYMENT_STATUS_COLORS,
  EVENT_TYPE_COLORS, EVENT_TYPE_ICONS,
  BADGE_RARITY_COLORS,
  getAthleteSchedule, formatDateRu, isToday,
  formatMonthRu, formatCurrency,
} from "@/data/academy";

type ParentTab = "overview" | "progress" | "events" | "gallery";

export default function ParentDashboardPage() {
  const t = useTranslations("academy");
  const { role, currentId, isLoggedIn, logout } = useAcademyAuth();
  const store = useAcademyStore();
  const { athletes, parents, schedule, exercises, payments, events, badges, athleteBadges, progress, media } = store;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ParentTab>("overview");
  const [selectedChild, setSelectedChild] = useState<string | "all">("all");

  useEffect(() => {
    if (!isLoggedIn || role !== "parent") router.replace("/academy/login");
  }, [isLoggedIn, role]);

  const parent = parents.find(p => p.id === currentId);
  if (!parent) return null;

  const children = athletes.filter(a => parent.childrenIds.includes(a.id));
  const myPayments = payments.filter(p => p.parentId === parent.id);
  const pendingPayments = myPayments.filter(p => p.status === "pending" || p.status === "overdue");
  const totalOwed = pendingPayments.reduce((s, p) => s + p.amount, 0);

  // Events for children
  const childAgeGroups = [...new Set(children.map(c => c.ageGroup))];
  const childIds = children.map(c => c.id);
  const upcomingEvents = events.filter(e =>
    e.date >= new Date().toISOString().slice(0, 10) &&
    e.ageGroups.some(ag => childAgeGroups.includes(ag))
  ).sort((a, b) => a.date.localeCompare(b.date));

  // Badges for all children
  const childBadgeEntries = athleteBadges.filter(ab => childIds.includes(ab.athleteId));

  // Media for children
  const childMedia = media.filter(m =>
    m.athleteIds?.some(id => childIds.includes(id)) || (m.ageGroup && childAgeGroups.includes(m.ageGroup))
  ).sort((a, b) => b.date.localeCompare(a.date));

  const TABS: { key: ParentTab; label: string; icon: typeof Trophy }[] = [
    { key: "overview", label: t("tab_overview"), icon: User },
    { key: "progress", label: t("tab_progress"), icon: TrendingUp },
    { key: "events", label: t("tab_events"), icon: CalendarDays },
    { key: "gallery", label: t("tab_gallery"), icon: Camera },
  ];

  // Helper for nested label translations
  const tLabel = (group: string, key: string) =>
    t(`${group}.${key}` as Parameters<typeof t>[0]);

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">
      {/* Header */}
      <div className="bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))]">
        <div className="container-uha py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/academy" className="text-blue-400 text-xs font-bold uppercase tracking-widest">UHA Academy</Link>
            <button onClick={() => { logout(); router.replace("/academy"); }}
              className="flex items-center gap-2 px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-red-400 hover:border-red-500/30 rounded-xl text-sm transition-all">
              <LogOut className="w-3.5 h-3.5" /> {t("logout")}
            </button>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{parent.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-[rgb(var(--muted))]">
                <span>{parent.phone}</span>
                {parent.telegram && <span className="text-[#2AABEE] flex items-center gap-1"><Send className="w-3 h-3" /> {parent.telegram}</span>}
              </div>
            </div>
          </div>

          {pendingPayments.length > 0 && (
            <div className="mt-5 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-amber-400 text-sm font-semibold">
                  {pendingPayments.length}{" "}
                  {pendingPayments.length === 1 ? t("payment_pending_one") : t("payment_pending_few")}
                </p>
                <p className="text-amber-400/70 text-xs mt-0.5">{t("payment_total")} {formatCurrency(totalOwed)}</p>
              </div>
            </div>
          )}

          {/* Tab nav */}
          <div className="flex gap-1 mt-6 overflow-x-auto pb-1 -mb-[1px]">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-medium transition-all whitespace-nowrap border-b-2 ${
                  activeTab === key
                    ? "text-purple-400 border-purple-400 bg-[rgb(var(--background))]"
                    : "text-[rgb(var(--muted))] border-transparent hover:text-[rgb(var(--foreground))]"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-uha py-8 space-y-8">
        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <>
            {/* Children cards */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" /> {t("my_children")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children.map(child => {
                  const childExercises = exercises.filter(e => e.athleteId === child.id);
                  const todayEx = childExercises.filter(e => isToday(e.assignedDate));
                  const completedToday = todayEx.filter(e => e.completed).length;
                  const childSchedule = getAthleteSchedule(child.id, athletes, schedule);
                  const nextSession = childSchedule.find(s => s.date >= new Date().toISOString().slice(0, 10));
                  const childBadges = athleteBadges.filter(ab => ab.athleteId === child.id);

                  return (
                    <motion.div key={child.id} whileHover={{ scale: 1.01 }}
                      className="p-5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl hover:border-blue-500/20 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 font-bold text-sm">{child.name.split(" ").map(n => n[0]).join("")}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{child.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-blue-400 text-[10px] font-bold">{child.ageGroup}</span>
                              <span className="text-[rgb(var(--muted))] text-[10px]">{POSITION_SHORT[child.position]}</span>
                              {childBadges.length > 0 && (
                                <span className="text-amber-400 text-[10px] flex items-center gap-0.5"><Medal className="w-3 h-3" />{childBadges.length}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[child.status]}`}>
                          {tLabel("status", child.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-[rgb(var(--background))] rounded-xl">
                          <p className="text-[10px] text-[rgb(var(--muted))] uppercase tracking-wider mb-0.5">{t("tasks_label")}</p>
                          <p className="text-sm font-bold">
                            {completedToday}/{todayEx.length}{" "}
                            <span className="text-[rgb(var(--muted))] font-normal text-xs">{t("today_suffix")}</span>
                          </p>
                        </div>
                        <div className="p-3 bg-[rgb(var(--background))] rounded-xl">
                          <p className="text-[10px] text-[rgb(var(--muted))] uppercase tracking-wider mb-0.5">{t("height_weight")}</p>
                          <p className="text-sm font-bold">
                            {child.height || "-"} <span className="text-[rgb(var(--muted))] font-normal text-xs">{t("cm_unit")}</span>
                            {" / "}{child.weight || "-"} <span className="text-[rgb(var(--muted))] font-normal text-xs">{t("kg_unit")}</span>
                          </p>
                        </div>
                      </div>
                      {nextSession && (
                        <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                          <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{nextSession.title}</p>
                            <p className="text-[10px] text-[rgb(var(--muted))]">
                              {isToday(nextSession.date) ? t("today") : formatDateRu(nextSession.date)}, {nextSession.timeStart}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Schedule */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> {t("schedule_label")}
              </h2>
              <div className="space-y-2">
                {(() => {
                  const allSessions = children.flatMap(child =>
                    getAthleteSchedule(child.id, athletes, schedule).map(s => ({ ...s, childName: child.name }))
                  );
                  const unique = allSessions.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);
                  const upcoming = unique.filter(s => s.date >= new Date().toISOString().slice(0, 10))
                    .sort((a, b) => `${a.date}${a.timeStart}`.localeCompare(`${b.date}${b.timeStart}`)).slice(0, 8);
                  return upcoming.length > 0 ? upcoming.map(session => (
                    <div key={session.id} className="flex items-center gap-4 p-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl">
                      <div className="flex-shrink-0 text-center w-14">
                        <div className="text-xs font-bold">{session.timeStart}</div>
                        <div className="text-[10px] text-[rgb(var(--muted))]">
                          {isToday(session.date) ? t("today") : formatDateRu(session.date)}
                        </div>
                      </div>
                      <div className="w-px h-8 bg-[rgb(var(--border))]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-[rgb(var(--muted))] mt-0.5"><MapPin className="w-3 h-3" /> {session.location}</div>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${SESSION_TYPE_COLORS[session.type]}`}>
                        {tLabel("session_type", session.type)}
                      </span>
                    </div>
                  )) : (
                    <div className="py-10 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                      <p className="text-[rgb(var(--muted))]">{t("no_schedule")}</p>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* Payments */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> {t("payments_title")}
              </h2>
              <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden">
                <div className="divide-y divide-[rgb(var(--border))]">
                  {myPayments.sort((a, b) => b.month.localeCompare(a.month)).map(payment => {
                    const child = athletes.find(a => a.id === payment.athleteId);
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-[rgb(var(--background)/0.5)] transition-colors">
                        <div>
                          <p className="text-sm font-medium">{child?.name || "-"}</p>
                          <p className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{formatMonthRu(payment.month)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">{formatCurrency(payment.amount)}</span>
                          <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${PAYMENT_STATUS_COLORS[payment.status]}`}>
                            {tLabel("payment_status", payment.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-center text-[rgb(var(--muted))] text-xs mt-4">
                {t("payment_contact")}{" "}
                <a href="https://t.me/uha_manager" target="_blank" className="text-[#2AABEE] hover:underline">@uha_manager</a>
              </p>
            </section>
          </>
        )}

        {/* ═══ PROGRESS ═══ */}
        {activeTab === "progress" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> {t("tab_progress")}
              </h2>
              {children.length > 1 && (
                <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)}
                  className="h-9 px-3 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--foreground))] focus:outline-none">
                  <option value="all">{t("all_children")}</option>
                  {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>

            {children.filter(c => selectedChild === "all" || c.id === selectedChild).map(child => {
              const childProgress = progress.filter(p => p.athleteId === child.id);
              const metrics = [...new Set(childProgress.map(p => p.metric))];
              const childBadgeList = athleteBadges.filter(ab => ab.athleteId === child.id)
                .map(ab => badges.find(b => b.id === ab.badgeId)).filter(Boolean);

              return (
                <div key={child.id} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                      <span className="text-blue-400 text-[10px] font-bold">{child.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{child.name}</h3>
                      <p className="text-[10px] text-[rgb(var(--muted))]">{child.ageGroup} | {POSITION_SHORT[child.position]}</p>
                    </div>
                  </div>

                  {/* Badges row */}
                  {childBadgeList.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                      {childBadgeList.map((badge, i) => badge && (
                        <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium flex-shrink-0 ${BADGE_RARITY_COLORS[badge.rarity]}`}>
                          <span>{badge.icon}</span>
                          <span>{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {metrics.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {metrics.map(metric => {
                        const entries = childProgress.filter(p => p.metric === metric).sort((a, b) => a.date.localeCompare(b.date));
                        const first = entries[0];
                        const last = entries[entries.length - 1];
                        const delta = last.value - first.value;
                        const isLowerBetter = metric === "speed";
                        const improved = isLowerBetter ? delta < 0 : delta > 0;
                        const unit = tLabel("progress_unit", metric);

                        return (
                          <div key={metric} className="p-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold">{tLabel("progress_metric", metric)}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">{last.value}{unit}</div>
                                <div className={`flex items-center gap-1 text-[10px] font-semibold ${improved ? "text-emerald-400" : delta === 0 ? "text-[rgb(var(--muted))]" : "text-red-400"}`}>
                                  {improved ? <ArrowUp className="w-3 h-3" /> : delta === 0 ? <Minus className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                  {Math.abs(delta).toFixed(metric === "speed" ? 1 : 0)}{unit}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[rgb(var(--muted))]">
                              <span>{t("start_label")} {first.value}{unit}</span>
                              <span>({formatDateRu(first.date)})</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                      <p className="text-[rgb(var(--muted))] text-sm">{t("no_data")}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* ═══ EVENTS ═══ */}
        {activeTab === "events" && (
          <section>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-orange-400" /> {t("events_title")}
            </h2>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => {
                  const registeredChildren = children.filter(c => event.registeredIds?.includes(c.id));
                  const spotsLeft = event.maxParticipants ? event.maxParticipants - (event.registeredIds?.length || 0) : null;
                  return (
                    <div key={event.id} className="p-5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgb(var(--background))] border border-[rgb(var(--border))] flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">{EVENT_TYPE_ICONS[event.type]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-sm">{event.title}</h3>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[event.type]}`}>
                              {tLabel("event_type", event.type)}
                            </span>
                          </div>
                          <p className="text-xs text-[rgb(var(--muted))] leading-relaxed mb-3">{event.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[rgb(var(--muted))]">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateRu(event.date)}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.timeStart} - {event.timeEnd}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                            {event.fee && <span className="text-amber-400 font-semibold">{formatCurrency(event.fee)}</span>}
                          </div>
                          {registeredChildren.length > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] text-emerald-400 font-medium">
                                {t("registered_children")} {registeredChildren.map(c => c.name.split(" ")[0]).join(", ")}
                              </span>
                            </div>
                          )}
                          {spotsLeft !== null && spotsLeft <= 5 && (
                            <p className={`text-[10px] mt-2 font-semibold ${spotsLeft === 0 ? "text-red-400" : "text-amber-400"}`}>
                              {spotsLeft > 0
                                ? t("spots_remaining_count", { count: spotsLeft })
                                : t("spots_left_zero")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                <p className="text-[rgb(var(--muted))]">{t("no_events")}</p>
              </div>
            )}
          </section>
        )}

        {/* ═══ GALLERY ═══ */}
        {activeTab === "gallery" && (
          <section>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-400" /> {t("gallery_title")}
            </h2>
            {childMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {childMedia.map(item => (
                  <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
                    {item.type === "photo" ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[rgb(var(--muted))] opacity-40" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                        <Play className="w-8 h-8 text-[rgb(var(--muted))] opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-white text-xs font-medium line-clamp-2">{item.caption}</p>
                      <p className="text-white/50 text-[10px] mt-1">{formatDateRu(item.date)}</p>
                    </div>
                    {item.type === "video" && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                <Camera className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                <p className="text-[rgb(var(--muted))]">{t("no_gallery")}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
