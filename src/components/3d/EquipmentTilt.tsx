"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";

export function EquipmentTilt({
  children,
  className,
  intensity = 12,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 220, damping: 22 });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 220, damping: 22 });

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      className={className}
    >
      <div style={{ transform: "translateZ(0)" }}>{children}</div>
    </motion.div>
  );
}
