"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Trophy, Users, Calendar, ChevronDown, Send, Instagram } from "lucide-react";
import { subscribeToEvents, getUpcomingEvent, type LeagueEvent } from "@/lib/firebase/leagueEvents";
import { TeamRegistrationModal } from "@/components/ui/TeamRegistrationModal";

/* ── gallery ───────────────────────────────────────────────────── */
const GALLERY = [
  { src: "/images/legue/1.jpeg",  span: "col-span-1 row-span-2" },
  { src: "/images/legue/2.jpeg",  span: "col-span-1" },
  { src: "/images/legue/3.jpeg",  span: "col-span-1" },
  { src: "/images/legue/4.jpeg",  span: "col-span-1 row-span-2" },
  { src: "/images/legue/5.jpeg",  span: "col-span-1" },
  { src: "/images/legue/6.jpeg",  span: "col-span-1" },
  { src: "/images/legue/7.jpeg",  span: "col-span-1" },
  { src: "/images/legue/8.jpeg",  span: "col-span-1" },
];

/* ── component ─────────────────────────────────────────────────── */
export function LeagueClient() {
  const [events, setEvents]         = useState<LeagueEvent[]>([]);
  const [nextEvent, setNextEvent]   = useState<LeagueEvent | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    try {
      const unsub = subscribeToEvents((evts) => {
        setEvents(evts);
        setLoading(false);
      });
      getUpcomingEvent().then(setNextEvent).catch(() => setLoading(false));
      return unsub;
    } catch (err) {
      console.error("League events error:", err);
      setLoading(false);
    }
  }, []);

  const stats = [
    { number: "100+",  label: "Событий",  icon: Trophy },
    { number: "1000+", label: "Игроков",  icon: Users },
    { number: "1000+", label: "Зрителей", icon: Users },
    { number: "100+",  label: "Призов",   icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">

      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">

        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/legue/main3x3.jpeg"
            alt="UHA 3x3 League"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </div>

        {/* Accent glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--accent))] to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 w-full container-uha mx-auto px-4 py-32 flex flex-col items-center text-center">

          {/* Бейдж */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgb(var(--accent))/40] bg-[rgb(var(--accent))/10] mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent))] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[rgb(var(--accent))]">
              Street Basketball League · Uzbekistan
            </span>
          </motion.div>

          {/* Заголовок */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-7xl sm:text-8xl md:text-[120px] font-black leading-none tracking-tighter mb-6"
          >
            UHA{" "}
            <span className="text-[rgb(var(--accent))]">3×3</span>
          </motion.h1>

          {/* Подзаголовок */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-lg leading-relaxed mb-10"
          >
            Уличный баскетбол нового уровня. Каждые 2 недели — новый турнир. Выходи на площадку.
          </motion.p>

          {/* CTA кнопки */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={() => setShowModal(true)}
              className="px-10 py-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all hover:scale-105 shadow-xl shadow-[rgb(var(--accent))/30]"
            >
              Зарегистрировать команду
            </button>
            <a href="#events"
              className="px-8 py-4 border border-white/20 hover:border-[rgb(var(--accent))/60] text-white/70 hover:text-white font-semibold text-sm uppercase tracking-widest rounded-xl transition-all">
              Расписание ↓
            </a>
            {/* Social quick links */}
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <a href="https://t.me/hoopertournaments" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#2AABEE]/15 border border-[#2AABEE]/25 flex items-center justify-center text-[#2AABEE] hover:bg-[#2AABEE]/25 transition-all"
                title="Telegram @hoopertournaments">
                <Send className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/uha_league/" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/25 flex items-center justify-center text-pink-400 hover:bg-pink-500/25 transition-all"
                title="Instagram uha_league">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* ══════════════════════════════ STATS ══════════════════════════════ */}
      <section className="relative py-16 border-y border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="container-uha px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {stats.map(({ number, label, icon: Icon }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center justify-center gap-1 bg-[#080808] py-8 px-4 text-center"
              >
                <Icon className="w-4 h-4 text-[rgb(var(--accent))] mb-2 opacity-60" />
                <span className="text-4xl md:text-5xl font-black font-display text-white">{number}</span>
                <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">{label}</span>
              </motion.div>
            ))}
          </div>

          {/* ── Social links ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          >
            <a
              href="https://t.me/hoopertournaments"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#2AABEE]/10 border border-[#2AABEE]/20 text-[#2AABEE] hover:bg-[#2AABEE]/20 transition-all text-sm font-semibold"
            >
              <Send className="w-4 h-4" />
              @hoopertournaments
            </a>
            <a
              href="https://www.instagram.com/uha_league/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 transition-all text-sm font-semibold"
            >
              <Instagram className="w-4 h-4" />
              uha_league
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════ NEXT EVENT ══════════════════════════════ */}
      <section id="events" className="relative py-24 px-4">
        <div className="container-uha max-w-4xl mx-auto">

          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-3">
              Расписание
            </p>
            <h2 className="text-4xl md:text-5xl font-black">
              {nextEvent ? "Следующий турнир" : loading ? "Загрузка…" : "Турниры скоро"}
            </h2>
          </motion.div>

          {nextEvent && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden border border-white/8 bg-[#0d0d0d]"
            >
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))]" />

              <div className="p-8 md:p-12">
                <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[rgb(var(--accent))/15] text-[rgb(var(--accent))] border border-[rgb(var(--accent))/25] mb-3">
                      Upcoming
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black text-white">{nextEvent.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-[rgb(var(--accent))]">
                      ${nextEvent.prizePool.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/40 uppercase tracking-wider mt-1">Призовой фонд</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 pt-6 border-t border-white/5">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Дата</p>
                      <p className="font-bold text-white">
                        {new Date(nextEvent.date).toLocaleDateString("ru-RU", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Место</p>
                      <p className="font-bold text-white">{nextEvent.city}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Слоты</p>
                      <p className="font-bold text-white">{nextEvent.availableSlots} / {nextEvent.maxTeams}</p>
                    </div>
                  </div>
                </div>

                {nextEvent.description && (
                  <p className="text-white/60 leading-relaxed mb-8">{nextEvent.description}</p>
                )}

                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-[rgb(var(--accent))/20]"
                >
                  Зарегистрировать команду →
                </button>
              </div>
            </motion.div>
          )}

          {/* Past events list */}
          {events.filter(e => e.status === "completed").length > 0 && (
            <div className="mt-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-6">
                Прошедшие события
              </p>
              <div className="space-y-3">
                {events.filter(e => e.status === "completed").slice(0, 4).map((event) => (
                  <div key={event.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a0a0a]">
                    <div>
                      <p className="font-semibold text-white/80">{event.name}</p>
                      <p className="text-xs text-white/30 mt-0.5">{event.city} · {new Date(event.date).toLocaleDateString("ru-RU")}</p>
                    </div>
                    <span className="text-xs font-bold text-white/20 uppercase tracking-wider">Завершён</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════ GALLERY ══════════════════════════════ */}
      <section className="relative py-24 px-4">
        <div className="container-uha">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-3">
              Атмосфера
            </p>
            <h2 className="text-4xl md:text-5xl font-black">Из реальных событий</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[180px] md:auto-rows-[220px]">
            {GALLERY.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`relative overflow-hidden rounded-xl bg-[#111] group cursor-pointer ${img.span}`}
              >
                <Image
                  src={img.src}
                  alt={`UHA 3x3 — фото ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Red accent corner on hover */}
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[rgb(var(--accent))] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-[8px] font-black">3×3</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ CTA BANNER ══════════════════════════════ */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--accent))/15] via-[rgb(var(--accent))/5] to-transparent" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[rgb(var(--accent))]" />

        <div className="container-uha relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-4">
              Присоединяйся
            </p>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Готов выйти<br />на площадку?
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Собери команду из 4 человек и зарегистрируйся на ближайший турнир.
              Вход свободный — только твоя игра.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-3 px-10 py-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all hover:scale-105 shadow-2xl shadow-[rgb(var(--accent))/30]"
            >
              <Users className="w-5 h-5" />
              Зарегистрировать команду
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      {showModal && <TeamRegistrationModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
