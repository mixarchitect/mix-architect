import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { isAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity-logger";

/**
 * POST /api/admin/bulk-comp
 * Grant comp accounts to multiple users at once.
 *
 * Body: {
 *   userIds: string[];
 *   duration?: "indefinite" | "30d" | "90d" | "6m" | "1y";
 *   reason?: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userIds, duration, reason } = body as {
      userIds: string[];
      duration?: "indefinite" | "30d" | "90d" | "6m" | "1y";
      reason?: string;
    };

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "userIds array required" }, { status: 400 });
    }

    // Calculate expiration
    let expiresAt: string | null = null;
    if (duration && duration !== "indefinite") {
      const now = new Date();
      const durationMap: Record<string, number> = {
        "30d": 30,
        "90d": 90,
        "6m": 182,
        "1y": 365,
      };
      const days = durationMap[duration] ?? 0;
      if (days > 0) {
        now.setDate(now.getDate() + days);
        expiresAt = now.toISOString();
      }
    }

    const serviceClient = createSupabaseServiceClient();
    const rows = userIds.map((userId) => ({
      user_id: userId,
      plan: "pro",
      status: "active",
      granted_by_admin: true,
      cancel_at_period_end: false,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_end: expiresAt,
    }));

    const { error } = await serviceClient
      .from("subscriptions")
      .upsert(rows, { onConflict: "user_id" });

    if (error) {
      console.error("[admin/bulk-comp] Failed:", error);
      return NextResponse.json({ error: "Failed to grant comp accounts" }, { status: 500 });
    }

    // Log activity for each user (fire-and-forget)
    for (const userId of userIds) {
      logActivity(userId, "comp_account_granted", {
        granted_by: user.id,
        reason: reason || undefined,
        duration: duration || "indefinite",
        bulk: true,
      });
    }

    return NextResponse.json({ success: true, count: userIds.length });
  } catch (err) {
    console.error("[admin/bulk-comp] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
