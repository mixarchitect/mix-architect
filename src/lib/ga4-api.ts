/**
 * GA4 Data API client.
 *
 * Returns data matching the TrafficData / OverviewMetrics / BreakdownEntry
 * types from openpanel-api.ts so the admin traffic page needs minimal changes.
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type {
  TrafficData,
  OverviewMetrics,
  BreakdownEntry,
} from "./openpanel-api";

// ---------------------------------------------------------------------------
// Client setup
// ---------------------------------------------------------------------------

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

let _client: BetaAnalyticsDataClient | null = null;
function getClient(): BetaAnalyticsDataClient {
  if (!_client) {
    const email = process.env.GA4_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GA4_PRIVATE_KEY ?? "";

    // Handle both literal \n (from Vercel env var UI) and actual newlines
    if (key.includes("\\n")) {
      key = key.replace(/\\n/g, "\n");
    }

    if (!email || !key) {
      throw new Error("Missing GA4_SERVICE_ACCOUNT_EMAIL or GA4_PRIVATE_KEY env vars");
    }

    // Debug: log credential shape (never log actual values)
    console.log("[ga4-api] Initializing client:", {
      email: email.substring(0, 10) + "...",
      keyLength: key.length,
      keyStart: key.substring(0, 27),
      keyEnd: key.substring(key.length - 27),
      hasRealNewlines: key.includes("\n") && key.charAt(5) !== "\\",
      propertyId: PROPERTY_ID,
    });

    _client = new BetaAnalyticsDataClient({
      credentials: { client_email: email, private_key: key },
    });
  }
  return _client;
}

function propertyPath(): string {
  if (!PROPERTY_ID) throw new Error("Missing GA4_PROPERTY_ID env var");
  return `properties/${PROPERTY_ID}`;
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

type RangeInput = string | { start: string; end: string };

function resolveDateRange(range: RangeInput): { startDate: string; endDate: string } {
  if (typeof range === "object") {
    return { startDate: range.start, endDate: range.end };
  }
  const presetMap: Record<string, string> = {
    "24h": "1daysAgo",
    today: "today",
    yesterday: "1daysAgo",
    "7d": "7daysAgo",
    "30d": "30daysAgo",
    "90d": "90daysAgo",
    "365d": "365daysAgo",
  };
  return { startDate: presetMap[range] ?? "7daysAgo", endDate: "today" };
}

// ---------------------------------------------------------------------------
// API functions — return shapes compatible with openpanel-api.ts types
// ---------------------------------------------------------------------------

/** Summary metrics for the admin traffic overview */
export async function getGA4Overview(range: RangeInput): Promise<OverviewMetrics> {
  const client = getClient();
  const { startDate, endDate } = resolveDateRange(range);

  const [response] = await client.runReport({
    property: propertyPath(),
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "screenPageViews" },
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
      { name: "screenPageViewsPerSession" },
    ],
  });

  const row = response.rows?.[0];
  const val = (i: number) => parseFloat(row?.metricValues?.[i]?.value || "0");

  return {
    current_visitors: 0, // filled by realtime call
    pageviews: Math.round(val(0)),
    visitors: Math.round(val(1)),
    sessions: Math.round(val(2)),
    bounce_rate: Math.round(val(3) * 10000) / 100, // GA4 returns 0-1, convert to %
    session_duration: Math.round(val(4)),
    views_per_session: Math.round(val(5) * 10) / 10,
  };
}

/** Top pages ranked by pageviews */
export async function getGA4TopPages(range: RangeInput, limit = 10): Promise<BreakdownEntry[]> {
  const client = getClient();
  const { startDate, endDate } = resolveDateRange(range);

  const [response] = await client.runReport({
    property: propertyPath(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit,
  });

  return (response.rows || []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "",
    count: parseInt(row.metricValues?.[0]?.value || "0"),
  }));
}

/** Referrer / traffic source breakdown */
export async function getGA4Referrers(range: RangeInput, limit = 10): Promise<BreakdownEntry[]> {
  const client = getClient();
  const { startDate, endDate } = resolveDateRange(range);

  const [response] = await client.runReport({
    property: propertyPath(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit,
  });

  return (response.rows || []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "(direct)",
    count: parseInt(row.metricValues?.[0]?.value || "0"),
  }));
}

/** Generic dimension breakdown (browser, deviceCategory, country, operatingSystem) */
export async function getGA4DimensionBreakdown(
  range: RangeInput,
  dimension: "browser" | "deviceCategory" | "country" | "operatingSystem",
  limit = 5,
): Promise<BreakdownEntry[]> {
  const client = getClient();
  const { startDate, endDate } = resolveDateRange(range);

  const [response] = await client.runReport({
    property: propertyPath(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: dimension }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit,
  });

  return (response.rows || []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "Unknown",
    count: parseInt(row.metricValues?.[0]?.value || "0"),
  }));
}

/** Custom event counts for tracked events */
export async function getGA4EventCounts(range: RangeInput): Promise<Record<string, number>> {
  const client = getClient();
  const { startDate, endDate } = resolveDateRange(range);

  const [response] = await client.runReport({
    property: propertyPath(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: {
          values: [
            "signup_start",
            "pricing_view",
            "checkout_start",
            "release_create",
            "portal_share",
            "audio_upload",
            "converter_use",
          ],
        },
      },
    },
  });

  const counts: Record<string, number> = {};
  for (const row of response.rows || []) {
    const name = row.dimensionValues?.[0]?.value || "";
    const count = parseInt(row.metricValues?.[0]?.value || "0");
    if (name) counts[name] = count;
  }
  return counts;
}

/** Real-time active users (separate API method) */
export async function getGA4RealtimeUsers(): Promise<number> {
  const client = getClient();

  const [response] = await client.runRealtimeReport({
    property: propertyPath(),
    metrics: [{ name: "activeUsers" }],
  });

  return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0");
}

/**
 * Full analytics payload matching the TrafficData shape.
 * All queries run in parallel for speed.
 */
export async function getAllGA4TrafficData(range: RangeInput): Promise<TrafficData & { events: Record<string, number> }> {
  const [overview, topPages, referrers, browsers, devices, countries, os, events, realtimeUsers] =
    await Promise.all([
      getGA4Overview(range),
      getGA4TopPages(range, 10),
      getGA4Referrers(range, 10),
      getGA4DimensionBreakdown(range, "browser", 5),
      getGA4DimensionBreakdown(range, "deviceCategory", 5),
      getGA4DimensionBreakdown(range, "country", 10),
      getGA4DimensionBreakdown(range, "operatingSystem", 5),
      getGA4EventCounts(range),
      getGA4RealtimeUsers(),
    ]);

  return {
    overview: { ...overview, current_visitors: realtimeUsers },
    topPages,
    referrers,
    countries,
    devices,
    browsers,
    os,
    events,
  };
}
