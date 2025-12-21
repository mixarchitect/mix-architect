import * as React from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: string;
  note?: string;
  className?: string;
};

export function StatTile({ label, value, note, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-panel2",
        "px-4 py-3 transition duration-200 ease-out",
        "hover:-translate-y-[1px] hover:border-black/15",
        className
      )}
    >
      <div className="label text-[11px] text-faint">{label}</div>
      <div className="mt-2 font-mono text-2xl leading-tight text-text">{value}</div>
      {note && <div className="mt-1 text-xs text-muted">{note}</div>}
    </div>
  );
}


