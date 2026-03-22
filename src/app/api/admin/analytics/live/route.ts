import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getRecentVisitorLocations } from "@/lib/openpanel-api";

/**
 * GET /api/admin/analytics/live
 *
 * Returns an array of recent visitor locations (last 30 minutes)
 * for the live visitor map. Requires admin authentication.
 * No caching — real-time data.
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-analytics-live:${ip}`, 20, 60_000);
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

    const locations = await getRecentVisitorLocations();

    return NextResponse.json({ success: true, locations });
  } catch (err) {
    console.error("[admin/analytics/live] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch live visitor data" },
      { status: 500 },
    );
  }
}
