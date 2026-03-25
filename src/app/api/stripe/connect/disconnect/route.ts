import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe-server";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`stripe-disconnect:${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the connected account
  const { data: account } = await supabase
    .from("stripe_connected_accounts")
    .select("id, stripe_account_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) {
    return NextResponse.json(
      { error: "No connected account found" },
      { status: 404 },
    );
  }

  // Best-effort deauthorize at Stripe
  try {
    const clientId = process.env.STRIPE_CLIENT_ID;
    if (clientId) {
      await stripe.oauth.deauthorize({
        client_id: clientId,
        stripe_user_id: account.stripe_account_id,
      });
    }
  } catch {
    // Best-effort; don't fail if Stripe is unreachable
  }

  // Delete using service role (RLS doesn't include delete policy)
  const serviceClient = createSupabaseServiceClient();
  const { error } = await serviceClient
    .from("stripe_connected_accounts")
    .delete()
    .eq("id", account.id);

  if (error) {
    console.error("[stripe-connect] delete error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
