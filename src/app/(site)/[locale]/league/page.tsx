import type { Metadata } from "next";
import { LeagueClient } from "./LeagueClient";

export const metadata: Metadata = {
  title: "UHA 3x3 League — Турниры Баскетбола",
  description: "Узбекистан's premier street basketball series. Рекурентные 3x3 турниры каждые 2 недели.",
  openGraph: {
    title: "UHA 3x3 League",
    description: "Турниры баскетбола в Центральной Азии",
  },
};

export default function LeaguePage() {
  return <LeagueClient />;
}
