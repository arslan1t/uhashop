"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type VersionFilter = "all" | "original" | "replica";
type StockFilter = "all" | "instock" | "preorder";

export interface FilterState {
  search: string;
  brand: string;
  category: string;
  style: "" | "basketball" | "lifestyle";
  version: VersionFilter;
  stockType: StockFilter;
  priceMin: number;
  priceMax: number;
  size: string;
  sort: string;
}

interface FilterBarProps {
  state: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onClear: () => void;
  brands: string[];
  categories: string[];
  allSizes: string[];
  priceRange: [number, number];
  total: number;
}

const SORT_OPTIONS = [
  { value: "popular", label: "Популярные" },
  { value: "new", label: "Новинки" },
  { value: "price_asc", label: "Дешевле" },
  { value: "price_desc", label: "Дороже" },
];

const VERSION_OPTIONS: { value: VersionFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "original", label: "Оригинал" },
  { value: "replica", label: "Реплика" },
];

const STOCK_OPTIONS: { value: StockFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "instock", label: "В наличии" },
  { value: "preorder", label: "Предзаказ" },
];

function catLabel(cat: string) {
  return cat === "shoes" ? "Кроссовки" : cat === "apparel" ? "Одежда" : cat === "accessories" ? "Аксессуары" : cat;
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all",
        active
          ? "bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]"
          : "bg-[rgb(var(--background))] text-[rgb(var(--muted))] border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.3)] hover:text-[rgb(var(--foreground))]"
      )}>
      {label}
    </button>
  );
}

