"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Eye,
  Timer,
  MousePointerClick,
  Activity,
  Globe,
  Monitor,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { TrafficData } from "@/lib/openpanel-api";

const RANGES = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

export default function SiteTrafficPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rangeParam = searchParams.get("range") ?? "7d";
  const range: RangeKey = (["24h", "7d", "30d", "90d"] as const).includes(
    rangeParam as RangeKey,
  )
    ? (rangeParam as RangeKey)
    : "7d";

  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json.data as TrafficData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function setRange(newRange: RangeKey) {
    router.push(`/admin/traffic?range=${newRange}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">Site Traffic</h1>
          <p className="text-sm text-muted mt-0.5">
            Analytics powered by OpenPanel
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range selector pills */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-panel p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  range === r.key
                    ? "bg-amber-600/15 text-amber-500 font-medium"
                    : "text-muted hover:text-text hover:bg-panel2"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-md border border-border text-muted hover:text-text hover:bg-panel2 transition-colors disabled:opacity-50"
            aria-label="Refresh analytics"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && !data ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : data ? (
        <TrafficDashboard data={data} loading={loading} />
      ) : null}

      {/* OpenPanel link */}
      <div className="text-center pt-2 pb-4">
        <a
          href="https://openpanel.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
        >
          View full dashboard on OpenPanel
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard content
// ---------------------------------------------------------------------------

function TrafficDashboard({
  data,
  loading,
}: {
  data: TrafficData;
  loading: boolean;
}) {
  const { overview } = data;

  return (
    <div className={`space-y-6 ${loading ? "opacity-60" : ""}`}>
      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Visitors"
          value={overview.visitors.toLocaleString()}
          icon={Users}
          color="text-blue-400"
        />
        <StatCard
          label="Pageviews"
          value={overview.pageviews.toLocaleString()}
          icon={Eye}
          color="text-purple-400"
        />
        <StatCard
          label="Bounce Rate"
          value={`${overview.bounce_rate.toFixed(1)}%`}
          icon={MousePointerClick}
          color={
            overview.bounce_rate > 70
              ? "text-red-400"
              : overview.bounce_rate > 50
                ? "text-amber-400"
                : "text-emerald-400"
          }
        />
        <StatCard
          label="Avg Duration"
          value={formatDuration(overview.session_duration)}
          icon={Timer}
          color="text-teal-400"
        />
        <StatCard
          label="Active Now"
          value={String(overview.current_visitors)}
          icon={Activity}
          color="text-emerald-400"
          dot
        />
      </div>

      {/* Two-column: Top Pages + Referrers */}
      <div className="grid lg:grid-cols-2 gap-4">
        <BreakdownTable
          title="Top Pages"
          icon={Globe}
          rows={data.topPages}
          emptyMessage="No page data yet"
          formatName={formatPath}
        />
        <BreakdownTable
          title="Referrers"
          icon={ExternalLink}
          rows={data.referrers}
          emptyMessage="No referrer data yet"
        />
      </div>

      {/* Three-column: Browsers, Devices, Countries */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BreakdownTable
          title="Browsers"
          icon={Monitor}
          rows={data.browsers}
          emptyMessage="No browser data yet"
        />
        <BreakdownTable
          title="Devices"
          icon={Smartphone}
          rows={data.devices}
          emptyMessage="No device data yet"
          formatName={capitalizeFirst}
        />
        <BreakdownTable
          title="Countries"
          icon={Globe}
          rows={data.countries}
          emptyMessage="No country data yet"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card component
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  dot,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  color: string;
  dot?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-[10px] text-faint font-medium uppercase tracking-wider">
          {label}
        </span>
        {dot && (
          <span className="ml-auto flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </span>
        )}
      </div>
      <div className="text-xl font-bold text-text">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breakdown table component
// ---------------------------------------------------------------------------

function BreakdownTable({
  title,
  icon: Icon,
  rows,
  emptyMessage,
  formatName,
}: {
  title: string;
  icon: typeof Globe;
  rows: { name: string; count: number }[];
  emptyMessage: string;
  formatName?: (name: string) => string;
}) {
  const maxCount = rows.length > 0 ? Math.max(...rows.map((r) => r.count)) : 1;
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="rounded-lg border border-border bg-panel">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Icon size={14} className="text-muted" />
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        {total > 0 && (
          <span className="ml-auto text-xs text-faint">{total.toLocaleString()} total</span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {rows.map((row, i) => {
            const pct = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
            const displayName = formatName
              ? formatName(row.name)
              : row.name || "(direct)";

            return (
              <div key={`${row.name}-${i}`} className="relative px-4 py-2.5">
                {/* Background bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-amber-500/[0.06] rounded-r"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between gap-3">
                  <span
                    className="text-sm text-text truncate"
                    title={row.name}
                  >
                    {displayName}
                  </span>
                  <span className="text-xs text-muted font-mono shrink-0">
                    {row.count.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-panel p-4 h-[88px]"
          >
            <div className="h-3 w-16 bg-panel2 rounded mb-3" />
            <div className="h-6 w-12 bg-panel2 rounded" />
          </div>
        ))}
      </div>

      {/* Two-column tables */}
      <div className="grid lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-panel"
          >
            <div className="px-4 py-3 border-b border-border">
              <div className="h-4 w-24 bg-panel2 rounded" />
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-3 bg-panel2 rounded" style={{ width: `${60 - j * 8}%` }} />
                  <div className="h-3 w-8 bg-panel2 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Three-column tables */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-panel"
          >
            <div className="px-4 py-3 border-b border-border">
              <div className="h-4 w-20 bg-panel2 rounded" />
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-3 bg-panel2 rounded" style={{ width: `${50 - j * 8}%` }} />
                  <div className="h-3 w-8 bg-panel2 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel p-8 text-center">
      <div className="text-red-400 mb-2">
        <Loader2 size={24} className="mx-auto" />
      </div>
      <p className="text-sm text-red-400 mb-1">Failed to load analytics</p>
      <p className="text-xs text-muted mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 text-xs rounded-md bg-amber-600/15 text-amber-500 hover:bg-amber-600/25 transition-colors font-medium"
      >
        Try again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

function formatPath(path: string): string {
  if (!path || path === "/") return "/";
  // Truncate long paths for display
  return path.length > 50 ? path.slice(0, 47) + "..." : path;
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
