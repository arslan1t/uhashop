"use client";

import { User, Shield, Mail } from "lucide-react";

const USERS = [
  { id: "1", name: "UHA Admin", email: "admin@uhashop.uz", role: "super_admin", lastLogin: "2024-02-13 14:30" },
];

export default function AdminUsersPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <h3 className="text-white font-semibold text-sm">Администраторы</h3>
          <p className="text-[#444] text-xs">{USERS.length} пользователь</p>
        </div>
        <div className="divide-y divide-[#161616]">
          {USERS.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-bold">{u.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{u.name}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
                    Super Admin
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[#555] text-xs flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {u.email}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#555] text-xs">Последний вход</p>
                <p className="text-[#888] text-xs">{u.lastLogin}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
        <p className="text-[#555] text-xs">
          💡 Роли: Super Admin (полный доступ), Editor (товары и контент), Viewer (только просмотр). Backend-ready architecture.
        </p>
      </div>
    </div>
  );
}