export function FilterBar({
  state, onChange, onClear,
  brands, categories, allSizes,
  priceRange, total,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    state.brand,
    state.category,
    state.style,
    state.version !== "all",
    state.stockType !== "all",
    state.size,
    state.priceMin > priceRange[0] || state.priceMax < priceRange[1],
  ].filter(Boolean).length;

  const chips: { label: string; clear: () => void }[] = [];
  if (state.brand) chips.push({ label: state.brand, clear: () => onChange({ brand: "" }) });
  if (state.category) chips.push({ label: catLabel(state.category), clear: () => onChange({ category: "" }) });
  if (state.style) chips.push({ label: state.style === "basketball" ? "🏀 Баскетбол" : "👟 Лайфстайл", clear: () => onChange({ style: "" }) });
  if (state.version !== "all") chips.push({ label: state.version === "original" ? "Оригинал" : "Реплика", clear: () => onChange({ version: "all" }) });
  if (state.stockType !== "all") chips.push({ label: state.stockType === "instock" ? "В наличии" : "Предзаказ", clear: () => onChange({ stockType: "all" }) });
  if (state.size) chips.push({ label: `Размер ${state.size}`, clear: () => onChange({ size: "" }) });
  if (state.priceMin > priceRange[0] || state.priceMax < priceRange[1]) {
    chips.push({ label: `$${state.priceMin}–$${state.priceMax}`, clear: () => onChange({ priceMin: priceRange[0], priceMax: priceRange[1] }) });
  }

  return (
    <div className="space-y-3">
      {/* ── Top row ── */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted))]" />
          <input type="text" placeholder="Поиск по названию, бренду..."
            value={state.search} onChange={e => onChange({ search: e.target.value })}
            className="w-full h-11 pl-10 pr-10 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl text-sm placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent))] transition-colors" />
          {state.search && (
            <button onClick={() => onChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative hidden sm:block">
          <select value={state.sort} onChange={e => onChange({ sort: e.target.value })}
            className="h-11 pl-4 pr-9 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl text-sm focus:outline-none focus:border-[rgb(var(--accent))] cursor-pointer appearance-none min-w-[140px] transition-colors">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted))] pointer-events-none" />
        </div>

        <button onClick={() => setOpen(o => !o)}
          className={cn(
            "h-11 px-4 flex items-center gap-2 border rounded-xl text-sm font-medium transition-all flex-shrink-0",
            open || activeCount > 0
              ? "bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]"
              : "bg-[rgb(var(--surface))] border-[rgb(var(--border))] hover:border-[rgb(var(--accent))]"
          )}>
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Фильтры</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white/25 text-[11px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Active chips + count ── */}
      <div className="flex flex-wrap gap-2 items-center min-h-[28px]">
        <AnimatePresence>
          {chips.map(chip => (
            <motion.button key={chip.label}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
              onClick={chip.clear}
              className="flex items-center gap-1.5 px-3 py-1 bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))] border border-[rgb(var(--accent)/0.25)] rounded-full text-xs font-semibold hover:bg-[rgb(var(--accent)/0.2)] transition-colors">
              {chip.label}
              <X className="w-3 h-3" />
            </motion.button>
          ))}
          {chips.length > 1 && (
            <motion.button key="clear-all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClear}
              className="text-xs text-[rgb(var(--muted))] hover:text-red-400 transition-colors underline underline-offset-2">
              Сбросить всё
            </motion.button>
          )}
        </AnimatePresence>
        <span className="ml-auto text-xs text-[rgb(var(--muted))]">{total} товаров</span>
      </div>

      {/* ── Expandable panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden">
            <div className="p-5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl space-y-6">

              {/* Type + Stock + Sort (mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))] mb-2.5">Тип товара</p>
                  <div className="flex gap-1.5">
                    {VERSION_OPTIONS.map(v => (
                      <button key={v.value} onClick={() => onChange({ version: v.value })}
                        className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                          state.version === v.value
                            ? v.value === "replica" ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                              : v.value === "original" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]"
                            : "bg-[rgb(var(--background))] text-[rgb(var(--muted))] border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.25)]")}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))] mb-2.5">Наличие</p>
                  <div className="flex gap-1.5">
                    {STOCK_OPTIONS.map(s => (
                      <button key={s.value} onClick={() => onChange({ stockType: s.value })}
                        className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                          state.stockType === s.value
                            ? "bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]"
                            : "bg-[rgb(var(--background))] text-[rgb(var(--muted))] border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.25)]")}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:hidden">
                  <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))] mb-2.5">Сортировка</p>
                  <div className="relative">
                    <select value={state.sort} onChange={e => onChange({ sort: e.target.value })}
                      className="w-full h-10 pl-4 pr-9 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl text-sm focus:outline-none appearance-none cursor-pointer">
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted))] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Price range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))]">Цена (USD)</p>
                  <span className="text-xs font-semibold text-[rgb(var(--foreground))]">${state.priceMin} — ${state.priceMax}</span>
                </div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="relative flex-1">
                    <span className="absolute -top-4 left-0 text-[10px] text-[rgb(var(--muted))]">от</span>
                    <input type="number" value={state.priceMin} min={priceRange[0]} max={state.priceMax - 1}
                      onChange={e => onChange({ priceMin: Math.max(priceRange[0], Math.min(Number(e.target.value), state.priceMax - 1)) })}
                      className="w-full h-9 px-3 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl text-sm text-center focus:outline-none focus:border-[rgb(var(--accent))] transition-colors" />
                  </div>
                  <div className="w-6 h-px bg-[rgb(var(--border))]" />
                  <div className="relative flex-1">
                    <span className="absolute -top-4 left-0 text-[10px] text-[rgb(var(--muted))]">до</span>
                    <input type="number" value={state.priceMax} min={state.priceMin + 1} max={priceRange[1]}
                      onChange={e => onChange({ priceMax: Math.min(priceRange[1], Math.max(Number(e.target.value), state.priceMin + 1)) })}
                      className="w-full h-9 px-3 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl text-sm text-center focus:outline-none focus:border-[rgb(var(--accent))] transition-colors" />
                  </div>
                </div>
                <div className="h-1.5 bg-[rgb(var(--border))] rounded-full overflow-hidden">
                  <div className="h-full bg-[rgb(var(--accent))] rounded-full transition-all duration-200"
                    style={{
                      marginLeft: `${((state.priceMin - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`,
                      width: `${((state.priceMax - state.priceMin) / (priceRange[1] - priceRange[0])) * 100}%`,
                    }} />
                </div>
              </div>

              {/* Brands */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))] mb-2.5">Бренд</p>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!state.brand} onClick={() => onChange({ brand: "" })} label="Все" />
                  {brands.map(b => <Chip key={b} active={state.brand === b} onClick={() => onChange({ brand: state.brand === b ? "" : b })} label={b} />)}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))] mb-2.5">Категория</p>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!state.category} onClick={() => onChange({ category: "" })} label="Все" />
                  {categories.map(c => <Chip key={c} active={state.category === c} onClick={() => onChange({ category: state.category === c ? "" : c })} label={catLabel(c)} />)}
                </div>
              </div>

              {/* Style */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))] mb-2.5">Стиль</p>
                <div className="flex gap-2">
                  {[
                    { value: "" as const, label: "Все" },
                    { value: "basketball" as const, label: "🏀 Баскетбол" },
                    { value: "lifestyle" as const, label: "👟 Лайфстайл" },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => onChange({ style: opt.value })}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all",
                        state.style === opt.value
                          ? opt.value === "basketball"
                            ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                            : opt.value === "lifestyle"
                            ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                            : "bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]"
                          : "bg-[rgb(var(--background))] text-[rgb(var(--muted))] border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.25)]"
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted))] mb-2.5">Размер EU</p>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(s => (
                      <button key={s} onClick={() => onChange({ size: state.size === s ? "" : s })}
                        className={cn("min-w-[46px] px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all",
                          state.size === s
                            ? "bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]"
                            : "bg-[rgb(var(--background))] text-[rgb(var(--muted))] border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.3)] hover:text-[rgb(var(--foreground))]")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[rgb(var(--border))]">
                {activeCount > 0 && (
                  <button onClick={onClear} className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Сбросить всё
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className="ml-auto px-5 py-2.5 bg-[rgb(var(--accent))] text-white font-bold rounded-xl text-sm hover:bg-[rgb(var(--accent-hover))] transition-colors flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Показать {total} товаров
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
