"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { IconButton } from "@/components/ui/button";

export function CalendarExportButton({ releaseId }: { releaseId: string }) {
  const t = useTranslations("releaseDetail");
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/releases/${releaseId}/calendar`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error("[calendar] export failed:", body?.error || res.status);
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] ?? "release.ics";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <IconButton
      size="sm"
      onClick={handleExport}
      disabled={loading}
      title={t("exportToCalendar")}
    >
      <CalendarDays size={14} />
    </IconButton>
  );
}
