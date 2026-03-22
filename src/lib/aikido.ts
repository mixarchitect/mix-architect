/**
 * Server-side Aikido API client.
 * Uses OAuth2 client credentials flow to authenticate.
 */

const AIKIDO_BASE = "https://app.aikido.dev/api/public/v1";
const AIKIDO_TOKEN_URL = "https://app.aikido.dev/api/oauth/token";

// In-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const clientId = process.env.AIKIDO_CLIENT_ID;
  const clientSecret = process.env.AIKIDO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("AIKIDO_CLIENT_ID and AIKIDO_CLIENT_SECRET must be set");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const res = await fetch(AIKIDO_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Aikido token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  // Cache with expiry (default to 1 hour if not provided)
  const expiresIn = (data.expires_in ?? 3600) * 1000;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn,
  };

  return cachedToken.token;
}

async function aikidoFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${AIKIDO_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Aikido API ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

// ── Types ──

export interface AikidoIssueCounts {
  issue_groups: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    all: number;
  };
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    all: number;
  };
}

export interface AikidoIssueGroup {
  id: number;
  title: string;
  description: string | null;
  type: string;
  severity_score: number;
  severity: "critical" | "high" | "medium" | "low";
  group_status: string;
  time_to_fix_minutes: number;
  locations: unknown[];
  how_to_fix: string;
  related_cve_ids: string[];
  first_detected_at?: number;
}

export interface AikidoCodeRepo {
  id: number;
  name: string;
}

// ── API Methods ──

export async function getIssueCounts(
  repoName?: string,
): Promise<AikidoIssueCounts> {
  const params = new URLSearchParams();
  if (repoName) params.set("filter_code_repo_name", repoName);
  const qs = params.toString();
  return aikidoFetch<AikidoIssueCounts>(
    `/issues/counts${qs ? `?${qs}` : ""}`,
  );
}

export async function getOpenIssueGroups(
  repoName?: string,
  page = 0,
): Promise<AikidoIssueGroup[]> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("per_page", "20");
  if (repoName) params.set("filter_code_repo_name", repoName);
  return aikidoFetch<AikidoIssueGroup[]>(
    `/open-issue-groups?${params.toString()}`,
  );
}

export async function listCodeRepos(): Promise<AikidoCodeRepo[]> {
  return aikidoFetch<AikidoCodeRepo[]>("/repositories/code");
}

export async function triggerScan(codeRepoId: number): Promise<void> {
  await aikidoFetch(`/repositories/code/${codeRepoId}/scan`, {
    method: "POST",
  });
}

/**
 * Convenience: find repo by name and trigger scan.
 * Returns the repo ID used, or null if not found.
 */
export async function triggerScanByName(
  repoName: string,
): Promise<number | null> {
  const repos = await listCodeRepos();
  const repo = repos.find(
    (r) => r.name.toLowerCase() === repoName.toLowerCase(),
  );
  if (!repo) return null;
  await triggerScan(repo.id);
  return repo.id;
}

/**
 * Check whether Aikido credentials are configured.
 */
export function isAikidoConfigured(): boolean {
  return !!(process.env.AIKIDO_CLIENT_ID && process.env.AIKIDO_CLIENT_SECRET);
}
