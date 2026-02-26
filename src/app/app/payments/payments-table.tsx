"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format-money";
import { ChevronRight, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import type { PaymentRelease } from "@/lib/db-types";

type Props = {
  releases: PaymentRelease[];
  currency: string;
};

type SortKey = "title" | "date" | "artist" | "fee" | "paid" | "balance" | "status";
type SortDir = "asc" | "desc";

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

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function SortArrow({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return null;
  return sortDir === "asc" ? (
    <ArrowUp size={12} className="inline ml-0.5" />
  ) : (
    <ArrowDown size={12} className="inline ml-0.5" />
  );
}

export function PaymentsTable({ releases, currency }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedReleases = useMemo(() => {
    const sorted = [...releases];
    const dir = sortDir === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      switch (sortKey) {
        case "title":
          return dir * a.title.localeCompare(b.title);
        case "date":
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case "artist":
          return dir * (a.artist ?? "").localeCompare(b.artist ?? "");
        case "fee":
          return dir * (a.feeTotal - b.feeTotal);
        case "paid":
          return dir * (a.paidAmount - b.paidAmount);
        case "balance":
          return dir * ((a.feeTotal - a.paidAmount) - (b.feeTotal - b.paidAmount));
        case "status":
          return dir * a.paymentStatus.localeCompare(b.paymentStatus);
        default:
          return 0;
      }
    });

    return sorted;
  }, [releases, sortKey, sortDir]);

  // Totals
  const totalFee = releases.reduce((sum, r) => sum + r.feeTotal, 0);
  const totalPaid = releases.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalBalance = totalFee - totalPaid;

  if (releases.length === 0) {
    return (
      <div className="p-8 text-center text-muted text-sm">
        No releases with fees yet.
      </div>
    );
  }

  const thClass =
    "px-4 py-3 font-medium cursor-pointer select-none hover:text-text transition-colors";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-faint uppercase tracking-wide">
            <th className="px-4 py-3 font-medium print:hidden w-8" />
            <th className={thClass} onClick={() => handleSort("title")}>
              Release <SortArrow column="title" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={cn(thClass, "hidden sm:table-cell")} onClick={() => handleSort("date")}>
              Date <SortArrow column="date" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={cn(thClass, "hidden sm:table-cell")} onClick={() => handleSort("artist")}>
              Artist <SortArrow column="artist" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={cn(thClass, "text-right")} onClick={() => handleSort("fee")}>
              Fee <SortArrow column="fee" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={cn(thClass, "text-right")} onClick={() => handleSort("paid")}>
              Paid <SortArrow column="paid" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={cn(thClass, "text-right hidden sm:table-cell")} onClick={() => handleSort("balance")}>
              Balance <SortArrow column="balance" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={thClass} onClick={() => handleSort("status")}>
              Status <SortArrow column="status" sortKey={sortKey} sortDir={sortDir} />
            </th>
          </tr>
        </thead>
        {sortedReleases.map((r) => {
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
                <td className="px-4 py-3 text-muted hidden sm:table-cell whitespace-nowrap">
                  {formatShortDate(r.createdAt)}
                </td>
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
                      <td className="px-4 py-2 pl-8 text-muted" colSpan={3}>
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
        <tfoot>
          <tr className="border-t-2 border-border font-semibold text-text">
            <td className="print:hidden" />
            <td className="px-4 py-3">Total</td>
            <td className="hidden sm:table-cell" />
            <td className="hidden sm:table-cell" />
            <td className="px-4 py-3 text-right font-mono">
              {formatMoney(totalFee, currency)}
            </td>
            <td className="px-4 py-3 text-right font-mono">
              {formatMoney(totalPaid, currency)}
            </td>
            <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">
              <span className={totalBalance > 0 ? "text-signal" : "text-muted"}>
                {formatMoney(totalBalance, currency)}
              </span>
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
