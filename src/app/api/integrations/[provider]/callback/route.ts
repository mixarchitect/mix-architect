import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isValidProvider } from "@/lib/integrations/providers";
import {
  decodeOAuthState,
  exchangeCodeForTokens,
  fetchProviderUserInfo,
} from "@/lib/integrations/oauth";
import { encrypt } from "@/lib/integrations/crypto";
import type { IntegrationProvider } from "@/lib/integrations/types";

type RouteParams = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { provider } = await params;
  const settingsUrl = new URL("/app/settings", request.nextUrl.origin);

  function errorRedirect(message: string) {
    settingsUrl.searchParams.set("integration", "error");
    settingsUrl.searchParams.set("message", message);
    return NextResponse.redirect(settingsUrl);
  }

  if (!isValidProvider(provider)) {
    return errorRedirect("Unknown provider");
  }

  const code = request.nextUrl.searchParams.get("code");
  const stateParam = request.nextUrl.searchParams.get("state");
  const errorParam = request.nextUrl.searchParams.get("error");

  if (errorParam) {
    return errorRedirect(errorParam);
  }

  if (!code || !stateParam) {
    return errorRedirect("Missing code or state");
  }

  // Decode and verify state
  const state = decodeOAuthState(stateParam);
  if (!state) {
    return errorRedirect("Invalid state");
  }

  if (state.provider !== provider) {
    return errorRedirect("Provider mismatch");
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
    const redirectUri = `${request.nextUrl.origin}/api/integrations/${provider}/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
      provider as IntegrationProvider,
      code,
      redirectUri,
      state.codeVerifier,
    );

    // Fetch user info from provider
    const userInfo = await fetchProviderUserInfo(
      provider as IntegrationProvider,
      tokens.accessToken,
    );

    // Encrypt tokens
    const accessTokenEnc = encrypt(tokens.accessToken);
    const refreshTokenEnc = tokens.refreshToken
      ? encrypt(tokens.refreshToken)
      : null;

    // Upsert integration (reconnect replaces existing row)
    const { error } = await supabase.from("integrations").upsert(
      {
        user_id: user.id,
        provider,
        provider_account_id: userInfo.accountId,
        provider_email: userInfo.email,
        access_token_enc: accessTokenEnc,
        refresh_token_enc: refreshTokenEnc,
        token_expires_at: tokens.expiresAt?.toISOString() ?? null,
        scopes: tokens.scopes,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" },
    );

    if (error) {
      console.error("[integrations] upsert error:", error);
      return errorRedirect("Failed to save integration");
    }

    settingsUrl.searchParams.set("integration", "connected");
    settingsUrl.searchParams.set("provider", provider);
    return NextResponse.redirect(settingsUrl);
  } catch (err) {
    console.error("[integrations] callback error:", err);
    return errorRedirect("Connection failed");
  }
}
