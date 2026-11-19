"use client";

import { useEffect } from "react";
import { cleanLandingPage, isAuthReferrer } from "@/lib/attribution-source";

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
    // A page view that is the return leg of a sign-in (OAuth code, email
    // confirmation) is not a first touch. Recording it stamped signups as
    // "from accounts.google.com" and hid where they really came from.
    if (params.has("code") || params.has("token_hash")) return;

    let referrer: string | null = document.referrer || null;
    try {
      if (referrer && new URL(referrer).origin === window.location.origin) {
        referrer = null;
      }
    } catch {
      referrer = null;
    }
    if (isAuthReferrer(referrer)) return;

    const clip = (v: string | null, max: number) => (v ? v.slice(0, max) : null);
    const touch = {
      referrer: clip(referrer, 500),
      landing_page: cleanLandingPage(window.location.pathname + window.location.search),
      utm_source: clip(params.get("utm_source"), 200),
      utm_medium: clip(params.get("utm_medium"), 200),
      utm_campaign: clip(params.get("utm_campaign"), 200),
      utm_term: clip(params.get("utm_term"), 200),
      utm_content: clip(params.get("utm_content"), 200),
    };
    document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(touch))}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${sharedCookieDomain()}`;
  }, []);
  return null;
}

/**
 * The site answers on both the bare domain and www. A host-only cookie set
 * on one is invisible on the other, so a visitor who lands on www and is
 * sent back from sign-in to the bare domain lost their first touch. Scoping
 * the cookie to the parent domain keeps it across both.
 */
function sharedCookieDomain(): string {
  const host = window.location.hostname;
  const bare = host.replace(/^www\./, "");
  const isIp = /^[\d.]+$/.test(bare) || bare.includes(":");
  if (isIp || bare.split(".").length !== 2) return "";
  return `; Domain=.${bare}`;
}
