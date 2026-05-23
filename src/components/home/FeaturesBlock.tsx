"use client";

import { motion } from "framer-motion";
import { Globe, Copy, Star, Zap, Camera, CircleDot } from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Worldwide Sourcing",
    titleRu: "Мировые источники",
    desc: "Товары напрямую из США, Европы и Азии. Проверенные поставщики.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: CircleDot,
    title: "Basketball Focused",
    titleRu: "Баскетбол-фокус",
    desc: "Только кроссовки и одежда из мира баскетбольной культуры.",
    color: "text-[rgb(var(--accent))]",
    bg: "bg-[rgb(var(--accent)/0.1)] border-[rgb(var(--accent)/0.2)]",
  },
  {
    icon: Copy,
    title: "Replica & Original",
    titleRu: "Реплика и Оригинал",
    desc: "Честный выбор: оригинальные товары или качественные реплики по доступной цене.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Star,
    title: "Curated Catalog",
    titleRu: "Кураторский каталог",
    desc: "Каждая позиция отбирается вручную. Только актуальные релизы и гиперы.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Zap,
    title: "Fast Support",
    titleRu: "Быстрая поддержка",
    desc: "Ответ в Telegram в течение 30 минут. Помощь с выбором размера.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Camera,
    title: "Photo Search",
    titleRu: "Поиск по фото",
    desc: "Загрузи фото модели — найдём её в каталоге за секунды.",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturesBlock() {
  return (
    <section className="py-20 md:py-28 bg-[rgb(var(--surface))]">
      <div className="container-uha">
        <div className="mb-14 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))] mb-4 block">
            Why UHA SHOP
          </span>
          <h2 className="font-display text-5xl md:text-6xl tracking-wide text-[rgb(var(--foreground))]">
            Преимущества
          </h2>
        </div>

        <motion.div variants={stagger} initial="hidden" whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} variants={fadeUp}
                className="group p-6 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-2xl hover:border-opacity-60 transition-all duration-300 cursor-default">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-5 ${f.bg}`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div className="font-display text-xl tracking-wide text-[rgb(var(--foreground))] mb-1">
                  {f.titleRu}
                </div>
                <div className="text-xs font-medium uppercase tracking-widest text-[rgb(var(--muted))] mb-3">
                  {f.title}
                </div>
                <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
