import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ className, variant = "secondary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 select-none",
        "h-10 px-[18px] rounded-full text-sm font-semibold",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
        // Primary: signal orange, physical button feel
        variant === "primary" &&
          "bg-signal text-white border border-black/[0.08] shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)] hover:brightness-[1.02] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-0 active:brightness-[0.98]",
        // Secondary: paper button with ink border
        variant === "secondary" &&
          "bg-panel text-text border border-border shadow-paper hover:-translate-y-px hover:border-border-strong active:translate-y-0",
        // Ghost: minimal, just border
        variant === "ghost" &&
          "bg-transparent text-text border border-border hover:bg-panel hover:border-border-strong hover:-translate-y-px active:translate-y-0",
        // Disabled state
        "disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:hover:transform-none",
        className
      )}
      {...props}
    />
  );
}
