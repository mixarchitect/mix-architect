/**
 * OpenPanel Insights API client.
 *
 * Fetches analytics data from the OpenPanel Cloud export/chart API.
 * Uses server-side credentials (OPENPANEL_API_CLIENT_ID / OPENPANEL_API_CLIENT_SECRET)
 * which must never be exposed to the browser.
 *
 * Docs: https://openpanel.dev/docs/api
 */

const API_BASE = "https://api.openpanel.dev";

function getHeaders(): Record<string, string> {
  const clientId = process.env.OPENPANEL_API_CLIENT_ID;
  const clientSecret = process.env.OPENPANEL_API_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing OPENPANEL_API_CLIENT_ID or OPENPANEL_API_CLIENT_SECRET env vars",
    );
  }

  return {
    "openpanel-client-id": clientId,
    "openpanel-client-secret": clientSecret,
    "Content-Type": "application/json",
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

export interface TopPage {
  name: string;
  count: number;
}

export interface Referrer {
  name: string;
  count: number;
}

export interface GeoEntry {
  name: string;
  count: number;
}

export interface DeviceEntry {
  name: string;
  count: number;
}

export interface BrowserEntry {
  name: string;
  count: number;
}

export interface OsEntry {
  name: string;
  count: number;
}

export interface TrafficData {
  overview: OverviewMetrics;
  topPages: TopPage[];
  referrers: Referrer[];
  countries: GeoEntry[];
  devices: DeviceEntry[];
  browsers: BrowserEntry[];
  os: OsEntry[];
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

type RangeKey = "24h" | "7d" | "30d" | "90d";

function rangeToDates(range: RangeKey): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().slice(0, 10); // YYYY-MM-DD

  const msPerDay = 86_400_000;
  let daysBack: number;
  switch (range) {
    case "24h":
      daysBack = 1;
      break;
    case "7d":
      daysBack = 7;
      break;
    case "30d":
      daysBack = 30;
      break;
    case "90d":
      daysBack = 90;
      break;
    default:
      daysBack = 30;
  }

  const start = new Date(now.getTime() - daysBack * msPerDay)
    .toISOString()
    .slice(0, 10);

  return { start, end };
}

function rangeToInterval(range: RangeKey): string {
  switch (range) {
    case "24h":
      return "hour";
    case "7d":
    case "30d":
      return "day";
    case "90d":
      return "month";
    default:
      return "day";
  }
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

const PROJECT_ID = process.env.OPENPANEL_API_CLIENT_ID ?? "";

/**
 * Generic fetch wrapper for the OpenPanel chart/export API.
 * Uses Next.js `revalidate` for 5-minute ISR caching.
 */
async function opFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `OpenPanel API error ${res.status} on ${path}: ${text}`,
    );
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Fetch the real-time active visitor count.
 */
export async function getActiveVisitors(): Promise<number> {
  try {
    const data = await opFetch<{ count?: number; visitors?: number }>(
      "/live/visitors",
      { projectId: PROJECT_ID },
    );
    return data.count ?? data.visitors ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Fetch summary overview metrics (pageviews, visitors, sessions, bounce rate, etc.)
 */
export async function getOverviewMetrics(
  range: RangeKey,
): Promise<Omit<OverviewMetrics, "current_visitors">> {
  const { start, end } = rangeToDates(range);

  try {
    // The OpenPanel chart API returns series data for the overview
    const data = await opFetch<Record<string, unknown>>(
      "/chart/events",
      {
        event: "screen_view",
        type: "linear",
        interval: rangeToInterval(range),
        start,
        end,
        projectId: PROJECT_ID,
        name: "overview",
        breakdowns: "",
      },
    );

    // Parse the response - OpenPanel may return data in different shapes
    // depending on version. We handle both summary and series formats.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = data as Record<string, any>;
    const s = obj.summary ?? obj.current ?? obj;

    return {
      pageviews: num(s.pageviews),
      visitors: num(s.visitors),
      sessions: num(s.sessions),
      bounce_rate: num(s.bounce_rate ?? s.bounceRate),
      session_duration: num(s.session_duration ?? s.sessionDuration ?? s.duration),
      views_per_session: num(s.views_per_session ?? s.viewsPerSession),
    };
  } catch {
    return {
      pageviews: 0,
      visitors: 0,
      sessions: 0,
      bounce_rate: 0,
      session_duration: 0,
      views_per_session: 0,
    };
  }
}

/**
 * Fetch top pages by pageview count.
 */
export async function getTopPages(
  range: RangeKey,
  limit = 10,
): Promise<TopPage[]> {
  const { start, end } = rangeToDates(range);

  try {
    const data = await opFetch<unknown[]>(
      "/chart/events",
      {
        event: "screen_view",
        type: "bar",
        interval: rangeToInterval(range),
        start,
        end,
        projectId: PROJECT_ID,
        breakdowns: JSON.stringify([{ name: "path" }]),
        limit: String(limit),
      },
    );

    return normalizeBreakdown(data);
  } catch {
    return [];
  }
}

/**
 * Fetch referrer sources.
 */
export async function getReferrers(
  range: RangeKey,
  limit = 10,
): Promise<Referrer[]> {
  const { start, end } = rangeToDates(range);

  try {
    const data = await opFetch<unknown[]>(
      "/chart/events",
      {
        event: "screen_view",
        type: "bar",
        interval: rangeToInterval(range),
        start,
        end,
        projectId: PROJECT_ID,
        breakdowns: JSON.stringify([{ name: "referrer" }]),
        limit: String(limit),
      },
    );

    return normalizeBreakdown(data);
  } catch {
    return [];
  }
}

/**
 * Fetch geographic (country) breakdown.
 */
export async function getCountries(
  range: RangeKey,
  limit = 10,
): Promise<GeoEntry[]> {
  const { start, end } = rangeToDates(range);

  try {
    const data = await opFetch<unknown[]>(
      "/chart/events",
      {
        event: "screen_view",
        type: "bar",
        interval: rangeToInterval(range),
        start,
        end,
        projectId: PROJECT_ID,
        breakdowns: JSON.stringify([{ name: "country" }]),
        limit: String(limit),
      },
    );

    return normalizeBreakdown(data);
  } catch {
    return [];
  }
}

/**
 * Fetch device type breakdown (mobile, desktop, tablet).
 */
export async function getDevices(
  range: RangeKey,
  limit = 10,
): Promise<DeviceEntry[]> {
  const { start, end } = rangeToDates(range);

  try {
    const data = await opFetch<unknown[]>(
      "/chart/events",
      {
        event: "screen_view",
        type: "bar",
        interval: rangeToInterval(range),
        start,
        end,
        projectId: PROJECT_ID,
        breakdowns: JSON.stringify([{ name: "device" }]),
        limit: String(limit),
      },
    );

    return normalizeBreakdown(data);
  } catch {
    return [];
  }
}

/**
 * Fetch browser breakdown.
 */
export async function getBrowsers(
  range: RangeKey,
  limit = 10,
): Promise<BrowserEntry[]> {
  const { start, end } = rangeToDates(range);

  try {
    const data = await opFetch<unknown[]>(
      "/chart/events",
      {
        event: "screen_view",
        type: "bar",
        interval: rangeToInterval(range),
        start,
        end,
        projectId: PROJECT_ID,
        breakdowns: JSON.stringify([{ name: "browser" }]),
        limit: String(limit),
      },
    );

    return normalizeBreakdown(data);
  } catch {
    return [];
  }
}

/**
 * Fetch OS breakdown.
 */
export async function getOsList(
  range: RangeKey,
  limit = 10,
): Promise<OsEntry[]> {
  const { start, end } = rangeToDates(range);

  try {
    const data = await opFetch<unknown[]>(
      "/chart/events",
      {
        event: "screen_view",
        type: "bar",
        interval: rangeToInterval(range),
        start,
        end,
        projectId: PROJECT_ID,
        breakdowns: JSON.stringify([{ name: "os" }]),
        limit: String(limit),
      },
    );

    return normalizeBreakdown(data);
  } catch {
    return [];
  }
}

/**
 * Fetch all traffic data in parallel for a given range.
 */
export async function getAllTrafficData(
  range: RangeKey,
): Promise<TrafficData> {
  const [
    activeVisitors,
    overviewMetrics,
    topPages,
    referrers,
    countries,
    devices,
    browsers,
    os,
  ] = await Promise.all([
    getActiveVisitors(),
    getOverviewMetrics(range),
    getTopPages(range),
    getReferrers(range),
    getCountries(range),
    getDevices(range),
    getBrowsers(range),
    getOsList(range),
  ]);

  return {
    overview: {
      current_visitors: activeVisitors,
      ...overviewMetrics,
    },
    topPages,
    referrers,
    countries,
    devices,
    browsers,
    os,
  };
}

// ---------------------------------------------------------------------------
// Primitive helpers
// ---------------------------------------------------------------------------

/** Safely coerce a value to a number, defaulting to 0. */
function num(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

/**
 * Normalize OpenPanel breakdown responses into a { name, count } array.
 * OpenPanel may return data in various shapes:
 *   - Array of { name, count }
 *   - Array of { label, value }
 *   - Object with series data keyed by breakdown value
 *   - Nested { data: [...] } wrapper
 */
function normalizeBreakdown(raw: unknown): { name: string; count: number }[] {
  // Handle null/undefined
  if (!raw) return [];

  // Unwrap { data: [...] } wrapper
  if (typeof raw === "object" && !Array.isArray(raw) && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return normalizeBreakdown(obj.data);
    }
    // Object keyed by breakdown value -> { [name]: count }
    if (obj.series || obj.metrics) {
      const series = (obj.series ?? obj.metrics) as Record<string, unknown>;
      return Object.entries(series)
        .map(([name, val]) => ({
          name,
          count: typeof val === "number" ? val : Number(val) || 0,
        }))
        .sort((a, b) => b.count - a.count);
    }
    // Plain object keyed by name
    return Object.entries(obj)
      .filter(([, v]) => typeof v === "number")
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);
  }

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item: unknown) => {
      if (!item || typeof item !== "object") return null;
      const i = item as Record<string, unknown>;
      const name =
        (i.name as string) ??
        (i.label as string) ??
        (i.key as string) ??
        (i.value as string) ??
        "Unknown";
      const count =
        typeof i.count === "number"
          ? i.count
          : typeof i.value === "number"
            ? i.value
            : typeof i.total === "number"
              ? i.total
              : typeof i.events === "number"
                ? i.events
                : 0;
      return { name: String(name), count };
    })
    .filter(Boolean) as { name: string; count: number }[];
}
