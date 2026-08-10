import Anthropic from "@anthropic-ai/sdk";
import type { GA4FullPayload } from "@/lib/ga4-api";

/**
 * Shared AI traffic-synopsis generation with a 1-hour in-memory cache,
 * used by both the synopsis endpoint (the Site Traffic card) and the
 * analytics report export so the two never bill a second generation for
 * the same range within the cache window.
 */

const synopsisCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_ENTRIES = 20;

export function getCachedTrafficSynopsis(range: string): string | null {
  const cached = synopsisCache.get(range);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.text;
  if (cached) synopsisCache.delete(range); // expired
  return null;
}

function setCachedSynopsis(range: string, text: string) {
  if (synopsisCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = synopsisCache.keys().next().value;
    if (oldest) synopsisCache.delete(oldest);
  }
  synopsisCache.set(range, { text, timestamp: Date.now() });
}

export const RANGE_LABELS: Record<string, string> = {
  "24h": "the last 24 hours",
  today: "today",
  yesterday: "yesterday",
  "7d": "the last 7 days",
  "30d": "the last 30 days",
  "90d": "the last 90 days",
  "365d": "the last 365 days",
};

function buildPrompt(data: GA4FullPayload, range: string): string {
  const label = RANGE_LABELS[range] ?? `the period ${range}`;
  const o = data.overview;

  return `You are the analytics assistant for Mix Architect, a SaaS platform for freelance mix/mastering engineers and independent artists. The platform handles release management, audio versioning, client collaboration, and payment tracking.

Analyze the following site traffic data for ${label} and write a concise 3-5 sentence synopsis. Focus on:
- What stands out (traffic trends, unusual referrers, notable pages)
- Conversion signals (pricing page visits, signup events, checkout events)
- Portal traffic as a percentage of total (paths starting with /portal are client delivery portals; this is our viral loop)
- Anything that might need attention (high bounce rates, drop-offs, zero events where there should be activity)

Be direct, specific with numbers, and actionable. No filler. Write in a natural, conversational tone. Do not use bullet points or headers. Do not start with "Here's" or "Based on". Just give me the analysis as a short paragraph.

DATA:
- Visitors: ${o.visitors} (New: ${o.new_users ?? 0}, Returning: ${o.returning_users ?? 0})
- Pageviews: ${o.pageviews}
- Sessions: ${o.sessions}
- Engagement Rate: ${o.engagement_rate ?? 0}%
- Bounce Rate: ${o.bounce_rate}%
- Avg Session Duration: ${o.session_duration}s
- Pages per Session: ${o.views_per_session}
- Real-time Active: ${o.current_visitors}

Channels:
${data.channels.map((c) => `  ${c.name}: ${c.count} sessions`).join("\n")}

Top Pages:
${data.topPages.map((p) => `  ${p.name}: ${p.count} views`).join("\n")}

Landing Pages:
${data.landingPages.map((p) => `  ${p.name}: ${p.count} sessions`).join("\n")}

Referrers:
${data.referrers.map((r) => `  ${r.name}: ${r.count} sessions`).join("\n")}

Countries:
${data.countries.map((c) => `  ${c.name}: ${c.count} sessions`).join("\n")}

Custom Events:
${Object.entries(data.events).map(([name, count]) => `  ${name}: ${count}`).join("\n") || "  (no custom events tracked yet)"}

Browsers: ${data.browsers.map((b) => `${b.name}: ${b.count}`).join(", ")}
Devices: ${data.devices.map((d) => `${d.name}: ${d.count}`).join(", ")}`;
}

/**
 * Generate a synopsis for already-fetched traffic data and cache it under
 * the given range key. Throws when ANTHROPIC_API_KEY is unset or the API
 * call fails; callers decide whether that is fatal (synopsis card) or
 * degradable (report export).
 */
export async function generateTrafficSynopsis(
  data: GA4FullPayload,
  range: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const anthropic = new Anthropic({ apiKey });
  const message = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 1000,
    messages: [{ role: "user", content: buildPrompt(data, range) }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const synopsis = textBlock && textBlock.type === "text" ? textBlock.text : "";
  if (synopsis) setCachedSynopsis(range, synopsis);
  return synopsis;
}
