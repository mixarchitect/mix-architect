"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { DollarSign, TrendingUp, Calendar, FileText, Plus } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from "recharts";
import { DateRangeSelector } from "@/components/ui/date-range-selector";
import { resolvePreset, parseDateISO, type PresetKey } from "@/lib/admin-date-utils";
import type { QuoteRow } from "./page";

type Props = {
  quotes: QuoteRow[];
  releases: { id: string; title: string }[];
  currency: string;
  range: string;
  from?: string;
  to?: string;
};

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function fmt(amount: number, currency: string): string {
  if (amount === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

const PRESET_KEYS = ["today", "yesterday", "7d", "30d", "90d", "365d"] as const;

export function MoneyDashboard({ quotes, releases, currency, range, from, to }: Props) {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState({
    signal: "#0D9488",
    muted: "rgba(120,120,120,0.5)",
    faint: "rgba(120,120,120,0.3)",
    border: "rgba(120,120,120,0.1)",
    text: "#e8e8e8",
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setColors({
        signal: getCSSVar("--signal") || "#0D9488",
        muted: getCSSVar("--muted") || "rgba(120,120,120,0.5)",
        faint: getCSSVar("--faint") || "rgba(120,120,120,0.3)",
        border: getCSSVar("--border") || "rgba(120,120,120,0.1)",
        text: getCSSVar("--text") || "#e8e8e8",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  // ── Date range ──
  const isAllTime = range === "all";
  const dateRange = useMemo(() => {
    if (isAllTime) return null;
    if (PRESET_KEYS.includes(range as PresetKey)) {
      const p = resolvePreset(range as PresetKey);
      return { from: p.from, to: p.to };
    }
    if (from && to) {
      const f = parseDateISO(from);
      const t = parseDateISO(to);
      if (f && t) return { from: f, to: t };
    }
    return null;
  }, [range, from, to, isAllTime]);

  // ── Filter state ──
  const [typeFilter, setTypeFilter] = useState<"all" | "quote" | "invoice">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // ── Computed data ──
  const nonCancelled = quotes.filter((q) => q.status !== "cancelled");
  const paidQuotes = nonCancelled.filter((q) => q.status === "paid");
  const unpaidQuotes = nonCancelled.filter((q) => !["paid", "draft"].includes(q.status));

  // Paid quotes within the selected date range (for cards + charts)
  const rangedPaidQuotes = dateRange
    ? paidQuotes.filter((q) => {
        if (!q.paid_at) return false;
        const d = new Date(q.paid_at);
        return d >= dateRange.from && d <= dateRange.to;
      })
    : paidQuotes;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const outstanding = unpaidQuotes.reduce((s, q) => s + Number(q.total), 0);
  const unpaidCount = unpaidQuotes.length;

  const receivedThisMonth = paidQuotes
    .filter((q) => q.paid_at && new Date(q.paid_at) >= monthStart)
    .reduce((s, q) => s + Number(q.total), 0);
  const receivedLastMonth = paidQuotes
    .filter((q) => q.paid_at && new Date(q.paid_at) >= lastMonthStart && new Date(q.paid_at) <= lastMonthEnd)
    .reduce((s, q) => s + Number(q.total), 0);
  const monthPaymentCount = paidQuotes.filter((q) => q.paid_at && new Date(q.paid_at) >= monthStart).length;

  const receivedThisYear = paidQuotes
    .filter((q) => q.paid_at && new Date(q.paid_at) >= yearStart)
    .reduce((s, q) => s + Number(q.total), 0);
  const yearPaymentCount = paidQuotes.filter((q) => q.paid_at && new Date(q.paid_at) >= yearStart).length;

  const totalBilled = nonCancelled.reduce((s, q) => s + Number(q.total), 0);
  const sentCount = nonCancelled.filter((q) => q.status !== "draft").length;

  // Ranged totals
  const receivedInRange = rangedPaidQuotes.reduce((s, q) => s + Number(q.total), 0);
  const rangedPaymentCount = rangedPaidQuotes.length;

  // Month-over-month comparison (only used in all-time mode)
  let monthCompare = "";
  if (receivedLastMonth > 0) {
    const pct = Math.round(((receivedThisMonth - receivedLastMonth) / receivedLastMonth) * 100);
    monthCompare = pct >= 0 ? `+${pct}% vs last month` : `${pct}% vs last month`;
  } else if (receivedThisMonth > 0) {
    monthCompare = `${monthPaymentCount} payment${monthPaymentCount !== 1 ? "s" : ""}`;
  }

  // ── Monthly revenue chart data ──
  const monthlyData = useMemo(() => {
    const months: { label: string; key: string; amount: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      months.push({ label, key, amount: 0, count: 0 });
    }
    for (const q of rangedPaidQuotes) {
      if (!q.paid_at) continue;
      const pd = new Date(q.paid_at);
      const key = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, "0")}`;
      const entry = months.find((m) => m.key === key);
      if (entry) {
        entry.amount += Number(q.total);
        entry.count++;
      }
    }
    return months;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes, rangedPaidQuotes]);

  // ── Client breakdown ──
  const clientData = useMemo(() => {
    const byClient: Record<string, { amount: number; count: number }> = {};
    for (const q of rangedPaidQuotes) {
      const name = q.client_name || "Unknown";
      if (!byClient[name]) byClient[name] = { amount: 0, count: 0 };
      byClient[name].amount += Number(q.total);
      byClient[name].count++;
    }
    const sorted = Object.entries(byClient)
      .sort(([, a], [, b]) => b.amount - a.amount);
    const top5 = sorted.slice(0, 5).map(([name, d]) => ({ name, ...d }));
    const otherAmount = sorted.slice(5).reduce((s, [, d]) => s + d.amount, 0);
    const otherCount = sorted.slice(5).reduce((s, [, d]) => s + d.count, 0);
    if (otherAmount > 0) top5.push({ name: "Other", amount: otherAmount, count: otherCount });
    return { entries: top5, totalClients: sorted.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes]);

  const totalPaidAll = rangedPaidQuotes.reduce((s, q) => s + Number(q.total), 0);

  // ── Filtered document list ──
  const releaseMap = new Map(releases.map((r) => [r.id, r.title]));

  const filteredQuotes = quotes.filter((q) => {
    if (typeFilter !== "all" && (q.document_type ?? "quote") !== typeFilter) return false;
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const relTitle = q.release_id ? (releaseMap.get(q.release_id) ?? "") : "";
      if (
        !q.quote_number.toLowerCase().includes(s) &&
        !(q.client_name ?? "").toLowerCase().includes(s) &&
        !relTitle.toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-text">Money</h1>
        <DateRangeSelector
          range={range === "all" ? "365d" : range}
          from={from}
          to={to}
          basePath="/app/money"
          variant="app"
          showCompare={false}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DollarSign}
          label="Outstanding"
          value={fmt(outstanding, currency)}
          sub={unpaidCount > 0 ? `${unpaidCount} unpaid` : "All clear"}
          color={outstanding > 0 ? "text-amber-400" : undefined}
        />
        <StatCard
          icon={TrendingUp}
          label={dateRange ? "Received in Range" : "Received This Month"}
          value={fmt(dateRange ? receivedInRange : receivedThisMonth, currency)}
          sub={dateRange ? `${rangedPaymentCount} payment${rangedPaymentCount !== 1 ? "s" : ""}` : (monthCompare || "No payments yet")}
          color="text-teal-400"
        />
        <StatCard
          icon={Calendar}
          label="Received This Year"
          value={fmt(receivedThisYear, currency)}
          sub={`${yearPaymentCount} payment${yearPaymentCount !== 1 ? "s" : ""}`}
          color="text-teal-400"
        />
        <StatCard
          icon={FileText}
          label="Total Billed"
          value={fmt(totalBilled, currency)}
          sub={`${sentCount} document${sentCount !== 1 ? "s" : ""} sent`}
        />
      </div>

      {/* Charts */}
      {paidQuotes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue */}
          <ChartCard title="Monthly Revenue" description="Payments received per month">
            {monthlyData.some((m) => m.amount > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: colors.faint }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: colors.faint }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => fmt(v, currency)}
                  />
                  <ReTooltip
                    contentStyle={{
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value) => [fmt(Number(value), currency), "Revenue"]}
                  />
                  <Bar dataKey="amount" fill={colors.signal} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Revenue will appear here as payments come in" />
            )}
          </ChartCard>

          {/* Client Breakdown */}
          <ChartCard title="Client Breakdown" description="Top clients by revenue">
            {clientData.totalClients >= 2 ? (
              <div className="space-y-3">
                {clientData.entries.map((c) => {
                  const pct = totalPaidAll > 0 ? (c.amount / totalPaidAll) * 100 : 0;
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-text font-medium truncate">{c.name}</span>
                        <span className="text-muted shrink-0 ml-2">
                          {fmt(c.amount, currency)} · {c.count} doc{c.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-panel2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${Math.max(pct, 2)}%`, opacity: Math.max(0.4, 1 - clientData.entries.indexOf(c) * 0.15) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyChart message="Client breakdown appears after working with multiple clients" />
            )}
          </ChartCard>
        </div>
      )}

      {/* Document List */}
      <div className="bg-panel border border-border rounded-lg">
        {/* Filter bar */}
        <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-3">
          {/* Type filter */}
          <div className="flex gap-1">
            {(["all", "quote", "invoice"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                  typeFilter === t
                    ? "bg-signal text-white"
                    : "bg-panel2 text-muted hover:text-text",
                )}
              >
                {t === "all" ? "All" : t === "quote" ? "Quotes" : "Invoices"}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-xs h-7 px-2 w-auto"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="accepted">Accepted</option>
            <option value="paid">Paid</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="input text-xs h-7 px-2 w-40"
          />

          <div className="ml-auto">
            <Link
              href="/app/quotes/new"
              className="inline-flex items-center gap-1 text-xs text-signal hover:text-text transition-colors"
            >
              <Plus size={12} />
              New
            </Link>
          </div>
        </div>

        {/* Table */}
        {filteredQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-faint">
                  <th className="text-left px-4 py-2 font-medium">#</th>
                  <th className="text-left px-4 py-2 font-medium">Release</th>
                  <th className="text-left px-4 py-2 font-medium">Client</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Total</th>
                  <th className="text-left px-4 py-2 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((q) => {
                  const relTitle = q.release_id ? (releaseMap.get(q.release_id) ?? "\u2014") : "\u2014";
                  const isOverdue = q.due_date && q.due_date < today && q.status !== "paid" && q.status !== "cancelled";
                  const docType = (q.document_type ?? "quote") === "invoice" ? "INV" : "Q";

                  return (
                    <tr
                      key={q.id}
                      className="border-b border-border hover:bg-panel2 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={q.release_id ? `/app/releases/${q.release_id}/quotes/${q.id}` : "#"}
                          className="text-text font-medium hover:text-signal transition-colors"
                        >
                          {q.quote_number}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted max-w-[160px] truncate">
                        {q.release_id ? (
                          <Link href={`/app/releases/${q.release_id}`} className="hover:text-text transition-colors">
                            {relTitle}
                          </Link>
                        ) : "\u2014"}
                      </td>
                      <td className="px-4 py-2.5 text-muted">{q.client_name ?? "\u2014"}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide",
                          STATUS_STYLES[q.status] ?? "bg-zinc-500/10 text-zinc-400",
                        )}>
                          {q.status}
                        </span>
                        {isOverdue && (
                          <span className="ml-1.5 text-[10px] font-medium text-red-400">Overdue</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-text font-medium tabular-nums">
                        {fmt(Number(q.total), q.currency)}
                      </td>
                      <td className={cn("px-4 py-2.5 text-xs", isOverdue ? "text-red-400" : "text-muted")}>
                        {q.due_date ? new Date(q.due_date).toLocaleDateString() : "\u2014"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-muted">No quotes or invoices yet</p>
            <p className="text-xs text-faint mt-1">Create your first quote from any release&apos;s Money tab</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400",
  sent: "bg-blue-500/10 text-blue-400",
  viewed: "bg-amber-500/10 text-amber-400",
  accepted: "bg-teal-500/10 text-teal-400",
  paid: "bg-green-500/10 text-green-400",
  expired: "bg-zinc-500/10 text-zinc-500",
  cancelled: "bg-red-500/10 text-red-400",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  sub: string;
  color?: string;
}) {
  return (
    <div className="px-4 py-3 rounded-lg border border-border bg-panel">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} strokeWidth={1.5} className="text-muted" />
        <span className="text-[10px] uppercase tracking-wide text-faint font-medium">{label}</span>
      </div>
      <div className={cn("text-lg font-semibold", color ?? "text-text")}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{sub}</div>
    </div>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-panel border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-text mb-0.5">{title}</h3>
      <p className="text-xs text-muted mb-4">{description}</p>
      {children}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-xs text-muted">
      {message}
    </div>
  );
}
