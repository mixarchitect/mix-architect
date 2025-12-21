import * as React from "react";
import { cn } from "@/lib/cn";

export function TagBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-panel2",
        "px-2.5 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase",
        "text-faint",
        className
      )}
      {...props}
    />
  );
}


