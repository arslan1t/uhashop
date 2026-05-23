"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAdminStore } from "@/store/admin";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@uhashop.uz");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError("Введите пароль"); return; }
    setLoading(true);
    setError("");
    const ok = await login(email, password);
    if (ok) {
      router.replace("/admin");
    } else {
      setError("Неверный логин или пароль");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[380px]"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
            <span className="text-orange-400 text-2xl font-black" style={{ fontFamily: "Bebas Neue, Impact, sans-serif", letterSpacing: "0.05em" }}>UHA</span>
          </div>
          <p className="text-white font-bold tracking-[0.25em] uppercase text-sm">Admin Panel</p>
          <p className="text-[#444] text-[11px] mt-1 tracking-widest uppercase">UHA SHOP</p>
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-3xl p-8 shadow-2xl shadow-black/60">
          <p className="text-white font-semibold text-base mb-1">Вход в систему</p>
          <p className="text-[#444] text-sm mb-7">Управление контентом сайта</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-[0.15em] mb-2">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@uhashop.uz"
                className="w-full h-12 px-4 bg-[#161616] border border-[#252525] rounded-xl text-white text-sm placeholder:text-[#3a3a3a] focus:outline-none focus:border-orange-500/60 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-[0.15em] mb-2">Пароль</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••••"
                  className="w-full h-12 px-4 pr-12 bg-[#161616] border border-[#252525] rounded-xl text-white text-sm placeholder:text-[#3a3a3a] focus:outline-none focus:border-orange-500/60 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a3a3a] hover:text-[#777] transition-colors p-1">
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
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2.5 disabled:opacity-50 mt-2 shadow-lg shadow-orange-500/20">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Входим...</span></>) : "Войти"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#1a1a1a]">
            <p className="text-[#2e2e2e] text-[11px] text-center">admin@uhashop.uz · uha2024admin</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
