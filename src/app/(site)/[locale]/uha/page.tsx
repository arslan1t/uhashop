import type { Metadata } from "next";
import { UhaClient } from "./UhaClient";

export const metadata: Metadata = {
  title: "О бренде UHA",
  description:
    "UHA — баскетбольный бренд из Центральной Азии. Узнайте о нашей миссии, ценностях и экосистеме: маркетплейс, мерч, академия и лига.",
  openGraph: {
    title: "О бренде UHA | UHA SHOP",
    description:
      "UHA — это не просто магазин. Это экосистема баскетбольной культуры Центральной Азии.",
  },
};

export default function UhaPage() {
  return <UhaClient />;
}
