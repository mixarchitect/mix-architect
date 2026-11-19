/**
 * Shared helpers for first-touch signup attribution: cleaning what gets
 * stored, and turning a stored row into a readable source label.
 */

const AUTH_REFERRER = /(^|\.)accounts\.google\.com$|(^|\.)supabase\.co$|(^|\.)appleid\.apple\.com$/i;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * The page a sign-in provider sends the browser back from is never where a
 * visitor came from; recording it hides the real source.
 */
export function isAuthReferrer(referrer: string | null | undefined): boolean {
  const host = hostOf(referrer);
  return host ? AUTH_REFERRER.test(host) : false;
}

/**
 * Path plus UTM params only. Anything else in the query (OAuth codes,
 * tokens, share ids) has no business in an analytics table.
 */
export function cleanLandingPage(landing: string | null | undefined): string | null {
  if (!landing) return null;
  const [path, query = ""] = landing.split("?");
  const params = new URLSearchParams(query);
  const kept = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) kept.set(key, value);
  }
  const qs = kept.toString();
  return (qs ? `${path}?${qs}` : path).slice(0, 500);
}

export type SourceKind = "search" | "ai" | "social" | "referral" | "campaign" | "direct" | "unknown";

const KNOWN_SOURCES: { pattern: RegExp; label: string; kind: SourceKind }[] = [
  { pattern: /chatgpt\.com|chat\.openai\.com|openai/i, label: "ChatGPT", kind: "ai" },
  { pattern: /claude\.ai|anthropic/i, label: "Claude", kind: "ai" },
  { pattern: /perplexity/i, label: "Perplexity", kind: "ai" },
  { pattern: /gemini\.google|bard\.google/i, label: "Gemini", kind: "ai" },
  { pattern: /copilot\.microsoft/i, label: "Copilot", kind: "ai" },
  { pattern: /(^|\.)google\./i, label: "Google search", kind: "search" },
  { pattern: /(^|\.)bing\.com/i, label: "Bing search", kind: "search" },
  { pattern: /duckduckgo/i, label: "DuckDuckGo", kind: "search" },
  { pattern: /search\.yahoo|search\.brave|ecosia|kagi\.com/i, label: "Other search", kind: "search" },
  { pattern: /reddit/i, label: "Reddit", kind: "social" },
  { pattern: /(^|\.)(x|twitter)\.com|(^|\.)t\.co$/i, label: "X / Twitter", kind: "social" },
  { pattern: /facebook|(^|\.)fb\.|instagram|threads\.net/i, label: "Meta", kind: "social" },
  { pattern: /youtube|youtu\.be/i, label: "YouTube", kind: "social" },
  { pattern: /linkedin|lnkd\.in/i, label: "LinkedIn", kind: "social" },
  { pattern: /tiktok/i, label: "TikTok", kind: "social" },
  { pattern: /gearspace|gearslutz/i, label: "Gearspace", kind: "referral" },
];

export type SignupSourceRow = {
  source?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  engineer_id?: string | null;
};

/** Human-readable origin of a signup, e.g. "Google search" or "ChatGPT". */
export function classifySignupSource(
  row: SignupSourceRow | null | undefined,
): { label: string; kind: SourceKind } {
  if (!row) return { label: "Not recorded", kind: "unknown" };
  if (row.engineer_id) return { label: "Engineer's client portal", kind: "referral" };

  const utm = row.utm_source?.trim();
  if (utm) {
    const known = KNOWN_SOURCES.find((s) => s.pattern.test(utm));
    return known ? { label: known.label, kind: known.kind } : { label: utm, kind: "campaign" };
  }

  if (isAuthReferrer(row.referrer)) {
    return { label: "Lost in sign-in redirect", kind: "unknown" };
  }

  const host = hostOf(row.referrer);
  if (host) {
    const known = KNOWN_SOURCES.find((s) => s.pattern.test(host));
    return known
      ? { label: known.label, kind: known.kind }
      : { label: host.replace(/^www\./, ""), kind: "referral" };
  }

  return { label: "Direct / typed in", kind: "direct" };
}
