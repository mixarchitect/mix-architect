import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe-server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

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
          .select("id, granted_by_admin")
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
          .select("id, granted_by_admin")
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
        }
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
