import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { stripe } from "@/lib/stripe-server";
import { isAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit-logger";
import { logActivity } from "@/lib/activity-logger";
import { dbRateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";

/**
 * POST /api/admin/cancel-subscription
 *
 * Admin tool for ending a user's Pro subscription.
 *
 * Handles three cases based on the row's current state:
 *
 *   - Admin-granted comp (granted_by_admin = true):
 *       Direct DB update — no Stripe call. Plan goes to "free",
 *       status to "canceled", granted_by_admin to false.
 *
 *   - Real Stripe subscription, mode="immediate":
 *       stripe.subscriptions.cancel(...) cancels at Stripe. The
 *       customer.subscription.deleted webhook updates our DB row.
 *       The local row is also updated immediately so the admin UI
 *       reflects the change without waiting for webhook latency.
 *
 *   - Real Stripe subscription, mode="at_period_end":
 *       stripe.subscriptions.update({ cancel_at_period_end: true }).
 *       Customer keeps access until current_period_end; the
 *       customer.subscription.updated webhook reconciles state.
 *
 * Used for QA (an admin wants to take their own paid account back to
 * Free to test the upgrade flow) and for handling refund/cancel
 * requests where you don't want to make the user go through the
 * customer portal.
 *
 * Body: {
 *   userId: string;
 *   mode: "immediate" | "at_period_end";
 *   reason?: string;
 * }
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = await dbRateLimit(`admin-cancel-sub:${ip}`, 20, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, mode, reason } = body as {
      userId: string;
      mode: "immediate" | "at_period_end";
      reason?: string;
    };

    if (!userId || (mode !== "immediate" && mode !== "at_period_end")) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid fields. Required: userId, mode (immediate | at_period_end)",
        },
        { status: 400 },
      );
    }

    const serviceClient = createSupabaseServiceClient();

    // Look up the existing subscription row.
    const { data: existing, error: lookupErr } = await serviceClient
      .from("subscriptions")
      .select("user_id, plan, status, granted_by_admin, stripe_subscription_id, stripe_customer_id, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    if (lookupErr) {
      console.error("[admin/cancel-subscription] lookup error:", lookupErr.message);
      return NextResponse.json(
        { error: "Failed to load subscription" },
        { status: 500 },
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "User has no subscription to cancel" },
        { status: 404 },
      );
    }

    if (existing.plan !== "pro" || existing.status === "canceled") {
      return NextResponse.json(
        { error: "User is not on an active Pro plan" },
        { status: 400 },
      );
    }

    let outcome: "comp_removed" | "stripe_canceled_immediate" | "stripe_cancel_scheduled";

    if (existing.granted_by_admin === true) {
      // Comp account — no Stripe call needed. Just flip the row.
      // The WHERE includes `granted_by_admin = true` to close a race
      // where a Stripe webhook (customer.subscription.created) lands
      // between our lookup above and this UPDATE — without the
      // guard we'd strip granted_by_admin and overwrite a real paid
      // sub's status to canceled.
      const { error: updateErr } = await serviceClient
        .from("subscriptions")
        .update({
          plan: "free",
          status: "canceled",
          granted_by_admin: false,
        })
        .eq("user_id", userId)
        .eq("granted_by_admin", true);

      if (updateErr) {
        console.error("[admin/cancel-subscription] comp revoke failed:", updateErr.message);
        return NextResponse.json(
          { error: "Failed to remove comp account" },
          { status: 500 },
        );
      }
      outcome = "comp_removed";
    } else if (existing.stripe_subscription_id) {
      // Real Stripe subscription — drive cancellation through Stripe so
      // the customer isn't billed and our records stay consistent.
      try {
        if (mode === "immediate") {
          await stripe.subscriptions.cancel(existing.stripe_subscription_id);
          // Mirror the change locally so the admin UI updates without
          // waiting for the customer.subscription.deleted webhook.
          await serviceClient
            .from("subscriptions")
            .update({ status: "canceled", plan: "free", cancel_at_period_end: false })
            .eq("user_id", userId);
          outcome = "stripe_canceled_immediate";
        } else {
          await stripe.subscriptions.update(existing.stripe_subscription_id, {
            cancel_at_period_end: true,
          });
          await serviceClient
            .from("subscriptions")
            .update({ cancel_at_period_end: true })
            .eq("user_id", userId);
          outcome = "stripe_cancel_scheduled";
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[admin/cancel-subscription] Stripe call failed:", message);
        return NextResponse.json(
          { error: `Stripe cancellation failed: ${message}` },
          { status: 500 },
        );
      }
    } else {
      // Neither comp nor a Stripe sub — shouldn't happen in practice
      // (a paid Pro plan always has stripe_subscription_id), but
      // surface it explicitly rather than silently noop.
      return NextResponse.json(
        { error: "Subscription has no Stripe link and is not a comp account" },
        { status: 400 },
      );
    }

    // Audit log + user-facing activity log.
    const requestInfo = {
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") ?? undefined,
    };
    logAdminAction(
      user.id,
      "subscription_canceled_by_admin",
      { target_user: userId, mode, outcome, reason },
      requestInfo,
    );
    logActivity(
      userId,
      "subscription_cancelled",
      { by_admin: true, admin_id: user.id, mode, outcome, reason },
      requestInfo,
    );

    return NextResponse.json({ success: true, outcome });
  } catch (err) {
    console.error("[admin/cancel-subscription] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
