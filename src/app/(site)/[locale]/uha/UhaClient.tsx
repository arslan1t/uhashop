"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag, Trophy, GraduationCap, Shirt,
  Globe, Zap, Heart, Star, Instagram, Youtube,
  MessageCircle, ExternalLink, Quote, MapPin,
} from "lucide-react";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const SOCIALS = [
  {
    icon: Instagram,
    label: "UHA Store",
    handle: "@uha_store_",
    desc: "Официальный магазин — кроссовки, одежда, мерч",
    href: "https://www.instagram.com/uha_store_/",
    color: "from-purple-500/15 to-pink-500/10",
    border: "border-purple-500/20 hover:border-purple-500/40",
    text: "text-purple-400",
  },
  {
    icon: Instagram,
    label: "UHA League",
    handle: "@uha_league",
    desc: "3×3 баскетбольная лига — новости, результаты, турниры",
    href: "https://www.instagram.com/uha_league/",
    color: "from-amber-500/15 to-orange-500/10",
    border: "border-amber-500/20 hover:border-amber-500/40",
    text: "text-amber-400",
  },
  {
    icon: Instagram,
    label: "UHA Academy",
    handle: "@uha_basketball_academy",
    desc: "Академия — тренировки, прогресс, молодые таланты",
    href: "https://www.instagram.com/uha_basketball_academy/",
    color: "from-blue-500/15 to-cyan-500/10",
    border: "border-blue-500/20 hover:border-blue-500/40",
    text: "text-blue-400",
  },
  {
    icon: MessageCircle,
    label: "Hooper Tournaments",
    handle: "@hoopertournaments",
    desc: "Организация турниров — расписание и регистрация",
    href: "https://t.me/hoopertournaments",
    color: "from-sky-500/15 to-blue-500/10",
    border: "border-sky-500/20 hover:border-sky-500/40",
    text: "text-sky-400",
  },
  {
    icon: Youtube,
    label: "UHA League YouTube",
    handle: "@UHALeague",
    desc: "Видеозаписи матчей, хайлайты и обзоры туров",
    href: "https://www.youtube.com/@UHALeague",
    color: "from-red-500/15 to-rose-500/10",
    border: "border-red-500/20 hover:border-red-500/40",
    text: "text-red-400",
  },
];

