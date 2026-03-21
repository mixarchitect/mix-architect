/**
 * Track a custom event in OpenPanel.
 * Usage: trackEvent('signup_start', { source: 'landing_page' })
 */
export function trackEvent(eventName: string, data?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).__op) {
    const op = (window as unknown as Record<string, unknown>).__op as {
      track: (name: string, data?: Record<string, string | number | boolean>) => void;
    };
    op.track(eventName, data);
  }
}

/**
 * Identify a logged-in user for user-level analytics.
 * Call this after authentication succeeds.
 */
export function identifyUser(profile: {
  profileId: string;
  email?: string;
  firstName?: string;
  [key: string]: string | undefined;
}) {
  if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).__op) {
    const op = (window as unknown as Record<string, unknown>).__op as {
      identify: (profile: Record<string, string | undefined>) => void;
    };
    op.identify(profile);
  }
}
