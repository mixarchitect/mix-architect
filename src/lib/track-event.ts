import { logActivityClient } from "@/lib/activity-logger-client";
import type { ProductEvent } from "@/lib/product-events";

let disabled = false;

/** Admin sessions are excluded so the owner's own clicks don't drown out real usage. */
export function setProductTrackingDisabled(value: boolean) {
  disabled = value;
}

export function trackProductEvent(
  event: ProductEvent,
  metadata?: Record<string, string | number | boolean | null | undefined>,
) {
  if (disabled || typeof window === "undefined") return;
  logActivityClient(event, metadata);
}

/**
 * Record an event at most once per browser tab session. Used for signals
 * where the first occurrence is the information (a visit started, a section
 * was opened, a version was played) and repeats would only add volume.
 */
export function trackOncePerSession(
  key: string,
  event: ProductEvent,
  metadata?: Record<string, string | number | boolean | null | undefined>,
) {
  if (disabled || typeof window === "undefined") return;
  const storageKey = `mix_evt:${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Storage unavailable (private mode): still record, repeats are harmless.
  }
  logActivityClient(event, metadata);
}
