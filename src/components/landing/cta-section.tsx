"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export function CtaSection() {
  return (
    <section className="relative py-20 sm:py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <motion.div
          initial={{ y: 28, opacity: 0, filter: "blur(8px)" }}
          whileInView={{ y: 0, opacity: 1, filter: "blur(0)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="bezel"
        >
          <div className="bezel-inner relative overflow-hidden p-7 sm:p-10 md:p-16">
            <div className="absolute -inset-4 -z-0 opacity-50 [mask-image:radial-gradient(60%_80%_at_50%_50%,#000,transparent)]">
              <div className="absolute inset-0 grid-floor" />
            </div>
            <div
              className="absolute -right-20 top-1/2 -translate-y-1/2 h-56 w-56 sm:h-72 sm:w-72 rounded-full blur-3xl opacity-50"
              style={{ background: "var(--accent)" }}
              aria-hidden="true"
            />
            <div className="relative grid md:grid-cols-12 gap-8 sm:gap-10 items-center">
              <div className="md:col-span-7">
                <span className="inline-block rounded-full border border-line bg-bg/40 backdrop-blur-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-fg-soft mb-5">
                  {t.cta.eyebrow}
                </span>
                <h2 className="text-balance text-[26px] sm:text-3xl md:text-5xl leading-[1.1] sm:leading-[1.05] tracking-tight font-semibold mb-4 sm:mb-5">
                  {t.cta.title}
                </h2>
                <p className="text-fg-soft text-pretty text-[15px] sm:text-base md:text-lg leading-relaxed max-w-[55ch]">
                  {t.cta.body}
                </p>
              </div>
              <div className="md:col-span-5 flex md:justify-end">
                <Button asChild variant="accent" size="lg" className="text-base w-full sm:w-auto justify-center">
                  <Link href="/login">
                    {t.cta.button}
                    <span className="ms-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-fg/15">
                      <ArrowUpRight size={14} weight="bold" className="rtl:scale-x-[-1]" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
