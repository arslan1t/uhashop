"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function CategoriesSection() {
  const t = useTranslations("home");

  const CATEGORIES = [
    {
      id: "shoes",
      title: t("cat_shoes_title"),
      subtitle: t("cat_shoes_sub"),
      href: "/marketplace?category=shoes",
      coverImage: "/images/branding/category-shoes.png",
      accent: "from-red-800/20",
    },
    {
      id: "apparel",
      title: t("cat_apparel_title"),
      subtitle: t("cat_apparel_sub"),
      href: "/marketplace?category=apparel",
      coverImage: "/images/branding/category-apparel.png",
      accent: "from-purple-600/20",
    },
    {
      id: "merch",
      title: t("cat_merch_title"),
      subtitle: t("cat_merch_sub"),
      href: "/merch",
      coverImage: "/images/branding/category-merch.png",
      accent: "from-red-500/15",
      badge: t("cat_merch_badge"),
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={cat.href}
                className="group relative block rounded-3xl overflow-hidden bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.2)] transition-all duration-300"
                style={{ aspectRatio: "1086 / 1448" }}
              >
                {/* Cover image */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={cat.coverImage}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Gradient overlays */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} to-transparent`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                {/* Badge */}
                {cat.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-[rgb(var(--accent))] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      {cat.badge}
                    </span>
                  </div>
                )}

                {/* Bottom text */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/55 text-xs uppercase tracking-widest mb-2">
                        {cat.subtitle}
                      </p>
                      <h3 className="font-display text-4xl text-white tracking-wide leading-none drop-shadow-lg">
                        {cat.title}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[rgb(var(--accent))] group-hover:border-[rgb(var(--accent))] transition-all duration-300 flex-shrink-0">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
