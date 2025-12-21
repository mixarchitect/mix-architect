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
        "rounded-md border border-border bg-panel2 px-4 py-3",
        "transition duration-200 ease-out hover:-translate-y-[1px] hover:border-black/15",
        className
      )}
    >
      <div className="label text-[11px] text-faint mb-1">
        {label}
      </div>
      <div className="font-mono text-2xl text-text leading-tight">{value}</div>
      {hint && <div className="text-xs text-muted mt-0.5">{hint}</div>}
    </div>
  );
}

