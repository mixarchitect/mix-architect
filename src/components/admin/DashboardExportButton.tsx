"use client";

import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/csv-export";

interface DashboardMetrics {
  period: string;
  totalUsers: number;
  activePro: number;
  newSignups: number;
  mrr: string;
  conversionRate: string;
  churnRate: string;
  openChurnSignals: number;
  events: number;
}

export function DashboardExportButton({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <button
      onClick={() =>
        downloadCsv(
          [
            {
              Period: metrics.period,
              "Total Users": metrics.totalUsers,
              "Active Pro": metrics.activePro,
              "New Signups": metrics.newSignups,
              MRR: metrics.mrr,
              "Conversion Rate": metrics.conversionRate,
              "Churn Rate": metrics.churnRate,
              "Open Churn Signals": metrics.openChurnSignals,
              Events: metrics.events,
            },
          ],
          `dashboard-${metrics.period.replace(/\s/g, "-").toLowerCase()}.csv`,
        )
      }
      className="p-1.5 rounded-md text-muted hover:text-text hover:bg-panel2 transition-colors"
      title="Export metrics as CSV"
    >
      <Download size={14} />
    </button>
  );
}
