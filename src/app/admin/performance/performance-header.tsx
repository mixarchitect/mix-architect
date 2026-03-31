"use client";

import { Download } from "lucide-react";
import { DateRangeSelector } from "@/components/ui/date-range-selector";

export interface MetricRow {
  metric: string;
  label: string;
  count: number;
  p50: number;
  p95: number;
  avg: number;
  max: number;
  budget: number | null;
  status: string;
}

export interface FormatRow {
  file_format: string;
  count: number;
  avg_duration: number;
  p95_duration: number;
}

export interface DeviceRow {
  device_type: string;
  count: number;
  avg_duration: number;
}

interface Props {
  range: string;
  from?: string;
  to?: string;
  metrics: MetricRow[];
  formats: FormatRow[];
  devices: DeviceRow[];
  avgFps: number | null;
  totalJank: number;
  totalDropped: number;
  totalSamples: number;
}

function escapeCsv(v: string | number): string {
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsv({ metrics, formats, devices, avgFps, totalJank, totalDropped, totalSamples }: Props): string {
  const lines: string[] = [];

  // Summary
  lines.push("AUDIO PERFORMANCE REPORT");
  lines.push("");
  lines.push(`Total Samples,${totalSamples}`);
  lines.push(`Avg FPS,${avgFps ?? "N/A"}`);
  lines.push(`Total Jank Frames,${totalJank}`);
  lines.push(`Total Dropped Frames,${totalDropped}`);
  lines.push("");

  // Timing metrics
  lines.push("TIMING METRICS");
  lines.push("Metric,Samples,P50 (ms),P95 (ms),Avg (ms),Max (ms),Budget (ms),Status");
  for (const m of metrics) {
    lines.push([
      escapeCsv(m.label),
      m.count,
      m.p50,
      m.p95,
      m.avg,
      m.max,
      m.budget ?? "",
      m.status,
    ].join(","));
  }
  lines.push("");

  // Format breakdown
  if (formats.length > 0) {
    lines.push("BY FILE FORMAT");
    lines.push("Format,Samples,Avg (ms),P95 (ms)");
    for (const f of formats) {
      lines.push([escapeCsv(f.file_format), f.count, f.avg_duration, f.p95_duration].join(","));
    }
    lines.push("");
  }

  // Device breakdown
  if (devices.length > 0) {
    lines.push("BY DEVICE TYPE");
    lines.push("Device,Samples,Avg (ms)");
    for (const d of devices) {
      lines.push([escapeCsv(d.device_type), d.count, d.avg_duration].join(","));
    }
  }

  return lines.join("\n");
}

export function PerformanceHeader(props: Props) {
  const { range, from, to } = props;

  function handleDownload() {
    const csv = buildCsv(props);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateLabel = from && to ? `${from}_${to}` : range;
    a.href = url;
    a.download = `audio-perf-${dateLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Audio Performance</h1>
        <p className="text-sm text-muted mt-0.5">
          Real-world audio playback metrics from user sessions
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-border text-muted hover:text-text hover:bg-panel2 transition-colors"
        >
          <Download size={14} />
          Download Report
        </button>
        <DateRangeSelector
          range={range}
          from={from}
          to={to}
          basePath="/admin/performance"
          variant="admin"
          showCompare={false}
        />
      </div>
    </div>
  );
}
