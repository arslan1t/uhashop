import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { MarketplaceClient } from "./MarketplaceClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketplace");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function MarketplacePage() {
  return <MarketplaceClient />;
}
