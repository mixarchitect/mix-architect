import * as React from "react";
import { cn } from "@/lib/cn";

export function Pill({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-panel2",
        "px-3 py-1 text-xs text-muted",
        className
      )}
      {...props}
    />
  );
}


