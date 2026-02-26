"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format-money";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { PaymentRelease } from "@/lib/db-types";

type Props = {
  releases: PaymentRelease[];
  currency: string;
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide",
        status === "paid" && "bg-green-500/10 text-green-400",
        status === "partial" && "bg-amber-500/10 text-amber-400",
        status === "unpaid" && "bg-zinc-500/10 text-zinc-400",
      )}
    >
      {status}
    </span>
  );
}

export function PaymentsTable({ releases, currency }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (releases.length === 0) {
    return (
      <div className="p-8 text-center text-muted text-sm">
        No releases with fees yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-faint uppercase tracking-wide">
            <th className="px-4 py-3 font-medium print:hidden w-8" />
            <th className="px-4 py-3 font-medium">Release</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Artist</th>
            <th className="px-4 py-3 font-medium text-right">Fee</th>
            <th className="px-4 py-3 font-medium text-right">Paid</th>
            <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Balance</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        {releases.map((r) => {
            const isExpanded = expandedIds.has(r.id);
            const balance = r.feeTotal - r.paidAmount;
            const hasTracks = r.tracks.some((t) => t.fee != null);

            return (
              <tbody key={r.id} className="print:break-inside-avoid">
                {/* Release row */}
                <tr
                  onClick={() => hasTracks && toggleExpand(r.id)}
                  className={cn(
                    "border-b border-border transition-colors",
                    hasTracks && "cursor-pointer hover:bg-panel2",
                  )}
                >
                  <td className="px-4 py-3 print:hidden w-8">
                    {hasTracks && (
                      isExpanded
                        ? <ChevronDown size={14} className="text-muted" />
                        : <ChevronRight size={14} className="text-muted" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-text">{r.title}</td>
                  <td className="px-4 py-3 text-muted hidden sm:table-cell">{r.artist ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-mono text-text">
                    {formatMoney(r.feeTotal, r.feeCurrency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text">
                    {formatMoney(r.paidAmount, r.feeCurrency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">
                    <span className={balance > 0 ? "text-signal" : "text-muted"}>
                      {formatMoney(balance, r.feeCurrency)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.paymentStatus} />
                  </td>
                </tr>

                {/* Track sub-rows (expanded or print) */}
                {hasTracks &&
                  r.tracks
                    .filter((t) => t.fee != null)
                    .map((t) => (
                      <tr
                        key={t.id}
                        className={cn(
                          "border-b border-border/50 bg-panel2/50 text-xs",
                          !isExpanded && "hidden print:table-row",
                        )}
                      >
                        <td className="print:hidden" />
                        <td className="px-4 py-2 pl-8 text-muted" colSpan={2}>
                          <span className="font-mono mr-2">
                            {String(t.trackNumber).padStart(2, "0")}
                          </span>
                          {t.title}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-muted">
                          {formatMoney(t.fee!, r.feeCurrency)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-muted">
                          {t.feePaid ? formatMoney(t.fee!, r.feeCurrency) : "—"}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-muted hidden sm:table-cell">
                          {t.feePaid ? "—" : formatMoney(t.fee!, r.feeCurrency)}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge status={t.feePaid ? "paid" : "unpaid"} />
                        </td>
                      </tr>
                    ))}
              </tbody>
            );
          })}
      </table>
    </div>
  );
}
