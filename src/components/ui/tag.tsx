import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * @deprecated Use Pill or TagBadge instead for consistency
 */
export function Tag({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full",
        "border border-border bg-panel2",
        "px-3 py-1 text-xs text-muted",
        className
      )}
      {...props}
    />
  );
}
