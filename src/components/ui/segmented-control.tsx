"use client";

import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SegmentedControl({ options, value, onChange, className }: Props) {
  return (
    <div className={cn("inline-flex rounded-sm border border-border-strong p-0.5 bg-panel2", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-[7px] transition-all duration-150",
            value === opt.value
              ? "bg-panel text-text shadow-sm"
              : "text-muted hover:text-text"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
