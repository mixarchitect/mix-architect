import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getAllTrafficData,
  getOverviewOnly,
  type OverviewMetrics,
} from "@/lib/openpanel-api";

/**
 * GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD[&compare_from=...&compare_to=...]
 *
 * Returns aggregated site traffic data from OpenPanel.
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

    // Parse current period dates
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return NextResponse.json(
        { error: "Missing or invalid 'from' and 'to' date params (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    // Parse comparison period dates (optional)
    const compareFrom = req.nextUrl.searchParams.get("compare_from");
    const compareTo = req.nextUrl.searchParams.get("compare_to");
    const hasComparison =
      compareFrom &&
      compareTo &&
      /^\d{4}-\d{2}-\d{2}$/.test(compareFrom) &&
      /^\d{4}-\d{2}-\d{2}$/.test(compareTo);

    // Fetch current period data
    const data = await getAllTrafficData({ start: from, end: to });

    // Fetch comparison period overview (only stat-card metrics, not breakdowns)
    let comparison: OverviewMetrics | null = null;
    if (hasComparison) {
      comparison = await getOverviewOnly({
        start: compareFrom,
        end: compareTo,
      });
    }

    return NextResponse.json({ success: true, data, comparison });
  } catch (err) {
    console.error("[admin/analytics] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
