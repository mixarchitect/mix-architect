export type IntegrationProvider = "google_drive" | "dropbox";

export type ProviderConfig = {
  provider: IntegrationProvider;
  displayName: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  revokeUrl: string | null;
  scopes: string[];
  supportsPkce: boolean;
  userInfoUrl: string;
  parseUserInfo: (data: Record<string, unknown>) => {
    accountId: string;
    email: string;
  };
};

export type OAuthState = {
  provider: IntegrationProvider;
  userId: string;
  codeVerifier: string;
  returnUrl: string;
  nonce: string;
};

/** What the list API returns (no tokens). */
export type IntegrationPublic = {
  id: string;
  provider: IntegrationProvider;
  provider_account_id: string | null;
  provider_email: string | null;
  is_active: boolean;
  scopes: string[];
  created_at: string;
  updated_at: string;
};
