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
import { CITY_COORDS, COUNTRY_CENTROIDS } from "./country-centroids";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface VisitorLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

// ---------------------------------------------------------------------------
// Client setup
// ---------------------------------------------------------------------------

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

let _client: BetaAnalyticsDataClient | null = null;
function getClient(): BetaAnalyticsDataClient {
  if (!_client) {
    // Option 1: Full JSON key as single env var (most reliable on Vercel)
    const jsonKey = process.env.GA4_SERVICE_ACCOUNT_KEY;
    if (jsonKey) {
      let parsed: { client_email: string; private_key: string };
      try {
        parsed = JSON.parse(jsonKey);
      } catch {
        throw new Error("GA4_SERVICE_ACCOUNT_KEY is not valid JSON");
      }
      _client = new BetaAnalyticsDataClient({
        credentials: {
          client_email: parsed.client_email,
          private_key: parsed.private_key,
        },
      });
      return _client;
    }

    // Option 2: Separate env vars
    const email = process.env.GA4_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GA4_PRIVATE_KEY ?? "";
    if (key.includes("\\n")) {
      key = key.replace(/\\n/g, "\n");
    }

    if (!email || !key) {
      throw new Error("Missing GA4 credentials: set GA4_SERVICE_ACCOUNT_KEY (full JSON) or GA4_SERVICE_ACCOUNT_EMAIL + GA4_PRIVATE_KEY");
    }

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
      { name: "newUsers" },
      { name: "engagedSessions" },
    ],
  });

  const row = response.rows?.[0];
  const val = (i: number) => parseFloat(row?.metricValues?.[i]?.value || "0");
  const sessions = Math.round(val(2));
  const engagedSessions = Math.round(val(7));

  return {
    current_visitors: 0, // filled by realtime call
    pageviews: Math.round(val(0)),
    visitors: Math.round(val(1)),
    sessions,
    bounce_rate: Math.round(val(3) * 10000) / 100, // GA4 returns 0-1, convert to %
    session_duration: Math.round(val(4)),
    views_per_session: Math.round(val(5) * 10) / 10,
    new_users: Math.round(val(6)),
    returning_users: Math.max(0, Math.round(val(1)) - Math.round(val(6))),
    engagement_rate: sessions > 0 ? Math.round((engagedSessions / sessions) * 1000) / 10 : 0,
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

/** Generic dimension breakdown */
export async function getGA4DimensionBreakdown(
  range: RangeInput,
  dimension: "browser" | "deviceCategory" | "country" | "operatingSystem" | "screenResolution" | "sessionDefaultChannelGroup",
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

/** Landing pages — which pages visitors enter the site on */
export async function getGA4LandingPages(range: RangeInput, limit = 10): Promise<BreakdownEntry[]> {
  const client = getClient();
  const { startDate, endDate } = resolveDateRange(range);

  const [response] = await client.runReport({
    property: propertyPath(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "landingPage" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit,
  });

  return (response.rows || []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "",
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
 * Realtime visitor locations for the live visitor map.
 * Uses GA4 realtime API with city/country dimensions, then maps to
 * approximate coordinates via country centroids.
 */
export async function getGA4RealtimeLocations(): Promise<VisitorLocation[]> {
  try {
    const client = getClient();

    const [response] = await client.runRealtimeReport({
      property: propertyPath(),
      dimensions: [
        { name: "city" },
        { name: "country" },
        { name: "countryId" },
      ],
      metrics: [{ name: "activeUsers" }],
    });

    const locations: VisitorLocation[] = [];

    for (const row of response.rows || []) {
      const city = row.dimensionValues?.[0]?.value || "";
      const country = row.dimensionValues?.[1]?.value || "";
      const countryId = row.dimensionValues?.[2]?.value || "";
      const activeUsers = parseInt(row.metricValues?.[0]?.value || "0");

      if (!countryId || countryId === "(not set)") continue;

      // Try city-level coordinates first, fall back to country centroid
      const cityKey = city.toLowerCase();
      const coords = (cityKey && cityKey !== "(not set)" ? CITY_COORDS[cityKey] : null)
        ?? COUNTRY_CENTROIDS[countryId];
      if (!coords) continue;

      // One entry per active user so the map shows the right dot count.
      // Small offsets so dots from the same country don't stack exactly.
      for (let i = 0; i < activeUsers; i++) {
        const jitter = i * 0.8;
        locations.push({
          city: city === "(not set)" ? "" : city,
          country,
          lat: coords.lat + jitter,
          lng: coords.lng + jitter,
        });
      }
    }

    return locations;
  } catch (err) {
    console.error("[ga4] getGA4RealtimeLocations error:", err);
    return [];
  }
}

/**
 * Full analytics payload matching the TrafficData shape.
 * All queries run in parallel for speed.
 */
export type GA4FullPayload = TrafficData & {
  events: Record<string, number>;
  channels: BreakdownEntry[];
  landingPages: BreakdownEntry[];
  screenResolutions: BreakdownEntry[];
};

export async function getAllGA4TrafficData(range: RangeInput): Promise<GA4FullPayload> {
  const [overview, topPages, referrers, browsers, devices, countries, os, events, channels, landingPages, screenResolutions, realtimeUsers] =
    await Promise.all([
      getGA4Overview(range),
      getGA4TopPages(range, 10),
      getGA4Referrers(range, 10),
      getGA4DimensionBreakdown(range, "browser", 5),
      getGA4DimensionBreakdown(range, "deviceCategory", 5),
      getGA4DimensionBreakdown(range, "country", 10),
      getGA4DimensionBreakdown(range, "operatingSystem", 5),
      getGA4EventCounts(range),
      getGA4DimensionBreakdown(range, "sessionDefaultChannelGroup", 8),
      getGA4LandingPages(range, 10),
      getGA4DimensionBreakdown(range, "screenResolution", 5),
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
    channels,
    landingPages,
    screenResolutions,
  };
}
