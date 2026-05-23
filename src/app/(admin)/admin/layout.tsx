import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../globals.css";
import { AdminShell } from "@/components/admin/AdminShell";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-admin",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "UHA Admin", template: "%s | UHA Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
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
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
