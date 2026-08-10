import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getAllGA4TrafficData } from "@/lib/ga4-api";
import {
  getCachedTrafficSynopsis,
  generateTrafficSynopsis,
} from "@/lib/traffic-synopsis";

/**
 * GET /api/admin/analytics/synopsis?range=7d[&refresh=true]
 *
 * Generates an AI synopsis of GA4 analytics data using Claude.
 * Cached for 1 hour per range (cache shared with the report export).
 * Pass refresh=true to regenerate.
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

  if (!refresh) {
    const cached = getCachedTrafficSynopsis(range);
    if (cached) {
      return NextResponse.json({ synopsis: cached, range, cached: true });
    }
  }

  try {
    const data = await getAllGA4TrafficData(range);
    const synopsis = await generateTrafficSynopsis(data, range);
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
