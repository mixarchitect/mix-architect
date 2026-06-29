import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { isAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity-logger";
import { logAdminAction } from "@/lib/admin-audit-logger";
import { dbRateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";
import { createNotification } from "@/lib/notifications/service";
import {
  sendTransactionalEmail,
  buildUnsubscribeUrl,
  getUserEmail,
  getUserDisplayName,
} from "@/lib/email/service";
import { buildCompGrantedEmail } from "@/lib/email-templates/transactional";

/**
 * Notify a user that they've been granted a complimentary account:
 * an in-app notification + a confirmation email. Never throws — a
 * notification failure must not fail the grant itself.
 */
async function notifyCompGranted(userId: string, plan: "pro" | "studio") {
  const planLabel = plan === "studio" ? "Studio" : "Pro";
  try {
    await createNotification({
      userId,
      type: "payment_update",
      title: `Complimentary ${planLabel} unlocked`,
      body:
        plan === "studio"
          ? "An admin upgraded your account to Studio — unlimited releases, team workspace, and full white-label features are now active."
          : "An admin upgraded your account to Pro — unlimited releases and all Pro features are now active.",
    });

    const email = await getUserEmail(userId);
    if (!email) return;
    const displayName = await getUserDisplayName(userId);

    const svc = createSupabaseServiceClient();
    const { data: prefs } = await svc
      .from("email_preferences")
      .select("unsubscribe_token")
      .eq("user_id", userId)
      .maybeSingle();
    const unsubscribeUrl = prefs?.unsubscribe_token
      ? buildUnsubscribeUrl(prefs.unsubscribe_token, "subscription_confirmed")
      : undefined;

    const { subject, html } = buildCompGrantedEmail({ displayName, unsubscribeUrl, plan });
    await sendTransactionalEmail({
      userId,
      to: email,
      category: "subscription_confirmed",
      subject,
      html,
    });
  } catch (err) {
    console.error("[admin/comp-account] grant notification failed (non-fatal):", err);
  }
}

/**
 * POST /api/admin/comp-account
 * Grant or revoke a comp (admin-granted) subscription. The grant action
 * doubles as a tier switch: re-granting with a different plan upserts the
 * existing comp row in place (the workspace plan follows via DB trigger).
 *
 * Body: {
 *   userId: string;
 *   action: "grant" | "revoke";
 *   plan?: "pro" | "studio";   // grant only, defaults to "pro"
 *   reason?: string;
 *   duration?: "indefinite" | "30d" | "90d" | "6m" | "1y";
 * }
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = await dbRateLimit(`admin-comp:${ip}`, 30, 60_000);
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
    const { userId, action, reason, duration, plan } = body as {
      userId: string;
      action: "grant" | "revoke";
      reason?: string;
      duration?: "indefinite" | "30d" | "90d" | "6m" | "1y";
      plan?: "pro" | "studio";
    };

    if (!userId || !action || !["grant", "revoke"].includes(action)) {
      return NextResponse.json(
        { error: "Missing required fields: userId, action (grant|revoke)" },
        { status: 400 },
      );
    }

    // Comp tier — anything other than "studio" falls back to "pro" so older
    // callers (e.g. bulk-comp) that omit `plan` keep granting Pro.
    const compPlan: "pro" | "studio" = plan === "studio" ? "studio" : "pro";

    const serviceClient = createSupabaseServiceClient();

    if (action === "grant") {
      // Calculate expiration date based on duration
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

      // Upsert a subscription with granted_by_admin = true
      const { error } = await serviceClient.from("subscriptions").upsert(
        {
          user_id: userId,
          plan: compPlan,
          status: "active",
          granted_by_admin: true,
          cancel_at_period_end: false,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: expiresAt,
        },
        { onConflict: "user_id" },
      );

      if (error) {
        console.error("[admin/comp-account] grant failed:", error);
        return NextResponse.json({ error: "Failed to grant comp account" }, { status: 500 });
      }

      logActivity(userId, "comp_account_granted", {
        granted_by: user.id,
        plan: compPlan,
        reason: reason || undefined,
        duration: duration || "indefinite",
        expires_at: expiresAt || undefined,
      }, { ip: getClientIp(req), userAgent: req.headers.get("user-agent") ?? undefined });

      // Notify the user (in-app + email). Awaited so the email send isn't
      // killed when the handler returns; non-fatal on failure.
      await notifyCompGranted(userId, compPlan);
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
      }, { ip: getClientIp(req), userAgent: req.headers.get("user-agent") ?? undefined });
    }

    logAdminAction(user.id, `comp_${action}`, { target_user: userId, reason, duration, plan: action === "grant" ? compPlan : undefined }, { ip: getClientIp(req), userAgent: req.headers.get("user-agent") ?? undefined });

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error("[admin/comp-account] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
