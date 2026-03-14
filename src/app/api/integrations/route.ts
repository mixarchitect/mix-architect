import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getAvailableProviderKeys } from "@/lib/integrations/providers";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`integrations-list:${ip}`, 30, 60_000);
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

  const { data: integrations, error } = await supabase
    .from("integrations")
    .select(
      "id, provider, provider_account_id, provider_email, is_active, scopes, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("created_at");

  if (error) {
    console.error("[integrations] list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    integrations: integrations ?? [],
    availableProviders: getAvailableProviderKeys(),
  });
}
