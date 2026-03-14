import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { isAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity-logger";

/**
 * POST /api/admin/comp-account
 * Grant or revoke a comp (admin-granted) Pro subscription.
 *
 * Body: {
 *   userId: string;
 *   action: "grant" | "revoke";
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
    const { userId, action, reason } = body as {
      userId: string;
      action: "grant" | "revoke";
      reason?: string;
    };

    if (!userId || !action || !["grant", "revoke"].includes(action)) {
      return NextResponse.json(
        { error: "Missing required fields: userId, action (grant|revoke)" },
        { status: 400 },
      );
    }

    const serviceClient = createSupabaseServiceClient();

    if (action === "grant") {
      // Upsert a subscription with granted_by_admin = true
      const { error } = await serviceClient.from("subscriptions").upsert(
        {
          user_id: userId,
          plan: "pro",
          status: "active",
          granted_by_admin: true,
          cancel_at_period_end: false,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: null,
        },
        { onConflict: "user_id" },
      );

      if (error) {
        console.error("[admin/comp-account] grant failed:", error);
        return NextResponse.json({ error: "Failed to grant comp account" }, { status: 500 });
      }

      logActivity(userId, "comp_account_granted", {
        granted_by: user.id,
        reason: reason || undefined,
      });
    } else {
      // Revoke: set plan back to free
      const { error } = await serviceClient
        .from("subscriptions")
        .update({
          plan: "free",
          status: "canceled",
          granted_by_admin: false,
        })
        .eq("user_id", userId)
        .eq("granted_by_admin", true);

      if (error) {
        console.error("[admin/comp-account] revoke failed:", error);
        return NextResponse.json({ error: "Failed to revoke comp account" }, { status: 500 });
      }

      logActivity(userId, "comp_account_revoked", {
        revoked_by: user.id,
        reason: reason || undefined,
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error("[admin/comp-account] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
