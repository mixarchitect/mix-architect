"use client";

import { cn } from "@/lib/cn";

type Props = {
  status: "idle" | "saving" | "saved" | "error";
  className?: string;
};

export function AutoSaveIndicator({ status, className }: Props) {
  if (status === "idle") return null;

  return (
    <span
      className={cn(
        "text-xs font-mono transition-opacity",
        status === "saving" && "text-muted animate-pulse",
        status === "saved" && "text-status-green",
        status === "error" && "text-signal",
        className
      )}
    >
      {status === "saving" && "Saving\u2026"}
      {status === "saved" && "Saved"}
      {status === "error" && "Error saving"}
    </span>
  );
}
