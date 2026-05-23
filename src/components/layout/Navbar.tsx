"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sun, Moon, Menu, X, User, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "@/i18n/navigation";

const NAV_LINKS = [
  { key: "marketplace", href: "/marketplace" },
  { key: "merch",       href: "/merch" },
  { key: "league",      href: "/league-coming-soon" },
  { key: "academy",     href: "/academy-coming-soon" },
  { key: "uha",         href: "/uha" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { toggleCart, totalItems } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const itemCount = totalItems();
  const isDark = mounted ? theme === "dark" : true;
  const LOCALES = ["ru", "uz", "en"] as const;
  const localeLabels: Record<string, string> = { ru: "RU", uz: "UZ", en: "EN" };
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
    setMobileOpen(false);
  };
  const isActive = (href: string) => pathname.includes(href);

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-lg shadow-black/5" : "bg-transparent border-b border-transparent"
      )}>
        <div className="container-uha">
          <div className="flex items-center justify-between h-16 md:h-[72px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative h-12 w-auto">
                {mounted ? (
                  <Image
                    src={isDark
                      ? "/images/branding/logo-on-dark.png"
                      : "/images/branding/logo-on-light.png"}
                    alt="UHA SHOP"
                    width={160}
                    height={48}
                    className="h-12 w-auto object-contain"
                    priority
                  />
                ) : (
                  <Image
                    src="/images/branding/logo-on-dark.png"
                    alt="UHA SHOP"
                    width={160}
                    height={48}
                    className="h-12 w-auto object-contain"
                    priority
                  />
                )}
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ key, href, label }: { key: string; href: string; label?: string }) => (
                <Link key={key} href={href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-200",
                    isActive(href)
                      ? "text-[rgb(var(--accent))]"
                      : "text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                  )}>
                  {label ?? t(key as Parameters<typeof t>[0])}
                  {isActive(href) && (
                    <motion.div layoutId="nav-indicator"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-[rgb(var(--accent))]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-1">
              {/* Language */}
              <div className="relative hidden sm:block">
                <button onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
                  {locale.toUpperCase()}
                  <ChevronDown className={cn("w-3 h-3 transition-transform", langOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg overflow-hidden shadow-xl min-w-[80px]">
                      {LOCALES.filter(l => l !== locale).map(l => (
                        <button key={l} onClick={() => switchLocale(l)}
                          className="w-full block px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-2))] transition-colors text-left">
                          {localeLabels[l]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme */}
              {mounted && (
                <button onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="p-2 rounded-lg text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface))] transition-all"
                  aria-label="Toggle theme">
                  {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </button>
              )}

              {/* Profile */}
              <Link href={isAuthenticated ? "/profile" : "/auth/login"}
                className="p-2 rounded-lg text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface))] transition-all hidden sm:flex items-center"
                title={isAuthenticated ? user?.name : "Войти"}>
                {isAuthenticated ? (
                  <div className="w-[18px] h-[18px] rounded-full bg-[rgb(var(--accent))] flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold leading-none">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <User className="w-[18px] h-[18px]" />
                )}
              </Link>

              {/* Cart */}
              <button onClick={toggleCart}
                className="relative p-2 rounded-lg text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface))] transition-all"
                aria-label="Open cart">
                <ShoppingBag className="w-[18px] h-[18px]" />
                {itemCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[rgb(var(--accent))] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile menu */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface))] transition-all md:hidden">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden bg-[rgb(var(--surface))] border-t border-[rgb(var(--border))]">
              <nav className="container-uha py-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ key, href, label }: { key: string; href: string; label?: string }) => (
                  <Link key={key} href={href} onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl text-sm font-medium uppercase tracking-wider transition-colors",
                      isActive(href)
                        ? "bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]"
                        : "text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-2))]"
                    )}>
                    {label ?? t(key as Parameters<typeof t>[0])}
                  </Link>
                ))}

                {/* Divider */}
                <div className="mt-2 pt-2 border-t border-[rgb(var(--border))] flex flex-col gap-1">
                  {/* Profile */}
                  <Link href={isAuthenticated ? "/profile" : "/auth/login"}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-2))] transition-colors">
                    <User className="w-4 h-4" />
                    {isAuthenticated ? (user?.name ?? "Профиль") : "Войти"}
                  </Link>

                  {/* Language switcher — all locales */}
                  {LOCALES.filter(l => l !== locale).map(l => (
                    <button key={l} onClick={() => switchLocale(l)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-2))] transition-colors w-full text-left">
                      <span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold border border-[rgb(var(--border))] rounded-md">
                        {l.toUpperCase()}
                      </span>
                      {l === "ru" ? "Русский" : l === "uz" ? "O'zbekcha" : "English"}
                    </button>
                  ))}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}
    </>
  );
}
