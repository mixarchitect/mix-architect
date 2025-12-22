import * as React from "react";
import { cn } from "@/lib/cn";

type DataGridProps = React.HTMLAttributes<HTMLDivElement>;

export function DataGrid({ className, ...props }: DataGridProps) {
  return <div className={cn("data-grid", className)} {...props} />;
}

type DataCellProps = {
  label: string;
  value: string;
  unit?: string;
  size?: "default" | "small";
  className?: string;
};

export function DataCell({
  label,
  value,
  unit,
  size = "default",
  className,
}: DataCellProps) {
  return (
    <div className={cn("data-cell", className)}>
      <span className="data-label">{label}</span>
      <span className={size === "small" ? "data-value-sm" : "data-value"}>
        {value}
        {unit && <span className="text-[0.6em] ml-1 opacity-70">{unit}</span>}
      </span>
    </div>
  );
}



