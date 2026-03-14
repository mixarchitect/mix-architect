import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { revokeProviderToken } from "@/lib/integrations/oauth";
import type { IntegrationProvider } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const ip = getClientIp(request);
  const { success } = rateLimit(`integration-disconnect:${ip}`, 10, 60_000);
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

  // RLS ensures only the owner can see this row
  const { data: integration, error: fetchError } = await supabase
    .from("integrations")
    .select("id, provider, access_token_enc")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (fetchError || !integration) {
    return NextResponse.json(
      { error: "Integration not found" },
      { status: 404 },
    );
  }

  // Best-effort revoke at provider
  await revokeProviderToken(
    integration.provider as IntegrationProvider,
    integration.access_token_enc,
  );

  // Soft delete
  const { error: updateError } = await supabase
    .from("integrations")
    .update({ is_active: false })
    .eq("id", id);

  if (updateError) {
    console.error("[integrations] disconnect error:", updateError);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
