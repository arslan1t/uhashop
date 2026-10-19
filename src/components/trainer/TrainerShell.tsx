"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, GraduationCap } from "lucide-react";
import { useTrainerStore } from "@/store/trainer";

/** Lightweight auth-gated shell for the dedicated trainer panel — no
 *  sidebar with shop sections, just a header and the academy manager below. */
export function TrainerShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const { isAuthenticated, trainerUser, checkAuth, validateToken, logout } = useTrainerStore();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/trainer/login";

  useEffect(() => {
    checkAuth();
    setReady(true);
    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated && !isLogin) router.replace("/trainer/login");
    if (isAuthenticated && isLogin) router.replace("/trainer");
  }, [ready, isAuthenticated, isLogin, router]);

  if (isLogin) return <div className="min-h-screen bg-[#080808]">{children}</div>;

  if (!ready || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#333] border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => { logout(); router.replace("/trainer/login"); };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="h-16 bg-[#0d0d0d] border-b border-[#1a1a1a] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="w-5 h-5 text-blue-400" />
          <div>
            <p className="font-semibold text-sm">UHA Academy</p>
            <p className="text-[#555] text-[11px]">Панель тренера</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {trainerUser && <span className="text-[#888] text-xs hidden sm:inline">{trainerUser.name}</span>}
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#141414] border border-[#222] text-[#888] hover:text-red-400 hover:border-red-500/30 text-xs font-semibold transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Выйти
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
