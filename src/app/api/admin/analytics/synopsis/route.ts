import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getAllGA4TrafficData } from "@/lib/ga4-api";
import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// In-memory cache (1 hour TTL per range)
// ---------------------------------------------------------------------------

const synopsisCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const MAX_CACHE_ENTRIES = 20;

function getCachedSynopsis(range: string): string | null {
  const cached = synopsisCache.get(range);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.text;
  if (cached) synopsisCache.delete(range); // expired
  return null;
}

function setCachedSynopsis(range: string, text: string) {
  // Evict oldest entries if cache is full
  if (synopsisCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = synopsisCache.keys().next().value;
    if (oldest) synopsisCache.delete(oldest);
  }
  synopsisCache.set(range, { text, timestamp: Date.now() });
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

const RANGE_LABELS: Record<string, string> = {
  "24h": "the last 24 hours",
  today: "today",
  yesterday: "yesterday",
  "7d": "the last 7 days",
  "30d": "the last 30 days",
  "90d": "the last 90 days",
  "365d": "the last 365 days",
};

function buildPrompt(data: Awaited<ReturnType<typeof getAllGA4TrafficData>>, range: string): string {
  const label = RANGE_LABELS[range] ?? `the period ${range}`;
  const o = data.overview;

  return `You are the analytics assistant for Mix Architect, a SaaS platform for freelance mix/mastering engineers and independent artists. The platform handles release management, audio versioning, client collaboration, and payment tracking.

Analyze the following site traffic data for ${label} and write a concise 3-5 sentence synopsis. Focus on:
- What stands out (traffic trends, unusual referrers, notable pages)
- Conversion signals (pricing page visits, signup events, checkout events)
- Portal traffic as a percentage of total (paths starting with /portal are client delivery portals — this is our viral loop)
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

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * GET /api/admin/analytics/synopsis?range=7d[&refresh=true]
 *
 * Generates an AI synopsis of GA4 analytics data using Claude.
 * Cached for 1 hour per range. Pass refresh=true to regenerate.
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-synopsis:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Auth check
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const range = req.nextUrl.searchParams.get("range") ?? "7d";
  const refresh = req.nextUrl.searchParams.get("refresh") === "true";

  // Check cache first
  if (!refresh) {
    const cached = getCachedSynopsis(range);
    if (cached) {
      return NextResponse.json({ synopsis: cached, range, cached: true });
    }
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
    }

    // Fetch GA4 data
    const data = await getAllGA4TrafficData(range);

    // Generate synopsis with Claude
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: buildPrompt(data, range) }],
    });

    const synopsis = message.content[0].type === "text" ? message.content[0].text : "";

    // Cache the result
    setCachedSynopsis(range, synopsis);

    return NextResponse.json({ synopsis, range, cached: false });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[admin/analytics/synopsis] Error:", errMsg, err instanceof Error ? err.stack : "");
    return NextResponse.json(
      { error: "Failed to generate synopsis" },
      { status: 500 },
    );
  }
}
