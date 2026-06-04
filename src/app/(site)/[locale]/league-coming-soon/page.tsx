"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowLeft, Send, Check, Users, Star, Zap } from "lucide-react";

export default function LeagueComingSoonPage() {
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[rgb(var(--accent)/0.04)] rounded-full blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgb(255,255,255) 1px, transparent 1px), linear-gradient(90deg, rgb(255,255,255) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      </div>

      <div className="container-uha relative z-10 py-20">
        <div className="flex items-center gap-8 lg:gap-16">
          {/* Left — content */}
          <div className="flex-1 max-w-2xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors mb-12">
              <ArrowLeft className="w-4 h-4" /> Назад
            </Link>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
              <Trophy className="w-8 h-8 text-amber-400" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                Coming Soon
              </div>

              <h1 className="font-display text-4xl md:text-6xl tracking-tight text-[rgb(var(--foreground))] leading-none mb-4">
                UHA<br /><span className="text-amber-400">LEAGUE</span>
              </h1>
              <p className="text-[rgb(var(--accent))] font-semibold text-lg mb-3">
                Баскетбольный турнир Центральной Азии
              </p>
              <p className="text-[rgb(var(--muted))] text-base leading-relaxed mb-8 max-w-lg">
                Профессиональная лига, объединяющая сильнейшие команды региона. Официальный запуск скоро.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                {[{ icon: Users, text: "Командные турниры" }, { icon: Star, text: "Рейтинговая система" }, { icon: Zap, text: "Live трансляции" }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--muted))]">
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                    {text}
                  </div>
                ))}
              </div>

              <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl p-6 max-w-md">
                <p className="text-sm font-semibold mb-1">Ранний доступ</p>
                <p className="text-[rgb(var(--muted))] text-xs mb-4 leading-relaxed">
                  Оставь Telegram или почту, чтобы первым узнать о запуске UHA League
                </p>

                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                      <Check className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Вы в списке!</p>
                        <p className="text-xs opacity-70">Уведомим при запуске</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handleSubmit} className="flex gap-2">
                      <input value={contact} onChange={e => setContact(e.target.value)} placeholder="@telegram или email"
                        className="flex-1 h-11 px-4 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl text-sm placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-amber-500/50 transition-colors" />
                      <button type="submit" disabled={loading || !contact}
                        className="h-11 px-5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                        Вступить
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right — large transparent league logo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block flex-shrink-0 relative w-[380px] h-[380px] xl:w-[440px] xl:h-[440px]"
          >
            {/* Light theme: black logo visible on white bg */}
            <Image
              src="/images/branding/league-black.png"
              alt="UHA League"
              fill
              className="object-contain opacity-[0.08] dark:hidden select-none pointer-events-none"
              sizes="440px"
            />
            {/* Dark theme: white logo visible on dark bg */}
            <Image
              src="/images/branding/league-white.png"
              alt="UHA League"
              fill
              className="object-contain opacity-[0.10] hidden dark:block select-none pointer-events-none"
              sizes="440px"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
