import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { decodeOAuthState } from "@/lib/integrations/oauth";
import { encrypt } from "@/lib/integrations/crypto";
import { stripe } from "@/lib/stripe-server";

export async function GET(request: NextRequest) {
  const settingsUrl = new URL("/app/settings", request.nextUrl.origin);

  function errorRedirect(message: string) {
    settingsUrl.searchParams.set("stripe_connect", "error");
    settingsUrl.searchParams.set("message", message);
    return NextResponse.redirect(settingsUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  const stateParam = request.nextUrl.searchParams.get("state");
  const errorParam = request.nextUrl.searchParams.get("error");
  const errorDesc = request.nextUrl.searchParams.get("error_description");

  if (errorParam) {
    return errorRedirect(errorDesc || errorParam);
  }

  if (!code || !stateParam) {
    return errorRedirect("Missing code or state");
  }

  // Decode and verify HMAC-signed state
  const state = decodeOAuthState(stateParam);
  if (!state) {
    return errorRedirect("Invalid state");
  }

  // Verify user is still authenticated and matches state
  const supabase = await createSupabaseServerClient({
    allowCookieWrite: true,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== state.userId) {
    return errorRedirect("Authentication mismatch");
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    const stripeAccountId = tokenResponse.stripe_user_id;
    if (!stripeAccountId) {
      return errorRedirect("No account ID returned from Stripe");
    }

    // Fetch connected account details
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // Encrypt tokens before storage
    const accessTokenEnc = tokenResponse.access_token
      ? encrypt(tokenResponse.access_token)
      : null;
    const refreshTokenEnc = tokenResponse.refresh_token
      ? encrypt(tokenResponse.refresh_token)
      : null;

    // Upsert using service role (insert/delete not covered by RLS)
    const serviceClient = createSupabaseServiceClient();
    const { error } = await serviceClient
      .from("stripe_connected_accounts")
      .upsert(
        {
          user_id: user.id,
          stripe_account_id: stripeAccountId,
          access_token: accessTokenEnc,
          refresh_token: refreshTokenEnc,
          scope: tokenResponse.scope ?? null,
          livemode: tokenResponse.livemode ?? false,
          charges_enabled: account.charges_enabled ?? false,
          payouts_enabled: account.payouts_enabled ?? false,
          details_submitted: account.details_submitted ?? false,
          business_name:
            account.business_profile?.name ||
            account.settings?.dashboard?.display_name ||
            null,
          default_currency: account.default_currency ?? "usd",
          country: account.country ?? null,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (error) {
      console.error("[stripe-connect] upsert error:", error);
      return errorRedirect("Failed to save connected account");
    }

    // Create default workflow triggers (idempotent — unique constraint prevents duplicates)
    const defaultTriggers = [
      { trigger_event: "payment_received", action_type: "unlock_downloads" },
      { trigger_event: "all_tracks_approved", action_type: "send_invoice" },
      { trigger_event: "release_closed", action_type: "send_email_thank_you" },
    ];
    for (const t of defaultTriggers) {
      await serviceClient
        .from("workflow_triggers")
        .upsert(
          {
            user_id: user.id,
            trigger_event: t.trigger_event,
            action_type: t.action_type,
            enabled: true,
            release_id: null,
          },
          { onConflict: "user_id,trigger_event,action_type,release_id" },
        )
        .then(({ error: trigErr }) => {
          if (trigErr) console.error("[stripe-connect] default trigger error:", trigErr);
        });
    }

    settingsUrl.searchParams.set("stripe_connect", "connected");
    return NextResponse.redirect(settingsUrl);
  } catch (err) {
    console.error("[stripe-connect] callback error:", err);
    return errorRedirect("Connection failed");
  }
}
