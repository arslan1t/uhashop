"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Instagram, Youtube, Twitter, Link as LinkIcon, Users, Package, ChevronRight, Loader2 } from "lucide-react";
import { usePlayerSets } from "@/store/playerSets";
import type { PlayerSet } from "@/types";

interface PublicProfile {
  name?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: { instagram?: string; tiktok?: string; youtube?: string; twitter?: string };
}

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const allSets = usePlayerSets(s => s.sets);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const userSets = allSets.filter(s => s.createdBy === userId);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user/profile?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => setProfile(data.profile ?? {}))
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));
  }, [userId]);

  const name = profile?.name ?? "Пользователь";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--muted))]" />
      </div>
    );
  }

  return (
    <div className="bg-[rgb(var(--background))] min-h-screen">
      {/* Header */}
      <div className="bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))]">
        <div className="container-uha py-10">
          <Link href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Назад
          </Link>

          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[rgb(var(--accent)/0.15)] border border-[rgb(var(--accent)/0.3)] flex items-center justify-center flex-shrink-0">
              {profile?.avatar
                ? <Image src={profile.avatar} alt={name} fill className="object-cover" sizes="80px" />
                : <span className="text-[rgb(var(--accent))] font-bold text-2xl">{initials}</span>}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              {profile?.bio && (
                <p className="text-[rgb(var(--muted))] text-sm mt-1 max-w-md">{profile.bio}</p>
              )}
              {profile?.socialLinks && (
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {profile.socialLinks.instagram && (
                    <a href={`https://instagram.com/${profile.socialLinks.instagram.replace("@","")}`}
                      target="_blank" rel="noopener"
                      className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors">
                      <Instagram className="w-3.5 h-3.5" /> {profile.socialLinks.instagram}
                    </a>
                  )}
                  {profile.socialLinks.tiktok && (
                    <a href={`https://tiktok.com/@${profile.socialLinks.tiktok.replace("@","")}`}
                      target="_blank" rel="noopener"
                      className="flex items-center gap-1 text-xs text-[rgb(var(--muted))] hover:text-white transition-colors">
                      <LinkIcon className="w-3.5 h-3.5" /> {profile.socialLinks.tiktok}
                    </a>
                  )}
                  {profile.socialLinks.youtube && (
                    <a href={`https://youtube.com/@${profile.socialLinks.youtube.replace("@","")}`}
                      target="_blank" rel="noopener"
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                      <Youtube className="w-3.5 h-3.5" /> {profile.socialLinks.youtube}
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={`https://x.com/${profile.socialLinks.twitter.replace("@","")}`}
                      target="_blank" rel="noopener"
                      className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors">
                      <Twitter className="w-3.5 h-3.5" /> {profile.socialLinks.twitter}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex gap-4">
            <div className="px-4 py-3 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl">
              <div className="flex items-center gap-2 text-[rgb(var(--muted))] text-xs mb-0.5">
                <Users className="w-3 h-3" /> Сеты
              </div>
              <span className="text-xl font-bold">{userSets.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sets */}
      <div className="container-uha py-10">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Package className="w-5 h-5 text-[rgb(var(--accent))]" /> Сеты игрока
        </h2>

        {userSets.length > 0 ? (
          <motion.div
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {userSets.map(s => <SetCard key={s.id} set={s} />)}
          </motion.div>
        ) : (
          <div className="py-16 text-center border border-[rgb(var(--border))] border-dashed rounded-2xl">
            <Users className="w-8 h-8 mx-auto mb-3 text-[rgb(var(--muted))] opacity-40" />
            <p className="text-[rgb(var(--muted))]">Сеты ещё не добавлены</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SetCard({ set }: { set: PlayerSet }) {
  const thumb = set.heroImages?.[0] ?? set.heroImage;
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
      <Link href={`/marketplace/player-sets/${set.id}`}
        className="group block bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden hover:border-[rgb(var(--accent)/0.3)] transition-all">
        <div className="relative aspect-square overflow-hidden bg-[rgb(var(--surface-2))]">
          {thumb
            ? <Image src={thumb} alt={set.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw, 50vw" />
            : <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent)/0.2)] to-[rgb(var(--surface))] flex items-center justify-center">
                <Users className="w-10 h-10 text-[rgb(var(--accent)/0.3)]" />
              </div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base mb-1 group-hover:text-[rgb(var(--accent))] transition-colors">{set.name}</h3>
          {set.description && <p className="text-[rgb(var(--muted))] text-xs line-clamp-2 mb-3">{set.description}</p>}
          <div className="flex items-center justify-between">
            <span className="text-[rgb(var(--muted))] text-xs flex items-center gap-1">
              <Package className="w-3 h-3" /> {set.productIds.length} товар{set.productIds.length !== 1 ? "а" : ""}
            </span>
            <span className="text-[rgb(var(--accent))] text-xs font-semibold flex items-center gap-1">
              Смотреть <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
