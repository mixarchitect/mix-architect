import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { stripe } from "@/lib/stripe-server";
import { getStripePriceId, type BillingInterval, type PaidPlan } from "@/lib/pricing";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for upgrading to a paid plan.
 * Body params (both optional):
 *   - plan: "pro" | "studio"         (default: "pro")
 *   - interval: "monthly" | "annual" (default: "monthly")
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`stripe-checkout:${ip}`, 10, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json().catch(() => ({}));
    const interval: BillingInterval =
      body.interval === "annual" ? "annual" : "monthly";
    // Allowlist the plan — never trust the body to name an arbitrary price.
    const plan: PaidPlan = body.plan === "studio" ? "studio" : "pro";

    const priceId = getStripePriceId(plan, interval);
    if (!priceId) {
      // Price env var for this plan/interval isn't configured (e.g. the
      // Studio product hasn't been created yet). Fail clearly rather
      // than handing Stripe an empty price id.
      return NextResponse.json(
        { error: `Pricing for the ${plan} plan is not configured.` },
        { status: 503 },
      );
    }

    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for existing Stripe customer ID
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id;

    // Create Stripe customer if none exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Include the chosen interval + Stripe-supplied session id in
      // the return URL so the settings page can fire a GA4 `purchase`
      // conversion event with the right plan dimension and a stable
      // transaction_id (used by Google Ads for dedup against the
      // server-side conversion-API call if we ever wire that in).
      // Stripe substitutes {CHECKOUT_SESSION_ID} server-side.
      success_url: `${origin}/app/settings?checkout=success&interval=${interval}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app/settings?checkout=canceled`,
      // Stamp the plan into both the session and the subscription so the
      // webhook can record the right plan. The subscription_data copy
      // survives onto the Subscription object for later events.
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
      },
      metadata: { supabase_user_id: user.id, plan },
    });

    console.log("[stripe/checkout] session created:", session.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout] error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to create checkout session: ${message}` },
      { status: 500 },
    );
  }
}
