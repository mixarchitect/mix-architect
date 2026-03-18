"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format-money";
import { useLocale } from "next-intl";
import { ChevronRight, ChevronDown, ArrowUp, ArrowDown, DollarSign } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { PaymentRelease } from "@/lib/db-types";

type Props = {
  releases: PaymentRelease[];
  currency: string;
};

type SortKey = "title" | "date" | "artist" | "fee" | "time" | "expenses" | "total" | "paid" | "balance" | "status";
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

function formatShortDate(iso: string, locale: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
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
  const locale = useLocale();
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
          return dir * ((a.feeTotal + a.timeBillable + a.expenseTotal - a.paidAmount) - (b.feeTotal + b.timeBillable + b.expenseTotal - b.paidAmount));
        case "time":
          return dir * (a.timeHours - b.timeHours);
        case "expenses":
          return dir * (a.expenseTotal - b.expenseTotal);
        case "total":
          return dir * ((a.feeTotal + a.timeBillable + a.expenseTotal) - (b.feeTotal + b.timeBillable + b.expenseTotal));
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
  const totalTimeHours = releases.reduce((sum, r) => sum + r.timeHours, 0);
  const totalTimeBillable = releases.reduce((sum, r) => sum + r.timeBillable, 0);
  const totalExpenses = releases.reduce((sum, r) => sum + r.expenseTotal, 0);
  const totalBilled = totalFee + totalTimeBillable + totalExpenses;
  const totalBalance = totalBilled - totalPaid;

  if (releases.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        size="md"
        title="No payments tracked"
        description="Add payment milestones to track what's owed and what's been collected."
      />
    );
  }

  const thClass =
    "px-3 py-3 font-medium cursor-pointer select-none hover:text-text transition-colors whitespace-nowrap";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-faint uppercase tracking-wide">
            <th className="px-3 py-3 font-medium print:hidden w-8" />
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
            <th className={cn(thClass, "text-right hidden lg:table-cell")} onClick={() => handleSort("time")}>
              Time <SortArrow column="time" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={cn(thClass, "text-right hidden lg:table-cell")} onClick={() => handleSort("expenses")}>
              Expenses <SortArrow column="expenses" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={cn(thClass, "text-right")} onClick={() => handleSort("total")}>
              Total <SortArrow column="total" sortKey={sortKey} sortDir={sortDir} />
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
          const balance = r.feeTotal + r.timeBillable + r.expenseTotal - r.paidAmount;
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
                <td className="px-3 py-4 print:hidden w-8">
                  {hasTracks && (
                    isExpanded
                      ? <ChevronDown size={14} className="text-muted" />
                      : <ChevronRight size={14} className="text-muted" />
                  )}
                </td>
                <td className="px-3 py-4 font-medium text-text">
                  <Link
                    href={`/app/releases/${r.id}?tab=financials`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-signal transition-colors"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="px-3 py-4 text-muted hidden sm:table-cell whitespace-nowrap">
                  {formatShortDate(r.createdAt, locale)}
                </td>
                <td className="px-3 py-4 text-muted hidden sm:table-cell">{r.artist ?? "—"}</td>
                <td className="px-3 py-4 text-right whitespace-nowrap text-text">
                  {formatMoney(r.feeTotal, r.feeCurrency, locale)}
                </td>
                <td className="px-3 py-4 text-right whitespace-nowrap hidden lg:table-cell text-text">
                  {r.timeBillable > 0 ? (
                    <>
                      {formatMoney(r.timeBillable, r.feeCurrency, locale)}
                      <span className="text-[10px] text-muted ml-1">
                        {r.timeHours.toFixed(1)}h
                      </span>
                    </>
                  ) : r.timeHours > 0 ? (
                    <span className="text-muted">
                      {r.timeHours.toFixed(1)}h
                    </span>
                  ) : <span className="text-muted">—</span>}
                </td>
                <td className="px-3 py-4 text-right whitespace-nowrap hidden lg:table-cell text-muted">
                  {r.expenseTotal > 0
                    ? formatMoney(r.expenseTotal, r.feeCurrency, locale)
                    : "—"}
                </td>
                <td className="px-3 py-4 text-right whitespace-nowrap font-medium text-green-400">
                  {formatMoney(r.feeTotal + r.timeBillable + r.expenseTotal, r.feeCurrency, locale)}
                </td>
                <td className="px-3 py-4 text-right whitespace-nowrap text-red-400">
                  {r.paidAmount > 0
                    ? `−${formatMoney(r.paidAmount, r.feeCurrency, locale)}`
                    : "—"}
                </td>
                <td className="px-3 py-4 text-right whitespace-nowrap hidden sm:table-cell">
                  <span className={balance > 0 ? "text-amber-400" : "text-muted"}>
                    {formatMoney(balance, r.feeCurrency, locale)}
                  </span>
                </td>
                <td className="px-3 py-4">
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
                      <td className="px-3 py-2 pl-8 text-muted" colSpan={3}>
                        <span className="mr-2">
                          {String(t.trackNumber).padStart(2, "0")}
                        </span>
                        {t.title}
                      </td>
                      <td className="px-3 py-2 text-right text-muted">
                        {formatMoney(t.fee!, r.feeCurrency, locale)}
                      </td>
                      <td className="hidden lg:table-cell" />
                      <td className="hidden lg:table-cell" />
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2 text-right text-muted">
                        {t.feePaid ? `−${formatMoney(t.fee!, r.feeCurrency, locale)}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-muted hidden sm:table-cell">
                        {t.feePaid ? "—" : formatMoney(t.fee!, r.feeCurrency, locale)}
                      </td>
                      <td className="px-3 py-2">
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
            <td className="px-3 py-3">Total</td>
            <td className="hidden sm:table-cell" />
            <td className="hidden sm:table-cell" />
            <td className="px-3 py-3 text-right whitespace-nowrap">
              {formatMoney(totalFee, currency, locale)}
            </td>
            <td className="px-3 py-3 text-right whitespace-nowrap hidden lg:table-cell">
              {totalTimeBillable > 0 ? (
                <>
                  {formatMoney(totalTimeBillable, currency, locale)}
                  <span className="text-xs font-normal text-muted ml-1">
                    {totalTimeHours.toFixed(1)}h
                  </span>
                </>
              ) : totalTimeHours > 0 ? (
                <span className="font-normal text-muted">
                  {totalTimeHours.toFixed(1)}h
                </span>
              ) : "—"}
            </td>
            <td className="px-3 py-3 text-right whitespace-nowrap hidden lg:table-cell">
              {totalExpenses > 0
                ? formatMoney(totalExpenses, currency, locale)
                : "—"}
            </td>
            <td className="px-3 py-3 text-right whitespace-nowrap text-green-400">
              {formatMoney(totalBilled, currency, locale)}
            </td>
            <td className="px-3 py-3 text-right whitespace-nowrap text-red-400">
              {totalPaid > 0
                ? `−${formatMoney(totalPaid, currency, locale)}`
                : "—"}
            </td>
            <td className="px-3 py-3 text-right whitespace-nowrap hidden sm:table-cell">
              <span className={totalBalance > 0 ? "text-amber-400" : "text-muted"}>
                {formatMoney(totalBalance, currency, locale)}
              </span>
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
