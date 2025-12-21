import * as React from "react";
import { cn } from "@/lib/cn";

export function Tag({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-stroke px-3 py-1 text-xs text-muted",
        "bg-bg1/40 backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

