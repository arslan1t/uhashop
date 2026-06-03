"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  onClose: () => void;
}

type Step = "form" | "success";

const INP = "w-full h-11 px-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl text-[rgb(var(--foreground))] text-sm placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-blue-500/60 transition-colors";
const LBL = "block text-xs font-semibold text-[rgb(var(--muted))] uppercase tracking-wider mb-1.5";

export function AcademyApplicationModal({ onClose }: Props) {
  const t = useTranslations("academy");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SKILL_OPTIONS = [
    { value: "beginner",     label: t("modal_skill_beginner"),     desc: t("modal_skill_beginner_desc") },
    { value: "intermediate", label: t("modal_skill_intermediate"),  desc: t("modal_skill_intermediate_desc") },
    { value: "advanced",     label: t("modal_skill_advanced"),      desc: t("modal_skill_advanced_desc") },
    { value: "pro",          label: t("modal_skill_pro"),           desc: t("modal_skill_pro_desc") },
  ];

  // Required fields
  const [parentName,  setParentName]  = useState("");
  const [parentTg,    setParentTg]    = useState("");
  const [age,         setAge]         = useState("");

  // Optional fields
  const [athleteName, setAthleteName] = useState("");
  const [height,      setHeight]      = useState("");
  const [weight,      setWeight]      = useState("");
  const [skillLevel,  setSkillLevel]  = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parentName.trim() || !parentTg.trim() || !age.trim()) {
      setError(t("modal_required_error"));
      return;
    }
    if (Number(age) < 6 || Number(age) > 25) {
      setError(t("modal_age_error"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/academy/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: parentName.trim(),
          parentTg:   parentTg.trim(),
          age:        Number(age),
          athleteName: athleteName.trim() || undefined,
          height:      height ? Number(height) : undefined,
          weight:      weight ? Number(weight) : undefined,
          skillLevel:  skillLevel || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("modal_server_error"));
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("modal_server_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[rgb(var(--border))]">
            <div>
              <h2 className="font-display text-xl tracking-tight">
                {step === "success" ? t("modal_success_title") : t("modal_title")}
              </h2>
              {step === "form" && (
                <p className="text-[rgb(var(--muted))] text-sm mt-0.5">
                  {t("modal_subtitle")}
                </p>
              )}
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[rgb(var(--surface-2))] flex items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === "success" ? (
            /* ── SUCCESS STATE ── */
            <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <h3 className="font-display text-2xl mb-2">{t("modal_success_title")}</h3>
                <p className="text-[rgb(var(--muted))] leading-relaxed max-w-sm">
                  {t("modal_success_text")}
                </p>
              </div>
              <div className="mt-2 w-full bg-blue-500/8 border border-blue-500/20 rounded-2xl px-5 py-4 text-left">
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">{t("modal_next_label")}</p>
                <ul className="text-[rgb(var(--foreground))] text-sm space-y-1.5">
                  <li>• {t("modal_next_1")}</li>
                  <li>• {t("modal_next_2")}</li>
                  <li>• {t("modal_next_3")}</li>
                </ul>
              </div>
              <button onClick={onClose}
                className="mt-2 w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl text-sm uppercase tracking-widest transition-colors">
                {t("modal_close")}
              </button>
            </div>
          ) : (
            /* ── FORM STATE ── */
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">

              {/* Required section */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[rgb(var(--accent))] uppercase tracking-widest">
                  {t("modal_required_label")}
                </p>

                <div>
                  <label className={LBL}>{t("modal_parent_name")}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted))]" />
                    <input
                      value={parentName} onChange={e => setParentName(e.target.value)}
                      placeholder={t("modal_parent_name_ph")}
                      className={`${INP} pl-10`} required
                    />
                  </div>
                </div>

                <div>
                  <label className={LBL}>{t("modal_parent_tg")}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))] text-sm font-mono">@</span>
                    <input
                      value={parentTg} onChange={e => setParentTg(e.target.value.replace(/^@/, ""))}
                      placeholder="username"
                      className={`${INP} pl-8`} required
                    />
                  </div>
                </div>

                <div>
                  <label className={LBL}>{t("modal_age")}</label>
                  <input
                    type="number" min="6" max="25"
                    value={age} onChange={e => setAge(e.target.value)}
                    placeholder="12"
                    className={INP} required
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[rgb(var(--border))]" />

              {/* Optional section */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[rgb(var(--muted))] uppercase tracking-widest">
                  {t("modal_optional_label")}
                </p>

                <div>
                  <label className={LBL}>{t("modal_athlete_name")}</label>
                  <input
                    value={athleteName} onChange={e => setAthleteName(e.target.value)}
                    placeholder="Иванов Алексей"
                    className={INP}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LBL}>{t("modal_height")}</label>
                    <input
                      type="number" min="100" max="230"
                      value={height} onChange={e => setHeight(e.target.value)}
                      placeholder="150"
                      className={INP}
                    />
                  </div>
                  <div>
                    <label className={LBL}>{t("modal_weight")}</label>
                    <input
                      type="number" min="20" max="150"
                      value={weight} onChange={e => setWeight(e.target.value)}
                      placeholder="45"
                      className={INP}
                    />
                  </div>
                </div>

                <div>
                  <label className={LBL}>{t("modal_skill_label")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SKILL_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setSkillLevel(s => s === opt.value ? "" : opt.value)}
                        className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all ${
                          skillLevel === opt.value
                            ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                            : "bg-[rgb(var(--surface-2))] border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-[rgb(var(--foreground)/0.2)]"
                        }`}>
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-[10px] opacity-70 mt-0.5 leading-tight">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-bold rounded-2xl text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("modal_submitting")}</>
                  : t("modal_submit")
                }
              </button>

              <p className="text-center text-[rgb(var(--muted))] text-xs pb-1">
                {t("modal_consent")}
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
