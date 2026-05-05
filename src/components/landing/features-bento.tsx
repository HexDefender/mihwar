"use client";

import { motion } from "motion/react";
import {
  Cube,
  PaperPlaneTilt,
  Fingerprint,
  ClockClockwise,
  CircleHalf,
  DeviceMobile,
} from "@phosphor-icons/react";
import { t } from "@/lib/i18n";
import { EquipmentTilt } from "@/components/3d/EquipmentTilt";

const ICONS = [Cube, PaperPlaneTilt, Fingerprint, ClockClockwise, CircleHalf, DeviceMobile];
const SPANS = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
  "md:col-span-2",
];

export function FeaturesBento() {
  return (
    <section id="features" className="relative py-20 sm:py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col items-start gap-4 mb-12 sm:mb-14 md:mb-20 max-w-3xl">
          <span className="rounded-full border border-line bg-bg-elev/70 backdrop-blur-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-fg-soft">
            {t.features.eyebrow}
          </span>
          <h2 className="text-balance text-[28px] sm:text-3xl md:text-5xl leading-[1.1] sm:leading-[1.08] tracking-tight font-semibold">
            {t.features.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[minmax(220px,auto)] gap-3 sm:gap-4">
          {t.features.items.map((it, i) => {
            const Icon = ICONS[i] ?? Cube;
            return (
              <motion.div
                key={i}
                initial={{ y: 28, opacity: 0, filter: "blur(6px)" }}
                whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className={SPANS[i] ?? ""}
              >
                <EquipmentTilt intensity={6} className="h-full">
                  <div className="bezel h-full">
                    <div className="bezel-inner h-full p-5 sm:p-7 md:p-8 flex flex-col justify-between gap-5 sm:gap-6 relative overflow-hidden">
                      <div
                        className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-30 blur-3xl pointer-events-none"
                        style={{ background: "var(--accent)" }}
                      />
                      <div className="relative z-10">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent border border-[color-mix(in_oklab,var(--accent)_25%,transparent)]">
                          <Icon size={22} weight="duotone" />
                        </div>
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-lg sm:text-xl md:text-[22px] font-semibold leading-tight tracking-tight mb-2">
                          {it.title}
                        </h3>
                        <p className="text-fg-soft text-[14px] sm:text-[15px] leading-relaxed max-w-prose">{it.body}</p>
                      </div>
                    </div>
                  </div>
                </EquipmentTilt>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
