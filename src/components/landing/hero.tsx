"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { arabicNumber } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden pt-28 sm:pt-32 pb-16 md:pt-36 md:pb-20">
      <div className="absolute inset-0 grid-floor opacity-[0.35] sm:opacity-[0.45] -z-10" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 [background:radial-gradient(70%_60%_at_50%_0%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_75%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 relative">
            <motion.span
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-elev/70 backdrop-blur-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-fg-soft"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              {t.hero.eyebrow}
            </motion.span>

            <motion.h1
              initial={{ y: 24, opacity: 0, filter: "blur(6px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0)" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="mt-6 text-balance text-[34px] sm:text-5xl md:text-6xl lg:text-[64px] leading-[1.07] sm:leading-[1.05] tracking-tight font-semibold"
            >
              {t.hero.title.split("،").map((part, i, arr) => (
                <span key={i} className={i === 1 ? "gradient-text" : ""}>
                  {part}
                  {i < arr.length - 1 && "، "}
                </span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="mt-6 max-w-[58ch] text-pretty text-base md:text-lg leading-relaxed text-fg-soft"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild variant="accent" size="lg">
                <Link href="/login">
                  {t.nav.enter}
                  <span className="ms-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-fg/15">
                    <ArrowUpRight size={14} weight="bold" className="rtl:scale-x-[-1]" />
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">{t.hero.ctaSecondary}</a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
              className="mt-10 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-6 max-w-md"
            >
              {[t.hero.metric1, t.hero.metric2, t.hero.metric3].map((m, i) => (
                <div key={i} className="border-s border-line ps-3 sm:ps-4 first:border-s-0 first:ps-0">
                  <div className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight font-mono tabular-nums">
                    {arabicNumber(m.v.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)))}
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-fg-mute mt-1 leading-snug">{m.l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative h-[420px] lg:h-[560px] hidden lg:block" aria-hidden="true" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-fg-mute pointer-events-none"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">مرّر للأسفل</span>
          <div className="h-10 w-[1px] bg-line relative overflow-hidden">
            <motion.div
              initial={{ y: -40 }}
              animate={{ y: 40 }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="absolute inset-x-0 h-3 bg-accent"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
