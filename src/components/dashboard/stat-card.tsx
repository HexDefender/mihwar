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
    <div className="rounded-3xl border border-line bg-bg-elev/70 backdrop-blur-md p-6 flex flex-col gap-3 shadow-[var(--shadow-bezel)]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] uppercase tracking-[0.2em] text-fg-mute font-mono">{label}</span>
        {IconCmp && (
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${toneClass}`}>
            <IconCmp size={18} weight="duotone" />
          </span>
        )}
      </div>
      <div className="text-3xl font-mono font-semibold tabular-nums tracking-tight">
        {typeof value === "number" ? arabicNumber(value) : value}
      </div>
      {trend && <div className="text-[12px] text-fg-mute">{trend}</div>}
    </div>
  );
}
