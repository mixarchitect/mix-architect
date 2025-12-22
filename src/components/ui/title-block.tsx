import * as React from "react";
import { cn } from "@/lib/cn";

type Props = {
  label?: string;
  value?: string;
  note?: string;
  className?: string;
};

export function TitleBlock({ label = "V1", value = "Drafting Table", note, className }: Props) {
  return (
    <div
      className={cn(
        "title-block text-[11px] text-muted grid gap-1 min-w-[120px]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="label text-[10px] text-faint">TITLE</span>
        <span className="mono text-text">{label}</span>
      </div>
      <div className="text-text font-semibold leading-tight">{value}</div>
      {note && <div className="text-[10px] text-faint">{note}</div>}
    </div>
  );
}



