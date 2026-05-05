"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Cube, ArrowsLeftRight, Tray, GearSix } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const items = [
  { href: "/dashboard", label: t.dashboard.sections.overview, icon: House },
  { href: "/dashboard/equipment", label: t.dashboard.sections.equipment, icon: Cube },
  { href: "/dashboard/transfers", label: t.dashboard.sections.transfers, icon: ArrowsLeftRight },
  { href: "/dashboard/inbox", label: t.dashboard.sections.inbox, icon: Tray },
  { href: "/dashboard/settings", label: t.dashboard.sections.settings, icon: GearSix },
];

export function MobileTabBar({ pendingInbox = 0 }: { pendingInbox?: number }) {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-3 inset-x-3 z-30 rounded-full glass shadow-[var(--shadow-elevated)] px-2 py-1.5">
      <div className="flex items-center justify-between">
        {items.map((it) => {
          const isActive = pathname === it.href || (it.href !== "/dashboard" && pathname?.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-2 text-[10px] transition-colors",
                isActive ? "text-fg" : "text-fg-mute hover:text-fg"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-tab-active"
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="absolute inset-0 -z-10 rounded-full bg-fg/10"
                />
              )}
              <span className="relative">
                <Icon size={20} weight={isActive ? "fill" : "duotone"} />
                {it.href === "/dashboard/inbox" && pendingInbox > 0 && (
                  <span className="absolute -top-1 -end-1 h-3 min-w-3 rounded-full bg-accent text-accent-fg text-[8px] font-mono leading-none flex items-center justify-center px-0.5">
                    {pendingInbox}
                  </span>
                )}
              </span>
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
