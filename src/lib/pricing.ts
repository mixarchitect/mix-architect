/* ------------------------------------------------------------------ */
/*  Centralized pricing constants                                      */
/* ------------------------------------------------------------------ */

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
} as const;

/* ------------------------------------------------------------------ */
/*  Stripe Price IDs                                                   */
/* ------------------------------------------------------------------ */

export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID_MONTHLY ?? "",
  PRO_ANNUAL: process.env.STRIPE_PRO_PRICE_ID_ANNUAL ?? "",
} as const;

/** Billing interval type */
export type BillingInterval = "monthly" | "annual";

/** Get the Stripe Price ID for a given interval */
export function getStripePriceId(interval: BillingInterval): string {
  return interval === "annual"
    ? STRIPE_PRICES.PRO_ANNUAL
    : STRIPE_PRICES.PRO_MONTHLY;
}

/** Display price for a given interval */
export function getDisplayPrice(interval: BillingInterval): {
  amount: number;
  period: string;
  totalAnnual?: number;
} {
  if (interval === "annual") {
    return {
      amount: PRICING.PRO.annualMonthlyEquivalent,
      period: "/mo",
      totalAnnual: PRICING.PRO.annualPrice,
    };
  }
  return {
    amount: PRICING.PRO.monthlyPrice,
    period: "/mo",
  };
}
