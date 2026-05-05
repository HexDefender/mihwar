"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Cube,
  UsersThree,
  ArrowsLeftRight,
  Tray,
  ScrollIcon,
  GearSix,
  type Icon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  badge?: number | null;
  adminOnly?: boolean;
};

export function DashboardSidebar({ role, pendingInbox = 0 }: { role: "ADMIN" | "MEMBER"; pendingInbox?: number }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/dashboard", label: t.dashboard.sections.overview, icon: House },
    { href: "/dashboard/equipment", label: t.dashboard.sections.equipment, icon: Cube },
    { href: "/dashboard/members", label: t.dashboard.sections.members, icon: UsersThree, adminOnly: true },
    { href: "/dashboard/transfers", label: t.dashboard.sections.transfers, icon: ArrowsLeftRight },
    { href: "/dashboard/inbox", label: t.dashboard.sections.inbox, icon: Tray, badge: pendingInbox || null },
    { href: "/dashboard/audit", label: t.dashboard.sections.audit, icon: ScrollIcon, adminOnly: true },
    { href: "/dashboard/settings", label: t.dashboard.sections.settings, icon: GearSix },
  ];

  const visible = items.filter((it) => !it.adminOnly || role === "ADMIN");

  return (
    <aside className="hidden lg:flex w-72 shrink-0 sticky top-0 h-[100dvh] flex-col gap-2 p-4 border-s border-line bg-bg-elev/40 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2.5 px-3 py-4">
        <div className="relative h-9 w-9 rounded-full bg-fg text-bg flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight">{t.brand.name}</span>
          <span className="text-[10px] text-fg-mute font-mono uppercase tracking-[0.2em]">
            {t.brand.nameLatin}
          </span>
        </div>
      </Link>

      <nav className="flex-1 mt-2 flex flex-col gap-1">
        {visible.map((it) => {
          const isActive = pathname === it.href || (it.href !== "/dashboard" && pathname?.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "group relative flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] transition-colors",
                isActive ? "text-fg" : "text-fg-soft hover:text-fg hover:bg-fg/5"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 240, damping: 22 }}
                  className="absolute inset-0 -z-10 rounded-2xl bg-fg/8 border border-line"
                />
              )}
              <span className="flex items-center gap-3">
                <Icon size={18} weight={isActive ? "fill" : "duotone"} className="opacity-80" />
                {it.label}
              </span>
              {it.badge ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-accent-fg text-[11px] font-mono px-1.5">
                  {it.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-line bg-bg-elev p-3 text-[12px] text-fg-mute font-mono uppercase tracking-[0.2em]">
        {t.brand.nameLatin} v 1.0
      </div>
    </aside>
  );
}
