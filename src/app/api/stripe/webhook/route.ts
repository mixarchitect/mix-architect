import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe-server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { logActivity } from "@/lib/activity-logger";
import { createChurnSignal, resolveChurnSignals } from "@/lib/churn-detection";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  sendTransactionalEmail,
  buildUnsubscribeUrl,
  getUserEmail,
  getUserDisplayName,
} from "@/lib/email/service";
import {
  buildSubscriptionConfirmedEmail,
  buildSubscriptionCancelledEmail,
  buildPaymentReminderEmail,
  buildPaymentReceivedEmail,
} from "@/lib/email-templates/transactional";

/**
 * In Stripe API v2025+, current_period_end lives on the subscription
 * item, not the subscription itself.
 */
function getPeriodEnd(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0];
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000).toISOString();
  }
  return null;
}

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events to sync subscription state.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`stripe-webhook:${ip}`, 60, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  console.log("[stripe/webhook] event:", event.type, event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!userId || !customerId) {
          console.error("[stripe/webhook] checkout.session.completed missing metadata");
          break;
        }

        // Fetch the subscription to get period end
        let periodEnd: string | null = null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["items"],
          });
          periodEnd = getPeriodEnd(sub);
        }

        const { error } = await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId || null,
            plan: "pro",
            status: "active",
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            granted_by_admin: false,
          },
          { onConflict: "user_id" },
        );

        if (error) {
          console.error("[stripe/webhook] upsert failed:", error);
        } else {
          console.log("[stripe/webhook] subscription activated for user:", userId);
          logActivity(userId, "subscription_started", { plan: "pro" });

          // Send subscription confirmed email (fire-and-forget)
          sendSubscriptionEmail(supabase, userId, "subscription_confirmed");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        // Look up the subscription row by stripe_customer_id
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id, user_id, granted_by_admin")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        // Don't touch admin-granted subscriptions
        if (existingSub?.granted_by_admin) {
          console.log("[stripe/webhook] skipping update for admin-granted sub:", customerId);
          break;
        }

        if (!existingSub) {
          console.log("[stripe/webhook] no subscription found for customer:", customerId);
          break;
        }

        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "past_due",
          canceled: "canceled",
          trialing: "trialing",
          incomplete: "incomplete",
          incomplete_expired: "canceled",
          unpaid: "past_due",
          paused: "canceled",
        };

        const mappedStatus = statusMap[subscription.status] || "active";
        const periodEnd = getPeriodEnd(subscription);

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: mappedStatus,
            plan: subscription.status === "canceled" ? "free" : "pro",
            current_period_end: periodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("id", existingSub.id);

        if (error) {
          console.error("[stripe/webhook] subscription update failed:", error);
        } else {
          console.log("[stripe/webhook] subscription updated:", customerId, mappedStatus);
          if (existingSub.user_id) {
            if (mappedStatus === "active") {
              logActivity(existingSub.user_id, "subscription_renewed", { plan: "pro" });
              // Resolve any open churn signals when subscription becomes active again
              resolveChurnSignals(existingSub.user_id);
            } else if (mappedStatus === "past_due") {
              logActivity(existingSub.user_id, "payment_failed", {});
              createChurnSignal(existingSub.user_id, "payment_failed", "medium", {
                stripe_customer_id: customerId,
              });
            }
            // Detect intent to cancel (cancel_at_period_end toggled on)
            if (subscription.cancel_at_period_end && mappedStatus === "active") {
              createChurnSignal(existingSub.user_id, "subscription_cancelled", "medium", {
                stripe_customer_id: customerId,
                cancel_at_period_end: true,
              });
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        // Look up the subscription row
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id, user_id, granted_by_admin")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        // Don't touch admin-granted subscriptions
        if (existingSub?.granted_by_admin) {
          console.log("[stripe/webhook] skipping delete for admin-granted sub:", customerId);
          break;
        }

        if (!existingSub) break;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            cancel_at_period_end: false,
          })
          .eq("id", existingSub.id);

        if (error) {
          console.error("[stripe/webhook] subscription delete update failed:", error);
        } else {
          console.log("[stripe/webhook] subscription canceled:", customerId);
          if (existingSub.user_id) {
            logActivity(existingSub.user_id, "subscription_cancelled", {});
            createChurnSignal(existingSub.user_id, "subscription_cancelled", "high", {
              stripe_customer_id: customerId,
            });

            // Send subscription cancelled email (fire-and-forget)
            sendSubscriptionEmail(supabase, existingSub.user_id, "subscription_cancelled");
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (!customerId) break;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id, granted_by_admin")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (!sub?.user_id || sub.granted_by_admin) break;

        // Send payment reminder email (fire-and-forget)
        sendPaymentEmail(supabase, sub.user_id, "payment_reminder");
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (!customerId) break;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id, granted_by_admin, current_period_end")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (!sub?.user_id || sub.granted_by_admin) break;

        // Format amount
        const amount = invoice.amount_paid
          ? `$${(invoice.amount_paid / 100).toFixed(2)}`
          : "$0.00";

        // Format period end
        const nextBilling = sub.current_period_end
          ? new Date(sub.current_period_end).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "your next billing date";

        // Send payment received email (fire-and-forget)
        (async () => {
          try {
            const email = await getUserEmail(sub.user_id);
            if (!email) return;
            const displayName = await getUserDisplayName(sub.user_id);

            const { data: prefs } = await supabase
              .from("email_preferences")
              .select("unsubscribe_token")
              .eq("user_id", sub.user_id)
              .maybeSingle();

            const unsubscribeUrl = prefs?.unsubscribe_token
              ? buildUnsubscribeUrl(prefs.unsubscribe_token, "payment_received")
              : undefined;

            const { subject, html } = buildPaymentReceivedEmail({
              displayName,
              amount,
              periodEnd: nextBilling,
              unsubscribeUrl,
            });

            await sendTransactionalEmail({
              userId: sub.user_id,
              to: email,
              category: "payment_received",
              subject,
              html,
            });
          } catch (err) {
            console.error("[stripe/webhook] payment received email error:", err);
          }
        })();
        break;
      }

      default:
        console.log("[stripe/webhook] unhandled event type:", event.type);
    }
  } catch (err) {
    console.error("[stripe/webhook] handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Email helpers (fire-and-forget) ─────────────────────────────────

async function sendSubscriptionEmail(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  userId: string,
  category: "subscription_confirmed" | "subscription_cancelled",
) {
  try {
    const email = await getUserEmail(userId);
    if (!email) return;
    const displayName = await getUserDisplayName(userId);

    const { data: prefs } = await supabase
      .from("email_preferences")
      .select("unsubscribe_token")
      .eq("user_id", userId)
      .maybeSingle();

    const unsubscribeUrl = prefs?.unsubscribe_token
      ? buildUnsubscribeUrl(prefs.unsubscribe_token, category)
      : undefined;

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    let templateResult: { subject: string; html: string };

    if (category === "subscription_confirmed") {
      templateResult = buildSubscriptionConfirmedEmail({
        displayName,
        plan: "Pro",
        unsubscribeUrl,
      });
    } else {
      const periodEnd = sub?.current_period_end
        ? new Date(sub.current_period_end).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "your current billing period";

      templateResult = buildSubscriptionCancelledEmail({
        displayName,
        periodEnd,
        unsubscribeUrl,
      });
    }

    await sendTransactionalEmail({
      userId,
      to: email,
      category,
      subject: templateResult.subject,
      html: templateResult.html,
    });
  } catch (err) {
    console.error(`[stripe/webhook] ${category} email error:`, err);
  }
}

async function sendPaymentEmail(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  userId: string,
  category: "payment_reminder",
) {
  try {
    const email = await getUserEmail(userId);
    if (!email) return;
    const displayName = await getUserDisplayName(userId);

    const { data: prefs } = await supabase
      .from("email_preferences")
      .select("unsubscribe_token")
      .eq("user_id", userId)
      .maybeSingle();

    const unsubscribeUrl = prefs?.unsubscribe_token
      ? buildUnsubscribeUrl(prefs.unsubscribe_token, category)
      : undefined;

    const { subject, html } = buildPaymentReminderEmail({
      displayName,
      appUrl: "https://mixarchitect.com/app/settings",
      unsubscribeUrl,
    });

    await sendTransactionalEmail({
      userId,
      to: email,
      category,
      subject,
      html,
    });
  } catch (err) {
    console.error(`[stripe/webhook] ${category} email error:`, err);
  }
}
