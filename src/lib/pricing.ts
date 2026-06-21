/* ------------------------------------------------------------------ */
/*  Centralized pricing constants                                      */
/* ------------------------------------------------------------------ */

import type { Plan } from "@/lib/entitlements";

export const PRICING = {
  FREE: {
    name: "Free",
    description: "Perfect for independent artists getting started",
    monthlyPrice: 0,
    features: [
      "1 release",
      "Mix brief builder with intent & references",
      "Release planning & timeline",
      "Audio review with waveform & comments",
      "Technical specs (LUFS, format, sample rate)",
      "Audio format conversion",
    ],
  },
  PRO: {
    name: "Pro",
    description: "Everything you need to run a professional operation",
    monthlyPrice: 14,
    annualPrice: 129,
    annualMonthlyEquivalent: 10.75, // $129 / 12
    annualSavingsPercent: 23, // Math.round((1 - 129/168) * 100)
    features: [
      "Unlimited releases",
      "Everything in Free, plus:",
      "Audio file storage",
      "Web-based client delivery portal",
      "Release templates",
      "Payment tracking with export",
      "Multi-project dashboard",
      "Priority support",
    ],
  },
  STUDIO: {
    name: "Studio",
    description: "A white-labeled studio with your whole team",
    monthlyPrice: 39,
    annualPrice: 390,
    annualMonthlyEquivalent: 32.5, // $390 / 12
    annualSavingsPercent: 17, // Math.round((1 - 390/468) * 100)
    features: [
      "Unlimited team members",
      "Everything in Pro, plus:",
      "Full white-label client portal",
      "Custom portal domain",
      "Branded email sender",
      "Shared client roster & releases",
      "Member roles & permissions",
    ],
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Stripe Price IDs                                                   */
/* ------------------------------------------------------------------ */

export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID_MONTHLY ?? "",
  PRO_ANNUAL: process.env.STRIPE_PRO_PRICE_ID_ANNUAL ?? "",
  STUDIO_MONTHLY: process.env.STRIPE_STUDIO_PRICE_ID_MONTHLY ?? "",
  STUDIO_ANNUAL: process.env.STRIPE_STUDIO_PRICE_ID_ANNUAL ?? "",
} as const;

/** Billing interval type */
export type BillingInterval = "monthly" | "annual";

/** The paid plans that have Stripe prices (Free has none). */
export type PaidPlan = "pro" | "studio";

/** Get the Stripe Price ID for a given paid plan + interval. */
export function getStripePriceId(plan: PaidPlan, interval: BillingInterval): string {
  if (plan === "studio") {
    return interval === "annual"
      ? STRIPE_PRICES.STUDIO_ANNUAL
      : STRIPE_PRICES.STUDIO_MONTHLY;
  }
  return interval === "annual"
    ? STRIPE_PRICES.PRO_ANNUAL
    : STRIPE_PRICES.PRO_MONTHLY;
}

/**
 * Resolve a Stripe Price ID back to a plan. Used by the webhook to
 * tell Pro from Studio on customer.subscription.* events (which carry
 * the price but no checkout metadata — e.g. a portal upgrade). Returns
 * null for an unrecognized price id.
 */
export function planFromPriceId(priceId: string | null | undefined): PaidPlan | null {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICES.STUDIO_MONTHLY || priceId === STRIPE_PRICES.STUDIO_ANNUAL) {
    return "studio";
  }
  if (priceId === STRIPE_PRICES.PRO_MONTHLY || priceId === STRIPE_PRICES.PRO_ANNUAL) {
    return "pro";
  }
  return null;
}

/** Display price for a given plan + interval. */
export function getDisplayPrice(
  plan: PaidPlan,
  interval: BillingInterval,
): { amount: number; period: string; totalAnnual?: number } {
  const tier = plan === "studio" ? PRICING.STUDIO : PRICING.PRO;
  if (interval === "annual") {
    return {
      amount: tier.annualMonthlyEquivalent,
      period: "/mo",
      totalAnnual: tier.annualPrice,
    };
  }
  return { amount: tier.monthlyPrice, period: "/mo" };
}
