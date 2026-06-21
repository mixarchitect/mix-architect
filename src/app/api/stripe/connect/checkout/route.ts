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

  // Validate payable status — only sent/viewed/accepted quotes can be paid
  const payableStatuses = ["sent", "viewed", "accepted"];
  if (!payableStatuses.includes(quote.status)) {
    const messages: Record<string, string> = {
      paid: "Quote already paid",
      expired: "Quote has expired",
      cancelled: "Quote has been cancelled",
      draft: "Quote has not been sent yet",
    };
    return NextResponse.json(
      { error: messages[quote.status] ?? `Quote status "${quote.status}" is not payable` },
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

  // Resolve the destination connected account. Per D1 Option B, client
  // payments route to the *workspace's* connected account (the studio's),
  // not the individual engineer's. quote.workspace_id was backfilled in
  // migration 063; fall back to the quote owner's personal connected
  // account when it's missing (transition safety / older rows).
  let destinationAccountId: string | null = null;
  if (quote.workspace_id) {
    const { data: ws } = await supabase
      .from("workspaces")
      .select("connected_account_id")
      .eq("id", quote.workspace_id)
      .maybeSingle();
    destinationAccountId = ws?.connected_account_id ?? null;
  }
  if (!destinationAccountId) {
    const { data: ownerAccount } = await supabase
      .from("stripe_connected_accounts")
      .select("stripe_account_id")
      .eq("user_id", quote.user_id)
      .maybeSingle();
    destinationAccountId = ownerAccount?.stripe_account_id ?? null;
  }

  if (!destinationAccountId) {
    return NextResponse.json(
      { error: "Payment processing not available" },
      { status: 400 },
    );
  }

  // Confirm that account can actually accept charges (onboarding complete).
  const { data: connectedAccount } = await supabase
    .from("stripe_connected_accounts")
    .select("charges_enabled")
    .eq("stripe_account_id", destinationAccountId)
    .maybeSingle();

  if (!connectedAccount?.charges_enabled) {
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

  // Validate total is positive
  if (Number(quote.total) <= 0) {
    return NextResponse.json(
      { error: "Quote total must be greater than zero" },
      { status: 400 },
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com";

  try {
    // Atomic guard: re-check status hasn't changed (prevents race with concurrent requests)
    const { data: freshQuote } = await supabase
      .from("quotes")
      .select("status")
      .eq("id", quote.id)
      .single();

    if (!freshQuote || !payableStatuses.includes(freshQuote.status)) {
      return NextResponse.json(
        { error: "Quote is no longer payable" },
        { status: 409 },
      );
    }

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
        // 0% platform fee — Mix Architect takes no cut of client payments.
        // `on_behalf_of` makes the connected account the merchant of
        // record, so it bears the standard Stripe processing fee and any
        // disputes (not the platform). Without on_behalf_of the platform
        // is the settlement merchant and eats the ~2.9%+30¢ fee, which a
        // 1% application fee didn't even cover.
        on_behalf_of: destinationAccountId,
        transfer_data: {
          destination: destinationAccountId,
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
