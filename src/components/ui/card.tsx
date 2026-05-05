import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bezel", className)} {...props}>
      <div className="bezel-inner h-full">{props.children}</div>
    </div>
  );
}

export function PlainCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-line bg-bg-elev/70 backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6 md:p-7 border-b border-line-soft", className)}>{children}</div>;
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6 md:p-7", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6 md:p-7 border-t border-line-soft", className)}>{children}</div>;
}
