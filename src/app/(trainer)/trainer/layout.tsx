import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import { TrainerShell } from "@/components/trainer/TrainerShell";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-admin",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "UHA Academy — Тренер", template: "%s | UHA Academy" },
  robots: { index: false, follow: false },
};

export default function TrainerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-admin), Inter, system-ui, sans-serif" }}
      >
        <TrainerShell>{children}</TrainerShell>
      </body>
    </html>
  );
}
