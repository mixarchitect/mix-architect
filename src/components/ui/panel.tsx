import * as React from "react";
import { cn } from "@/lib/cn";

type PanelVariant = "default" | "float" | "inset" | "flat";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: PanelVariant;
};

export function Panel({ className, variant = "default", ...props }: PanelProps) {
  return (
    <section
      className={cn(
        "relative bg-panel border border-border rounded-lg",
        variant === "default" && "shadow-DEFAULT",
        variant === "float" && "shadow-float",
        variant === "inset" && "bg-panel2 shadow-none",
        variant === "flat" && "shadow-none border-transparent",
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
