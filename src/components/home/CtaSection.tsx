"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  const t = useTranslations("home");

  return (
    <section className="py-20 md:py-28 bg-[rgb(var(--surface))]">
      <div className="container-uha">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-[rgb(var(--background))] border border-[rgb(var(--border))] px-8 md:px-16 py-16 md:py-20 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[rgb(var(--accent)/0.08)] rounded-full blur-[60px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[rgb(var(--accent)/0.06)] rounded-full blur-[60px]" />
          </div>

          <div className="relative z-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-5">
              UHA Shop
            </span>
            <h2 className="font-display text-3xl sm:text-5xl md:text-7xl tracking-wide text-[rgb(var(--foreground))] leading-none mb-6">
              {t("cta_section_title")}
            </h2>
            <p className="text-[rgb(var(--muted))] text-lg max-w-xl mx-auto mb-10">
              {t("cta_section_subtitle")}
            </p>
            <Link
              href="/marketplace"
              className="group inline-flex items-center gap-3 px-10 py-4 bg-[rgb(var(--accent))] text-white font-bold uppercase tracking-widest text-sm rounded-2xl hover:bg-[rgb(var(--accent-hover))] transition-all shadow-xl shadow-[rgb(var(--accent)/0.3)]"
            >
              {t("cta_section_btn")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
