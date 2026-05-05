"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { t } from "@/lib/i18n";
import { arabicNumber } from "@/lib/utils";

export function FlowSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineProgress = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  return (
    <section ref={ref} id="flow" className="relative py-20 sm:py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid lg:grid-cols-12 gap-8 sm:gap-10 mb-12 sm:mb-16 md:mb-24">
          <div className="lg:col-span-5">
            <span className="inline-block rounded-full border border-line bg-bg-elev/70 backdrop-blur-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-fg-soft mb-5">
              {t.flow.eyebrow}
            </span>
            <h2 className="text-balance text-[28px] sm:text-3xl md:text-5xl leading-[1.1] sm:leading-[1.08] tracking-tight font-semibold">
              {t.flow.title}
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-10">
            <p className="text-pretty text-[15px] sm:text-base md:text-lg leading-relaxed text-fg-soft max-w-prose">
              كلّ تسليمة في محور هي عقد مصغّر بين شخصين وقطعة. لا تنتقل المسؤولية حتى يضع المستلم
              توقيعه الرقمي. وكلّ خطوة من الخطوات الأربع تُسجَّل بزمنها.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute end-[31px] md:end-1/2 md:-translate-x-px md:translate-x-[0px] top-0 bottom-0 w-px bg-line" />
          <motion.div
            style={{ height: lineProgress }}
            className="absolute end-[31px] md:end-1/2 md:-translate-x-px md:translate-x-[0px] top-0 w-px bg-accent"
          />

          <ol className="flex flex-col gap-12 md:gap-20">
            {t.flow.steps.map((step, i) => (
              <motion.li
                key={step.n}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className={`relative md:grid md:grid-cols-2 md:gap-16 ${i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}
              >
                <div className={`flex items-start gap-5 ${i % 2 === 1 ? "md:flex-row-reverse md:text-end" : ""} pe-14 sm:pe-16 md:pe-0 md:px-10`}>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs tracking-[0.3em] text-accent mb-2">
                      {arabicNumber(step.n)}
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight mb-3 break-words">{step.title}</h3>
                    <p className="text-fg-soft leading-relaxed text-[14px] sm:text-[15px] max-w-md">{step.body}</p>
                  </div>
                </div>
                <div className="hidden md:block" />
                <span className="absolute end-[24px] md:end-1/2 md:-translate-x-1/2 md:translate-x-[5px] top-2 h-4 w-4 rounded-full bg-accent ring-4 ring-bg" />
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
