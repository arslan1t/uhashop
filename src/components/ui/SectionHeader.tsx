import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {label && (
        <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[rgb(var(--accent))] mb-3">
          {label}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-4xl tracking-tight text-[rgb(var(--foreground))] leading-tight mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[rgb(var(--muted))] text-base max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
