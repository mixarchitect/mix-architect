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
        "h-11 px-4 rounded-full text-sm font-semibold",
        "transition duration-200 ease-out",
        variant === "primary" &&
          "bg-signal text-white border border-black/5 shadow-[0_10px_22px_rgba(0,0,0,0.08)] hover:-translate-y-[1px] hover:brightness-[0.985] active:translate-y-0",
        variant === "secondary" &&
          "bg-panel border border-border text-text shadow-[0_10px_26px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] hover:border-black/20 active:translate-y-0",
        variant === "ghost" &&
          "bg-white/60 border border-border text-text hover:bg-white/85 hover:-translate-y-[1px] active:translate-y-0",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}


