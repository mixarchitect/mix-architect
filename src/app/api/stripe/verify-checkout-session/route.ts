import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { stripe } from "@/lib/stripe-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/stripe/verify-checkout-session
 *
 * Confirms a checkout session id is real, was paid, and belongs to
 * the currently-authenticated user. Used by the settings page to
 * gate firing the GA4 `purchase` conversion event — without this,
 * an attacker could DM a victim
 *   https://mixarchitect.com/app/settings?checkout=success&session_id=cs_fake&interval=annual
 * and skew Google Ads / GA4 conversion optimization data.
 *
 * Body: { sessionId: string }
 * Response (verified):
 *   { verified: true, interval: "monthly" | "annual",
 *     amountTotal: number, currency: string }
 * Response (rejected):
 *   { verified: false, reason: string }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`verify-checkout:${ip}`, 30, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";

    // Cheap shape filter before touching Stripe.
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ verified: false, reason: "invalid_session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    if (session.metadata?.supabase_user_id !== user.id) {
      return NextResponse.json({
        verified: false,
        reason: "user_mismatch",
      });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        verified: false,
        reason: "not_paid",
      });
    }

    const price = session.line_items?.data?.[0]?.price;
    const stripeInterval = price?.recurring?.interval; // "month" | "year"
    const interval: "monthly" | "annual" =
      stripeInterval === "year" ? "annual" : "monthly";

    return NextResponse.json({
      verified: true,
      interval,
      amountTotal: session.amount_total ?? 0, // cents
      currency: session.currency ?? "usd",
    });
  } catch (err) {
    // Don't leak the Stripe error text to the client — it can include
    // request ids / customer ids that are useful to attackers.
    console.error("[stripe/verify-checkout-session] error:", err);
    return NextResponse.json({ verified: false, reason: "lookup_failed" });
  }
}
