import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { encodeOAuthState } from "@/lib/integrations/oauth";
import type { OAuthState } from "@/lib/integrations/types";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`stripe-connect:${ip}`, 5, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const clientId = process.env.STRIPE_CLIENT_ID;
  const redirectUri = process.env.STRIPE_CONNECT_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Stripe Connect not configured" },
      { status: 500 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already connected
  const { data: existing } = await supabase
    .from("stripe_connected_accounts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Stripe account already connected" },
      { status: 400 },
    );
  }

  // Generate HMAC-signed state (reuse existing OAuth utility)
  const state = encodeOAuthState({
    provider: "stripe_connect" as OAuthState["provider"],
    userId: user.id,
    codeVerifier: "",
    returnUrl: "/app/settings",
    nonce: crypto.randomBytes(16).toString("hex"),
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: redirectUri,
    state,
  });

  if (user.email) {
    params.set("stripe_user[email]", user.email);
  }

  const authUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

  return NextResponse.json({ authUrl });
}
