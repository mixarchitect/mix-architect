import * as React from "react";
import { cn } from "@/lib/cn";

type AccentPanelProps = React.HTMLAttributes<HTMLDivElement>;

export function AccentPanel({ className, children, ...props }: AccentPanelProps) {
  return (
    <div className={cn("panel-accent p-6", className)} {...props}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function AccentPanelHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function AccentPanelBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}


