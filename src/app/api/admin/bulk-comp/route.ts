import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { isAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity-logger";
import { logAdminAction } from "@/lib/admin-audit-logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";

/** Cap on bulk operations. Beyond this an admin should script it. */
const MAX_BULK_USERS = 500;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-bulk-comp:${ip}`, 30, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

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

    // Cap input size — a compromised admin token shouldn't be able to
    // upsert subscriptions for every user in the database.
    if (userIds.length > MAX_BULK_USERS) {
      return NextResponse.json(
        {
          error: `Too many userIds (max ${MAX_BULK_USERS} per request)`,
        },
        { status: 400 },
      );
    }

    // Validate UUID shape — protects against malformed strings or
    // attempts to inject other types into the FK column.
    const invalid = userIds.filter((id) => typeof id !== "string" || !UUID_RE.test(id));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid userIds (must be UUIDs): ${invalid.length} rejected` },
        { status: 400 },
      );
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
      }, { ip: getClientIp(req), userAgent: req.headers.get("user-agent") ?? undefined });
    }

    logAdminAction(user.id, "bulk_comp_grant", {
      count: userIds.length,
      duration: duration || "indefinite",
      reason,
    }, { ip: getClientIp(req), userAgent: req.headers.get("user-agent") ?? undefined });

    return NextResponse.json({ success: true, count: userIds.length });
  } catch (err) {
    console.error("[admin/bulk-comp] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
