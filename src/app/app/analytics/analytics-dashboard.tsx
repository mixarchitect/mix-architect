"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import type { AnalyticsSummary } from "@/types/analytics";
import { DateRangeSelector } from "@/components/ui/date-range-selector";
import { BarChart3, Clock, DollarSign, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Props = {
  summary: AnalyticsSummary;
  from: string;
  to: string;
  range: string;
  compare?: string;
};

/** Read a CSS custom property from :root */
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function AnalyticsDashboard({ summary, from, to, range, compare }: Props) {
  const { releaseVelocity, turnaround, revenue, clients } = summary;
  const { resolvedTheme } = useTheme();

  // Resolve theme colors for Recharts (canvas can't use CSS vars directly)
  const [colors, setColors] = useState({
    signal: "#0D9488",
    muted: "rgba(120,120,120,0.5)",
    faint: "rgba(120,120,120,0.3)",
    border: "rgba(120,120,120,0.1)",
    text: "#e8e8e8",
  });

  useEffect(() => {
    // Defer to ensure CSS vars are resolved after theme switch
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

      {/* Charts - only show when there's data */}
      {releaseVelocity.totalCompleted > 0 && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Release Velocity" description="Completed releases per month">
          {releaseVelocity.series.some((s) => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={releaseVelocity.series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                <XAxis
                  dataKey="label"
                  tickFormatter={(v: string) => v.split(" ")[0]}
                  tick={{ fontSize: 10, fill: colors.faint }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: colors.faint }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: colors.text, fontWeight: 600 }}
                  itemStyle={{ color: colors.muted }}
                  formatter={(val) => [Number(val), "Releases"]}
                />
                <Bar dataKey="value" fill={colors.signal} radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Turnaround Time" description="Average days to complete per month">
          {turnaround.series.some((s) => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={turnaround.series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                <XAxis
                  dataKey="label"
                  tickFormatter={(v: string) => v.split(" ")[0]}
                  tick={{ fontSize: 10, fill: colors.faint }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: colors.faint }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}d`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: colors.text, fontWeight: 600 }}
                  itemStyle={{ color: colors.muted }}
                  formatter={(val) => [`${Number(val)} days`, "Turnaround"]}
                />
                <Bar dataKey="value" fill={`${colors.signal}99`} radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard
          title="Revenue"
          description={`Total fee earned per month (${revenue.currency})`}
          className="lg:col-span-2"
        >
          {revenue.series.some((s) => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenue.series} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.signal} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors.signal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                <XAxis
                  dataKey="label"
                  tickFormatter={(v: string) => v.split(" ")[0]}
                  tick={{ fontSize: 10, fill: colors.faint }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: colors.faint }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: colors.text, fontWeight: 600 }}
                  itemStyle={{ color: colors.muted }}
                  formatter={(val) => [
                    formatCurrency(Number(val), revenue.currency),
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.signal}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>}

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

/* ─── Chart Card ─────────────────────────────────── */

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-panel border border-border rounded-lg p-4 ${className ?? ""}`}>
      <h3 className="text-sm font-semibold text-text mb-0.5">{title}</h3>
      <p className="text-xs text-muted mb-4">{description}</p>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[200px] flex items-center justify-center text-xs text-muted">
      No data for this period
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
