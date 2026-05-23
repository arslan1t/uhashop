"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Star, Trophy, Zap, ChevronRight, Heart } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";

// ── NBA Stars data ────────────────────────────────────────────────────
const NBA_STARS = [
  {
    id: "lebron",
    name: "LeBron James",
    team: "Los Angeles Lakers",
    number: "23",
    position: "SF",
    stats: { pts: 25.7, ast: 8.1, reb: 7.3 },
    accentColor: "#552583",
    teamColor: "#FDB927",
    emoji: "👑",
    bio: "«King James» — величайший баскетболист современности. 4-кратный чемпион, 4-кратный MVP.",
    style: "Легендарный 'The Chosen One'. Стиль: oversized streetwear + премиум кроссовки.",
    productSlugs: ["kd-16-ny", "jordan-1-lucky-green", "fog-essential-tee"],
    imageQuery: "lebron",
  },
  {
    id: "curry",
    name: "Stephen Curry",
    team: "Golden State Warriors",
    number: "30",
    position: "PG",
    stats: { pts: 26.4, ast: 6.1, reb: 4.5 },
    accentColor: "#1D428A",
    teamColor: "#FFC72C",
    emoji: "🎯",
    bio: "Величайший снайпер в истории NBA. 4-кратный чемпион, 2-кратный MVP.",
    style: "Clean casual + баскетбольная классика. Любит минималистичный streetwear.",
    productSlugs: ["nike-dunk-low-panda", "adidas-samba-black", "stussy-stock-tee"],
    imageQuery: "curry",
  },
  {
    id: "durant",
    name: "Kevin Durant",
    team: "Phoenix Suns",
    number: "35",
    position: "SF",
    stats: { pts: 27.3, ast: 5.0, reb: 6.8 },
    accentColor: "#1D1160",
    teamColor: "#E56020",
    emoji: "⚡",
    bio: "KD — один из самых результативных игроков всех времён. 2-кратный чемпион.",
    style: "Brooklyn meets Phoenix. Тёмные тона, streetwear с баскетбольными акцентами.",
    productSlugs: ["kd-16-ny", "jordan-4-military-black", "supreme-box-logo-tee"],
    imageQuery: "durant",
  },
  {
    id: "giannis",
    name: "Giannis Antetokounmpo",
    team: "Milwaukee Bucks",
    number: "34",
    position: "PF",
    stats: { pts: 30.4, ast: 6.5, reb: 11.8 },
    accentColor: "#00471B",
    teamColor: "#EEE1C6",
    emoji: "🦌",
    bio: "«Греческий Бог» — 2-кратный MVP, чемпион 2021. Самый доминирующий игрок лиги.",
    style: "Athletic premium. Мощный, агрессивный стиль с баскетбольными технологиями.",
    productSlugs: ["anta-shock-wave-5", "adidas-adiform-q-black", "vlone-staple-tee"],
    imageQuery: "giannis",
  },
  {
    id: "luka",
    name: "Luka Dončić",
    team: "Los Angeles Lakers",
    number: "77",
    position: "PG/SG",
    stats: { pts: 32.4, ast: 9.0, reb: 8.7 },
    accentColor: "#00538C",
    teamColor: "#002B5e",
    emoji: "🪄",
    bio: "Словенский вундеркинд. Три раза попадал в топ-3 MVP. Будущая легенда.",
    style: "European meets NBA. Чистый, уверенный стиль.",
    productSlugs: ["adidas-campus-00s", "yeezy-350-zebra", "kaws-tee"],
    imageQuery: "luka",
  },
  {
    id: "ja",
    name: "Ja Morant",
    team: "Memphis Grizzlies",
    number: "12",
    position: "PG",
    stats: { pts: 25.1, ast: 8.1, reb: 5.6 },
    accentColor: "#5D76A9",
    teamColor: "#12173F",
    emoji: "🚀",
    bio: "Самый взрывной игрок поколения. Фантастический атлетизм и стиль.",
    style: "Яркий, экспрессивный streetwear. Ja 1 — его сигнатурная кроссовка.",
    productSlugs: ["ja-morant-1", "travis-scott-tee", "adidas-samba-black"],
    imageQuery: "ja_morant",
  },
];

