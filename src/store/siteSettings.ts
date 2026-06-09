import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SiteSettings {
  // SEO
  siteName:    string;
  descRu:      string;
  descUz:      string;
  keywords:    string;
  // Social
  telegramUrl: string;
  instagramUrl: string;
  phone:       string;
  website:     string;
}

const DEFAULTS: SiteSettings = {
  siteName:     "UHA SHOP — Basketball Ecosystem",
  descRu:       "UHA SHOP — премиум баскетбольный маркетплейс Центральной Азии.",
  descUz:       "UHA SHOP — Markaziy Osiyoning premium basketbol marketplace'i.",
  keywords:     "UHA, basketball, Jordan, Nike, Adidas, Uzbekistan, preorder",
  telegramUrl:  "https://t.me/uha_manager",
  instagramUrl: "https://www.instagram.com/uha_manager/",
  phone:        "+998 90 000 00 00",
  website:      "https://uhashop.uz",
};

interface SiteSettingsStore {
  settings: SiteSettings;
  setSettings: (s: Partial<SiteSettings>) => void;
}

export const useSiteSettings = create<SiteSettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULTS,
      setSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
    }),
    { name: "uha-site-settings-v1" }
  )
);
