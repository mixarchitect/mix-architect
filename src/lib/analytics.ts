import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import type {
  AnalyticsSummary,
  ClientInsight,
  ReleaseVelocity,
  RevenueSeries,
  TimeSeriesPoint,
  TurnaroundStats,
} from "@/types/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Date as "YYYY-MM" */
function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Format a month key as "Mar 2025" */
function toMonthLabel(key: string): string {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Build an ordered array of month keys between two dates (inclusive). */
function monthRange(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cursor <= end) {
    keys.push(toMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return keys;
}

/** Fill a sparse month map into a dense TimeSeriesPoint array. */
function fillSeries(
  months: string[],
  sparse: Map<string, number>,
): TimeSeriesPoint[] {
  return months.map((m) => ({
    month: m,
    label: toMonthLabel(m),
    value: sparse.get(m) ?? 0,
  }));
}

/** Diff in calendar days. */
function diffDays(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000,
  );
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// ---------------------------------------------------------------------------
// Query: Release Velocity
// ---------------------------------------------------------------------------

interface ReleaseRow {
  created_at: string;
  updated_at: string;
  status: string;
  client_name: string | null;
  fee_total: number | null;
  paid_amount: number | null;
  payment_status: string | null;
  fee_currency: string | null;
}

async function fetchCompletedReleases(
  userId: string,
  from: string,
  to: string,
): Promise<ReleaseRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("releases")
    .select(
      "created_at, updated_at, status, client_name, fee_total, paid_amount, payment_status, fee_currency",
    )
    .eq("user_id", userId)
    .eq("status", "ready")
    .gte("updated_at", from)
    .lte("updated_at", to)
    .order("updated_at", { ascending: true });

  if (error) {
    console.error("[analytics] fetchCompletedReleases:", error.message);
    return [];
  }
  return (data ?? []) as ReleaseRow[];
}

export async function getReleaseVelocity(
  userId: string,
  from: string,
  to: string,
): Promise<ReleaseVelocity> {
  const releases = await fetchCompletedReleases(userId, from, to);
  const months = monthRange(new Date(from), new Date(to));
  const counts = new Map<string, number>();

  for (const r of releases) {
    const key = toMonthKey(new Date(r.updated_at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series = fillSeries(months, counts);
  const total = releases.length;
  const avg = months.length > 0 ? total / months.length : 0;

  return {
    series,
    totalCompleted: total,
    avgPerMonth: Math.round(avg * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// Query: Turnaround Time
// ---------------------------------------------------------------------------

export async function getTurnaroundTime(
  userId: string,
  from: string,
  to: string,
): Promise<TurnaroundStats> {
  const releases = await fetchCompletedReleases(userId, from, to);
  const months = monthRange(new Date(from), new Date(to));
  const daysList: number[] = [];
  const monthTotals = new Map<string, { sum: number; count: number }>();

  for (const r of releases) {
    const days = diffDays(r.created_at, r.updated_at);
    daysList.push(days);
    const key = toMonthKey(new Date(r.updated_at));
    const entry = monthTotals.get(key) ?? { sum: 0, count: 0 };
    entry.sum += days;
    entry.count += 1;
    monthTotals.set(key, entry);
  }

  const avgMap = new Map<string, number>();
  for (const [k, v] of monthTotals) {
    avgMap.set(k, Math.round(v.sum / v.count));
  }

  return {
    series: fillSeries(months, avgMap),
    avgDays:
      daysList.length > 0
        ? Math.round(
            (daysList.reduce((a, b) => a + b, 0) / daysList.length) * 10,
          ) / 10
        : 0,
    medianDays: median(daysList),
    fastestDays: daysList.length > 0 ? Math.min(...daysList) : 0,
    slowestDays: daysList.length > 0 ? Math.max(...daysList) : 0,
  };
}

// ---------------------------------------------------------------------------
// Query: Revenue
// ---------------------------------------------------------------------------

export async function getRevenueSeries(
  userId: string,
  from: string,
  to: string,
): Promise<RevenueSeries> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("releases")
    .select(
      "updated_at, fee_total, paid_amount, payment_status, fee_currency",
    )
    .eq("user_id", userId)
    .neq("payment_status", "no_fee")
    .gte("updated_at", from)
    .lte("updated_at", to)
    .order("updated_at", { ascending: true });

  if (error) {
    console.error("[analytics] getRevenueSeries:", error.message);
  }

  const rows = (data ?? []) as {
    updated_at: string;
    fee_total: number | null;
    paid_amount: number | null;
    payment_status: string | null;
    fee_currency: string | null;
  }[];

  const months = monthRange(new Date(from), new Date(to));
  const revenueMap = new Map<string, number>();
  let totalRevenue = 0;
  let totalPaid = 0;
  let currency = "USD";

  for (const r of rows) {
    const fee = r.fee_total ?? 0;
    const paid = r.paid_amount ?? 0;
    totalRevenue += fee;
    totalPaid += paid;
    if (r.fee_currency) currency = r.fee_currency;

    const key = toMonthKey(new Date(r.updated_at));
    revenueMap.set(key, (revenueMap.get(key) ?? 0) + fee);
  }

  return {
    series: fillSeries(months, revenueMap),
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalOutstanding: Math.round((totalRevenue - totalPaid) * 100) / 100,
    currency,
  };
}

// ---------------------------------------------------------------------------
// Query: Client Insights
// ---------------------------------------------------------------------------

export async function getClientInsights(
  userId: string,
  from: string,
  to: string,
): Promise<ClientInsight[]> {
  const releases = await fetchCompletedReleases(userId, from, to);

  const map = new Map<
    string,
    { count: number; revenue: number; paid: number; days: number[] }
  >();

  for (const r of releases) {
    const name = r.client_name || "No client";
    const entry = map.get(name) ?? { count: 0, revenue: 0, paid: 0, days: [] };
    entry.count += 1;
    if (r.payment_status !== "no_fee") {
      entry.revenue += r.fee_total ?? 0;
      entry.paid += r.paid_amount ?? 0;
    }
    entry.days.push(diffDays(r.created_at, r.updated_at));
    map.set(name, entry);
  }

  return Array.from(map.entries())
    .map(([clientName, v]) => ({
      clientName,
      releaseCount: v.count,
      totalRevenue: Math.round(v.revenue * 100) / 100,
      totalPaid: Math.round(v.paid * 100) / 100,
      avgTurnaroundDays:
        v.days.length > 0
          ? Math.round(
              (v.days.reduce((a, b) => a + b, 0) / v.days.length) * 10,
            ) / 10
          : null,
    }))
    .sort((a, b) => b.releaseCount - a.releaseCount);
}

// ---------------------------------------------------------------------------
// Aggregator: Full Summary
// ---------------------------------------------------------------------------

export async function getAnalyticsSummary(
  userId: string,
  from: string,
  to: string,
): Promise<AnalyticsSummary> {
  const [releaseVelocity, turnaround, revenue, clients] = await Promise.all([
    getReleaseVelocity(userId, from, to),
    getTurnaroundTime(userId, from, to),
    getRevenueSeries(userId, from, to),
    getClientInsights(userId, from, to),
  ]);

  return {
    releaseVelocity,
    turnaround,
    revenue,
    clients,
    period: { from, to },
  };
}
