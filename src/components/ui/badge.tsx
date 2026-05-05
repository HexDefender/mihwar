import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "muted" | "accent";

const toneClass: Record<Tone, string> = {
  success: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)] border-[color-mix(in_oklab,var(--success)_35%,transparent)]",
  warning: "bg-[color-mix(in_oklab,var(--warning)_15%,transparent)] text-[var(--warning)] border-[color-mix(in_oklab,var(--warning)_35%,transparent)]",
  danger: "bg-[color-mix(in_oklab,var(--danger)_15%,transparent)] text-[var(--danger)] border-[color-mix(in_oklab,var(--danger)_35%,transparent)]",
  info: "bg-fg/5 text-fg-soft border-line",
  muted: "bg-fg/4 text-fg-mute border-line",
  accent: "bg-accent-soft text-accent border-[color-mix(in_oklab,var(--accent)_35%,transparent)]",
};

export function Badge({
  tone = "info",
  className,
  children,
  ...props
}: { tone?: Tone } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-tight",
        toneClass[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
