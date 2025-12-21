import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  active?: boolean;
};

export function Pill({ className, active, ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full",
        "border border-border bg-panel2",
        "px-3 py-1 text-xs text-muted",
        "transition-colors duration-150",
        active && "border-border-strong bg-panel text-text",
        className
      )}
      {...props}
    />
  );
}
