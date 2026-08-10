import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getAllGA4TrafficData, type GA4FullPayload } from "@/lib/ga4-api";
import {
  getCachedTrafficSynopsis,
  generateTrafficSynopsis,
  RANGE_LABELS,
} from "@/lib/traffic-synopsis";

function mdTable(headers: string[], rows: (string | number)[][]): string {
  if (rows.length === 0) return "_No data for this period._\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function buildReport(
  data: GA4FullPayload,
  rangeLabel: string,
  synopsis: string | null,
): string {
  const o = data.overview;
  const generatedAt = new Date().toISOString().replace("T", " ").slice(0, 16);

  const sections: string[] = [
    `# Mix Architect: Site Traffic Report`,
    ``,
    `**Period:** ${rangeLabel}`,
    `**Generated:** ${generatedAt} UTC`,
    ``,
    `## AI Summary`,
    ``,
    synopsis ??
      `_The AI summary could not be generated for this export. The traffic data below is complete._`,
    ``,
    `## Overview`,
    ``,
    mdTable(
      ["Metric", "Value"],
      [
        ["Visitors", o.visitors],
        ["New users", o.new_users ?? 0],
        ["Returning users", o.returning_users ?? 0],
        ["Pageviews", o.pageviews],
        ["Sessions", o.sessions],
        ["Engagement rate", `${o.engagement_rate ?? 0}%`],
        ["Bounce rate", `${o.bounce_rate}%`],
        ["Avg session duration", formatDuration(o.session_duration)],
        ["Pages per session", o.views_per_session],
        ["Active right now", o.current_visitors],
      ],
    ),
    ``,
    `## Channels`,
    ``,
    mdTable(
      ["Channel", "Sessions"],
      data.channels.map((c) => [c.name, c.count]),
    ),
    ``,
    `## Top Pages`,
    ``,
    mdTable(
      ["Page", "Views"],
      data.topPages.map((p) => [p.name, p.count]),
    ),
    ``,
    `## Landing Pages`,
    ``,
    mdTable(
      ["Page", "Sessions"],
      data.landingPages.map((p) => [p.name, p.count]),
    ),
    ``,
    `## Referrers`,
    ``,
    mdTable(
      ["Source", "Sessions"],
      data.referrers.map((r) => [r.name, r.count]),
    ),
    ``,
    `## Countries`,
    ``,
    mdTable(
      ["Country", "Sessions"],
      data.countries.map((c) => [c.name, c.count]),
    ),
    ``,
    `## Custom Events`,
    ``,
    mdTable(
      ["Event", "Count"],
      Object.entries(data.events).map(([name, count]) => [name, count]),
    ),
    ``,
    `## Devices and Browsers`,
    ``,
    mdTable(
      ["Device", "Sessions"],
      data.devices.map((d) => [d.name, d.count]),
    ),
    ``,
    mdTable(
      ["Browser", "Sessions"],
      data.browsers.map((b) => [b.name, b.count]),
    ),
    ``,
  ];

  return sections.join("\n");
}

/**
 * GET /api/admin/analytics/export?range=7d
 * GET /api/admin/analytics/export?from=2026-08-01&to=2026-08-09
 *
 * Downloads a Markdown site-traffic report for the requested period,
 * led by the AI summary (reusing the synopsis cache when warm). If the
 * summary cannot be generated, the report still exports with a note in
 * its place - the data tables never depend on the model call.
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-analytics-export:${ip}`, 5, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const range = req.nextUrl.searchParams.get("range");

  // Preset range key when given (matches the synopsis cache key); custom
  // ranges query GA4 by explicit dates and cache under "from_to".
  const rangeInput = range ?? (from && to ? { start: from, end: to } : "7d");
  const cacheKey = range ?? (from && to ? `${from}_${to}` : "7d");
  const rangeLabel = range
    ? (RANGE_LABELS[range] ?? range)
    : from && to
      ? `${from} to ${to}`
      : RANGE_LABELS["7d"];

  try {
    const data = await getAllGA4TrafficData(rangeInput);

    let synopsis: string | null = getCachedTrafficSynopsis(cacheKey);
    if (!synopsis) {
      try {
        synopsis = await generateTrafficSynopsis(data, cacheKey);
      } catch (err) {
        console.error(
          "[admin/analytics/export] Synopsis generation failed, exporting without it:",
          err instanceof Error ? err.message : String(err),
        );
        synopsis = null;
      }
    }

    const report = buildReport(data, rangeLabel, synopsis);
    const datePart = new Date().toISOString().slice(0, 10);
    const namePart = (range ?? (from && to ? `${from}-to-${to}` : "7d"))
      .replace(/[^a-zA-Z0-9-]/g, "-");
    const filename = `mix-architect-traffic-${namePart}-${datePart}.md`;

    return new NextResponse(report, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(
      "[admin/analytics/export] Error:",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      { error: "Failed to build the analytics report" },
      { status: 500 },
    );
  }
}
