"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Camera } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("home");

  const STATS = [
    { val: "200+",  label: t("stat_brands") },
    { val: "7–21",  label: t("stat_delivery") },
    { val: "1000+", label: t("stat_items") },
    { val: "📷",    label: t("stat_photo") },
  ];

  const tgUrl = `https://t.me/uha_manager?text=${encodeURIComponent("Привет! Хочу найти товар по фото. Можно прислать фотографию?")}`;

  return (
    <>
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[rgb(var(--background))]">
          <div className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgb(var(--foreground)) 1px, transparent 1px),
                                linear-gradient(90deg, rgb(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }} />
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[rgb(var(--accent)/0.06)] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] bg-[rgb(var(--accent)/0.03)] rounded-full blur-[80px]" />
        </div>

        <div className="container-uha relative z-10 py-20 lg:py-0 lg:min-h-[92vh] lg:flex lg:items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">

            {/* ── LEFT: text ── */}
            <div>
              {/* Badge */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-[rgb(var(--accent)/0.1)] border border-[rgb(var(--accent)/0.25)] text-[rgb(var(--accent))] text-xs font-semibold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full animate-pulse" />
                {t("hero_badge")}
              </motion.div>

              {/* Title — translated per locale */}
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display leading-[1.05] tracking-tight text-[rgb(var(--foreground))] mb-6"
                style={{ fontSize: "clamp(1.85rem, 4.2vw, 3.6rem)" }}>
                <span className="block">{t("hero_line1")}</span>
                <span className="block text-[rgb(var(--accent))]">{t("hero_line2")}</span>
                <span className="block text-[rgb(var(--accent))]">{t("hero_line3")}</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[rgb(var(--muted))] text-lg leading-relaxed max-w-lg mb-10">
                {t("hero_subtitle")}
              </motion.p>

              {/* CTA buttons */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4">
                <Link href="/marketplace"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-[rgb(var(--accent))] text-white font-bold uppercase tracking-widest text-sm rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-all shadow-xl shadow-[rgb(var(--accent)/0.3)]">
                  {t("hero_cta")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/merch"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-[rgb(var(--border))] font-bold uppercase tracking-widest text-sm rounded-2xl hover:border-[rgb(var(--foreground)/0.4)] transition-all">
                  {t("hero_cta_merch")}
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-0 mt-14 pt-8">
                {STATS.map((s, i) => {
                  const isPhotoSearch = s.val === "📷";
                  const borderClass =
                    i === 2 ? "pt-5 sm:pt-0" :
                    i === 3 ? "pt-5 sm:pt-0" : "";

                  const content = (
                    <>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {isPhotoSearch
                          ? <Camera className="w-5 h-5 text-[rgb(var(--accent))]" />
                          : <div className="font-display text-2xl sm:text-3xl leading-none">{s.val}</div>}
                      </div>
                      <div className={`text-[10px] sm:text-xs uppercase tracking-wider leading-tight ${isPhotoSearch ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted))]"}`}>
                        {s.label}
                      </div>
                    </>
                  );

                  return (
                    <div key={s.label} className={borderClass}>
                      {isPhotoSearch ? (
                        <a href={tgUrl} target="_blank" rel="noopener noreferrer"
                          className="block group cursor-pointer hover:opacity-80 transition-opacity"
                          title={s.label}>
                          {content}
                        </a>
                      ) : (
                        <div>{content}</div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* ── RIGHT: video (desktop only) ── */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center">

              <div className="relative w-full max-w-[520px] aspect-[4/5] rounded-3xl overflow-hidden bg-black border border-[rgb(var(--border)/0.5)] shadow-2xl">
                <video autoPlay muted loop playsInline preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover">
                  <source src="/videos/3d-tee.mov" type="video/quicktime" />
                  <source src="/videos/3d-tee.mov" type="video/mp4" />
                </video>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60 mb-1">UHA SHOP</p>
                  <p className="font-display text-2xl text-white tracking-wide leading-tight">Original Merch</p>
                  <p className="text-white/60 text-sm mt-1">Exclusive collection</p>
                </div>

                <div className="absolute top-5 right-5" style={{ filter: "drop-shadow(0 0 8px rgba(153,27,27,0.6)) drop-shadow(0 0 18px rgba(153,27,27,0.3))" }}>
                  <div className="w-14 h-14 animate-spin-slow relative">
                    <Image src="/images/branding/logo-spinning.png" alt="UHA"
                      fill className="object-contain" sizes="56px" />
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}
