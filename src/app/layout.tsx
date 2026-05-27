import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UHA SHOP — Basketball Ecosystem",
  description: "Premium basketball marketplace of Central Asia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
