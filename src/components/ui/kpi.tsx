import * as React from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
};

export function Kpi({ label, value, hint, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border border-stroke bg-surface/40 px-4 py-3 shadow-panel",
        "transition duration-200 hover:border-strokeHover hover:-translate-y-[2px]",
        className
      )}
    >
      <div className="text-[11px] uppercase tracking-[0.08em] text-muted mb-1">
        {label}
      </div>
      <div className="text-lg font-semibold text-text leading-tight">{value}</div>
      {hint && <div className="text-xs text-muted mt-0.5">{hint}</div>}
    </div>
  );
}

