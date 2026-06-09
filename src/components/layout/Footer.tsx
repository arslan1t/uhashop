"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Instagram, Send, ArrowUpRight } from "lucide-react";

type FooterKey = "marketplace" | "merch" | "league" | "academy" | "about" | "contact" | "instagram" | "telegram" | "rights" | "privacy" | "catalog" | "brand" | "links" | "tagline";

const footerLinks = {
  catalog: [
    { labelKey: "marketplace", href: "/marketplace" },
    { labelKey: "merch", href: "/merch" },
  ],
  brand: [
    { labelKey: "about", href: "/uha" },
    { labelKey: "league", href: "/league" },
    { labelKey: "academy", href: "/academy" },
  ],
};

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? theme === "dark" : true;

  return (
    <footer className="border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
      <div className="container-uha py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center mb-5 group">
              <Image
                src={isDark
                  ? "/images/branding/logo-white.png"
                  : "/images/branding/logo-black.png"}
                alt="UHA SHOP"
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-[rgb(var(--muted))] leading-relaxed max-w-xs mb-6">
              {t("tagline")}
              <br />
              Basketball ecosystem of Central Asia.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/uha_manager/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgb(var(--border))] text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground))] transition-all group"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="https://t.me/uha_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgb(var(--border))] text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground))] transition-all group"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))] mb-5">
              {t("catalog")}
            </h4>
            <ul className="space-y-3">
              {footerLinks.catalog.map(({ labelKey, href }) => (
                <li key={labelKey}>
                  <Link
                    href={href}
                    className="text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
                  >
                    {t(labelKey as FooterKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brand links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))] mb-5">
              {t("brand")}
            </h4>
            <ul className="space-y-3">
              {footerLinks.brand.map(({ labelKey, href }) => (
                <li key={labelKey}>
                  <Link
                    href={href}
                    className="text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
                  >
                    {t(labelKey as FooterKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-6 border-t border-[rgb(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[rgb(var(--muted))]">
            © {year} UHA SHOP. {t("rights")}.
          </p>
          <p className="text-xs text-[rgb(var(--muted))]">
            Central Asia Basketball Ecosystem
          </p>
        </div>
      </div>
    </footer>
  );
}