export function UhaClient() {
  const t = useTranslations("uha");

  const values = [
    { icon: Zap,    key: "value_1" as const },
    { icon: Star,   key: "value_2" as const },
    { icon: Heart,  key: "value_3" as const },
    { icon: Globe,  key: "value_4" as const },
  ];

  const ecosystem = [
    { icon: ShoppingBag,    label: "UHA Marketplace", desc: "Кроссовки и одежда под заказ",    href: "/marketplace",         active: true  },
    { icon: Shirt,          label: "UHA Merch",        desc: "Оригинальная линейка одежды",    href: "/merch",               active: true  },
    { icon: Trophy,         label: "UHA League",       desc: "3×3 баскетбольная лига",         href: "/league",              active: true  },
    { icon: GraduationCap,  label: "UHA Academy",      desc: "Тренировки и развитие",          href: "/academy",             active: true  },
  ];

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-[rgb(var(--border))]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[rgb(var(--accent)/0.05)] rounded-full blur-[100px]" />
        </div>
        <div className="container-uha py-24 md:py-32 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-6 block">
              {t("title")}
            </span>
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wide leading-none text-[rgb(var(--foreground))] mb-6">
              UHA
            </h1>
            <p className="font-display text-2xl md:text-3xl text-[rgb(var(--accent))] tracking-wide mb-8">
              {t("tagline")}
            </p>
            <p className="text-[rgb(var(--muted))] text-lg leading-relaxed max-w-xl">
              {t("mission_desc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOUNDER ── */}
      <section className="py-20 md:py-28">
        <div className="container-uha">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-4 block">Founder</span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">История основателя</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: story */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="space-y-5">
              <div className="relative">
                <Quote className="absolute -top-2 -left-1 w-8 h-8 text-[rgb(var(--accent)/0.3)]" />
                <p className="text-[rgb(var(--foreground))] text-lg leading-relaxed pl-8">
                  Всё началось с простого вопроса: почему в Центральной Азии невозможно найти нормальную пару Jordan'ов?
                </p>
              </div>

              <p className="text-[rgb(var(--muted))] leading-relaxed">
                <strong className="text-[rgb(var(--foreground))]">Сарвар Мусаев</strong> вырос в Ташкенте, с детства влюблённый в баскетбол. Кроссовки для него были не просто обувью — это была часть культуры, которую он видел в клипах, на площадках НБА, в уличных играх. Но купить пару оригинальных Nike или Jordan в Узбекистане было практически невозможно: либо подделки, либо цены в три раза выше рыночных.
              </p>

              <p className="text-[rgb(var(--muted))] leading-relaxed">
                В 2021 году Сарвар начал привозить кроссовки для себя и друзей через прямые каналы из Китая и Европы. Сарафанное радио сработало быстро — заказов становилось всё больше. Так родился <strong className="text-[rgb(var(--foreground))]">UHA Shop</strong> — маркетплейс для тех, кто живёт баскетболом.
              </p>

              <p className="text-[rgb(var(--muted))] leading-relaxed">
                Но остановиться на магазине было не в его характере. Он понял: чтобы баскетбольная культура в Центральной Азии развивалась, нужна полноценная экосистема. Так появились <strong className="text-[rgb(var(--foreground))]">UHA League</strong> — любительская лига 3×3 с официальным статусом FIBA, <strong className="text-[rgb(var(--foreground))]">UHA Academy</strong> — профессиональная школа для молодых игроков, и <strong className="text-[rgb(var(--foreground))]">UHA Merch</strong> — собственная линейка одежды для тех, кто идентифицирует себя с движением.
              </p>

              <p className="text-[rgb(var(--muted))] leading-relaxed">
                Сегодня UHA — это не просто бренд. Это сообщество тысяч игроков, болельщиков и хуперов по всей Центральной Азии, объединённых одной любовью к игре.
              </p>

              <a href="https://www.instagram.com/_s_musaev/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl text-sm font-semibold hover:border-[rgb(var(--accent)/0.4)] transition-colors group">
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>@_s_musaev</span>
                <ExternalLink className="w-3 h-3 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--foreground))] transition-colors" />
              </a>
            </motion.div>

            {/* Right: founder card */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="space-y-4">
              <div className="p-8 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.2)] flex items-center justify-center">
                    <span className="font-display text-2xl text-[rgb(var(--accent))]">S</span>
                  </div>
                  <div>
                    <div className="font-display text-xl tracking-tight">Сарвар Мусаев</div>
                    <div className="text-[rgb(var(--muted))] text-sm">Founder & CEO, UHA</div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Основан", value: "2021" },
                    { label: "Штаб-квартира", value: "Ташкент, Узбекистан" },
                    { label: "Миссия", value: "Basketball. Culture. Central Asia." },
                    { label: "Направления", value: "Shop · Merch · League · Academy" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <span className="text-[rgb(var(--muted))] min-w-[110px]">{label}</span>
                      <span className="text-[rgb(var(--foreground))] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini map */}
              <div className="rounded-3xl overflow-hidden border border-[rgb(var(--border))]" style={{ height: 220 }}>
                <iframe
                  src="https://yandex.com/map-widget/v1/?url=https%3A%2F%2Fyandex.com%2Fmaps%2F-%2FCPXFeSN9&z=13"
                  width="100%" height="100%" style={{ border: 0 }}
                  loading="lazy" title="UHA Headquarters"
                />
              </div>
              <a href="https://yandex.com/maps/-/CPXFeSN9" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
                <MapPin className="w-3 h-3" /> Открыть в Яндекс Картах
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL MEDIA ── */}
      <section className="py-20 border-t border-[rgb(var(--border))]">
        <div className="container-uha">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-4 block">Community</span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">Мы в соцсетях</h2>
            <p className="text-[rgb(var(--muted))] mt-3 text-lg max-w-xl">
              Следи за матчами, новинками и жизнью сообщества — мы везде
            </p>
          </div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIALS.map((s) => (
              <motion.a key={s.handle} variants={fadeUp}
                href={s.href} target="_blank" rel="noopener noreferrer"
                className={`group p-5 bg-gradient-to-br ${s.color} border ${s.border} rounded-3xl transition-all hover:-translate-y-0.5`}>
                <div className="flex items-start justify-between mb-4">
                  <s.icon className={`w-6 h-6 ${s.text}`} />
                  <ExternalLink className="w-4 h-4 text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className={`font-mono text-sm font-bold mb-1 ${s.text}`}>{s.handle}</div>
                <div className="font-semibold text-[rgb(var(--foreground))] text-sm mb-2">{s.label}</div>
                <div className="text-xs text-[rgb(var(--muted))] leading-relaxed">{s.desc}</div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MISSION + VISION ── */}
      <section className="py-20 md:py-28 border-t border-[rgb(var(--border))]">
        <div className="container-uha">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { titleKey: "mission_title" as const, descKey: "mission_desc" as const, accent: "rgb(var(--accent))" },
              { titleKey: "vision_title"  as const, descKey: "vision_desc"  as const, accent: "#8b5cf6"            },
            ].map(({ titleKey, descKey, accent }, i) => (
              <motion.div key={titleKey}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: accent }} />
                <div className="w-1 h-8 rounded-full mb-6" style={{ background: accent }} />
                <h3 className="font-display text-3xl tracking-wide mb-4" style={{ color: accent }}>{t(titleKey)}</h3>
                <p className="text-[rgb(var(--muted))] leading-relaxed">{t(descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-20 md:py-28 border-t border-[rgb(var(--border))]">
        <div className="container-uha">
          <div className="mb-14 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-4 block">DNA</span>
            <h2 className="font-display text-5xl md:text-6xl tracking-wide">{t("values_title")}</h2>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, key }) => (
              <motion.div key={key} variants={fadeUp}
                className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl group hover:border-[rgb(var(--accent)/0.4)] transition-colors">
                <div className="w-11 h-11 rounded-2xl bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.2)] flex items-center justify-center mb-5 group-hover:bg-[rgb(var(--accent)/0.15)] transition-colors">
                  <Icon className="w-5 h-5 text-[rgb(var(--accent))]" />
                </div>
                <h4 className="font-semibold text-lg mb-2">{t(key)}</h4>
                <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">{t(`${key}_desc` as Parameters<typeof t>[0])}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section className="py-20 border-t border-[rgb(var(--border))]">
        <div className="container-uha">
          <div className="mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-4 block">Ecosystem</span>
            <h2 className="font-display text-5xl tracking-wide">{t("ecosystem_title")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ecosystem.map(({ icon: Icon, label, desc, href, active }) => (
              <Link key={label} href={href}
                className="group p-5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl hover:border-[rgb(var(--accent)/0.4)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent)/0.1)] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[rgb(var(--accent))]" />
                </div>
                <div className="font-semibold text-sm mb-1">{label}</div>
                <div className="text-xs text-[rgb(var(--muted))] mb-3">{desc}</div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-emerald-400" : "text-[rgb(var(--muted))]"}`}>
                  {active ? "Active" : "Soon"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 border-t border-[rgb(var(--border))]">
        <div className="container-uha text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-5xl md:text-6xl tracking-wide mb-6">Ready to play?</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/marketplace" className="px-8 py-4 bg-[rgb(var(--accent))] text-white font-bold rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-colors text-sm uppercase tracking-widest">
                Marketplace
              </Link>
              <Link href="/merch" className="px-8 py-4 border border-[rgb(var(--border))] font-bold rounded-2xl hover:border-[rgb(var(--foreground)/0.4)] transition-colors text-sm uppercase tracking-widest">
                UHA Merch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
