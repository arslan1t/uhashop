"use client";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { TelegramLoginButton } from "@/components/ui/TelegramLoginButton";

export default function LoginPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = !mounted || theme === "dark";

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
              alt="UHA SHOP" fill className="object-contain"
            />
          </div>
        </div>

        <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl p-8">
          <h1 className="text-xl font-bold mb-1 text-center">Войти в аккаунт</h1>
          <p className="text-[rgb(var(--muted))] text-sm mb-8 text-center">
            UHA SHOP · Basketball Ecosystem
          </p>

          <TelegramLoginButton redirectTo="/profile" />

          <p className="text-center text-xs text-[rgb(var(--muted))] mt-6 leading-relaxed">
            Нажмите кнопку и войдите через Telegram.<br />
            Аккаунт создаётся автоматически при первом входе.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
