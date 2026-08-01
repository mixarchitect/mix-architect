import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { logActivity } from "@/lib/activity-logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";

/**
 * POST /api/onboarding/reset-releases
 * The user's decision about releases parked by an admin account reset.
 *
 * Body: { decision: "restore" | "discard" }
 *
 * "restore" un-parks them; "discard" leaves them soft-deleted, which stays
 * admin-recoverable. Either way the reset marker is cleared so the onboarding
 * step does not appear again.
 *
 * Runs with the service client because parked releases are hidden from the
 * user's own RLS view. Every write is still scoped to the session user's id,
 * which is never taken from the request body.
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = rateLimit(`reset-releases:${ip}`, 10, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { decision } = body as { decision?: string };
    if (decision !== "restore" && decision !== "discard") {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const service = createSupabaseServiceClient();

    const { data: defaults } = await service
      .from("user_defaults")
      .select("account_reset_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const resetAt = defaults?.account_reset_at as string | null | undefined;
    if (!resetAt) {
      // Nothing pending. Treat as a no-op rather than an error so a double
      // submit or a stale tab cannot wedge the flow.
      return NextResponse.json({ success: true, restored: 0 });
    }

    let restored = 0;
    if (decision === "restore") {
      // Only releases parked by THIS reset, never ones discarded earlier.
      const { data, error } = await service
        .from("releases")
        .update({ deleted_at: null })
        .eq("user_id", user.id)
        .gte("deleted_at", resetAt)
        .select("id");

      if (error) {
        console.error("[onboarding/reset-releases] restore failed:", error);
        return NextResponse.json({ error: "Failed to restore releases" }, { status: 500 });
      }
      restored = data?.length ?? 0;
    }

    const { error: clearErr } = await service
      .from("user_defaults")
      .update({ account_reset_at: null })
      .eq("user_id", user.id);

    if (clearErr) {
      console.error("[onboarding/reset-releases] failed to clear marker:", clearErr);
      return NextResponse.json({ error: "Failed to save your choice" }, { status: 500 });
    }

    logActivity(
      user.id,
      decision === "restore" ? "reset_releases_restored" : "reset_releases_discarded",
      { count: restored },
      { ip, userAgent: req.headers.get("user-agent") ?? undefined },
    );

    return NextResponse.json({ success: true, restored });
  } catch (err) {
    console.error("[onboarding/reset-releases] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
