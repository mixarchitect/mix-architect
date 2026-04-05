import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getAllGA4TrafficData,
  getGA4Overview,
} from "@/lib/ga4-api";
import type { OverviewMetrics } from "@/lib/openpanel-api";

/**
 * GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD[&compare_from=...&compare_to=...]
 *
 * Returns aggregated site traffic data from GA4.
 * Requires admin authentication.
 *
 * Query params:
 *   from / to        — ISO date strings for the current period (required)
 *   compare_from / compare_to — ISO date strings for the comparison period (optional)
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-analytics:${ip}`, 30, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    // Auth check
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse range — prefer preset key (OpenPanel handles these better), fall back to dates
    const rangePreset = req.nextUrl.searchParams.get("range");
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    // Map admin date picker presets to OpenPanel range keys
    const presetMap: Record<string, string> = {
      "today": "24h", "yesterday": "24h", "24h": "24h",
      "7d": "7d", "30d": "30d", "90d": "90d", "365d": "90d",
    };
    const mappedPreset = rangePreset ? presetMap[rangePreset] : null;
    const isValidPreset = !!mappedPreset;

    // Build the range argument for OpenPanel
    let rangeArg: string | { start: string; end: string };
    if (isValidPreset) {
      rangeArg = mappedPreset;
    } else if (from && to && /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      rangeArg = { start: from, end: to };
    } else {
      rangeArg = "7d"; // safe default
    }

    // Parse comparison period dates (optional)
    const compareFrom = req.nextUrl.searchParams.get("compare_from");
    const compareTo = req.nextUrl.searchParams.get("compare_to");
    const hasComparison =
      compareFrom &&
      compareTo &&
      /^\d{4}-\d{2}-\d{2}$/.test(compareFrom) &&
      /^\d{4}-\d{2}-\d{2}$/.test(compareTo);

    // Fetch current period data from GA4
    const data = await getAllGA4TrafficData(rangeArg);

    // Fetch comparison period overview (only stat-card metrics, not breakdowns)
    let comparison: OverviewMetrics | null = null;
    if (hasComparison) {
      comparison = await getGA4Overview({
        start: compareFrom,
        end: compareTo,
      });
    }

    return NextResponse.json({ success: true, data, comparison });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[admin/analytics] Error:", errMsg, err instanceof Error ? err.stack : "");
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
