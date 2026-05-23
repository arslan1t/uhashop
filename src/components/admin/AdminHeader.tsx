"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Plus } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Управление товарами",
  "/admin/orders": "Заказы",
  "/admin/merch": "Мерч",
  "/admin/categories": "Категории",
  "/admin/media": "Медиатека",
  "/admin/homepage": "Главная страница",
  "/admin/users": "Пользователи",
  "/admin/settings": "Настройки",
};

const PAGE_ACTIONS: Record<string, { label: string; href?: string }> = {
  "/admin/products": { label: "Добавить товар" },
  "/admin/orders": { label: "Экспорт заказов" },
  "/admin/categories": { label: "Добавить категорию" },
};

export function AdminHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Admin";
  const action = PAGE_ACTIONS[pathname];

  return (
    <header className="h-16 bg-[#0d0d0d] border-b border-[#1a1a1a] flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-white font-semibold text-base">{title}</h1>
        <p className="text-[#444] text-xs">UHA SHOP · Admin Panel</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input
            type="text"
            placeholder="Поиск..."
            className="h-9 pl-9 pr-4 bg-[#141414] border border-[#222] rounded-xl text-sm text-white placeholder:text-[#444] focus:outline-none focus:border-orange-500/50 transition-colors w-52"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-[#141414] border border-[#222] flex items-center justify-center text-[#555] hover:text-white hover:border-[#333] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        {/* Page action */}
        {action && (
          <button className="h-9 px-4 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-1.5 uppercase tracking-wide">
            <Plus className="w-3.5 h-3.5" />
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
}
