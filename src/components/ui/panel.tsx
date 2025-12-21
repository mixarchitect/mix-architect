import * as React from "react";
import { cn } from "@/lib/cn";

type PanelVariant = "default" | "inset" | "flat";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: PanelVariant;
};

export function Panel({ className, variant = "default", ...props }: PanelProps) {
  return (
    <section
      className={cn(
        "relative bg-panel border border-border rounded-lg",
        // Default has shadow + inner highlight
        variant === "default" && "shadow-paper-inset",
        // Inset is for nested sections (subtle, no shadow)
        variant === "inset" && "bg-panel2 shadow-none",
        // Flat has no shadow (for inside other panels)
        variant === "flat" && "shadow-none",
        className
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6 pb-4", className)} {...props} />;
}

export function PanelBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}
