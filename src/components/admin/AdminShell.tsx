"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useAdminStore } from "@/store/admin";
import { useProductOverrides } from "@/store/productOverrides";
import { useProductVisibility } from "@/store/productVisibility";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const { isAuthenticated, checkAuth } = useAdminStore();
  const hydrateOverrides = useProductOverrides(s => s.hydrate);
  const hydrateVisibility = useProductVisibility(s => s.hydrate);
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    checkAuth();
    hydrateOverrides();
    hydrateVisibility();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated && !isLogin) {
      router.replace("/admin/login");
    }
    if (isAuthenticated && isLogin) {
      router.replace("/admin");
    }
  }, [ready, isAuthenticated, isLogin]);

  // Login page — no shell
  if (isLogin) {
    return (
      <div className="min-h-screen bg-[#080808]">
        {children}
      </div>
    );
  }

  // Not yet hydrated / redirecting
  if (!ready || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#333] border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-[#0d0d0d]">
          {children}
        </main>
      </div>
    </div>
  );
}
