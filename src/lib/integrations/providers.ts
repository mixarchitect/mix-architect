import type { ProviderConfig, IntegrationProvider } from "./types";

const GOOGLE_DRIVE: ProviderConfig = {
  provider: "google_drive",
  displayName: "Google Drive",
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  revokeUrl: "https://oauth2.googleapis.com/revoke",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  supportsPkce: true,
  userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
  parseUserInfo: (data) => ({
    accountId: String(data.id ?? ""),
    email: String(data.email ?? ""),
  }),
};

const DROPBOX: ProviderConfig = {
  provider: "dropbox",
  displayName: "Dropbox",
  clientId: process.env.DROPBOX_CLIENT_ID ?? "",
  clientSecret: process.env.DROPBOX_CLIENT_SECRET ?? "",
  authUrl: "https://www.dropbox.com/oauth2/authorize",
  tokenUrl: "https://api.dropboxapi.com/oauth2/token",
  revokeUrl: "https://api.dropboxapi.com/2/auth/token/revoke",
  scopes: ["files.content.read"],
  supportsPkce: true,
  userInfoUrl: "https://api.dropboxapi.com/2/users/get_current_account",
  parseUserInfo: (data) => ({
    accountId: String(data.account_id ?? ""),
    email: String(data.email ?? ""),
  }),
};

const PROVIDERS: Record<IntegrationProvider, ProviderConfig> = {
  google_drive: GOOGLE_DRIVE,
  dropbox: DROPBOX,
};

export function getProviderConfig(
  provider: string,
): ProviderConfig | null {
  return PROVIDERS[provider as IntegrationProvider] ?? null;
}

/** Returns only providers whose env vars are configured. */
export function getAvailableProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS).filter(
    (p) => p.clientId && p.clientSecret,
  );
}

/** Returns provider keys that have env vars configured. */
export function getAvailableProviderKeys(): IntegrationProvider[] {
  return getAvailableProviders().map((p) => p.provider);
}

export function isValidProvider(
  provider: string,
): provider is IntegrationProvider {
  return provider in PROVIDERS;
}
