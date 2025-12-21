import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * @deprecated Use Panel instead for consistency
 */
export function Surface({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-panel shadow-paper-inset",
        className
      )}
      {...props}
    />
  );
}

/**
 * @deprecated Use PanelHeader instead for consistency
 */
export function SurfaceHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 pt-6 pb-4 border-b border-border", className)}
      {...props}
    />
  );
}

/**
 * @deprecated Use PanelBody instead for consistency
 */
export function SurfaceBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}
