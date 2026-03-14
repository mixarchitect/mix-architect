import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidProvider, getProviderConfig } from "@/lib/integrations/providers";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  encodeOAuthState,
  buildAuthUrl,
} from "@/lib/integrations/oauth";
import type { IntegrationProvider } from "@/lib/integrations/types";
import crypto from "crypto";

type RouteParams = { params: Promise<{ provider: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  const config = getProviderConfig(provider);
  if (!config || !config.clientId || !config.clientSecret) {
    return NextResponse.json(
      { error: "Provider not configured" },
      { status: 400 },
    );
  }

  const ip = getClientIp(request);
  const { success } = rateLimit(`integration-connect:${ip}`, 5, 60_000);
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

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const state = encodeOAuthState({
    provider: provider as IntegrationProvider,
    userId: user.id,
    codeVerifier,
    returnUrl: "/app/settings",
    nonce: crypto.randomBytes(16).toString("hex"),
  });

  const origin = request.headers.get("origin") ?? request.nextUrl.origin;
  const redirectUri = `${origin}/api/integrations/${provider}/callback`;

  const authUrl = buildAuthUrl(
    provider as IntegrationProvider,
    redirectUri,
    state,
    codeChallenge,
  );

  return NextResponse.json({ authUrl });
}
