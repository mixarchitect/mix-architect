/**
 * GA4 custom event tracking helper.
 *
 * Fire-and-forget — never blocks the caller.
 * Usage: trackGA4Event('signup_start', { source: 'landing' })
 */
// Param type is intentionally loose: GA4's recommended events (e.g.
// `purchase`) accept nested structures like `items: [{...}]` which
// gtag forwards verbatim. Locking this to flat primitives breaks
// those events.
export function trackGA4Event(
  eventName: string,
  params?: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

// Global type declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
