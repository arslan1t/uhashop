"use client";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BotAuthButton } from "@/components/ui/BotAuthButton";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = !mounted || theme === "dark";

  const router = useRouter();
  const setUser = useAuthStore(s => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password) { setError("Введите телефон и пароль"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) { setError(data?.error ?? "Ошибка входа"); setLoading(false); return; }
      setUser(data.profile, data.token);
      router.replace("/profile");
    } catch {
      setError("Ошибка соединения"); setLoading(false);
    }
  };

  const INP = "w-full h-12 px-4 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--foreground))] text-sm placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent)/0.5)] transition-all";

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="relative h-8 w-28 mb-4">
            <Image
              src={isDark ? "/images/branding/logo-white.png" : "/images/branding/logo-black.png"}
              alt="UHA" fill className="object-contain"
            />
          </div>
        </div>

        <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl p-8">
          <h1 className="text-xl font-bold mb-1 text-center">Войти в аккаунт</h1>
          <p className="text-[rgb(var(--muted))] text-sm mb-8 text-center">
            Единый аккаунт: магазин · академия · лига
          </p>

          <BotAuthButton redirectTo="/profile" />

          {!showPassword ? (
            <>
              <p className="text-center text-xs text-[rgb(var(--muted))] mt-6 leading-relaxed">
                Нажмите кнопку и войдите через Telegram.<br />
                Аккаунт создаётся автоматически при первом входе.
              </p>
              <button onClick={() => setShowPassword(true)}
                className="w-full mt-4 text-center text-xs font-semibold text-[rgb(var(--accent))] hover:underline">
                Войти по телефону и паролю
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[rgb(var(--border))]" />
                <span className="text-[rgb(var(--muted))] text-[11px] uppercase tracking-wider">или</span>
                <div className="flex-1 h-px bg-[rgb(var(--border))]" />
              </div>
              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <input type="tel" inputMode="tel" value={phone} onChange={e => { setPhone(e.target.value); setError(""); }}
                  placeholder="Номер телефона" className={INP} />
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Пароль" className={INP} />
                {error && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/8 border border-red-500/15 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full h-12 bg-[rgb(var(--accent))] hover:bg-red-900 text-white font-bold rounded-2xl text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Войти"}
                </button>
              </form>
              <p className="text-center text-[11px] text-[rgb(var(--muted))] mt-4">
                Пароль задаётся в профиле после входа через Telegram.
              </p>
              <button onClick={() => { setShowPassword(false); setError(""); }}
                className="w-full mt-2 text-center text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]">
                ← Назад ко входу через Telegram
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
