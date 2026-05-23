import type { Metadata } from "next";
import { Unbounded, Bebas_Neue } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { TelegramWidget } from "@/components/layout/TelegramWidget";
import "../../globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UHA SHOP — Basketball Ecosystem",
    template: "%s | UHA SHOP",
  },
  description:
    "UHA SHOP — premium basketball marketplace and sportswear ecosystem of Central Asia. Nike, Jordan, Adidas preorder. UHA Merch. Basketball Culture.",
  keywords: [
    "UHA",
    "basketball",
    "marketplace",
    "sneakers",
    "Jordan",
    "Nike",
    "Adidas",
    "preorder",
    "Central Asia",
    "Uzbekistan",
  ],
  metadataBase: new URL("https://uhashop.uz"),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://uhashop.uz",
    siteName: "UHA SHOP",
    title: "UHA SHOP — Basketball Ecosystem",
    description:
      "Premium basketball marketplace and sportswear ecosystem of Central Asia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UHA SHOP",
    description: "Basketball Ecosystem of Central Asia",
  },
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ru" | "uz")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${unbounded.variable} ${bebasNeue.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navbar />
            <CartDrawer />
            <main className="min-h-screen pt-16 md:pt-[72px] overflow-x-hidden">{children}</main>
            <Footer />
            <TelegramWidget />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
