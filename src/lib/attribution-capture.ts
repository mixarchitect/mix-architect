import type { NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

const TOUCH_COOKIE = "mix_attribution_touch";
const REFERRAL_COOKIE = "mix_attribution_id";
const MAX_ACCOUNT_AGE_MS = 60 * 60 * 1000;

/**
 * Record how a new signup found the app, from the first-touch cookie set by
 * AttributionCapture. Never throws; a missing cookie still records a
 * 'direct' row so no signup is untraceable. Skips users on the
 * engineer-referral path (they get linked to their click row separately)
 * and accounts older than an hour (so the auth callback can call this on
 * every code exchange without stamping old users).
 */
export async function recordSignupAttribution(
  req: NextRequest,
  user: { id: string; created_at?: string },
): Promise<void> {
  try {
    if (req.cookies.get(REFERRAL_COOKIE)?.value) return;
    if (
      user.created_at &&
      Date.now() - new Date(user.created_at).getTime() > MAX_ACCOUNT_AGE_MS
    ) {
      return;
    }

    const svc = createSupabaseServiceClient();
    const { data: existing } = await svc
      .from("signup_attributions")
      .select("id")
      .eq("attributed_user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (existing) return;

    let touch: Record<string, unknown> = {};
    const raw = req.cookies.get(TOUCH_COOKIE)?.value;
    if (raw) {
      try {
        touch = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
      } catch {
        touch = {};
      }
    }
    const clean = (v: unknown, max: number) =>
      typeof v === "string" && v ? v.slice(0, max) : null;

    const utmSource = clean(touch.utm_source, 200);
    const referrer = clean(touch.referrer, 500);
    const source = utmSource ? "utm" : referrer ? "organic" : "direct";

    const { error } = await svc.from("signup_attributions").insert({
      attributed_user_id: user.id,
      source,
      page_type: "landing",
      status: "signed_up",
      signed_up_at: new Date().toISOString(),
      referrer,
      landing_page: clean(touch.landing_page, 500),
      utm_source: utmSource,
      utm_medium: clean(touch.utm_medium, 200),
      utm_campaign: clean(touch.utm_campaign, 200),
      utm_term: clean(touch.utm_term, 200),
      utm_content: clean(touch.utm_content, 200),
    });
    if (error) {
      console.error("[attribution] signup attribution insert failed:", error);
    }
  } catch (err) {
    console.error("[attribution] signup attribution failed:", err);
  }
}
