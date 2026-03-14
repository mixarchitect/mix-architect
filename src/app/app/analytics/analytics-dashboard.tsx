"use client";

import type { AnalyticsSummary } from "@/types/analytics";
import { DateRangeSelector } from "@/components/ui/date-range-selector";
import { BarChart3, Clock, DollarSign, Users } from "lucide-react";

type Props = {
  summary: AnalyticsSummary;
  from: string;
  to: string;
  range: string;
  compare?: string;
};

export function AnalyticsDashboard({ summary, from, to, range, compare }: Props) {
  const { releaseVelocity, turnaround, revenue, clients } = summary;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-text">Analytics</h1>
        <DateRangeSelector
          range={range}
          from={from}
          to={to}
          compare={compare}
          basePath="/app/analytics"
          variant="app"
          showCompare={false}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BarChart3}
          label="Completed Releases"
          value={String(releaseVelocity.totalCompleted)}
          sub={`${releaseVelocity.avgPerMonth}/mo avg`}
        />
        <StatCard
          icon={Clock}
          label="Avg Turnaround"
          value={turnaround.avgDays > 0 ? `${turnaround.avgDays}d` : "N/A"}
          sub={
            turnaround.avgDays > 0
              ? `${turnaround.fastestDays}d fastest, ${turnaround.slowestDays}d slowest`
              : "No completed releases"
          }
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(revenue.totalRevenue, revenue.currency)}
          sub={
            revenue.totalOutstanding > 0
              ? `${formatCurrency(revenue.totalOutstanding, revenue.currency)} outstanding`
              : "All paid"
          }
        />
        <StatCard
          icon={Users}
          label="Clients"
          value={String(clients.filter((c) => c.clientName !== "No client").length)}
          sub={`${clients.reduce((a, b) => a + b.releaseCount, 0)} releases total`}
        />
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartPlaceholder
          title="Release Velocity"
          description="Completed releases per month"
          series={releaseVelocity.series}
        />
        <ChartPlaceholder
          title="Turnaround Time"
          description="Average days to complete per month"
          series={turnaround.series}
        />
        <ChartPlaceholder
          title="Revenue"
          description={`Total fee earned per month (${revenue.currency})`}
          series={revenue.series}
        />
      </div>

      {/* Client table */}
      {clients.length > 0 && (
        <div className="bg-panel border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-text">Client Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-faint">
                  <th className="px-4 py-2 font-medium">Client</th>
                  <th className="px-4 py-2 font-medium text-right">Releases</th>
                  <th className="px-4 py-2 font-medium text-right">Revenue</th>
                  <th className="px-4 py-2 font-medium text-right">Paid</th>
                  <th className="px-4 py-2 font-medium text-right">Avg Turnaround</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.clientName} className="border-t border-border">
                    <td className="px-4 py-2.5 text-text font-medium">{c.clientName}</td>
                    <td className="px-4 py-2.5 text-right text-muted">{c.releaseCount}</td>
                    <td className="px-4 py-2.5 text-right text-text">
                      {formatCurrency(c.totalRevenue, revenue.currency)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted">
                      {formatCurrency(c.totalPaid, revenue.currency)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted">
                      {c.avgTurnaroundDays != null ? `${c.avgTurnaroundDays}d` : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {releaseVelocity.totalCompleted === 0 && (
        <div className="text-center py-16">
          <BarChart3 size={40} strokeWidth={1} className="mx-auto text-muted mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">No completed releases yet</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Once you mark releases as ready, your analytics will appear here with
            velocity, turnaround time, revenue, and client insights.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="px-4 py-3 rounded-lg border border-border bg-panel">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} strokeWidth={1.5} className="text-muted" />
        <span className="text-[10px] uppercase tracking-wide text-faint font-medium">
          {label}
        </span>
      </div>
      <div className="text-lg font-semibold text-text">{value}</div>
      <div className="text-xs text-muted mt-0.5">{sub}</div>
    </div>
  );
}

/* ─── Chart Placeholder ──────────────────────────── */

function ChartPlaceholder({
  title,
  description,
  series,
}: {
  title: string;
  description: string;
  series: { month: string; label: string; value: number }[];
}) {
  const max = Math.max(...series.map((s) => s.value), 1);

  return (
    <div className="bg-panel border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-text mb-0.5">{title}</h3>
      <p className="text-xs text-muted mb-4">{description}</p>
      {series.length > 0 ? (
        <div className="flex items-end gap-1 h-32">
          {series.map((s) => (
            <div
              key={s.month}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full rounded-sm bg-signal/30"
                style={{
                  height: `${Math.max((s.value / max) * 100, 2)}%`,
                  minHeight: s.value > 0 ? 4 : 2,
                }}
                title={`${s.label}: ${s.value}`}
              />
              {series.length <= 12 && (
                <span className="text-[9px] text-faint truncate w-full text-center">
                  {s.label.split(" ")[0]}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-xs text-muted">
          No data for this period
        </div>
      )}
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────── */

function formatCurrency(amount: number, currency: string): string {
  if (amount === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
