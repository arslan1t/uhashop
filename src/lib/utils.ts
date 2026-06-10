import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Single source of truth for the standard delivery time shown on every item. */
export const DELIVERY_TIME = "7–14 дней";

export function formatPrice(price: number, currency: "USD" | "UZS" = "USD") {
  // Guard against NaN/Infinity/undefined so a bad value never renders "≈$NaN"
  const safe = Number.isFinite(price) ? price : 0;
  if (currency === "USD") {
    return `≈$${safe.toLocaleString("en-US")}`;
  }
  return `≈${(safe * 12500).toLocaleString("ru-RU")} сум`;
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}
