import Stripe from "stripe";

// Fail fast at module load if the secret is missing at runtime.
// The `sk_placeholder_build_only` fallback only kicks in during
// `next build` collecting page data — at runtime in prod, a missing
// key would otherwise produce a misleading "Stripe auth failed"
// error on the first API call instead of pointing at the real
// config issue (env var rotation gone wrong, wrong Vercel
// environment scope, etc.).
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

if (!STRIPE_KEY && !IS_BUILD) {
  throw new Error(
    "STRIPE_SECRET_KEY is required at runtime. Set it in the Vercel env for this deployment scope.",
  );
}

export const stripe = new Stripe(STRIPE_KEY || "sk_placeholder_build_only");
