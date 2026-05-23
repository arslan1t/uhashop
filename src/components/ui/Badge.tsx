import { cn } from "@/lib/utils";

type BadgeVariant = "preorder" | "new" | "popular" | "limited" | "sale" | "in_stock" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  preorder:  "bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent))] border border-[rgb(var(--accent)/0.3)]",
  new:       "bg-blue-500/10 text-blue-400 border border-blue-500/25",
  popular:   "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
  limited:   "bg-purple-500/10 text-purple-400 border border-purple-500/25",
  sale:      "bg-red-500/10 text-red-400 border border-red-500/25",
  in_stock:  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
  default:   "bg-[rgb(var(--surface-2))] text-[rgb(var(--muted))] border border-[rgb(var(--border))]",
};

const variantLabels: Record<BadgeVariant, string> = {
  preorder: "Preorder",
  new:      "New",
  popular:  "Popular",
  limited:  "Limited",
  sale:     "Sale",
  in_stock: "In Stock",
  default:  "",
};

interface BadgeProps {
  variant?: BadgeVariant;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ variant = "default", label, className, size = "sm" }: BadgeProps) {
  const text = label ?? variantLabels[variant];
  if (!text) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full uppercase tracking-wider",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        variantStyles[variant],
        className
      )}
    >
      {text}
    </span>
  );
}
