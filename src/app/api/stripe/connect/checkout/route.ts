import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe-server";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`connect-checkout:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { quoteId?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { quoteId, token } = body;
  if (!quoteId || !token) {
    return NextResponse.json(
      { error: "Missing quoteId or token" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceClient();

  // Fetch and validate quote
  const { data: quote } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .eq("portal_token", token)
    .maybeSingle();

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  // Validate payable status
  if (quote.status === "paid") {
    return NextResponse.json({ error: "Quote already paid" }, { status: 400 });
  }
  if (quote.status === "expired") {
    return NextResponse.json({ error: "Quote has expired" }, { status: 400 });
  }
  if (quote.status === "cancelled") {
    return NextResponse.json(
      { error: "Quote has been cancelled" },
      { status: 400 },
    );
  }
  if (quote.expires_at && new Date(quote.expires_at) < new Date()) {
    // Auto-expire
    await supabase
      .from("quotes")
      .update({ status: "expired" })
      .eq("id", quote.id);
    return NextResponse.json({ error: "Quote has expired" }, { status: 400 });
  }

  // Fetch engineer's connected account
  const { data: connectedAccount } = await supabase
    .from("stripe_connected_accounts")
    .select("stripe_account_id, charges_enabled")
    .eq("user_id", quote.user_id)
    .maybeSingle();

  if (!connectedAccount || !connectedAccount.charges_enabled) {
    return NextResponse.json(
      { error: "Payment processing not available" },
      { status: 400 },
    );
  }

  // Reuse existing checkout session if still valid
  if (quote.stripe_checkout_session_id) {
    try {
      const existingSession = await stripe.checkout.sessions.retrieve(
        quote.stripe_checkout_session_id,
      );
      if (existingSession.status === "open" && existingSession.url) {
        return NextResponse.json({ url: existingSession.url });
      }
    } catch {
      // Session expired or invalid — create a new one
    }
  }

  // Fetch line items for checkout
  const { data: lineItems } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("sort_order");

  if (!lineItems || lineItems.length === 0) {
    return NextResponse.json(
      { error: "Quote has no line items" },
      { status: 400 },
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com";

  try {
    // Create Stripe Checkout Session with destination charge
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: quote.currency.toLowerCase(),
          product_data: {
            name: item.description,
          },
          unit_amount: Math.round(Number(item.unit_price) * 100),
        },
        quantity: Math.round(Number(item.quantity)),
      })),
      payment_intent_data: {
        application_fee_amount: Math.round(Number(quote.total) * 0.01 * 100), // 1% platform fee
        transfer_data: {
          destination: connectedAccount.stripe_account_id,
        },
      },
      customer_email: quote.client_email ?? undefined,
      metadata: {
        quote_id: quote.id,
        release_id: quote.release_id ?? "",
        user_id: quote.user_id,
      },
      success_url: `${baseUrl}/portal/quote/${token}?payment=success`,
      cancel_url: `${baseUrl}/portal/quote/${token}?payment=cancelled`,
    });

    // Store checkout session ID on the quote
    await supabase
      .from("quotes")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", quote.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[connect/checkout] error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
