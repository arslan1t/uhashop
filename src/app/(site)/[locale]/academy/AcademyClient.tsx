"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  GraduationCap, ArrowLeft, ArrowRight, Dumbbell, Target, Users,
  Calendar, Trophy, Shield, Star, ChevronRight,
  MapPin, Clock, Phone, Bus, Navigation
} from "lucide-react";
import { AcademyApplicationModal } from "@/components/ui/AcademyApplicationModal";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function AcademyClient() {
  const t = useTranslations("academy");
  const [showModal, setShowModal] = useState(false);

  const FEATURES = [
    {
      icon: Dumbbell,
      title: t("feature_1_title"),
      desc: t("feature_1_desc"),
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: Calendar,
      title: t("feature_2_title"),
      desc: t("feature_2_desc"),
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Trophy,
      title: t("feature_3_title"),
      desc: t("feature_3_desc"),
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: Shield,
      title: t("feature_4_title"),
      desc: t("feature_4_desc"),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  const AGE_GROUPS = [
    { group: "U-10", ageRange: "8–10", scheduleKey: "age_schedule_3" as const, price: "350 000 сум/мес" },
    { group: "U-12", ageRange: "10–12", scheduleKey: "age_schedule_3" as const, price: "400 000 сум/мес" },
    { group: "U-14", ageRange: "12–14", scheduleKey: "age_schedule_4" as const, price: "500 000 сум/мес" },
    { group: "U-16", ageRange: "14–16", scheduleKey: "age_schedule_4" as const, price: "500 000 сум/мес" },
    { group: "U-18", ageRange: "16–18", scheduleKey: "age_schedule_5" as const, price: "600 000 сум/мес" },
  ];

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="container-uha relative z-10 py-20 lg:py-28">
          <div className="flex items-center gap-8 lg:gap-16">
            <div className="flex-1 max-w-2xl">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors mb-10">
                <ArrowLeft className="w-4 h-4" /> {t("hero_back")}
              </Link>

              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8">
                <GraduationCap className="w-8 h-8 text-blue-400" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h1 className="font-display text-4xl md:text-6xl tracking-tight leading-none mb-4">
                  UHA<br /><span className="text-blue-400">ACADEMY</span>
                </h1>
                <p className="text-[rgb(var(--accent))] font-semibold text-lg mb-3">
                  {t("hero_tagline")}
                </p>
                <p className="text-[rgb(var(--muted))] text-base leading-relaxed mb-8 max-w-lg">
                  {t("hero_desc")}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link href="/academy/login"
                    className="flex items-center gap-2 h-12 px-7 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl text-sm uppercase tracking-wider transition-colors">
                    <GraduationCap className="w-4 h-4" /> {t("btn_login")}
                  </Link>
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 h-12 px-7 border border-[rgb(var(--border))] text-[rgb(var(--foreground))] font-semibold rounded-2xl text-sm hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                    {t("btn_register")} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Large academy logo */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block flex-shrink-0 relative w-[380px] h-[380px] xl:w-[440px] xl:h-[440px]">
              <Image src="/images/branding/academy-black.png" alt="UHA Academy" fill
                className="object-contain opacity-[0.08] dark:hidden select-none pointer-events-none" sizes="440px" />
              <Image src="/images/branding/academy-white.png" alt="UHA Academy" fill
                className="object-contain opacity-[0.10] hidden dark:block select-none pointer-events-none" sizes="440px" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-[rgb(var(--border))]">
        <div className="container-uha py-16">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <motion.div key={title} variants={fadeUp}
                className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl hover:border-blue-500/20 transition-colors">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-sm mb-1.5">{title}</h3>
                <p className="text-[rgb(var(--muted))] text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Cabinets info */}
      <div className="border-t border-[rgb(var(--border))]">
        <div className="container-uha py-16">
          <h2 className="font-display text-3xl tracking-tight mb-8 text-center">{t("cabinets_title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">{t("athlete_cabinet_title")}</h3>
              <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                {([
                  t("athlete_item_1"),
                  t("athlete_item_2"),
                  t("athlete_item_3"),
                  t("athlete_item_4"),
                ]).map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">{t("parent_cabinet_title")}</h3>
              <ul className="space-y-2 text-sm text-[rgb(var(--muted))]">
                {([
                  t("parent_item_1"),
                  t("parent_item_2"),
                  t("parent_item_3"),
                  t("parent_item_4"),
                ]).map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Age groups */}
      <div className="border-t border-[rgb(var(--border))]">
        <div className="container-uha py-16">
          <h2 className="font-display text-3xl tracking-tight mb-3 text-center">{t("age_groups_title")}</h2>
          <p className="text-center text-[rgb(var(--muted))] text-sm mb-8">{t("age_groups_subtitle")}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {AGE_GROUPS.map(({ group, ageRange, scheduleKey, price }) => (
              <motion.div key={group}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl text-center hover:border-blue-500/20 transition-colors">
                <div className="text-2xl font-bold text-blue-400 mb-1">{group}</div>
                <div className="text-xs text-[rgb(var(--muted))] mb-3">{ageRange} {t("age_suffix")}</div>
                <div className="text-[10px] text-[rgb(var(--muted))] space-y-0.5">
                  <p>{t(scheduleKey)}</p>
                  <p className="font-semibold text-[rgb(var(--foreground))]">{price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-[rgb(var(--border))]">
        <div className="container-uha py-16 text-center">
          <Star className="w-8 h-8 text-blue-400 mx-auto mb-4" />
          <h2 className="font-display text-3xl tracking-tight mb-3">{t("cta_title")}</h2>
          <p className="text-[rgb(var(--muted))] text-sm mb-6 max-w-md mx-auto">
            {t("cta_subtitle")}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/academy/login"
              className="flex items-center gap-2 h-12 px-7 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl text-sm uppercase tracking-wider transition-colors">
              {t("btn_login")}
            </Link>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 h-12 px-7 border border-[rgb(var(--border))] rounded-2xl text-sm font-semibold hover:border-blue-500/30 transition-colors">
              {t("btn_trial")}
            </button>
          </div>
        </div>
      </div>

      {/* ── LOCATION BLOCK ── */}
      <section className="py-16 md:py-20 bg-[rgb(var(--surface))]">
        <div className="container-uha">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>

            <div className="text-center mb-10">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{t("loc_title")}</span>
              <h2 className="font-display text-3xl md:text-4xl mt-2 tracking-tight">{t("loc_heading")}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main info card */}
              <div className="bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-3xl p-6 md:p-8 space-y-5">

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[rgb(var(--muted))] uppercase tracking-wider mb-1">{t("loc_address_label")}</p>
                    <p className="font-semibold text-[rgb(var(--foreground))] text-base leading-snug">
                      {t("loc_city")}
                    </p>
                    <p className="text-[rgb(var(--muted))] text-sm mt-1">
                      {t("loc_street")}
                    </p>
                    <a href="https://yandex.com/maps/-/CPXFeSN9"
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 text-xs mt-1.5 hover:text-blue-300 transition-colors">
                      <Navigation className="w-3 h-3" /> {t("loc_yandex")}
                    </a>
                  </div>
                </div>

                <div className="border-t border-[rgb(var(--border))]" />

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[rgb(var(--muted))] uppercase tracking-wider mb-1">{t("loc_schedule_label")}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-[rgb(var(--foreground))]">{t("loc_mon_wed_fri")}</span>
                        <span className="font-semibold text-blue-400">17:00 – 19:00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[rgb(var(--foreground))]">{t("loc_tue_thu")}</span>
                        <span className="font-semibold text-blue-400">18:00 – 20:00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[rgb(var(--foreground))]">{t("loc_saturday")}</span>
                        <span className="font-semibold text-blue-400">10:00 – 12:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[rgb(var(--border))]" />

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Bus className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[rgb(var(--muted))] uppercase tracking-wider mb-1">{t("loc_transport_label")}</p>
                    <ul className="text-sm text-[rgb(var(--foreground))] space-y-1">
                      <li>🚇 {t("loc_metro")}</li>
                      <li>🚌 {t("loc_bus")}</li>
                      <li>🚗 {t("loc_parking")}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Map placeholder + CTA */}
              <div className="space-y-4">
                {/* Yandex Maps embed */}
                <div className="relative rounded-3xl overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))]" style={{ height: 280 }}>
                  <iframe
                    src="https://yandex.com/map-widget/v1/?ll=69.282401%2C41.277016&z=17&pt=69.282401%2C41.277016%2Cpm2rdm"
                    width="100%" height="100%" style={{ border: 0 }}
                    allowFullScreen loading="lazy"
                    title="UHA Academy location"
                  />
                </div>

                {/* Quick CTA */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-[rgb(var(--foreground))]">{t("loc_cta_badge")}</span>
                  </div>
                  <p className="text-[rgb(var(--muted))] text-sm mb-4">
                    {t("loc_cta_desc")}
                  </p>
                  <button onClick={() => setShowModal(true)}
                    className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl text-sm uppercase tracking-widest transition-colors">
                    {t("loc_cta_btn")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enrollment modal */}
      {showModal && <AcademyApplicationModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
