import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HeroContent {
  badgeRu: string;
  badgeUz: string;
  titleRu: string;
  titleUz: string;
  descRu:  string;
  descUz:  string;
  stats:   [string, string, string, string];
}

const DEFAULTS: HeroContent = {
  badgeRu: "Basketball Ecosystem",
  badgeUz: "Basketball Ecosystem",
  titleRu: "Новая эра баскетбольной культуры",
  titleUz: "Basketbol madaniyatining yangi davri",
  descRu:  "Эксклюзивные кроссовки, одежда и мерч — только для тех, кто живёт баскетболом.",
  descUz:  "Ekskluziv krossovkalar, kiyimlar va merch — faqat basketbol bilan yashaydigan uchun.",
  stats:   ["200+ Брендов", "7–14 Дней доставки", "1000+ Позиций", "📷 Поиск по фото"],
};

interface HeroContentStore {
  hero: HeroContent;
  setHero: (h: Partial<HeroContent>) => void;
  setStat: (index: 0 | 1 | 2 | 3, value: string) => void;
}

export const useHeroContent = create<HeroContentStore>()(
  persist(
    (set) => ({
      hero: DEFAULTS,
      setHero: (h) =>
        set((state) => ({ hero: { ...state.hero, ...h } })),
      setStat: (index, value) =>
        set((state) => {
          const stats = [...state.hero.stats] as [string, string, string, string];
          stats[index] = value;
          return { hero: { ...state.hero, stats } };
        }),
    }),
    { name: "uha-hero-content-v1" }
  )
);
