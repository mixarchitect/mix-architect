"use client";

import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/csv-export";

export function AttributionsExportButton({
  rows,
  disabled,
}: {
  rows: Record<string, unknown>[];
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => downloadCsv(rows, `attributions-${new Date().toISOString().slice(0, 10)}.csv`)}
      disabled={disabled}
      className="p-1.5 rounded-md text-muted hover:text-text hover:bg-panel2 transition-colors disabled:opacity-40 disabled:pointer-events-none"
      title="Export attributions as CSV"
    >
      <Download size={14} />
    </button>
  );
}
