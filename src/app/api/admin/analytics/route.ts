import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getAllTrafficData } from "@/lib/openpanel-api";

const VALID_RANGES = ["24h", "7d", "30d", "90d"] as const;
type RangeKey = (typeof VALID_RANGES)[number];

/**
 * GET /api/admin/analytics?range=7d
 *
 * Returns aggregated site traffic data from OpenPanel.
 * Requires admin authentication.
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

    // Parse range
    const rawRange = req.nextUrl.searchParams.get("range") ?? "7d";
    const range: RangeKey = VALID_RANGES.includes(rawRange as RangeKey)
      ? (rawRange as RangeKey)
      : "7d";

    // Fetch all traffic data in parallel
    const data = await getAllTrafficData(range);

    return NextResponse.json({ success: true, range, data });
  } catch (err) {
    console.error("[admin/analytics] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
