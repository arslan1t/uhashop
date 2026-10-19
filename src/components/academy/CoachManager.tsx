"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Shield, Copy, Check } from "lucide-react";
import { getAdminToken } from "@/store/admin";

interface Coach {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const INP = "w-full h-10 px-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-blue-500/50 transition-colors";

/** Admin-only — lets the shop owner create/remove trainer logins for the
 *  dedicated /trainer panel. Never rendered when isTrainer is true. */
export function CoachManager() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coaches", { headers: { "x-admin-token": getAdminToken() } });
      const data = await res.json();
      if (res.ok) setCoaches(data.coaches ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCoaches(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      alert("Имя, email и пароль (минимум 6 символов) обязательны");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setForm({ name: "", email: "", password: "" });
      await loadCoaches();
    } catch (e) {
      alert(`Не удалось создать тренера: ${e instanceof Error ? e.message : e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Удалить доступ тренера «${name}»? Он больше не сможет войти в панель.`)) return;
    try {
      const res = await fetch("/api/admin/coaches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCoaches(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert(`Не удалось удалить тренера: ${e instanceof Error ? e.message : e}`);
    }
  };

  const trainerUrl = typeof window !== "undefined" ? `${window.location.origin}/trainer/login` : "/trainer/login";
  const copyLink = () => {
    navigator.clipboard.writeText(trainerUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" /> Ссылка для входа тренеров
          </h3>
        </div>
        <p className="text-[#555] text-xs mb-3">Отдельная панель только для управления академией — без доступа к товарам, заказам и остальной админке.</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 h-10 px-3 bg-[#0a0a0a] border border-[#222] rounded-xl text-[#888] text-xs flex items-center overflow-x-auto whitespace-nowrap">{trainerUrl}</code>
          <button onClick={copyLink} className="h-10 px-4 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs font-bold rounded-xl hover:border-blue-500/40 transition-colors flex items-center gap-1.5 flex-shrink-0">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Новый тренер</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Имя *" className={INP} />
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email *" className={INP} />
          <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Пароль (мин. 6 симв.) *" className={INP} />
          <button type="submit" disabled={saving} className="sm:col-span-3 h-10 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {saving ? "Создание..." : "Создать тренера"}
          </button>
        </form>
      </div>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <h3 className="text-white font-semibold text-sm">Тренеры с доступом</h3>
        </div>
        {loading ? (
          <div className="py-12 text-center text-[#555] text-sm">Загрузка...</div>
        ) : coaches.length === 0 ? (
          <div className="py-12 text-center text-[#555] text-sm">Тренеров пока нет</div>
        ) : (
          <div className="divide-y divide-[#161616]">
            {coaches.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-[10px] font-bold">{c.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{c.name}</p>
                  <p className="text-[#555] text-xs truncate">{c.email}</p>
                </div>
                <button onClick={() => handleRemove(c.id, c.name)} className="text-[#555] hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
