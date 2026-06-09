"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Save, Globe, Send, Instagram, Phone, Info } from "lucide-react";
import { useSiteSettings } from "@/store/siteSettings";

const inputCls =
  "w-full h-10 px-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-red-800/60 transition-colors";

export default function AdminSettingsPage() {
  const { settings, setSettings } = useSiteSettings();
  const [saved, setSaved] = useState(false);

  // Local draft state so we only persist on "Save"
  const [draft, setDraft] = useState({ ...settings });
  const set = (key: keyof typeof draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    setSettings(draft);
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
              { label: "Логотип (тёмный фон)",   img: "/images/branding/logo-white.png" },
              { label: "Логотип (светлый фон)",   img: "/images/branding/logo-black.png" },
              { label: "Favicon",                 img: "/images/branding/logo-white.png" },
            ].map(({ label, img }) => (
              <div key={label}>
                <p className="text-[#555] text-[10px] uppercase tracking-wider mb-2">{label}</p>
                <div className="relative h-20 rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a] group cursor-pointer hover:border-red-800/40 transition-colors flex items-center justify-center">
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
            <input value={draft.siteName} onChange={set("siteName")}
              placeholder="UHA SHOP — Basketball Ecosystem" className={inputCls} />
          </Field>
          <Field label="Описание (RU)">
            <textarea rows={2} value={draft.descRu} onChange={set("descRu")}
              placeholder="Описание для поисковиков (RU)"
              className={`${inputCls} resize-none h-auto py-2.5`} />
          </Field>
          <Field label="Описание (UZ)">
            <textarea rows={2} value={draft.descUz} onChange={set("descUz")}
              placeholder="Описание для поисковиков (UZ)"
              className={`${inputCls} resize-none h-auto py-2.5`} />
          </Field>
          <Field label="Ключевые слова">
            <input value={draft.keywords} onChange={set("keywords")}
              placeholder="keyword1, keyword2, ..." className={inputCls} />
          </Field>
        </Section>

        {/* Social / contacts */}
        <Section title="Ссылки" subtitle="Социальные сети и контакты">
          {([
            { label: "Telegram (поддержка)", key: "telegramUrl",  Icon: Send,      placeholder: "https://t.me/..." },
            { label: "Instagram",             key: "instagramUrl", Icon: Instagram, placeholder: "https://instagram.com/..." },
            { label: "Телефон",               key: "phone",        Icon: Phone,     placeholder: "+998..." },
            { label: "Сайт",                  key: "website",      Icon: Globe,     placeholder: "https://..." },
          ] as const).map(({ label, key, Icon, placeholder }) => (
            <Field key={key} label={label}>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                <input value={draft[key]} onChange={set(key)}
                  placeholder={placeholder} className={`${inputCls} pl-10`} />
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

        {/* Security notice */}
        <Section title="Безопасность" subtitle="Данные администратора">
          <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-300 text-sm font-medium mb-1">Учётные данные хранятся в переменных окружения</p>
              <p className="text-[#555] text-xs leading-relaxed">
                Для смены email или пароля администратора обновите переменные{" "}
                <code className="text-[#888]">ADMIN_EMAIL</code> и{" "}
                <code className="text-[#888]">ADMIN_PASSWORD</code> в настройках Vercel, затем сделайте новый деплой.
              </p>
            </div>
          </div>
        </Section>

        {/* Save */}
        <div className="flex justify-end">
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl text-sm uppercase tracking-widest transition-all ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-red-800 text-white hover:bg-red-900"
            }`}>
            <Save className="w-4 h-4" />
            {saved ? "Сохранено ✓" : "Сохранить настройки"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
