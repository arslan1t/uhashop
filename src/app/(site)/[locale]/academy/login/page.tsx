"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Loader2, GraduationCap, Users } from "lucide-react";
import { useAcademyAuth } from "@/store/academy";
import { AcademyTelegramLoginButton } from "@/components/ui/AcademyTelegramLoginButton";

type Role = "athlete" | "parent";

function redirectForScope() {
  const { scope } = useAcademyAuth.getState();
  if (!scope) return null;
  return scope.role === "athlete" ? `/academy/athlete/${scope.athlete.id}` : "/academy/parent";
}

export default function AcademyLoginPage() {
  const t = useTranslations("academy");
  const [role, setRole] = useState<Role>("athlete");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolvingToken, setResolvingToken] = useState(false);
  const { login, loginWithToken } = useAcademyAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Deep link from the Telegram login bot (?t=<token>) — resolve and redirect.
  useEffect(() => {
    const token = searchParams.get("t");
    if (!token) return;
    setResolvingToken(true);
    loginWithToken(token).then(result => {
      if (result.ok) {
        const dest = redirectForScope();
        if (dest) { router.replace(dest); return; }
      }
      setError(t("error_login_default"));
      setResolvingToken(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError(t("error_fill_all"));
      return;
    }
    setLoading(true);
    setError("");

    const result = await login(role, name, code.trim());
    if (result.ok) {
      router.replace(redirectForScope() ?? (role === "athlete" ? "/academy/athlete" : "/academy/parent"));
    } else {
      setError(result.error || t("error_login_default"));
    }
    setLoading(false);
  };

  if (resolvingToken) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  const INP = "w-full h-12 px-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--foreground))] text-sm placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-blue-500/60 transition-all";

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]">
        <Link href="/academy" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("login_back")}
        </Link>
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-8 w-28 mb-4">
            <Image src="/images/branding/logo-white.png" alt="UHA" fill className="object-contain hidden dark:block" />
            <Image src="/images/branding/logo-black.png" alt="UHA" fill className="object-contain dark:hidden" />
          </div>
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Academy</p>
        </div>

        <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl p-8">
          <h1 className="text-xl font-bold mb-1">{t("login_title")}</h1>
          <p className="text-[rgb(var(--muted))] text-sm mb-6">{t("login_subtitle")}</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {([
              { key: "athlete" as Role, labelKey: "role_athlete", descKey: "role_athlete_desc", icon: GraduationCap },
              { key: "parent" as Role, labelKey: "role_parent", descKey: "role_parent_desc", icon: Users },
            ]).map(({ key, labelKey, descKey, icon: Icon }) => (
              <button key={key} type="button" onClick={() => { setRole(key); setError(""); }}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${
                  role === key
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.15)]"
                }`}>
                <Icon className={`w-5 h-5 mb-2 ${role === key ? "text-blue-400" : "text-[rgb(var(--muted))]"}`} />
                <p className={`text-sm font-semibold ${role === key ? "text-blue-400" : ""}`}>{t(labelKey)}</p>
                <p className="text-[rgb(var(--muted))] text-[10px] mt-0.5">{t(descKey)}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1.5">
                {role === "athlete" ? t("name_athlete_label") : t("name_parent_label")}
              </label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder={role === "athlete" ? "Алишер Рашидов" : "Камол Рашидов"}
                className={INP} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1.5">
                Код доступа
              </label>
              <input type="password" value={code}
                onChange={e => { setCode(e.target.value); setError(""); }}
                placeholder="PIN или ваш пароль"
                className={INP} />
              <p className="text-[11px] text-[rgb(var(--muted))] mt-1.5">Код выдаёт тренер. Забыли — напишите тренеру.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 bg-red-500/8 border border-red-500/15 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("logging_in")}</>
                : t("login_btn")
              }
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[rgb(var(--border))]" />
            <span className="text-[rgb(var(--muted))] text-[11px] uppercase tracking-wider">или</span>
            <div className="flex-1 h-px bg-[rgb(var(--border))]" />
          </div>

          <AcademyTelegramLoginButton role={role} />

          <p className="text-center text-[rgb(var(--muted))] text-xs mt-5 leading-relaxed">
            {t("pin_hint")}{" "}
            <a href="https://t.me/uha_manager" target="_blank" className="text-blue-400 hover:underline">
              {t("pin_contact")}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
