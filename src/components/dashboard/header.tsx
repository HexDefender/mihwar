"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { SignOut } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth";
import { t } from "@/lib/i18n";
import { initials } from "@/lib/utils";

export function DashboardHeader({
  name,
  nameAr,
  role,
  avatarUrl,
}: {
  name: string;
  nameAr?: string | null;
  role: "ADMIN" | "MEMBER";
  avatarUrl?: string | null;
}) {
  const display = nameAr || name;
  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 lg:px-8 py-4 border-b border-line bg-bg/85 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="relative h-8 w-8 rounded-full bg-fg text-bg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">{t.brand.name}</span>
        </Link>
        <div className="hidden lg:flex flex-col">
          <span className="text-[12px] uppercase tracking-[0.22em] text-fg-mute font-mono">
            {t.dashboard.welcome}
          </span>
          <span className="text-base font-semibold tracking-tight">{display}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden md:flex items-center gap-3 rounded-full border border-line bg-bg-elev/60 backdrop-blur-md ps-3 pe-1.5 py-1.5">
          <div className="text-end">
            <div className="text-[13px] font-medium leading-tight">{display}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-fg-mute font-mono">
              {role === "ADMIN" ? "مدير" : "عضو"}
            </div>
          </div>
          <Avatar className="h-9 w-9">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback name={display}>{initials(display)}</AvatarFallback>
          </Avatar>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="icon" aria-label="تسجيل الخروج">
            <SignOut size={18} weight="duotone" className="rtl:scale-x-[-1]" />
          </Button>
        </form>
      </div>
    </motion.header>
  );
}
