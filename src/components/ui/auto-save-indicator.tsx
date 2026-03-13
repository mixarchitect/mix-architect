"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

type Props = {
  status: "idle" | "saving" | "saved" | "error";
  className?: string;
};

export function AutoSaveIndicator({ status, className }: Props) {
  const t = useTranslations("autoSave");

  if (status === "idle") return null;

  return (
    <span
      className={cn(
        "text-xs transition-opacity",
        status === "saving" && "text-muted animate-pulse",
        status === "saved" && "text-status-green",
        status === "error" && "text-signal",
        className
      )}
    >
      {status === "saving" && t("saving")}
      {status === "saved" && t("saved")}
      {status === "error" && t("error")}
    </span>
  );
}
