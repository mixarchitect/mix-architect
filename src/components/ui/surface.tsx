import * as React from "react";
import { cn } from "@/lib/cn";

export function Surface({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-stroke bg-surface/70 shadow-panel backdrop-blur-md",
        "transition duration-200 hover:border-strokeHover hover:shadow-panel2",
        className
      )}
      {...props}
    />
  );
}

export function SurfaceHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 pt-5 pb-3 border-b border-stroke", className)}
      {...props}
    />
  );
}

export function SurfaceBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

