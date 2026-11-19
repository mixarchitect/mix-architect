/**
 * First-party product usage events, recorded to admin_activity_log.
 *
 * These exist to answer "what do people do after they sign up", not to
 * profile anyone: payloads carry ids and enum-like values only (never
 * titles, file names, comment text or other user content), no IP address
 * is stored for them, and the browser is reduced to a coarse device label.
 */
export const PRODUCT_EVENTS = [
  "session_start",
  "section_viewed",
  "onboarding_completed",
  "audio_played",
  "comment_added",
  "audio_downloaded",
  "portal_enabled",
  "portal_link_copied",
  "brief_link_copied",
  "flow_opened",
  "checkout_started",
] as const;

export type ProductEvent = (typeof PRODUCT_EVENTS)[number];

const PRODUCT_EVENT_SET: ReadonlySet<string> = new Set(PRODUCT_EVENTS);

export function isProductEvent(value: string): value is ProductEvent {
  return PRODUCT_EVENT_SET.has(value);
}

const TOP_LEVEL_SECTIONS = new Set([
  "artists",
  "templates",
  "money",
  "payments",
  "quotes",
  "analytics",
  "studio",
  "settings",
  "help",
  "featured",
  "changelog",
  "onboarding",
]);

/**
 * Collapse an /app pathname to a section name with every id removed, so a
 * section view says "looked at a track page", never which track.
 */
export function appSection(pathname: string | null | undefined): string {
  const parts = (pathname ?? "").split("/").filter(Boolean);
  if (parts[0] !== "app") return "other";
  if (parts.length === 1) return "dashboard";
  if (parts[1] === "releases") {
    if (parts[2] === "new") return "new_release";
    if (parts[3] === "tracks") return parts[4] === "new" ? "new_track" : "track";
    if (parts[3] === "brief") return "brief";
    if (parts[3] === "settings") return "release_settings";
    return parts[2] ? "release" : "dashboard";
  }
  return TOP_LEVEL_SECTIONS.has(parts[1]) ? parts[1] : "other";
}

/**
 * Reduce a User-Agent to "iPhone · Safari"-style granularity. Strings that
 * are not raw User-Agents (already-reduced labels) pass through unchanged.
 */
export function describeDevice(userAgent: string | null | undefined): string | null {
  if (!userAgent) return null;
  if (!userAgent.includes("Mozilla/")) return userAgent.slice(0, 40);

  const os = /iPhone|iPod/.test(userAgent)
    ? "iPhone"
    : /iPad/.test(userAgent)
      ? "iPad"
      : /Android/.test(userAgent)
        ? "Android"
        : /Macintosh/.test(userAgent)
          ? "Mac"
          : /Windows/.test(userAgent)
            ? "Windows"
            : /Linux|CrOS/.test(userAgent)
              ? "Linux"
              : "Other";

  const browser = /Edg(e|A|iOS)?\//.test(userAgent)
    ? "Edge"
    : /Firefox\/|FxiOS\//.test(userAgent)
      ? "Firefox"
      : /Chrome\/|CriOS\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Other";

  return `${os} · ${browser}`;
}

const MAX_METADATA_KEYS = 8;
const MAX_METADATA_STRING = 120;

/** Keep only short primitive values so no free-form content can ride along. */
export function sanitizeEventMetadata(input: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_METADATA_KEYS) break;
    if (typeof value === "number" && Number.isFinite(value)) out[key.slice(0, 40)] = value;
    else if (typeof value === "boolean") out[key.slice(0, 40)] = value;
    else if (typeof value === "string" && value) {
      out[key.slice(0, 40)] = value.slice(0, MAX_METADATA_STRING);
    }
  }
  return out;
}
