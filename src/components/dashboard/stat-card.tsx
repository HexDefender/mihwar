import { type Icon } from "@phosphor-icons/react";
import { arabicNumber } from "@/lib/utils";

export function StatCard({
  label,
  value,
  trend,
  icon: IconCmp,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  trend?: string;
  icon?: Icon;
  tone?: "neutral" | "accent" | "success" | "warning";
}) {
  const toneClass = {
    neutral: "bg-fg/5 text-fg-soft",
    accent: "bg-accent-soft text-accent",
    success: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)]",
    warning: "bg-[color-mix(in_oklab,var(--warning)_15%,transparent)] text-[var(--warning)]",
  }[tone];

  return (
    <div className="rounded-3xl border border-line bg-bg-elev/70 backdrop-blur-md p-4 sm:p-6 flex flex-col gap-2 sm:gap-3 shadow-[var(--shadow-bezel)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-[12px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-fg-mute font-mono leading-tight">{label}</span>
        {IconCmp && (
          <span className={`inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-2xl shrink-0 ${toneClass}`}>
            <IconCmp size={16} weight="duotone" />
          </span>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums tracking-tight">
        {typeof value === "number" ? arabicNumber(value) : value}
      </div>
      {trend && <div className="text-[12px] text-fg-mute">{trend}</div>}
    </div>
  );
}