// Player jersey number visual
function JerseyNumber({ number, color }: { number: string; color: string }) {
  return (
    <div className="relative w-20 h-24 flex items-center justify-center">
      <svg viewBox="0 0 80 96" className="w-full h-full absolute inset-0">
        <path d="M20 8 L8 28 L18 32 L18 88 L62 88 L62 32 L72 28 L60 8 Q40 2 20 8Z"
          fill="currentColor" className="opacity-10" stroke="currentColor"
          strokeWidth="1.5" strokeOpacity="0.3" />
      </svg>
      <span className="relative font-display text-3xl z-10" style={{ color }}>
        {number}
      </span>
    </div>
  );
}

// NBA star placeholder visual (gradient + initials)
function PlayerVisual({ player }: { player: typeof NBA_STARS[0] }) {
  const initials = player.name.split(" ").map(n => n[0]).join("");
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${player.accentColor}40 0%, ${player.teamColor}20 100%)` }}
    >
      {/* BG pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)`,
          backgroundSize: "20px 20px",
          color: player.accentColor,
        }} />

      {/* Big emoji */}
      <span className="text-6xl relative z-10 filter drop-shadow-lg">{player.emoji}</span>

      {/* Initials ring */}
      <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center border-2"
        style={{ borderColor: player.accentColor, background: `${player.accentColor}20` }}>
        <span className="font-display text-2xl text-white">{initials}</span>
      </div>

      {/* Jersey number */}
      <span className="relative z-10 font-display text-5xl opacity-20 absolute bottom-4 right-6"
        style={{ color: player.teamColor }}>
        {player.number}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function PlayersPage() {
  const [activePlayer, setActivePlayer] = useState(NBA_STARS[0]);
  const { addItem } = useCartStore();
  const { has: isLiked, toggle: toggleLike } = useWishlist();

  const playerProducts = products.filter(p =>
    activePlayer.productSlugs.includes(p.slug)
  ).slice(0, 3);

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">

      {/* ── Header ── */}
      <div className="bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))]">
        <div className="container-uha py-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[rgb(var(--accent))] block mb-3">
            Basketball Culture
          </span>
          <h1 className="font-display text-3xl md:text-5xl tracking-tight mb-3">
            NBA Stars & Style
          </h1>
          <p className="text-[rgb(var(--muted))] max-w-lg">
            Одевайся как твои кумиры. Кроссовки и одежда, вдохновлённые стилем лучших игроков NBA.
          </p>
        </div>
      </div>

      <div className="container-uha py-12">

        {/* ── Player selector tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {NBA_STARS.map((star) => (
            <motion.button
              key={star.id}
              onClick={() => setActivePlayer(star)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                activePlayer.id === star.id
                  ? "border-[rgb(var(--accent)/0.5)] bg-[rgb(var(--accent)/0.08)] text-[rgb(var(--foreground))]"
                  : "border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:border-[rgb(var(--foreground)/0.2)] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              <span className="text-base">{star.emoji}</span>
              <span className="whitespace-nowrap">{star.name.split(" ")[1]}</span>
              {activePlayer.id === star.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent))]" />
              )}
            </motion.button>
          ))}
        </div>

        {/* ── Main player section ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlayer.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-14">

              {/* Player visual (left) */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                {/* Main visual */}
                <div className="relative rounded-3xl overflow-hidden border border-[rgb(var(--border))]"
                  style={{ height: "420px" }}>
                  <PlayerVisual player={activePlayer} />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-1">
                      #{activePlayer.number} · {activePlayer.team}
                    </p>
                    <h2 className="font-display text-2xl md:text-3xl tracking-tight text-white">
                      {activePlayer.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="default"
                        label={activePlayer.position}
                        className="bg-white/10 text-white/80 border-white/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "PPG", val: activePlayer.stats.pts },
                    { label: "APG", val: activePlayer.stats.ast },
                    { label: "RPG", val: activePlayer.stats.reb },
                  ].map(({ label, val }) => (
                    <div key={label} className="p-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl text-center">
                      <div className="font-display text-2xl tracking-tight text-[rgb(var(--foreground))]">{val}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--muted))] mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                <div className="p-5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl">
                  <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed mb-3">
                    {activePlayer.bio}
                  </p>
                  <div className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[rgb(var(--muted))] leading-relaxed italic">
                      {activePlayer.style}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products (right) */}
              <div className="lg:col-span-3 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl tracking-tight">
                      Стиль как у {activePlayer.name.split(" ")[0]}
                    </h3>
                    <p className="text-[rgb(var(--muted))] text-sm mt-0.5">
                      Товары в духе его стиля — доступны к заказу
                    </p>
                  </div>
                  <Link href="/marketplace"
                    className="text-xs font-semibold text-[rgb(var(--accent))] hover:underline flex items-center gap-1">
                    Весь каталог <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Product cards — big style */}
                <div className="space-y-4">
                  {playerProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.08 }}
                      className="group flex gap-4 p-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl hover:border-[rgb(var(--accent)/0.3)] transition-all"
                    >
                      {/* Image */}
                      <Link href={`/product/${product.slug}`}
                        className="relative w-24 h-24 rounded-xl overflow-hidden bg-[rgb(var(--surface-2))] flex-shrink-0">
                        <Image src={product.image} alt={product.name}
                          fill className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="96px" />
                        {/* Like on image */}
                        <button
                          onClick={(e) => { e.preventDefault(); toggleLike(product.slug); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                          <Heart className="w-3 h-3" fill={isLiked(product.slug) ? "#ef4444" : "none"}
                            style={{ color: isLiked(product.slug) ? "#ef4444" : "rgba(255,255,255,0.8)" }} />
                        </button>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <span className="text-[10px] font-bold text-[rgb(var(--accent))] uppercase tracking-wider">
                              {product.brand}
                            </span>
                            <Link href={`/product/${product.slug}`}>
                              <h4 className="text-sm font-semibold leading-snug mt-0.5 hover:text-[rgb(var(--accent))] transition-colors">
                                {product.nameRu}
                              </h4>
                            </Link>
                          </div>
                          {product.type === "preorder" && <Badge variant="preorder" />}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className="font-bold text-base">{formatPrice(product.price)}</span>
                            {product.replicaPrice && (
                              <span className="text-xs text-[rgb(var(--muted))] ml-1.5">
                                / rep. {formatPrice(product.replicaPrice)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const s = product.sizes[0];
                              const size = s ? ("eu" in s ? `EU ${s.eu}` : s.label) : "";
                              addItem(product, size, "original");
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[rgb(var(--accent))] text-white text-xs font-bold rounded-xl hover:bg-[rgb(var(--accent-hover))] transition-colors uppercase tracking-wide"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            В корзину
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* View all for this player */}
                <Link href="/marketplace"
                  className="flex items-center justify-center gap-2 p-4 border border-[rgb(var(--border))] border-dashed rounded-2xl text-sm font-semibold text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground)/0.3)] transition-all">
                  Смотреть все товары в каталоге
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── All stars grid ── */}
        <div className="border-t border-[rgb(var(--border))] pt-12">
          <h2 className="font-display text-2xl tracking-tight mb-8">Все игроки</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {NBA_STARS.map((star) => (
              <motion.button
                key={star.id}
                onClick={() => { setActivePlayer(star); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                whileHover={{ scale: 1.04, y: -2 }}
                className={`rounded-2xl overflow-hidden border transition-all ${
                  activePlayer.id === star.id
                    ? "border-[rgb(var(--accent)/0.5)]"
                    : "border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.2)]"
                }`}
              >
                <div className="aspect-[3/4] relative" style={{ minHeight: "140px" }}>
                  <PlayerVisual player={star} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white text-[11px] font-bold leading-tight">
                      {star.name.split(" ").map((w, i) => (
                        <span key={i} className="block">{w}</span>
                      ))}
                    </p>
                    <p className="text-white/50 text-[9px] mt-0.5">#{star.number}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
