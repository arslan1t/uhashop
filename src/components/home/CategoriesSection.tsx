"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Footprints, Shirt, Star } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { LucideIcon } from "lucide-react";

const CATEGORIES: {
  id: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  href: string;
  gradient: string;
  border: string;
  accent: string;
  accentBg: string;
  tag: string;
  badge?: boolean;
}[] = [
  {
    id: "shoes-basketball",
    icon: Footprints,
    title: "Обувь",
    sub: "Баскетбол",
    href: "/marketplace?category=shoes&style=basketball",
    gradient: "from-orange-500/20 to-red-500/10",
    border: "border-orange-500/20 hover:border-orange-500/40",
    accent: "text-orange-400",
    accentBg: "bg-orange-500/10",
    tag: "Performance",
  },
  {
    id: "shoes-lifestyle",
    icon: Footprints,
    title: "Обувь",
    sub: "Лайфстайл",
    href: "/marketplace?category=shoes&style=lifestyle",
    gradient: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-500/20 hover:border-purple-500/40",
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10",
    tag: "Street",
  },
  {
    id: "apparel-basketball",
    icon: Shirt,
    title: "Одежда",
    sub: "Баскетбол",
    href: "/marketplace?category=apparel&style=basketball",
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20 hover:border-blue-500/40",
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10",
    tag: "Sport",
  },
  {
    id: "apparel-lifestyle",
    icon: Shirt,
    title: "Одежда",
    sub: "Лайфстайл",
    href: "/marketplace?category=apparel&style=lifestyle",
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    tag: "Casual",
  },
  {
    id: "merch",
    icon: Star,
    title: "Мерч",
    sub: "UHA Оригинал",
    href: "/merch",
    gradient: "from-red-500/20 to-rose-500/10",
    border: "border-red-500/20 hover:border-red-500/40",
    accent: "text-red-400",
    accentBg: "bg-red-500/10",
    tag: "В наличии",
    badge: true,
  },
];

export function CategoriesSection() {
  const t = useTranslations("home");

  return (
    <section className="py-20 md:py-28 bg-[rgb(var(--surface))]">
      <div className="container-uha">
        <div className="mb-12">
          <SectionHeader
            label="Shop"
            title={t("categories_title")}
            subtitle={t("categories_subtitle")}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link
                  href={cat.href}
                  className={`group relative flex flex-col items-center justify-center gap-3 p-5 md:p-6 rounded-2xl bg-gradient-to-br ${cat.gradient} border ${cat.border} transition-all duration-300 hover:scale-[1.03] hover:shadow-lg text-center h-full`}
                >
                  {cat.badge && (
                    <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-[rgb(var(--accent))] text-white px-2 py-0.5 rounded-full">
                      {cat.tag}
                    </span>
                  )}

                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${cat.accentBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 md:w-7 md:h-7 ${cat.accent}`} />
                  </div>

                  <div>
                    <p className="font-black text-base md:text-lg text-[rgb(var(--foreground))] leading-none mb-1">
                      {cat.title}
                    </p>
                    <p className={`text-xs font-bold uppercase tracking-wider ${cat.accent}`}>
                      {cat.sub}
                    </p>
                  </div>

                  <div className={`w-7 h-7 rounded-xl ${cat.accentBg} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}>
                    <ArrowUpRight className={`w-3.5 h-3.5 ${cat.accent}`} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
