import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { EcosystemSection } from "@/components/home/EcosystemSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CtaSection } from "@/components/home/CtaSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: "UHA SHOP — Basketball Ecosystem",
    description: t("hero_subtitle"),
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <EcosystemSection />
      <CtaSection />
    </>
  );
}
