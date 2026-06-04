"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Calendar, Dumbbell, CheckCircle2, Circle, Clock,
  MapPin, User, TrendingUp, ChevronRight, Trophy, Target,
  Medal, Image as ImageIcon, CalendarDays, Star, Camera,
  Play, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { useAcademyAuth, useAcademyStore } from "@/store/academy";
import {
  POSITION_SHORT, SESSION_TYPE_COLORS,
  EXERCISE_CATEGORY_ICONS,
  EVENT_TYPE_COLORS, EVENT_TYPE_ICONS,
  BADGE_RARITY_COLORS,
  getAthleteSchedule, formatDateRu, isToday, formatCurrency,
} from "@/data/academy";

type DashTab = "overview" | "progress" | "badges" | "events" | "gallery";

export default function AthleteDashboardPage() {
  const t = useTranslations("academy");
  const { role, currentId, isLoggedIn, logout } = useAcademyAuth();
  const store = useAcademyStore();
  const { athletes, schedule, exercises, events, badges, athleteBadges, progress, media } = store;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashTab>("overview");

  useEffect(() => {
    if (!isLoggedIn || role !== "athlete") router.replace("/academy/login");
  }, [isLoggedIn, role]);

  const athlete = athletes.find(a => a.id === currentId);
  if (!athlete) return null;

  const mySchedule = getAthleteSchedule(athlete.id, athletes, schedule);
  const myExercises = exercises.filter(e => e.athleteId === athlete.id);
  const todayExercises = myExercises.filter(e => isToday(e.assignedDate));
  const completedToday = todayExercises.filter(e => e.completed).length;
  const upcomingSessions = mySchedule.filter(s => s.date >= new Date().toISOString().slice(0, 10));

  // Badges
  const myBadgeEntries = athleteBadges.filter(ab => ab.athleteId === athlete.id);
  const myBadges = myBadgeEntries.map(ab => ({ ...badges.find(b => b.id === ab.badgeId)!, earnedAt: ab.earnedAt })).filter(b => b.id);

  // Progress
  const myProgress = progress.filter(p => p.athleteId === athlete.id);
  const progressMetrics = [...new Set(myProgress.map(p => p.metric))];

  // Events
  const myEvents = events.filter(e =>
    e.date >= new Date().toISOString().slice(0, 10) &&
    (e.ageGroups.includes(athlete.ageGroup) || e.registeredIds?.includes(athlete.id))
  ).sort((a, b) => a.date.localeCompare(b.date));

  // Media
  const myMedia = media.filter(m => m.athleteIds?.includes(athlete.id) || m.ageGroup === athlete.ageGroup).sort((a, b) => b.date.localeCompare(a.date));

  // Group schedule by date
  const scheduleByDate = upcomingSessions.reduce<Record<string, typeof mySchedule>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const initials = athlete.name.split(" ").map(n => n[0]).join("").toUpperCase();

  const TABS: { key: DashTab; label: string; icon: typeof Trophy }[] = [
    { key: "overview", label: t("tab_overview"), icon: Target },
    { key: "progress", label: t("tab_progress"), icon: TrendingUp },
    { key: "badges", label: t("tab_badges"), icon: Medal },
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
            <Link href="/academy" className="text-blue-400 text-xs font-bold uppercase tracking-widest">
              UHA Academy
            </Link>
            <button onClick={() => { logout(); router.replace("/academy"); }}
              className="flex items-center gap-2 px-4 py-2 border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-red-400 hover:border-red-500/30 rounded-xl text-sm transition-all">
              <LogOut className="w-3.5 h-3.5" /> {t("logout")}
            </button>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold text-xl">{initials}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{athlete.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-blue-400 text-xs font-bold bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                  {athlete.ageGroup}
                </span>
                <span className="text-[rgb(var(--muted))] text-xs">{POSITION_SHORT[athlete.position]}</span>
                {athlete.height && <span className="text-[rgb(var(--muted))] text-xs">{athlete.height} {t("cm_unit")}</span>}
                {myBadges.length > 0 && (
                  <span className="text-amber-400 text-xs flex items-center gap-1">
                    <Medal className="w-3 h-3" /> {myBadges.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: Target, label: t("stat_tasks_today"), value: `${completedToday}/${todayExercises.length}`, color: "text-blue-400" },
              { icon: Calendar, label: t("stat_sessions_week"), value: upcomingSessions.filter(s => s.date <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)).length, color: "text-purple-400" },
              { icon: Trophy, label: t("stat_achievements"), value: myBadges.length, color: "text-amber-400" },
              { icon: CalendarDays, label: t("stat_events_ahead"), value: myEvents.length, color: "text-emerald-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="p-4 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-2xl">
                <Icon className={`w-4 h-4 ${color} mb-2`} />
                <div className="text-xl font-bold">{value}</div>
                <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 mt-6 overflow-x-auto pb-1 -mb-[1px]">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-medium transition-all whitespace-nowrap border-b-2 ${
                  activeTab === key
                    ? "text-blue-400 border-blue-400 bg-[rgb(var(--background))]"
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
            {/* Today's exercises */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-400" />
                {t("today_tasks")}
                {todayExercises.length > 0 && (
                  <span className="text-xs font-normal text-[rgb(var(--muted))]">
                    {completedToday}/{todayExercises.length} {t("completed_count")}
                  </span>
                )}
              </h2>
              {todayExercises.length > 0 ? (
                <div className="space-y-3">
                  {todayExercises.map(ex => (
                    <motion.div key={ex.id} whileHover={{ scale: 1.005 }}
                      onClick={() => store.toggleExercise(ex.id)}
                      className={`p-4 bg-[rgb(var(--surface))] border rounded-2xl cursor-pointer transition-all ${
                        ex.completed ? "border-emerald-500/25 bg-emerald-500/5" : "border-[rgb(var(--border))] hover:border-blue-500/30"
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 flex-shrink-0">
                          {ex.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-[rgb(var(--muted))]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{EXERCISE_CATEGORY_ICONS[ex.category]}</span>
                            <h3 className={`font-semibold text-sm ${ex.completed ? "line-through text-[rgb(var(--muted))]" : ""}`}>{ex.title}</h3>
                            <span className="text-[10px] text-[rgb(var(--muted))] bg-[rgb(var(--background))] px-2 py-0.5 rounded-full">
                              {tLabel("exercise_category", ex.category)}
                            </span>
                          </div>
                          <p className="text-xs text-[rgb(var(--muted))] leading-relaxed">{ex.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {ex.sets && <span className="text-[10px] text-blue-400 font-semibold">{ex.sets} {t("sets")}</span>}
                            {ex.reps && <span className="text-[10px] text-blue-400 font-semibold">{ex.reps} {t("reps")}</span>}
                            {ex.duration && <span className="text-[10px] text-blue-400 font-semibold">{ex.duration}</span>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                  <Dumbbell className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                  <p className="text-[rgb(var(--muted))]">{t("no_tasks_today")}</p>
                </div>
              )}
            </section>

            {/* Schedule */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> {t("schedule_label")}
              </h2>
              <div className="space-y-4">
                {Object.entries(scheduleByDate).slice(0, 7).map(([date, sessions]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isToday(date) ? "text-blue-400" : "text-[rgb(var(--muted))]"}`}>
                        {isToday(date) ? t("today") : formatDateRu(date)}
                      </span>
                      {isToday(date) && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
                    </div>
                    <div className="space-y-2">
                      {sessions.map(session => (
                        <div key={session.id} className="flex items-center gap-4 p-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl hover:border-[rgb(var(--foreground)/0.1)] transition-colors">
                          <div className="flex-shrink-0 text-center w-16">
                            <div className="text-sm font-bold">{session.timeStart}</div>
                            <div className="text-[10px] text-[rgb(var(--muted))]">{session.timeEnd}</div>
                          </div>
                          <div className="w-px h-10 bg-[rgb(var(--border))]" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm truncate">{session.title}</h3>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${SESSION_TYPE_COLORS[session.type]}`}>
                                {tLabel("session_type", session.type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted))]">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {session.location}</span>
                              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {session.coach}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(scheduleByDate).length === 0 && (
                  <div className="py-10 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                    <p className="text-[rgb(var(--muted))]">{t("no_schedule")}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Upcoming exercises */}
            {myExercises.filter(e => !isToday(e.assignedDate)).length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" /> {t("upcoming_tasks")}
                </h2>
                <div className="space-y-2">
                  {myExercises.filter(e => !isToday(e.assignedDate) && !e.completed).map(ex => (
                    <div key={ex.id} className="flex items-center gap-3 p-3 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl">
                      <span className="text-base">{EXERCISE_CATEGORY_ICONS[ex.category]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ex.title}</p>
                        <p className="text-[10px] text-[rgb(var(--muted))]">{formatDateRu(ex.assignedDate)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[rgb(var(--muted))]" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ═══ PROGRESS ═══ */}
        {activeTab === "progress" && (
          <section>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> {t("my_progress")}
            </h2>

            {progressMetrics.length > 0 ? (
              <div className="space-y-6">
                {progressMetrics.map(metric => {
                  const entries = myProgress.filter(p => p.metric === metric).sort((a, b) => a.date.localeCompare(b.date));
                  const first = entries[0];
                  const last = entries[entries.length - 1];
                  const delta = last.value - first.value;
                  const isLowerBetter = metric === "speed";
                  const improved = isLowerBetter ? delta < 0 : delta > 0;
                  const maxVal = Math.max(...entries.map(e => e.value));
                  const unit = tLabel("progress_unit", metric);

                  return (
                    <div key={metric} className="p-5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <h3 className="font-semibold text-sm">{tLabel("progress_metric", metric)}</h3>
                            <p className="text-[10px] text-[rgb(var(--muted))]">{entries.length} {t("measurements")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{last.value}{unit}</div>
                          <div className={`flex items-center gap-1 text-xs font-semibold ${improved ? "text-emerald-400" : delta === 0 ? "text-[rgb(var(--muted))]" : "text-red-400"}`}>
                            {improved ? <ArrowUp className="w-3 h-3" /> : delta === 0 ? <Minus className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {Math.abs(delta).toFixed(metric === "speed" ? 1 : 0)}{unit}
                          </div>
                        </div>
                      </div>

                      {/* Simple bar chart */}
                      <div className="flex items-end gap-1 h-20">
                        {entries.map((entry) => (
                          <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t-md bg-blue-500/30 border border-blue-500/20 min-h-[4px] transition-all relative group"
                              style={{ height: `${(entry.value / maxVal) * 100}%` }}
                            >
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[rgb(var(--foreground))] text-[rgb(var(--background))] text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {entry.value}{unit}
                              </div>
                            </div>
                            <span className="text-[8px] text-[rgb(var(--muted))]">{entry.date.slice(5)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))] opacity-40" />
                <p className="text-[rgb(var(--muted))]">{t("no_progress")}</p>
              </div>
            )}
          </section>
        )}

        {/* ═══ BADGES ═══ */}
        {activeTab === "badges" && (
          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-400" /> {t("my_achievements")}
            </h2>
            <p className="text-xs text-[rgb(var(--muted))] mb-6">
              {myBadges.length} {t("earned_of")} {badges.length} {t("earned_received")}
            </p>

            {/* Earned badges */}
            {myBadges.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">{t("earned_badges")}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {myBadges.map(badge => (
                    <motion.div key={badge.id + badge.earnedAt} whileHover={{ scale: 1.03 }}
                      className={`p-4 rounded-2xl border text-center ${BADGE_RARITY_COLORS[badge.rarity]}`}>
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <h4 className="font-bold text-sm mb-0.5">{badge.name}</h4>
                      <p className="text-[10px] opacity-70 mb-2">{badge.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${BADGE_RARITY_COLORS[badge.rarity]}`}>
                          {tLabel("badge_rarity", badge.rarity)}
                        </span>
                      </div>
                      <p className="text-[9px] mt-2 opacity-50">{formatDateRu(badge.earnedAt)}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked badges */}
            {(() => {
              const earnedIds = myBadgeEntries.map(ab => ab.badgeId);
              const locked = badges.filter(b => !earnedIds.includes(b.id));
              return locked.length > 0 ? (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))] mb-3">{t("locked_badges")}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {locked.map(badge => (
                      <div key={badge.id} className="p-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-center opacity-50">
                        <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                        <h4 className="font-bold text-sm mb-0.5">{badge.name}</h4>
                        <p className="text-[10px] text-[rgb(var(--muted))]">{badge.criteria}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </section>
        )}

        {/* ═══ EVENTS ═══ */}
        {activeTab === "events" && (
          <section>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-orange-400" /> {t("events_title")}
            </h2>
            {myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.map(event => {
                  const isRegistered = event.registeredIds?.includes(athlete.id);
                  const spotsLeft = event.maxParticipants ? event.maxParticipants - (event.registeredIds?.length || 0) : null;
                  return (
                    <motion.div key={event.id} whileHover={{ scale: 1.005 }}
                      className="p-5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl hover:border-[rgb(var(--foreground)/0.1)] transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--background))] border border-[rgb(var(--border))] flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-xl">{EVENT_TYPE_ICONS[event.type]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-sm">{event.title}</h3>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[event.type]}`}>
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
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {event.ageGroups.map(ag => (
                              <span key={ag} className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">{ag}</span>
                            ))}
                            {spotsLeft !== null && (
                              <span className={`text-[10px] font-semibold ${spotsLeft <= 3 ? "text-red-400" : "text-[rgb(var(--muted))]"}`}>
                                {spotsLeft > 0
                                  ? t("spots_left", { count: spotsLeft })
                                  : t("spots_left_zero")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isRegistered ? (
                            <button onClick={() => store.unregisterFromEvent(event.id, athlete.id)}
                              className="px-4 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-bold hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25 transition-all">
                              {t("registered_event")}
                            </button>
                          ) : spotsLeft === 0 ? (
                            <span className="px-4 py-2 bg-[rgb(var(--background))] text-[rgb(var(--muted))] border border-[rgb(var(--border))] rounded-xl text-xs font-bold">
                              {t("event_full")}
                            </span>
                          ) : (
                            <button onClick={() => store.registerForEvent(event.id, athlete.id)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors">
                              {t("register_event")}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
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
            {myMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myMedia.map(item => (
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
