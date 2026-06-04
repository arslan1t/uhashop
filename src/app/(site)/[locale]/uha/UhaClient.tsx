"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  ShoppingBag, Trophy, GraduationCap, Shirt,
  Globe, Zap, Heart, Star, Instagram, Youtube,
  MessageCircle, ExternalLink, Quote,
} from "lucide-react";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function UhaClient() {
  const t = useTranslations("uha");

  const SOCIALS = [
    {
      icon: Instagram,
      label: "UHA Store",
      handle: "@uha_store_",
      desc: t("social_store_desc"),
      href: "https://www.instagram.com/uha_store_/",
      color: "from-purple-500/15 to-pink-500/10",
      border: "border-purple-500/20 hover:border-purple-500/40",
      text: "text-purple-400",
    },
    {
      icon: Instagram,
      label: "UHA League",
      handle: "@uha_league",
      desc: t("social_league_ig_desc"),
      href: "https://www.instagram.com/uha_league/",
      color: "from-amber-500/15 to-orange-500/10",
      border: "border-amber-500/20 hover:border-amber-500/40",
      text: "text-amber-400",
    },
    {
      icon: Instagram,
      label: "UHA Academy",
      handle: "@uha_basketball_academy",
      desc: t("social_academy_desc"),
      href: "https://www.instagram.com/uha_basketball_academy/",
      color: "from-blue-500/15 to-cyan-500/10",
      border: "border-blue-500/20 hover:border-blue-500/40",
      text: "text-blue-400",
    },
    {
      icon: MessageCircle,
      label: "UHA Manager",
      handle: "@uha_manager",
      desc: t("social_manager_desc"),
      href: "https://t.me/uha_manager",
      color: "from-sky-400/15 to-blue-500/10",
      border: "border-sky-400/20 hover:border-sky-400/40",
      text: "text-sky-400",
    },
    {
      icon: MessageCircle,
      label: "Hooper Tournaments",
      handle: "@hoopertournaments",
      desc: t("social_hooper_desc"),
      href: "https://t.me/hoopertournaments",
      color: "from-sky-500/15 to-blue-500/10",
      border: "border-sky-500/20 hover:border-sky-500/40",
      text: "text-sky-400",
    },
    {
      icon: Youtube,
      label: "UHA League YouTube",
      handle: "@UHALeague",
      desc: t("social_youtube_desc"),
      href: "https://www.youtube.com/@UHALeague",
      color: "from-red-500/15 to-rose-500/10",
      border: "border-red-500/20 hover:border-red-500/40",
      text: "text-red-400",
    },
  ];

  const values = [
    { icon: Zap,    key: "value_1" as const },
    { icon: Star,   key: "value_2" as const },
    { icon: Heart,  key: "value_3" as const },
    { icon: Globe,  key: "value_4" as const },
  ];

  const ecosystem = [
    { icon: ShoppingBag,   label: "UHA Marketplace", desc: t("ecosystem_shop_desc"),     href: "/marketplace", active: true },
    { icon: Shirt,         label: "UHA Merch",        desc: t("ecosystem_merch_desc"),    href: "/merch",       active: true },
    { icon: Trophy,        label: "UHA League",       desc: t("ecosystem_league_desc"),   href: "/league",      active: true },
    { icon: GraduationCap, label: "UHA Academy",      desc: t("ecosystem_academy_desc"),  href: "/academy",     active: true },
  ];

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-[rgb(var(--border))]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[rgb(var(--accent)/0.05)] rounded-full blur-[100px]" />
        </div>
        <div className="container-uha py-24 md:py-32 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-6 block">{t("title")}</span>
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wide leading-none mb-6">UHA</h1>
            <p className="font-display text-2xl md:text-3xl text-[rgb(var(--accent))] tracking-wide mb-8">{t("tagline")}</p>
            <p className="text-[rgb(var(--muted))] text-lg leading-relaxed max-w-xl">{t("mission_desc")}</p>
          </motion.div>
        </div>
      </section>

      {/* ── FOUNDER ── */}
      <section className="py-20 md:py-24 border-b border-[rgb(var(--border))]">
        <div className="container-uha">
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-3 block">{t("founder_title")}</span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">{t("founder_heading")}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Story — 3 cols */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:col-span-3 space-y-4">
              <div className="relative pl-6 border-l-2 border-[rgb(var(--accent)/0.4)]">
                <p className="text-[rgb(var(--foreground))] text-lg leading-relaxed italic">{t("founder_quote")}</p>
              </div>
              <p className="text-[rgb(var(--muted))] leading-relaxed">{t("founder_story_1")}</p>
              <p className="text-[rgb(var(--muted))] leading-relaxed">{t("founder_story_2")}</p>
              <a href="https://www.instagram.com/_s_musaev/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl text-sm font-semibold hover:border-pink-500/40 transition-colors group">
                <Instagram className="w-4 h-4 text-pink-400" />
                @_s_musaev
                <ExternalLink className="w-3 h-3 text-[rgb(var(--muted))]" />
              </a>
            </motion.div>

            {/* Card — 2 cols */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:col-span-2">
              <div className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.2)] flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-xl text-[rgb(var(--accent))]">S</span>
                  </div>
                  <div>
                    <div className="font-display text-lg tracking-tight">Самир Мусаев</div>
                    <div className="text-[rgb(var(--muted))] text-xs">{t("founder_role")}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm border-t border-[rgb(var(--border))] pt-4">
                  {([
                    ["📅", t("founder_est_label"), "2021"],
                    ["📍", t("founder_hq_label"), ""],
                    ["🏀", t("founder_directions_label"), ""],
                  ] as [string, string, string][]).map(([emoji, label, val]) => (
                    <div key={label} className="flex items-start gap-2 text-[rgb(var(--muted))]">
                      <span>{emoji}</span>
                      <span className="text-[rgb(var(--foreground))]">{label}{val ? ` — ${val}` : ""}</span>
                    </div>
                  ))}
                </div>
                <a href="https://yandex.com/maps/10335/tashkent/house/YkAYdA9iSk0AQFprfX52d3tkYA==/?ll=69.282401%2C41.277016&z=17"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors pt-1">
                  <ExternalLink className="w-3 h-3" /> {t("founder_map_link")}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOCIALS ── */}
      <section className="py-20 border-b border-[rgb(var(--border))]">
        <div className="container-uha">
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-3 block">{t("socials_title")}</span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">{t("socials_heading")}</h2>
            <p className="text-[rgb(var(--muted))] mt-2">{t("socials_desc")}</p>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIALS.map(s => (
              <motion.a key={s.handle} variants={fadeUp}
                href={s.href} target="_blank" rel="noopener noreferrer"
                className={`group flex items-start gap-4 p-5 bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl transition-all hover:-translate-y-0.5`}>
                <s.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${s.text}`} />
                <div className="min-w-0">
                  <div className={`font-mono text-sm font-bold ${s.text}`}>{s.handle}</div>
                  <div className="text-xs text-[rgb(var(--muted))] mt-0.5 leading-relaxed">{s.desc}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[rgb(var(--muted))] opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0 mt-0.5" />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MISSION + VISION ── */}
      <section className="py-20 border-b border-[rgb(var(--border))]">
        <div className="container-uha">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {([
              { titleKey: "mission_title" as const, descKey: "mission_desc" as const, accent: "rgb(var(--accent))" },
              { titleKey: "vision_title"  as const, descKey: "vision_desc"  as const, accent: "#8b5cf6" },
            ]).map(({ titleKey, descKey, accent }, i) => (
              <motion.div key={titleKey}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-7 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl" style={{ background: accent }} />
                <div className="w-1 h-7 rounded-full mb-5" style={{ background: accent }} />
                <h3 className="font-display text-2xl tracking-wide mb-3" style={{ color: accent }}>{t(titleKey)}</h3>
                <p className="text-[rgb(var(--muted))] leading-relaxed text-sm">{t(descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-20 border-b border-[rgb(var(--border))]">
        <div className="container-uha">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-4 block">DNA</span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">{t("values_title")}</h2>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map(({ icon: Icon, key }) => (
              <motion.div key={key} variants={fadeUp}
                className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl group hover:border-[rgb(var(--accent)/0.4)] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.2)] flex items-center justify-center mb-4 group-hover:bg-[rgb(var(--accent)/0.15)] transition-colors">
                  <Icon className="w-5 h-5 text-[rgb(var(--accent))]" />
                </div>
                <h4 className="font-semibold mb-1.5">{t(key)}</h4>
                <p className="text-xs text-[rgb(var(--muted))] leading-relaxed">{t(`${key}_desc` as Parameters<typeof t>[0])}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section className="py-20 border-b border-[rgb(var(--border))]">
        <div className="container-uha">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-3 block">Ecosystem</span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide">{t("ecosystem_title")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ecosystem.map(({ icon: Icon, label, desc, href }) => (
              <Link key={label} href={href}
                className="group p-5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl hover:border-[rgb(var(--accent)/0.4)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent)/0.1)] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[rgb(var(--accent))]" />
                </div>
                <div className="font-semibold text-sm mb-1">{label}</div>
                <div className="text-xs text-[rgb(var(--muted))]">{desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="container-uha text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-5xl md:text-6xl tracking-wide mb-6">{t("cta_heading")}</h2>
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
