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
import { buildPaymentConfirmationEmail } from "@/lib/email-templates/quote-emails";
import { syncPaymentStatus } from "@/lib/payment-sync";
import { fireTrigger } from "@/lib/workflow-engine";

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

        // ── Quote payment (Connect destination charge) ──
        const quoteId = session.metadata?.quote_id;
        if (quoteId) {
          const quoteUserId = session.metadata?.user_id;
          const releaseId = session.metadata?.release_id;
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null;

          // Idempotency: check if already paid
          const { data: existingQuote } = await supabase
            .from("quotes")
            .select("id, status, client_name, client_email, quote_number, total, currency, release_id")
            .eq("id", quoteId)
            .maybeSingle();

          if (!existingQuote) {
            console.error("[stripe/webhook] quote not found:", quoteId);
            break;
          }
          if (existingQuote.status === "paid") {
            console.log("[stripe/webhook] quote already paid, skipping:", quoteId);
            break;
          }

          // Mark quote as paid
          await supabase
            .from("quotes")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: paymentIntentId,
              payment_method: "stripe",
            })
            .eq("id", quoteId);

          console.log("[stripe/webhook] quote paid:", quoteId);

          // Sync release payment status
          const effectiveReleaseId = releaseId || existingQuote.release_id;
          if (effectiveReleaseId) {
            await syncPaymentStatus(effectiveReleaseId);
          }

          // Fire workflow triggers (fire-and-forget)
          if (quoteUserId && effectiveReleaseId) {
            fireTrigger("payment_received", {
              userId: quoteUserId,
              releaseId: effectiveReleaseId,
              quoteId,
            }).catch(console.error);
          }

          // Send payment confirmation email to engineer (fire-and-forget)
          if (quoteUserId) {
            (async () => {
              try {
                const email = await getUserEmail(quoteUserId);
                if (!email) return;
                const displayName = await getUserDisplayName(quoteUserId);

                const { data: prefs } = await supabase
                  .from("email_preferences")
                  .select("unsubscribe_token")
                  .eq("user_id", quoteUserId)
                  .maybeSingle();
                const unsubscribeUrl = prefs?.unsubscribe_token
                  ? buildUnsubscribeUrl(prefs.unsubscribe_token, "payment_received")
                  : undefined;

                let relTitle: string | undefined;
                if (effectiveReleaseId) {
                  const { data: rel } = await supabase
                    .from("releases")
                    .select("title")
                    .eq("id", effectiveReleaseId)
                    .maybeSingle();
                  relTitle = rel?.title;
                }

                const { subject, html } = buildPaymentConfirmationEmail({
                  clientName: existingQuote.client_name || "Client",
                  engineerName: displayName,
                  quoteNumber: existingQuote.quote_number,
                  total: Number(existingQuote.total),
                  currency: existingQuote.currency,
                  releaseTitle: relTitle,
                  unsubscribeUrl,
                });

                await sendTransactionalEmail({
                  userId: quoteUserId,
                  to: email,
                  category: "payment_received",
                  subject,
                  html,
                });
              } catch (err) {
                console.error("[stripe/webhook] quote payment email error:", err);
              }
            })();
          }

          break;
        }

        // ── Subscription checkout ──
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

      case "charge.refunded": {
        // Handle refunds — update quote status and re-sync release
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (paymentIntentId) {
          const { data: refundedQuote } = await supabase
            .from("quotes")
            .select("id, release_id, user_id")
            .eq("stripe_payment_intent_id", paymentIntentId)
            .maybeSingle();

          if (refundedQuote) {
            // Full refund: revert to 'sent'; partial refund: keep 'paid' (handled in Stripe Dashboard)
            if (charge.refunded) {
              await supabase
                .from("quotes")
                .update({ status: "sent", paid_at: null, payment_method: null })
                .eq("id", refundedQuote.id);

              if (refundedQuote.release_id) {
                await syncPaymentStatus(refundedQuote.release_id);
              }
              console.log("[stripe/webhook] quote refunded:", refundedQuote.id);
            }
          }
        }
        break;
      }

      case "account.updated": {
        // Connect account status update — keep charges_enabled/payouts_enabled fresh
        const account = event.data.object as Stripe.Account;
        if (account.id) {
          await supabase
            .from("stripe_connected_accounts")
            .update({
              charges_enabled: account.charges_enabled ?? false,
              payouts_enabled: account.payouts_enabled ?? false,
              details_submitted: account.details_submitted ?? false,
              business_name:
                account.business_profile?.name ||
                account.settings?.dashboard?.display_name ||
                null,
            })
            .eq("stripe_account_id", account.id);
          console.log("[stripe/webhook] account.updated:", account.id);
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
