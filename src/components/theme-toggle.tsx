"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonStars, Sun } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme === "system" ? resolvedTheme : theme) : "light";
  const isDark = current === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="تبديل الوضع"
      className={cn(
        "focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-elev/70 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.94]",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "dark" : "light"}
          initial={{ rotate: -45, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 45, opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? (
            <MoonStars size={18} weight="duotone" />
          ) : (
            <Sun size={18} weight="duotone" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
