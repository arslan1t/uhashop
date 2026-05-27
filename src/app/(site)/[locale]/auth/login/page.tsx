"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { TelegramLoginButton } from "@/components/ui/TelegramLoginButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Заполните все поля"); return; }
    setLoading(true); setError("");
    const result = await login(email, password);
    if (result.ok) router.replace("/profile");
    else { setError(result.error || "Неверный email или пароль"); setLoading(false); }
  };

  const INP = "w-full h-12 px-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--foreground))] text-sm placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent)/0.6)] transition-all";

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-8 w-28 mb-4">
            <Image src="/images/branding/logo-white.png" alt="UHA SHOP" fill className="object-contain" />
          </div>
        </div>
        <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl p-8">
          <h1 className="text-xl font-bold mb-1">Войти в аккаунт</h1>
          <p className="text-[rgb(var(--muted))] text-sm mb-7">UHA SHOP · Basketball Ecosystem</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className={INP} /></div>
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1.5">Пароль</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" className={`${INP} pr-11`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 bg-red-500/8 border border-red-500/15 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </motion.div>
            )}
            <button type="submit" disabled={loading}
              className="w-full h-12 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-bold rounded-2xl text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Входим...</> : "Войти"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[rgb(var(--border))]" />
            <span className="text-xs text-[rgb(var(--muted))] font-medium">или</span>
            <div className="flex-1 h-px bg-[rgb(var(--border))]" />
          </div>

          {/* Telegram quick login */}
          <TelegramLoginButton redirectTo="/profile" />

          <p className="text-center text-sm text-[rgb(var(--muted))] mt-5">
            Нет аккаунта?{" "}
            <Link href="/auth/register" className="text-[rgb(var(--accent))] font-semibold hover:underline">Зарегистрироваться</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
