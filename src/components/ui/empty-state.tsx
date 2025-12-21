import * as React from "react";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-panel2 px-5 py-6 text-center",
        className
      )}
    >
      <div className="text-sm font-semibold text-text">{title}</div>
      {description && (
        <p className="text-xs text-muted mt-2 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

