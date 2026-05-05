"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-55 disabled:pointer-events-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-fg text-bg hover:bg-fg/90 shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--fg)_60%,transparent)]",
        accent:
          "btn-pulse bg-accent text-accent-fg hover:bg-accent/95 shadow-[0_10px_28px_-14px_color-mix(in_oklab,var(--accent)_70%,transparent)]",
        ghost:
          "bg-transparent hover:bg-fg/5 text-fg",
        outline:
          "border border-line bg-bg-elev/60 hover:bg-bg-elev text-fg backdrop-blur-md",
        soft:
          "bg-fg/5 hover:bg-fg/10 text-fg",
        danger:
          "bg-danger/10 text-danger hover:bg-danger/15 border border-danger/30",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
