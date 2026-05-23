"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upload, Save, Globe, Send, Instagram, Phone } from "lucide-react";

const inputCls = "w-full h-10 px-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-orange-500/60 transition-colors";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="space-y-5">

        {/* Branding */}
        <Section title="Брендинг" subtitle="Логотипы и favicon">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Логотип (тёмный фон)", img: "/images/branding/logo-on-dark.png" },
              { label: "Логотип (светлый фон)", img: "/images/branding/logo-on-light.png" },
              { label: "Favicon", img: "/images/branding/logo-on-dark.png" },
            ].map(({ label, img }) => (
              <div key={label}>
                <p className="text-[#555] text-[10px] uppercase tracking-wider mb-2">{label}</p>
                <div className="relative h-20 rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a] group cursor-pointer hover:border-orange-500/40 transition-colors flex items-center justify-center">
                  <Image src={img} alt={label} width={100} height={32} className="object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* SEO */}
        <Section title="SEO" subtitle="Мета-данные сайта">
          <Field label="Название сайта">
            <input defaultValue="UHA SHOP — Basketball Ecosystem" className={inputCls} />
          </Field>
          <Field label="Описание (RU)">
            <textarea rows={2} defaultValue="UHA SHOP — премиум баскетбольный маркетплейс Центральной Азии."
              className={`${inputCls} resize-none h-auto py-2.5`} />
          </Field>
          <Field label="Описание (UZ)">
            <textarea rows={2} defaultValue="UHA SHOP — Markaziy Osiyoning premium basketbol marketplace'i."
              className={`${inputCls} resize-none h-auto py-2.5`} />
          </Field>
          <Field label="Ключевые слова">
            <input defaultValue="UHA, basketball, Jordan, Nike, Adidas, Uzbekistan, preorder"
              className={inputCls} />
          </Field>
        </Section>

        {/* Social */}
        <Section title="Ссылки" subtitle="Социальные сети и контакты">
          {[
            { label: "Telegram (поддержка)", icon: Send, defaultValue: "https://t.me/hooper_manager", placeholder: "https://t.me/..." },
            { label: "Instagram", icon: Instagram, defaultValue: "https://www.instagram.com/hooper_foot_locker/", placeholder: "https://instagram.com/..." },
            { label: "Телефон", icon: Phone, defaultValue: "+998 90 000 00 00", placeholder: "+998..." },
            { label: "Сайт", icon: Globe, defaultValue: "https://uhashop.uz", placeholder: "https://..." },
          ].map(({ label, icon: Icon, defaultValue, placeholder }) => (
            <Field key={label} label={label}>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                <input defaultValue={defaultValue} placeholder={placeholder}
                  className={`${inputCls} pl-10`} />
              </div>
            </Field>
          ))}
        </Section>

        {/* Merch video */}
        <Section title="Showcase Video" subtitle="3D видео для страницы мерча">
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-black border border-[#2a2a2a] flex items-center justify-center">
              <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                <source src="/videos/3d-tee.mov" type="video/quicktime" />
                <source src="/videos/3d-tee.mov" type="video/mp4" />
              </video>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1">3d-tee.mov</p>
              <p className="text-[#555] text-xs mb-3">Используется на Merch странице</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] hover:text-white text-xs font-semibold rounded-xl transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Заменить видео
              </button>
            </div>
          </div>
        </Section>

        {/* Admin credentials */}
        <Section title="Безопасность" subtitle="Данные администратора">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Admin Email">
              <input defaultValue="admin@uhashop.uz" className={inputCls} />
            </Field>
            <Field label="Новый пароль">
              <input type="password" placeholder="••••••••" className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Save */}
        <div className="flex justify-end">
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl text-sm uppercase tracking-widest transition-all ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}>
            <Save className="w-4 h-4" />
            {saved ? "Сохранено ✓" : "Сохранить настройки"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1a1a1a]">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <p className="text-[#444] text-xs mt-0.5">{subtitle}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
