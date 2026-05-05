"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: t.nav.features },
    { href: "#flow", label: t.nav.flow },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-4 inset-x-0 z-40 flex justify-center px-4"
      >
        <div
          className={cn(
            "glass flex h-14 w-full max-w-5xl items-center justify-between rounded-full px-4 md:px-5 transition-[box-shadow,background] duration-500",
            scrolled && "shadow-[var(--shadow-elevated)]"
          )}
        >
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <div className="relative h-8 w-8 rounded-full bg-fg text-bg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="3" y1="12" x2="21" y2="12" />
              </svg>
            </div>
            <span className="text-base">{t.brand.name}</span>
            <span className="hidden md:inline text-[11px] text-fg-mute font-mono uppercase tracking-[0.2em]">
              {t.brand.nameLatin}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-full text-fg-soft hover:text-fg hover:bg-fg/5 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" variant="primary" className="hidden md:inline-flex">
              <Link href="/login">
                {t.nav.login}
                <span className="ms-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-bg/10">
                  <ArrowUpRight size={12} weight="bold" />
                </span>
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="فتح القائمة"
              className="md:hidden focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-elev/70"
            >
              <List size={18} weight="bold" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 backdrop-blur-2xl bg-bg/85" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="relative mx-auto mt-6 w-[92%] rounded-3xl border border-line bg-bg-elev p-6 shadow-[var(--shadow-elevated)]"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold">{t.brand.name}</span>
                <button
                  onClick={() => setOpen(false)}
                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-fg/5"
                  aria-label="إغلاق"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
              <ul className="flex flex-col gap-1 text-base">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 hover:bg-fg/5"
                    >
                      <span>{l.label}</span>
                      <ArrowUpRight size={14} className="rtl:scale-x-[-1] text-fg-mute" />
                    </a>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3"
                >
                  <Button asChild variant="primary" size="lg" className="w-full">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      {t.nav.login}
                    </Link>
                  </Button>
                </motion.li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
