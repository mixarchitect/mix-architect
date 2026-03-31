import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { Gauge, Clock, Zap, MonitorSpeaker, BarChart3, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { resolvePreset, parseDateISO, formatDateISO, type PresetKey } from "@/lib/admin-date-utils";
import { PerformanceHeader } from "./performance-header";

export const dynamic = "force-dynamic";

const PRESET_KEYS = ["today", "yesterday", "7d", "30d", "90d", "365d"] as const;

/** Budget thresholds per metric mark name (ms). */
const METRIC_BUDGETS: Record<string, number> = {
  "wavesurfer:init": 150,
  "waveform:render": 500,
  "waveform:seek": 50,
  "waveform:resize": 100,
  "playback:start": 100,
};

type BudgetStatus = "good" | "warn" | "bad" | "none";

/** Compare a value against its budget. */
function budgetStatus(metric: string, value: number): BudgetStatus {
  const budget = METRIC_BUDGETS[metric];
  if (budget == null) return "none";
  if (value <= budget) return "good";
  if (value <= budget * 1.5) return "warn";
  return "bad";
}

function statusColor(status: BudgetStatus): string {
  switch (status) {
    case "good": return "text-emerald-400";
    case "warn": return "text-amber-400";
    case "bad": return "text-red-400";
    default: return "text-text";
  }
}

function StatusDot({ status }: { status: BudgetStatus }) {
  switch (status) {
    case "good": return <CheckCircle2 size={14} className="text-emerald-400" aria-label="Within budget" />;
    case "warn": return <AlertTriangle size={14} className="text-amber-400" aria-label="Near budget limit" />;
    case "bad": return <XCircle size={14} className="text-red-400" aria-label="Over budget" />;
    default: return <span className="w-3.5" aria-hidden="true" />;
  }
}

interface MetricAgg {
  metric: string;
  count: number;
  p50: number;
  p95: number;
  avg: number;
  max: number;
  status: BudgetStatus;
  budget: number | null;
}

interface FormatBreakdown {
  file_format: string;
  count: number;
  avg_duration: number;
  p95_duration: number;
}

interface DeviceBreakdown {
  device_type: string;
  count: number;
  avg_duration: number;
}

const METRIC_LABELS: Record<string, string> = {
  "wavesurfer:init": "WaveSurfer Init",
  "waveform:render": "Waveform Render",
  "waveform:seek": "Seek Latency",
  "waveform:resize": "Resize Redraw",
  "playback:start": "Playback Start",
  "fps:playback": "Playback FPS",
};

const METRIC_ICONS: Record<string, typeof Gauge> = {
  "wavesurfer:init": Zap,
  "waveform:render": MonitorSpeaker,
  "waveform:seek": Clock,
  "waveform:resize": BarChart3,
  "playback:start": Zap,
  "fps:playback": Gauge,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PerformancePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = createSupabaseServiceClient();

  // Resolve date range from URL params
  const rawRange = typeof sp.range === "string" ? sp.range : "";
  const rawFrom = typeof sp.from === "string" ? sp.from : undefined;
  const rawTo = typeof sp.to === "string" ? sp.to : undefined;

  let periodFrom: Date;
  let periodTo: Date;

  if (rawFrom && rawTo) {
    periodFrom = parseDateISO(rawFrom) ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    periodTo = parseDateISO(rawTo) ?? new Date();
  } else {
    const presetKey: PresetKey = PRESET_KEYS.includes(rawRange as PresetKey)
      ? (rawRange as PresetKey)
      : "30d";
    const preset = resolvePreset(presetKey);
    periodFrom = preset.from;
    periodTo = preset.to;
  }

  const currentRange = rawFrom && rawTo ? "custom" : (PRESET_KEYS.includes(rawRange as PresetKey) ? rawRange : "30d");
  const isCustom = currentRange === "custom";

  // Fetch raw metrics for aggregation
  const { data: rawMetrics, error } = await supabase
    .from("perf_metrics")
    .select("metric, duration_ms, file_format, file_size_mb, duration_sec, sample_rate, bit_depth, channels, device_type, avg_fps, min_fps, p5_fps, dropped_frames, jank_frames, created_at")
    .gte("created_at", periodFrom.toISOString())
    .lte("created_at", periodTo.toISOString())
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text mb-6">Audio Performance</h1>
        <div className="rounded-lg border border-border bg-panel p-6 text-center">
          <p className="text-sm text-red-400">
            Failed to load metrics: {error.message}
          </p>
          <p className="text-xs text-muted mt-2">
            Make sure the perf_metrics table exists. Run migration 044_perf_metrics.sql.
          </p>
        </div>
      </div>
    );
  }

  const metrics = rawMetrics ?? [];
  const totalSamples = metrics.length;

  // Aggregate by metric name (exclude FPS — it uses avg_fps, not duration_ms)
  const byMetric = new Map<string, number[]>();
  for (const m of metrics) {
    if (m.metric.startsWith("fps:")) continue;
    if (!byMetric.has(m.metric)) byMetric.set(m.metric, []);
    byMetric.get(m.metric)!.push(m.duration_ms);
  }

  const aggregated: MetricAgg[] = [];
  for (const [metric, durations] of byMetric) {
    const sorted = [...durations].sort((a, b) => a - b);
    const p95 = percentile(sorted, 95);
    aggregated.push({
      metric,
      count: sorted.length,
      p50: percentile(sorted, 50),
      p95,
      avg: Math.round((sorted.reduce((s, v) => s + v, 0) / sorted.length) * 10) / 10,
      max: sorted[sorted.length - 1],
      status: budgetStatus(metric, p95),
      budget: METRIC_BUDGETS[metric] ?? null,
    });
  }
  aggregated.sort((a, b) => b.count - a.count);

  // Breakdown by file format (for timing metrics only)
  const timingMetrics = metrics.filter(
    (m) => m.file_format && !m.metric.startsWith("fps:"),
  );
  const byFormat = new Map<string, number[]>();
  for (const m of timingMetrics) {
    const fmt = m.file_format!.toLowerCase();
    if (!byFormat.has(fmt)) byFormat.set(fmt, []);
    byFormat.get(fmt)!.push(m.duration_ms);
  }

  const formatBreakdown: FormatBreakdown[] = [];
  for (const [fmt, durations] of byFormat) {
    const sorted = [...durations].sort((a, b) => a - b);
    formatBreakdown.push({
      file_format: fmt.toUpperCase(),
      count: sorted.length,
      avg_duration: Math.round((sorted.reduce((s, v) => s + v, 0) / sorted.length) * 10) / 10,
      p95_duration: percentile(sorted, 95),
    });
  }
  formatBreakdown.sort((a, b) => b.count - a.count);

  // Breakdown by device type
  const byDevice = new Map<string, number[]>();
  for (const m of metrics.filter((m) => m.device_type && !m.metric.startsWith("fps:"))) {
    if (!byDevice.has(m.device_type!)) byDevice.set(m.device_type!, []);
    byDevice.get(m.device_type!)!.push(m.duration_ms);
  }

  const deviceBreakdown: DeviceBreakdown[] = [];
  for (const [device, durations] of byDevice) {
    deviceBreakdown.push({
      device_type: device,
      count: durations.length,
      avg_duration: Math.round((durations.reduce((s, v) => s + v, 0) / durations.length) * 10) / 10,
    });
  }
  deviceBreakdown.sort((a, b) => b.count - a.count);

  // FPS aggregates
  const fpsMetrics = metrics.filter((m) => m.metric.startsWith("fps:") && m.avg_fps != null);
  const avgFps = fpsMetrics.length > 0
    ? Math.round(fpsMetrics.reduce((s, m) => s + (m.avg_fps ?? 0), 0) / fpsMetrics.length)
    : null;
  const totalDropped = fpsMetrics.reduce((s, m) => s + (m.dropped_frames ?? 0), 0);
  const totalJank = fpsMetrics.reduce((s, m) => s + (m.jank_frames ?? 0), 0);

  // Unique sessions
  const uniqueSessions = new Set(metrics.map((m) => m.metric)).size; // approximation via metric variety

  // Build header data for client component
  const headerMetrics = aggregated.map((m) => ({
    metric: m.metric,
    label: METRIC_LABELS[m.metric] ?? m.metric,
    count: m.count,
    p50: m.p50,
    p95: m.p95,
    avg: m.avg,
    max: m.max,
    budget: m.budget,
    status: m.status,
  }));

  return (
    <div>
      <PerformanceHeader
        range={currentRange}
        from={isCustom ? rawFrom : undefined}
        to={isCustom ? rawTo : undefined}
        metrics={headerMetrics}
        formats={formatBreakdown}
        devices={deviceBreakdown}
        avgFps={avgFps}
        totalJank={totalJank}
        totalDropped={totalDropped}
        totalSamples={totalSamples}
      />

      {totalSamples === 0 ? (
        <div className="rounded-lg border border-border bg-panel p-8 text-center">
          <Gauge size={32} className="text-faint mx-auto mb-3" />
          <p className="text-sm text-muted">No performance data collected yet.</p>
          <p className="text-xs text-faint mt-1">
            Metrics are automatically recorded when users play audio tracks.
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <SummaryCard label="Total Samples" value={totalSamples.toLocaleString()} />
            <SummaryCard label="Metrics Tracked" value={String(byMetric.size)} />
            <SummaryCard
              label="Avg FPS"
              value={avgFps != null ? String(avgFps) : "—"}
              color={avgFps != null && avgFps < 30 ? "text-red-400" : avgFps != null && avgFps < 55 ? "text-amber-400" : "text-emerald-400"}
            />
            <SummaryCard
              label="Jank Frames"
              value={totalJank.toLocaleString()}
              color={totalJank > 100 ? "text-red-400" : totalJank > 20 ? "text-amber-400" : "text-emerald-400"}
            />
          </div>

          {/* Metric breakdown table */}
          <div className="rounded-lg border border-border bg-panel mb-6">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-text">Timing Metrics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-faint uppercase tracking-wider">
                    <th className="text-left px-4 py-2 w-8"><span className="sr-only">Status</span></th>
                    <th className="text-left px-0 py-2">Metric</th>
                    <th className="text-right px-4 py-2">Budget</th>
                    <th className="text-right px-4 py-2">Samples</th>
                    <th className="text-right px-4 py-2">P50</th>
                    <th className="text-right px-4 py-2">P95</th>
                    <th className="text-right px-4 py-2">Avg</th>
                    <th className="text-right px-4 py-2">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {aggregated.map((m) => {
                    const Icon = METRIC_ICONS[m.metric] ?? Gauge;
                    const p50Color = statusColor(budgetStatus(m.metric, m.p50));
                    const p95Color = statusColor(m.status);
                    const maxColor = statusColor(budgetStatus(m.metric, m.max));
                    return (
                      <tr key={m.metric}>
                        <td className="pl-4 pr-1 py-2.5">
                          <StatusDot status={m.status} />
                        </td>
                        <td className="px-0 py-2.5 flex items-center gap-2">
                          <Icon size={14} className="text-teal-500 shrink-0" />
                          <span className="text-text">
                            {METRIC_LABELS[m.metric] ?? m.metric}
                          </span>
                        </td>
                        <td className="text-right px-4 py-2.5 text-faint font-mono text-xs">
                          {m.budget != null ? formatMs(m.budget) : "—"}
                        </td>
                        <td className="text-right px-4 py-2.5 text-muted">{m.count}</td>
                        <td className={`text-right px-4 py-2.5 font-mono ${p50Color}`}>
                          {formatMs(m.p50)}
                        </td>
                        <td className={`text-right px-4 py-2.5 font-mono font-semibold ${p95Color}`}>
                          {formatMs(m.p95)}
                        </td>
                        <td className="text-right px-4 py-2.5 text-muted font-mono">
                          {formatMs(m.avg)}
                        </td>
                        <td className={`text-right px-4 py-2.5 font-mono ${maxColor}`}>
                          {formatMs(m.max)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Two-column: Format + Device breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By format */}
            {formatBreakdown.length > 0 && (
              <div className="rounded-lg border border-border bg-panel">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold text-text">By File Format</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-faint uppercase tracking-wider">
                        <th className="text-left px-4 py-2">Format</th>
                        <th className="text-right px-4 py-2">Samples</th>
                        <th className="text-right px-4 py-2">Avg</th>
                        <th className="text-right px-4 py-2">P95</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {formatBreakdown.map((f) => (
                        <tr key={f.file_format}>
                          <td className="px-4 py-2.5 text-text font-medium">{f.file_format}</td>
                          <td className="text-right px-4 py-2.5 text-muted">{f.count}</td>
                          <td className="text-right px-4 py-2.5 text-text font-mono">{formatMs(f.avg_duration)}</td>
                          <td className="text-right px-4 py-2.5 text-text font-mono">{formatMs(f.p95_duration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* By device type */}
            {deviceBreakdown.length > 0 && (
              <div className="rounded-lg border border-border bg-panel">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold text-text">By Device Type</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-faint uppercase tracking-wider">
                        <th className="text-left px-4 py-2">Device</th>
                        <th className="text-right px-4 py-2">Samples</th>
                        <th className="text-right px-4 py-2">Avg</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {deviceBreakdown.map((d) => (
                        <tr key={d.device_type}>
                          <td className="px-4 py-2.5 text-text font-medium capitalize">{d.device_type}</td>
                          <td className="text-right px-4 py-2.5 text-muted">{d.count}</td>
                          <td className="text-right px-4 py-2.5 text-text font-mono">{formatMs(d.avg_duration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-3">
      <div className="text-xs text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color ?? "text-text"}`}>{value}</div>
    </div>
  );
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return Math.round(sorted[Math.max(0, idx)] * 10) / 10;
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}
