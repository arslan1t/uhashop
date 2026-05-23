import { cn } from "@/lib/utils";
import { ReactNode, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))] shadow-lg shadow-[rgb(var(--accent)/0.25)]",
  secondary:
    "bg-[rgb(var(--surface-2))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--border))]",
  ghost:
    "bg-transparent text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface))]",
  outline:
    "border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground))] bg-transparent",
};

const sizeStyles: Record<Size, string> = {
  sm:  "h-9 px-4 text-xs rounded-xl",
  md:  "h-11 px-6 text-sm rounded-xl",
  lg:  "h-14 px-8 text-sm rounded-2xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth,
  loading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.97]",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
