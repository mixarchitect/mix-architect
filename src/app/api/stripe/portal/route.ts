import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { stripe } from "@/lib/stripe-server";

/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session for managing billing.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sub, error: subErr } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subErr) {
      console.error("[stripe/portal] subscription lookup failed:", subErr);
      return NextResponse.json({ error: "Failed to look up subscription" }, { status: 500 });
    }

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || req.nextUrl.origin;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/app/settings`,
    });

    console.log("[stripe/portal] portal session created for customer:", sub.stripe_customer_id);

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[stripe/portal] error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to create portal session: ${message}` },
      { status: 500 },
    );
  }
}
