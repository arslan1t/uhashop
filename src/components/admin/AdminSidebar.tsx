"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, FolderOpen,
  Image as ImageIcon, Settings, Shirt, FileText,
  ChevronLeft, LogOut, ExternalLink, Tag, GraduationCap
} from "lucide-react";
import { useAdminStore } from "@/store/admin";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Товары", href: "/admin/products", icon: Package },
  { label: "Заказы", href: "/admin/orders", icon: ShoppingCart, badge: "new" },
  { label: "Промокоды", href: "/admin/promos", icon: Tag },
  { label: "Мерч", href: "/admin/merch", icon: Shirt },
  { label: "Категории", href: "/admin/categories", icon: FolderOpen },
  { label: "Медиа", href: "/admin/media", icon: ImageIcon },
  { label: "Главная", href: "/admin/homepage", icon: FileText },
  { label: "Академия", href: "/admin/academy", icon: GraduationCap, badge: "new" },
  { label: "Пользователи", href: "/admin/users", icon: Users },
  { label: "Настройки", href: "/admin/settings", icon: Settings },
];

interface Props { collapsed?: boolean; onToggle?: () => void }

export function AdminSidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, logout } = useAdminStore();

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className={cn(
      "flex flex-col bg-[#0a0a0a] border-r border-[#1a1a1a] h-full transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#1a1a1a] min-h-[64px]">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="relative h-6 w-20">
              <Image src="/images/branding/logo-white.png" alt="UHA"
                fill className="object-contain object-left" />
            </div>
            <span className="text-[#444] text-[10px] font-bold uppercase tracking-widest border-l border-[#2a2a2a] pl-2">
              Admin
            </span>
          </div>
        )}
        <button onClick={onToggle}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors",
            collapsed && "mx-auto"
          )}>
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon, exact, badge }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-red-800/15 text-red-500"
                  : "text-[#666] hover:text-white hover:bg-[#141414]"
              )}>
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-800 rounded-r-full" />
              )}
              <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-red-500" : "text-[#555] group-hover:text-[#888]")} />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
              {!collapsed && badge && (
                <span className="ml-auto bg-red-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#1a1a1a] space-y-1">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#555] hover:text-white hover:bg-[#141414] transition-colors group">
          <ExternalLink className="w-4 h-4 flex-shrink-0 text-[#444] group-hover:text-[#888]" />
          {!collapsed && <span>Открыть сайт</span>}
        </Link>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#555] hover:text-red-500 hover:bg-red-500/5 transition-colors group">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Выйти</span>}
        </button>

        {!collapsed && adminUser && (
          <div className="px-3 pt-2 pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-800/20 border border-red-800/30 flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-xs font-bold">
                  {adminUser.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{adminUser.name}</p>
                <p className="text-[#444] text-[10px] truncate">{adminUser.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
