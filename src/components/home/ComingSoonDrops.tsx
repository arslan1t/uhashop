"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Clock, Bell } from "lucide-react";

const DROPS = [
  {
    slug: "jordan-4-thunder",
    name: "Air Jordan 4 Thunder",
    brand: "Jordan",
    price: "$225",
    image: "/images/products/shoes/jordan-4-fire-red/3.jpg",
    dropDate: "Summer 2026",
  },
  {
    slug: "travis-air-max-1",
    name: "Travis Scott Air Max 1",
    brand: "Travis Scott × Nike",
    price: "$380",
    image: "/images/products/shoes/travis-dunk-sb/3.jpg",
    dropDate: "Fall 2026",
  },
  {
    slug: "yeezy-950",
    name: "Adidas Yeezy 950",
    brand: "Adidas",
    price: "$320",
    image: "/images/products/shoes/yeezy-350-v2-carbon/2.jpg",
    dropDate: "TBA",
  },
  {
    slug: "uha-tee-v2",
    name: "UHA Collection Vol.2",
    brand: "UHA",
    price: "$45",
    image: "/images/products/apparel/fog-tee-1/2.jpg",
    dropDate: "June 2026",
  },
];

export function ComingSoonDrops() {
  return (
    <section className="py-20 md:py-28 bg-[rgb(var(--background))]">
      <div className="container-uha">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[rgb(var(--accent))]">
                Upcoming
              </span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl tracking-wide leading-none">
              Coming Soon
            </h2>
            <p className="text-[rgb(var(--muted))] text-base mt-2">
              Будущие дропы и релизы
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-[rgb(var(--border))] text-sm font-semibold text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground)/0.3)] rounded-xl transition-all flex-shrink-0">
            <Bell className="w-4 h-4" />
            Уведомить о всех
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {DROPS.map((drop, i) => (
            <motion.div key={drop.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden cursor-default">

              {/* Image — blurred */}
              <div className="relative aspect-square overflow-hidden">
                <Image src={drop.image} alt={drop.name} fill
                  className="object-cover scale-110 blur-sm brightness-50 transition-all duration-500 group-hover:blur-[3px] group-hover:brightness-40"
                  sizes="(max-width: 640px) 50vw, 25vw" />

                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="px-3 py-1.5 bg-[rgb(var(--accent))] rounded-full">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                      Soon
                    </span>
                  </div>
                </div>

                {/* Notify button on hover */}
                <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                    <Bell className="w-3 h-3" />
                    Уведомить
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-[rgb(var(--accent))] uppercase tracking-wider">
                    {drop.brand}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-[rgb(var(--muted))]">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{drop.dropDate}</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] leading-snug mb-2">
                  {drop.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[rgb(var(--muted))]">
                    from {drop.price}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))] border border-[rgb(var(--accent)/0.2)] rounded-full">
                    Preview
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
