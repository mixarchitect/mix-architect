/**
 * OpenPanel Insights API client.
 *
 * Uses the Insights API at /insights/{projectId}/...
 * Docs: https://openpanel.dev/docs/api/insights
 */

const API_BASE = "https://api.openpanel.dev";

function getProjectId(): string {
  const id = process.env.OPENPANEL_PROJECT_ID;
  if (!id) throw new Error("Missing OPENPANEL_PROJECT_ID env var");
  return id;
}

function getHeaders(): Record<string, string> {
  const clientId = process.env.OPENPANEL_API_CLIENT_ID;
  const clientSecret = process.env.OPENPANEL_API_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing OPENPANEL_API_CLIENT_ID or OPENPANEL_API_CLIENT_SECRET");
  }
  return {
    "openpanel-client-id": clientId,
    "openpanel-client-secret": clientSecret,
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OverviewMetrics {
  current_visitors: number;
  pageviews: number;
  visitors: number;
  sessions: number;
  bounce_rate: number;
  session_duration: number;
  views_per_session: number;
}

export interface BreakdownEntry {
  name: string;
  count: number;
}

export type TopPage = BreakdownEntry;
export type Referrer = BreakdownEntry;
export type GeoEntry = BreakdownEntry;
export type DeviceEntry = BreakdownEntry;
export type BrowserEntry = BreakdownEntry;
export type OsEntry = BreakdownEntry;

export interface TrafficData {
  overview: OverviewMetrics;
  topPages: TopPage[];
  referrers: Referrer[];
  countries: GeoEntry[];
  devices: DeviceEntry[];
  browsers: BrowserEntry[];
  os: OsEntry[];
}

/** Explicit date range with YYYY-MM-DD strings */
export interface DateRange {
  start: string;
  end: string;
}

type RangeKey = "24h" | "7d" | "30d" | "90d";

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

async function insightsGet<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const projectId = getProjectId();
  const url = new URL(`${API_BASE}/insights/${projectId}${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenPanel API ${res.status} on ${endpoint}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function resolveRange(range: RangeKey | DateRange): Record<string, string> {
  if (typeof range === "string") {
    return { range };
  }
  return { startDate: range.start, endDate: range.end };
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export async function getActiveVisitors(): Promise<number> {
  try {
    const data = await insightsGet<{ visitors?: number; count?: number }>("/live");
    return data.visitors ?? data.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getMetrics(
  range: RangeKey | DateRange,
): Promise<Omit<OverviewMetrics, "current_visitors">> {
  try {
    const raw = await insightsGet<Record<string, unknown>>(
      "/metrics",
      resolveRange(range),
    );

    // API returns { metrics: { ... }, series: [...] }
    const data = (raw.metrics ?? raw) as Record<string, unknown>;

    return {
      pageviews: num(data.total_screen_views ?? data.pageviews),
      visitors: num(data.unique_visitors ?? data.visitors),
      sessions: num(data.total_sessions ?? data.sessions),
      bounce_rate: num(data.bounce_rate ?? data.bounceRate),
      session_duration: num(data.avg_session_duration ?? data.session_duration),
      views_per_session: num(data.views_per_session ?? data.viewsPerSession),
    };
  } catch {
    return { pageviews: 0, visitors: 0, sessions: 0, bounce_rate: 0, session_duration: 0, views_per_session: 0 };
  }
}

export async function getTopPages(
  range: RangeKey | DateRange,
  limit = 10,
): Promise<TopPage[]> {
  try {
    const data = await insightsGet<unknown[]>(
      "/pages",
      { ...resolveRange(range), limit: String(limit) },
    );
    return normalizeInsightsRows(data, "path");
  } catch {
    return [];
  }
}

export async function getReferrers(
  range: RangeKey | DateRange,
  limit = 10,
): Promise<Referrer[]> {
  try {
    const data = await insightsGet<unknown[]>(
      "/referrer_name",
      { ...resolveRange(range), limit: String(limit) },
    );
    return normalizeInsightsRows(data, "name");
  } catch {
    return [];
  }
}

export async function getCountries(
  range: RangeKey | DateRange,
  limit = 10,
): Promise<GeoEntry[]> {
  try {
    const data = await insightsGet<unknown[]>(
      "/country",
      { ...resolveRange(range), limit: String(limit) },
    );
    return normalizeInsightsRows(data, "name");
  } catch {
    return [];
  }
}

export async function getDevices(
  range: RangeKey | DateRange,
  limit = 10,
): Promise<DeviceEntry[]> {
  try {
    const data = await insightsGet<unknown[]>(
      "/device",
      { ...resolveRange(range), limit: String(limit) },
    );
    return normalizeInsightsRows(data, "name");
  } catch {
    return [];
  }
}

export async function getBrowsers(
  range: RangeKey | DateRange,
  limit = 10,
): Promise<BrowserEntry[]> {
  try {
    const data = await insightsGet<unknown[]>(
      "/browser",
      { ...resolveRange(range), limit: String(limit) },
    );
    return normalizeInsightsRows(data, "name");
  } catch {
    return [];
  }
}

export async function getOsList(
  range: RangeKey | DateRange,
  limit = 10,
): Promise<OsEntry[]> {
  try {
    const data = await insightsGet<unknown[]>(
      "/os",
      { ...resolveRange(range), limit: String(limit) },
    );
    return normalizeInsightsRows(data, "name");
  } catch {
    return [];
  }
}

export async function getAllTrafficData(
  range: RangeKey | DateRange,
): Promise<TrafficData> {
  const [activeVisitors, metrics, topPages, referrers, countries, devices, browsers, os] =
    await Promise.all([
      getActiveVisitors(),
      getMetrics(range),
      getTopPages(range),
      getReferrers(range),
      getCountries(range),
      getDevices(range),
      getBrowsers(range),
      getOsList(range),
    ]);

  return {
    overview: { current_visitors: activeVisitors, ...metrics },
    topPages,
    referrers,
    countries,
    devices,
    browsers,
    os,
  };
}

export async function getOverviewOnly(
  range: RangeKey | DateRange,
): Promise<OverviewMetrics> {
  const metrics = await getMetrics(range);
  return { current_visitors: 0, ...metrics };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  return 0;
}

/**
 * Normalize Insights API rows into { name, count } entries.
 * The API returns objects with varying field names — handle common shapes.
 */
function normalizeInsightsRows(
  data: unknown,
  nameField: string,
): BreakdownEntry[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item: unknown) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const name = String(obj[nameField] ?? obj.name ?? obj.title ?? "");
      const count = num(obj.sessions ?? obj.count ?? obj.views ?? obj.pageviews ?? 0);
      if (!name) return null;
      return { name, count };
    })
    .filter((x): x is BreakdownEntry => x !== null)
    .sort((a, b) => b.count - a.count);
}
