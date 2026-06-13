"use client";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BotAuthButton } from "@/components/ui/BotAuthButton";

export default function RegisterPage() {
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
          <h1 className="text-xl font-bold mb-1 text-center">Создать аккаунт</h1>
          <p className="text-[rgb(var(--muted))] text-sm mb-8 text-center">
            Присоединись к UHA Basketball Ecosystem
          </p>

          <BotAuthButton redirectTo="/profile" />

          <p className="text-center text-xs text-[rgb(var(--muted))] mt-6 leading-relaxed">
            Нажмите кнопку и войдите через Telegram.<br />
            Аккаунт создаётся автоматически — регистрация не нужна.
          </p>

          <p className="text-center text-sm text-[rgb(var(--muted))] mt-5">
            Уже есть аккаунт?{" "}
            <Link href="/auth/login" className="text-[rgb(var(--accent))] font-semibold hover:underline">Войти</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
