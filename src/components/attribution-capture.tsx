"use client";

import { useEffect } from "react";

const COOKIE = "mix_attribution_touch";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * First-touch attribution capture. On the first page view without a touch
 * cookie, records the external referrer, landing page, and UTM params in a
 * 30-day cookie. The signup route reads it server-side and writes a
 * signup_attributions row (source: utm / organic / direct). First touch
 * wins: later visits never overwrite the cookie.
 */
export function AttributionCapture() {
  useEffect(() => {
    if (document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`))) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    let referrer: string | null = document.referrer || null;
    try {
      if (referrer && new URL(referrer).origin === window.location.origin) {
        referrer = null;
      }
    } catch {
      referrer = null;
    }
    const clip = (v: string | null, max: number) => (v ? v.slice(0, max) : null);
    const touch = {
      referrer: clip(referrer, 500),
      landing_page: clip(window.location.pathname + window.location.search, 500),
      utm_source: clip(params.get("utm_source"), 200),
      utm_medium: clip(params.get("utm_medium"), 200),
      utm_campaign: clip(params.get("utm_campaign"), 200),
      utm_term: clip(params.get("utm_term"), 200),
      utm_content: clip(params.get("utm_content"), 200),
    };
    document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(touch))}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
  }, []);
  return null;
}
