import crypto from "crypto";
import { getProviderConfig } from "./providers";
import { encrypt, decrypt } from "./crypto";
import type { OAuthState, IntegrationProvider } from "./types";

// ---------------------------------------------------------------------------
// PKCE
// ---------------------------------------------------------------------------

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// ---------------------------------------------------------------------------
// State encoding (HMAC-signed, no server-side session needed)
// ---------------------------------------------------------------------------

function hmacKey(): string {
  return process.env.INTEGRATION_ENCRYPTION_KEY ?? "";
}

export function encodeOAuthState(state: OAuthState): string {
  const payload = JSON.stringify(state);
  const hmac = crypto
    .createHmac("sha256", hmacKey())
    .update(payload)
    .digest("base64url");
  return Buffer.from(`${payload}|${hmac}`).toString("base64url");
}

export function decodeOAuthState(encoded: string): OAuthState | null {
  try {
    const decoded = Buffer.from(encoded, "base64url").toString("utf8");
    const pipeIdx = decoded.lastIndexOf("|");
    if (pipeIdx === -1) return null;
    const payload = decoded.substring(0, pipeIdx);
    const hmac = decoded.substring(pipeIdx + 1);
    const expected = crypto
      .createHmac("sha256", hmacKey())
      .update(payload)
      .digest("base64url");
    if (hmac !== expected) return null;
    return JSON.parse(payload) as OAuthState;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Authorization URL
// ---------------------------------------------------------------------------

export function buildAuthUrl(
  provider: IntegrationProvider,
  redirectUri: string,
  state: string,
  codeChallenge: string,
): string {
  const config = getProviderConfig(provider);
  if (!config) throw new Error(`Unknown provider: ${provider}`);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  if (provider === "google_drive") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  } else if (provider === "dropbox") {
    params.set("token_access_type", "offline");
  }

  return `${config.authUrl}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

export async function exchangeCodeForTokens(
  provider: IntegrationProvider,
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  scopes: string[];
}> {
  const config = getProviderConfig(provider);
  if (!config) throw new Error(`Unknown provider: ${provider}`);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code_verifier: codeVerifier,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as Record<string, unknown>;

  return {
    accessToken: data.access_token as string,
    refreshToken: (data.refresh_token as string) ?? null,
    expiresAt: data.expires_in
      ? new Date(Date.now() + Number(data.expires_in) * 1000)
      : null,
    scopes: String(data.scope ?? "")
      .split(" ")
      .filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

export async function refreshAccessToken(
  provider: IntegrationProvider,
  refreshTokenEnc: string,
): Promise<{ accessToken: string; expiresAt: Date | null }> {
  const config = getProviderConfig(provider);
  if (!config) throw new Error(`Unknown provider: ${provider}`);

  const refreshToken = decrypt(refreshTokenEnc);

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  const data = (await res.json()) as Record<string, unknown>;

  return {
    accessToken: data.access_token as string,
    expiresAt: data.expires_in
      ? new Date(Date.now() + Number(data.expires_in) * 1000)
      : null,
  };
}

// ---------------------------------------------------------------------------
// Provider user info
// ---------------------------------------------------------------------------

export async function fetchProviderUserInfo(
  provider: IntegrationProvider,
  accessToken: string,
): Promise<{ accountId: string; email: string }> {
  const config = getProviderConfig(provider);
  if (!config) throw new Error(`Unknown provider: ${provider}`);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  // Dropbox get_current_account requires POST with empty body
  const method = provider === "dropbox" ? "POST" : "GET";

  const res = await fetch(config.userInfoUrl, { method, headers });
  if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);

  const data = (await res.json()) as Record<string, unknown>;
  return config.parseUserInfo(data);
}

// ---------------------------------------------------------------------------
// Revocation (best-effort)
// ---------------------------------------------------------------------------

export async function revokeProviderToken(
  provider: IntegrationProvider,
  accessTokenEnc: string,
): Promise<void> {
  const config = getProviderConfig(provider);
  if (!config?.revokeUrl) return;

  const token = decrypt(accessTokenEnc);

  try {
    if (provider === "google_drive") {
      await fetch(`${config.revokeUrl}?token=${token}`, { method: "POST" });
    } else if (provider === "dropbox") {
      await fetch(config.revokeUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // Best-effort; don't fail if provider is unreachable
  }
}

// ---------------------------------------------------------------------------
// Auto-refresh helper (used by file import phases)
// ---------------------------------------------------------------------------

export async function getValidAccessToken(
  integration: {
    id: string;
    provider: string;
    access_token_enc: string;
    refresh_token_enc: string | null;
    token_expires_at: string | null;
  },
  updateTokenFn: (
    id: string,
    accessTokenEnc: string,
    expiresAt: Date | null,
  ) => Promise<void>,
): Promise<string> {
  const expiresAt = integration.token_expires_at
    ? new Date(integration.token_expires_at)
    : null;

  // Return current token if still valid (5-min buffer)
  if (expiresAt && expiresAt.getTime() > Date.now() + 5 * 60 * 1000) {
    return decrypt(integration.access_token_enc);
  }

  if (!integration.refresh_token_enc) {
    throw new Error("Token expired and no refresh token available");
  }

  const { accessToken, expiresAt: newExpiresAt } = await refreshAccessToken(
    integration.provider as IntegrationProvider,
    integration.refresh_token_enc,
  );

  const newEncrypted = encrypt(accessToken);
  await updateTokenFn(integration.id, newEncrypted, newExpiresAt);

  return accessToken;
}
