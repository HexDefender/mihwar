"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "focus-ring h-12 w-full rounded-2xl border border-line bg-bg-elev/60 px-4 text-sm text-fg placeholder:text-fg-mute backdrop-blur-md transition-colors duration-200 hover:border-fg/20 focus:border-accent/60",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
