import type { Metadata } from "next";
import { MerchClient } from "./MerchClient";

export const metadata: Metadata = {
  title: "UHA Merch",
  description:
    "UHA Merch — оригинальная линейка одежды от баскетбольного бренда UHA. Футболки, худи и аксессуары, сделанные в Узбекистане.",
  openGraph: {
    title: "UHA Merch | UHA SHOP",
    description:
      "Оригинальная одежда UHA — носи то, во что веришь. Собственная линейка бренда UHA.",
  },
};

export default function MerchPage() {
  return <MerchClient />;
}
