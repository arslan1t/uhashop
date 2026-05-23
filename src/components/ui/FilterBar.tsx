"use client";

import { useTranslations } from "next-intl";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

type VersionFilter = "all" | "original" | "replica";

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  selectedBrand: string;
  onBrand: (v: string) => void;
  selectedCategory: string;
  onCategory: (v: string) => void;
  sort: string;
  onSort: (v: string) => void;
  brands: string[];
  categories: string[];
  onClear: () => void;
  hasActiveFilters: boolean;
  total: number;
  version?: VersionFilter;
  onVersion?: (v: string) => void;
}

const SORT_OPTIONS = [
  { value: "popular", labelKey: "sort_popular" },
  { value: "new", labelKey: "sort_new" },
  { value: "price_asc", labelKey: "sort_price_asc" },
  { value: "price_desc", labelKey: "sort_price_desc" },
];

export function FilterBar({
  search, onSearch,
  selectedBrand, onBrand,
  selectedCategory, onCategory,
  sort, onSort,
  brands, categories,
  onClear, hasActiveFilters,
  total,
  version = "all",
  onVersion,
}: FilterBarProps) {
  const t = useTranslations("marketplace");

  return (
    <div className="space-y-4">
      {/* Top row: search + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted))]" />
          <input
            type="text"
            placeholder={`${t("filter_brand")}, ${t("filter_category")}...`}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent))] transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="h-11 px-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl text-sm text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))] transition-colors cursor-pointer min-w-[160px]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>
      </div>

      {/* Version filter — Original / Replica */}
      {onVersion && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[rgb(var(--muted))] uppercase tracking-wider mr-1">
            {t("filter_version")}:
          </span>
          {(["all", "original", "replica"] as VersionFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => onVersion(v)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
                version === v
                  ? v === "replica"
                    ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                    : v === "original"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]"
                  : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.3)] hover:text-[rgb(var(--foreground))]"
              )}
            >
              {v === "all"
                ? t("all_versions")
                : v === "original"
                ? t("original_only")
                : t("replica_only")}
            </button>
          ))}
        </div>
      )}

      {/* Filter chips row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted))]">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>

        {/* Brand filter */}
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={selectedBrand === ""} onClick={() => onBrand("")} label={t("all_brands")} />
          {brands.map((b) => (
            <FilterChip
              key={b}
              active={selectedBrand === b}
              onClick={() => onBrand(b === selectedBrand ? "" : b)}
              label={b}
            />
          ))}
        </div>

        <div className="w-px h-4 bg-[rgb(var(--border))] hidden sm:block" />

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={selectedCategory === ""} onClick={() => onCategory("")} label={t("all_categories")} />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              active={selectedCategory === cat}
              onClick={() => onCategory(cat === selectedCategory ? "" : cat)}
              label={cat === "shoes" ? t("categories.shoes") : cat === "apparel" ? t("categories.apparel") : t("categories.accessories")}
            />
          ))}
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded-full transition-colors"
          >
            <X className="w-3 h-3" />
            {t("clear_filters")}
          </button>
        )}

        {/* Count */}
        <span className="ml-auto text-xs text-[rgb(var(--muted))]">
          {total} {t("products")}
        </span>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
        active
          ? "bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]"
          : "bg-[rgb(var(--surface))] text-[rgb(var(--muted))] border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)/0.4)] hover:text-[rgb(var(--foreground))]"
      )}
    >
      {label}
    </button>
  );
}
