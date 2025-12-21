import * as React from "react";
import { cn } from "@/lib/cn";

export function TagBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full",
        "border border-border bg-panel2",
        "px-2 py-0.5",
        "text-[10px] font-semibold tracking-[0.18em] uppercase",
        "text-faint",
        className
      )}
      {...props}
    />
  );
}
