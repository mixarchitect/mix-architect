/** Analytics types for the user-facing /app/analytics dashboard. */

/** A single data point for time-series charts (monthly buckets). */
export interface TimeSeriesPoint {
  /** ISO month string, e.g. "2025-03" */
  month: string;
  /** Display label, e.g. "Mar 2025" */
  label: string;
  value: number;
}

/** Release velocity: completed releases per month. */
export interface ReleaseVelocity {
  series: TimeSeriesPoint[];
  totalCompleted: number;
  avgPerMonth: number;
}

/** Turnaround time stats (in days). */
export interface TurnaroundStats {
  series: TimeSeriesPoint[];
  avgDays: number;
  medianDays: number;
  fastestDays: number;
  slowestDays: number;
}

/** Revenue aggregated by month. */
export interface RevenueSeries {
  series: TimeSeriesPoint[];
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  currency: string;
}

/** Insights for a single client. */
export interface ClientInsight {
  clientName: string;
  releaseCount: number;
  totalRevenue: number;
  totalPaid: number;
  avgTurnaroundDays: number | null;
}

/** Top-level summary for the analytics dashboard. */
export interface AnalyticsSummary {
  releaseVelocity: ReleaseVelocity;
  turnaround: TurnaroundStats;
  revenue: RevenueSeries;
  clients: ClientInsight[];
  period: { from: string; to: string };
}
