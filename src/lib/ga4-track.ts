/**
 * GA4 custom event tracking helper.
 *
 * Fire-and-forget — never blocks the caller.
 * Usage: trackGA4Event('signup_start', { source: 'landing' })
 */
export function trackGA4Event(
  eventName: string,
  params?: Record<string, string | number | boolean>,
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
