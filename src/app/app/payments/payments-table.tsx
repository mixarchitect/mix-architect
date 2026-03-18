"use client";

import { useState, useMemo } from "react";
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

type SortKey = "title" | "date" | "artist" | "fee" | "paid" | "balance" | "time" | "expenses" | "status";
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
  const totalBalance = totalFee + totalTimeBillable + totalExpenses - totalPaid;

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
            <th className={cn(thClass, "text-right hidden lg:table-cell")} onClick={() => handleSort("time")}>
              Time <SortArrow column="time" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={cn(thClass, "text-right hidden lg:table-cell")} onClick={() => handleSort("expenses")}>
              Expenses <SortArrow column="expenses" sortKey={sortKey} sortDir={sortDir} />
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
                <td className="px-4 py-3 print:hidden w-8">
                  {hasTracks && (
                    isExpanded
                      ? <ChevronDown size={14} className="text-muted" />
                      : <ChevronRight size={14} className="text-muted" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-text">{r.title}</td>
                <td className="px-4 py-3 text-muted hidden sm:table-cell whitespace-nowrap">
                  {formatShortDate(r.createdAt, locale)}
                </td>
                <td className="px-4 py-3 text-muted hidden sm:table-cell">{r.artist ?? "—"}</td>
                <td className="px-4 py-3 text-right text-text">
                  {formatMoney(r.feeTotal, r.feeCurrency, locale)}
                </td>
                <td className="px-4 py-3 text-right hidden lg:table-cell text-muted">
                  {r.timeHours > 0 ? (
                    <span>
                      {r.timeHours.toFixed(2)} hrs
                      {r.timeBillable > 0 && (
                        <span className="block text-[10px]">
                          {formatMoney(r.timeBillable, r.feeCurrency, locale)}
                        </span>
                      )}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-right hidden lg:table-cell text-muted">
                  {r.expenseTotal > 0
                    ? formatMoney(r.expenseTotal, r.feeCurrency, locale)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right text-text">
                  {formatMoney(r.paidAmount, r.feeCurrency, locale)}
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className={balance > 0 ? "text-signal" : "text-muted"}>
                    {formatMoney(balance, r.feeCurrency, locale)}
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
                        <span className="mr-2">
                          {String(t.trackNumber).padStart(2, "0")}
                        </span>
                        {t.title}
                      </td>
                      <td className="px-4 py-2 text-right text-muted">
                        {formatMoney(t.fee!, r.feeCurrency, locale)}
                      </td>
                      <td className="hidden lg:table-cell" />
                      <td className="hidden lg:table-cell" />
                      <td className="px-4 py-2 text-right text-muted">
                        {t.feePaid ? formatMoney(t.fee!, r.feeCurrency, locale) : "—"}
                      </td>
                      <td className="px-4 py-2 text-right text-muted hidden sm:table-cell">
                        {t.feePaid ? "—" : formatMoney(t.fee!, r.feeCurrency, locale)}
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
            <td className="px-4 py-3 text-right">
              {formatMoney(totalFee, currency, locale)}
            </td>
            <td className="px-4 py-3 text-right hidden lg:table-cell">
              {totalTimeHours > 0 ? (
                <span>
                  {totalTimeHours.toFixed(2)} hrs
                  {totalTimeBillable > 0 && (
                    <span className="block text-xs font-normal text-muted">
                      {formatMoney(totalTimeBillable, currency, locale)}
                    </span>
                  )}
                </span>
              ) : "—"}
            </td>
            <td className="px-4 py-3 text-right hidden lg:table-cell">
              {totalExpenses > 0
                ? formatMoney(totalExpenses, currency, locale)
                : "—"}
            </td>
            <td className="px-4 py-3 text-right">
              {formatMoney(totalPaid, currency, locale)}
            </td>
            <td className="px-4 py-3 text-right hidden sm:table-cell">
              <span className={totalBalance > 0 ? "text-signal" : "text-muted"}>
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
