"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CalendarExportButton({ releaseId }: { releaseId: string }) {
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
    <Button
      variant="secondary"
      className="h-8 w-8 p-0"
      onClick={handleExport}
      disabled={loading}
      title="Export to calendar"
    >
      <CalendarDays size={14} />
    </Button>
  );
}
