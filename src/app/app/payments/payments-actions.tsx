"use client";

import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import type { PaymentRelease, PaymentSummary } from "@/lib/db-types";

type Props = {
  releases: PaymentRelease[];
  summary: PaymentSummary;
};

function escapeCSV(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function PaymentsActions({ releases, summary }: Props) {
  function handleExportCSV() {
    const BOM = "\uFEFF";
    const headers = ["Release", "Date", "Artist", "Fee", "Paid", "Outstanding", "Status", "Notes"];
    const rows: string[][] = [];

    for (const r of releases) {
      const balance = r.feeTotal - r.paidAmount;
      const date = new Date(r.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      });
      rows.push([
        r.title,
        date,
        r.artist ?? "",
        r.feeTotal.toFixed(2),
        r.paidAmount.toFixed(2),
        balance.toFixed(2),
        r.paymentStatus,
        r.paymentNotes ?? "",
      ]);

      for (const t of r.tracks) {
        if (t.fee != null) {
          rows.push([
            `  Track ${t.trackNumber}: ${t.title}`,
            "",
            "",
            t.fee.toFixed(2),
            t.feePaid ? t.fee.toFixed(2) : "0.00",
            t.feePaid ? "0.00" : t.fee.toFixed(2),
            t.feePaid ? "paid" : "unpaid",
            "",
          ]);
        }
      }
    }

    // Summary row
    rows.push([]);
    rows.push([
      "TOTAL",
      "",
      "",
      summary.grandTotal.toFixed(2),
      summary.earnedTotal.toFixed(2),
      summary.outstandingTotal.toFixed(2),
      "",
      "",
    ]);

    const csvContent =
      BOM +
      [headers.map(escapeCSV).join(","), ...rows.map((row) => row.map(escapeCSV).join(","))].join(
        "\n",
      );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="secondary" onClick={handleExportCSV}>
        <Download size={16} />
        Export CSV
      </Button>
      <Button variant="primary" onClick={handlePrint}>
        <Printer size={16} />
        Download PDF
      </Button>
    </div>
  );
}
