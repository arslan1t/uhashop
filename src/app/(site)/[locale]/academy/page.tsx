import type { Metadata } from "next";
import { AcademyClient } from "./AcademyClient";

export const metadata: Metadata = {
  title: "UHA Academy",
  description:
    "UHA Academy — профессиональная баскетбольная академия Центральной Азии. Тренировки для детей и молодёжи от 8 до 18 лет. Персональные программы, опытные тренеры.",
  openGraph: {
    title: "UHA Academy | UHA SHOP",
    description:
      "Баскетбольная академия нового поколения. Развиваем молодых спортсменов Узбекистана и Центральной Азии.",
  },
};

export default function AcademyPage() {
  return <AcademyClient />;
}
