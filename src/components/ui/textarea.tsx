"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "focus-ring w-full rounded-2xl border border-line bg-bg-elev/60 px-4 py-3 text-sm text-fg placeholder:text-fg-mute backdrop-blur-md transition-colors duration-200 hover:border-fg/20 focus:border-accent/60 leading-relaxed",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
