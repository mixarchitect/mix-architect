"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { stripe } from "@/lib/stripe-server";
import type { StripeConnectedAccount } from "@/types/payments";

export async function getConnectedAccount(): Promise<{
  account: StripeConnectedAccount | null;
  error?: string;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { account: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("stripe_connected_accounts")
    .select(
      "id, user_id, stripe_account_id, charges_enabled, payouts_enabled, details_submitted, business_name, default_currency, country, livemode, connected_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { account: null, error: error.message };
  return { account: data as StripeConnectedAccount | null };
}

export async function checkAccountStatus(): Promise<{
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  businessName?: string | null;
  error?: string;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: account } = await supabase
    .from("stripe_connected_accounts")
    .select("id, stripe_account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) return { error: "No connected account" };

  try {
    const stripeAccount = await stripe.accounts.retrieve(
      account.stripe_account_id,
    );

    // Update the local row with fresh data
    await supabase
      .from("stripe_connected_accounts")
      .update({
        charges_enabled: stripeAccount.charges_enabled ?? false,
        payouts_enabled: stripeAccount.payouts_enabled ?? false,
        details_submitted: stripeAccount.details_submitted ?? false,
        business_name:
          stripeAccount.business_profile?.name ||
          stripeAccount.settings?.dashboard?.display_name ||
          null,
      })
      .eq("id", account.id);

    return {
      chargesEnabled: stripeAccount.charges_enabled ?? false,
      payoutsEnabled: stripeAccount.payouts_enabled ?? false,
      detailsSubmitted: stripeAccount.details_submitted ?? false,
      businessName:
        stripeAccount.business_profile?.name ||
        stripeAccount.settings?.dashboard?.display_name ||
        null,
    };
  } catch (err) {
    console.error("[stripe-connect] status check error:", err);
    return { error: "Failed to check account status" };
  }
}
