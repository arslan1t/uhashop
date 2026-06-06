"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, MapPin, Trophy, Users } from "lucide-react";
import { subscribeToEvents, getUpcomingEvent, type LeagueEvent } from "@/lib/firebase/leagueEvents";
import { TeamRegistrationModal } from "@/components/ui/TeamRegistrationModal";

export function LeagueClient() {
  const [events, setEvents] = useState<LeagueEvent[]>([]);
  const [nextEvent, setNextEvent] = useState<LeagueEvent | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Subscribe to all events
      const unsub = subscribeToEvents((evts) => {
        setEvents(evts);
        setLoading(false);
      });

      // Fetch next upcoming event
      getUpcomingEvent().then(setNextEvent).catch(() => setLoading(false));

      return unsub;
    } catch (err) {
      console.error("Failed to load league events:", err);
      setLoading(false);
    }
  }, []);

  // Stats data
  const stats = [
    { number: "100+", label: "Событий", highlight: true },
    { number: "3000+", label: "Игроков", highlight: false },
    { number: "20K+", label: "Зрителей", highlight: false },
    { number: "10+", label: "Городов", highlight: false },
  ];

  // Mock gallery images (replace with real ones)
  const galleryImages = [
    { url: "/images/league/event-1.jpg", aspect: "landscape" },
    { url: "/images/league/event-2.jpg", aspect: "portrait" },
    { url: "/images/league/event-3.jpg", aspect: "landscape" },
    { url: "/images/league/event-4.jpg", aspect: "square" },
    { url: "/images/league/event-5.jpg", aspect: "landscape" },
    { url: "/images/league/event-6.jpg", aspect: "portrait" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#050505] z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80 z-10" />

        {/* Hero Content Grid */}
        <div className="relative z-20 w-full h-full flex items-center px-4 md:px-8">
          <div className="container-uha mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
              {/* Left Block */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-3 flex flex-col justify-center"
              >
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff6b00] mb-4">
                  Street Basketball League
                </p>
                <p className="text-lg text-gray-300 font-light leading-relaxed">
                  Each player's statistics
                </p>
              </motion.div>

              {/* Center - UHA 3X3 + Team Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.1 }}
                className="lg:col-span-6 flex flex-col items-center justify-center"
              >
                <div className="relative w-full mb-8">
                  {/* Team Photo */}
                  <div className="relative aspect-video md:aspect-auto md:h-96 rounded-2xl overflow-hidden border-4 border-[#ff6b00]/30 bg-[#101010]">
                    <img
                      src="/images/league/hero-bg.jpg"
                      alt="UHA 3x3 Team"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                </div>

                {/* UHA 3X3 Text Overlay */}
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="font-display text-7xl md:text-8xl font-black tracking-tighter text-white leading-none text-center"
                >
                  UHA{" "}
                  <span className="text-[#ff6b00]">3X3</span>
                </motion.h1>
              </motion.div>

              {/* Right Block */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="lg:col-span-3 flex flex-col justify-center items-end text-right"
              >
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff6b00] mb-4">
                  Every 2 Weeks New Event
                </p>
                <p className="text-lg text-gray-300 font-light leading-relaxed mb-8">
                  Professional level
                </p>
                <button
                  onClick={() => setShowTeamModal(true)}
                  className="px-6 py-3 bg-[#ff6b00] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#ff8533] transition-all hover:scale-105"
                >
                  Register Your Team
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-center justify-center">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── NEXT EVENT ── */}
      {nextEvent && (
        <section className="relative py-20 md:py-28 px-4">
          <div className="container-uha max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 md:p-12 bg-[#101010] border border-[#1e1e1e] rounded-2xl"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#ff6b00] font-bold mb-4">
                Следующее Событие
              </p>
              <h2 className="text-4xl md:text-5xl font-black mb-8 text-white">
                {nextEvent.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Date & Location */}
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Дата</p>
                  <p className="text-2xl font-bold text-white mb-6">
                    {new Date(nextEvent.date).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Место</p>
                  <p className="flex items-center gap-2 text-xl font-bold text-white">
                    <MapPin className="w-5 h-5 text-[#ff6b00]" /> {nextEvent.city}
                  </p>
                </div>

                {/* Prize & Slots */}
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Призовой Фонд</p>
                  <p className="text-2xl font-bold text-[#ff6b00] mb-6">
                    ${nextEvent.prizePool.toLocaleString()}
                  </p>

                  <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Доступные Слоты</p>
                  <p className="text-xl font-bold text-white">
                    {nextEvent.availableSlots} / {nextEvent.maxTeams} команд
                  </p>
                </div>
              </div>

              {nextEvent.description && (
                <p className="text-gray-300 text-base leading-relaxed mb-8 py-6 border-t border-[#1e1e1e]">
                  {nextEvent.description}
                </p>
              )}

              <button
                onClick={() => setShowTeamModal(true)}
                className="w-full py-4 bg-[#ff6b00] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#ff8533] transition-all"
              >
                Зарегистрировать Команду
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── STATS ── */}
      <section className="relative py-20 md:py-28 px-4 bg-black/50">
        <div className="container-uha">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`text-center p-6 md:p-8 rounded-xl border ${
                  stat.highlight
                    ? "bg-[#ff6b00]/10 border-[#ff6b00] "
                    : "bg-[#101010] border-[#1e1e1e]"
                }`}
              >
                <p
                  className={`text-5xl md:text-6xl font-black font-display mb-2 ${
                    stat.highlight ? "text-[#ff6b00]" : "text-white"
                  }`}
                >
                  {stat.number}
                </p>
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="relative py-20 md:py-28 px-4">
        <div className="container-uha">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#ff6b00] font-bold mb-4">
              Атмосфера
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Из Реальных Событий
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`relative overflow-hidden rounded-xl bg-[#101010] border border-[#1e1e1e] group cursor-pointer ${
                  img.aspect === "portrait" ? "col-span-2 md:col-span-1 row-span-2" : ""
                } ${img.aspect === "square" ? "aspect-square" : "aspect-video md:aspect-square"}`}
              >
                <img
                  src={img.url}
                  alt="Event photo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TEAM REGISTRATION MODAL ── */}
      {showTeamModal && (
        <TeamRegistrationModal onClose={() => setShowTeamModal(false)} />
      )}
    </div>
  );
}
