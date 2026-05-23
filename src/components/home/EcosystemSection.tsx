"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Shirt, Trophy, GraduationCap, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ECOSYSTEM = [
  {
    icon: ShoppingBag,
    key: "marketplace",
    href: "/marketplace",
    active: true,
    accent: "rgb(var(--accent))",
  },
  {
    icon: Shirt,
    key: "merch",
    href: "/merch",
    active: true,
    accent: "#8b5cf6",
  },
  {
    icon: Trophy,
    key: "league",
    href: "/league-coming-soon",
    active: false,
    accent: "#f59e0b",
  },
  {
    icon: GraduationCap,
    key: "academy",
    href: "/academy-coming-soon",
    active: false,
    accent: "#3b82f6",
  },
] as const;

export function EcosystemSection() {
  const t = useTranslations("home");

  return (
    <section className="py-20 md:py-28 bg-[rgb(var(--background))]">
      <div className="container-uha">
        <div className="mb-14 text-center">
          <SectionHeader
            label="Ecosystem"
            title={t("ecosystem_title")}
            subtitle={t("ecosystem_subtitle")}
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ECOSYSTEM.map(({ icon: Icon, key, href, active, accent }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={href}
                className="group relative flex flex-col h-full p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl overflow-hidden hover:border-[rgb(var(--foreground)/0.2)] transition-all duration-300"
              >
                {/* Glow */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                  style={{ background: accent }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
                >
                  <Icon className="w-6 h-6" style={{ color: accent }} />
                </div>

                {/* Text */}
                <h3 className="font-display text-2xl tracking-wide text-[rgb(var(--foreground))] mb-2">
                  {t(`ecosystem_${key}` as Parameters<typeof t>[0])}
                </h3>
                <p className="text-sm text-[rgb(var(--muted))] leading-relaxed flex-1">
                  {t(`ecosystem_${key}_desc` as Parameters<typeof t>[0])}
                </p>

                {/* Status / CTA */}
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-[rgb(var(--border))]">
                  {active ? (
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">
                      Coming Soon
                    </span>
                  )}
                  <ArrowUpRight
                    className="w-4 h-4 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--foreground))] transition-colors"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
