/**
 * One-off billing audit + repair script (2026-08-17 billing audit).
 *
 * Read-only by default. Requires STRIPE_SECRET_KEY in the environment.
 *
 *   node --env-file=.env.local scripts/stripe-billing-audit.mjs
 *
 * What it does (read-only):
 *   1. Lists webhook endpoints in the key's mode and flags which events the
 *      handler depends on but the endpoint does not send. This is the root
 *      cause of current_period_end never advancing: the handler has branches
 *      for customer.subscription.updated/.deleted and invoice.paid handling,
 *      but those event types have never appeared in stripe_processed_events.
 *   2. Retrieves the known paying subscription and reports livemode, status,
 *      billing interval, and the true current_period_end. If the key is
 *      sk_live and the subscription 404s, it is a TEST-mode subscription and
 *      reported MRR is $0 (audit issue 4b).
 *   3. Lists expired Checkout Sessions and groups them by mode / metadata /
 *      whether a payment_intent was ever created (audit issue 3: both
 *      session-creation call sites are click-driven, so expirations represent
 *      real users reaching checkout and leaving).
 *
 * Flags (each asks nothing and does exactly one write):
 *   --fix-events   PATCH the webhook endpoint's enabled_events to add the
 *                  missing event types (additive; nothing is removed).
 *   --backfill     Write the true current_period_end / billing_interval /
 *                  status onto the subscriptions row (needs
 *                  NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 *                  If the subscription turns out to be test-mode, sets
 *                  is_test_account = true on the profile instead.
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) {
  console.error(
    "STRIPE_SECRET_KEY is not set. Pull it from Vercel (vercel env pull) or export it, then re-run.",
  );
  process.exit(1);
}
const stripe = new Stripe(STRIPE_KEY);
const mode = STRIPE_KEY.startsWith("sk_live") ? "live" : "test";
const FIX_EVENTS = process.argv.includes("--fix-events");
const BACKFILL = process.argv.includes("--backfill");

// The one paying subscription from the 2026-08-17 audit.
const KNOWN_SUBSCRIPTION_ID = "sub_1TpyQmKHQrWWYOjJgD5DrtKL";

// Every event.type the webhook handler branches on.
const REQUIRED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "charge.dispute.created",
  "charge.refunded",
  "account.updated",
];

console.log(`\n=== Stripe key mode: ${mode.toUpperCase()} ===`);

// ── 1. Webhook endpoint event coverage ──────────────────────────────
const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
if (endpoints.data.length === 0) {
  console.log(`\nNo webhook endpoints exist in ${mode} mode.`);
}
for (const ep of endpoints.data) {
  console.log(`\nEndpoint: ${ep.url}\n  status: ${ep.status}`);
  const enabled = ep.enabled_events;
  const sendsAll = enabled.includes("*");
  const missing = sendsAll
    ? []
    : REQUIRED_EVENTS.filter((e) => !enabled.includes(e));
  console.log(`  enabled_events: ${sendsAll ? "* (all)" : enabled.join(", ")}`);
  if (missing.length === 0) {
    console.log("  ✓ all handler-required events are enabled");
  } else {
    console.log(`  ✗ MISSING: ${missing.join(", ")}`);
    if (FIX_EVENTS) {
      const updated = await stripe.webhookEndpoints.update(ep.id, {
        enabled_events: [...new Set([...enabled, ...missing])],
      });
      console.log(`  → fixed; now sends: ${updated.enabled_events.join(", ")}`);
    } else {
      console.log("  → re-run with --fix-events to add them");
    }
  }
}

// ── 2. The known paying subscription ────────────────────────────────
console.log(`\n=== Subscription ${KNOWN_SUBSCRIPTION_ID} (${mode} mode) ===`);
let sub = null;
try {
  sub = await stripe.subscriptions.retrieve(KNOWN_SUBSCRIPTION_ID, {
    expand: ["items"],
  });
} catch (err) {
  if (err?.statusCode === 404) {
    console.log(
      `Not found in ${mode} mode.` +
        (mode === "live"
          ? " ⇒ this is a TEST-mode subscription: reported MRR from it is $0 (issue 4b confirmed)."
          : " Try again with the live key."),
    );
  } else {
    throw err;
  }
}
if (sub) {
  const item = sub.items?.data?.[0];
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;
  const interval = item?.price?.recurring?.interval ?? null;
  console.log(`  livemode: ${sub.livemode}`);
  console.log(`  status: ${sub.status}  cancel_at_period_end: ${sub.cancel_at_period_end}`);
  console.log(`  billing interval: ${interval}`);
  console.log(`  true current_period_end: ${periodEnd}`);
  if (sub.test_clock) console.log(`  ⚠ attached to test clock: ${sub.test_clock}`);

  if (BACKFILL) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error("--backfill needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
      process.exit(1);
    }
    const supabase = createClient(url, key);
    if (!sub.livemode) {
      const { data: row } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", KNOWN_SUBSCRIPTION_ID)
        .maybeSingle();
      if (row?.user_id) {
        await supabase
          .from("profiles")
          .update({ is_test_account: true })
          .eq("id", row.user_id);
        console.log(`  → test-mode sub: set is_test_account=true on profile ${row.user_id}`);
      }
    } else {
      const statusMap = {
        active: "active", past_due: "past_due", canceled: "canceled",
        trialing: "trialing", incomplete: "incomplete",
        incomplete_expired: "canceled", unpaid: "past_due", paused: "canceled",
      };
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: statusMap[sub.status] || "active",
          current_period_end: periodEnd,
          billing_interval: interval === "month" || interval === "year" ? interval : null,
          cancel_at_period_end: sub.cancel_at_period_end,
        })
        .eq("stripe_subscription_id", KNOWN_SUBSCRIPTION_ID);
      console.log(error ? `  → backfill FAILED: ${error.message}` : "  → row backfilled");
    }
  }
}

// ── 3. Expired checkout sessions (issue 3) ──────────────────────────
console.log(`\n=== Expired Checkout Sessions (${mode} mode, up to 100) ===`);
const sessions = await stripe.checkout.sessions.list({ status: "expired", limit: 100 });
const groups = {};
for (const s of sessions.data) {
  const kind = s.metadata?.quote_id
    ? "quote-payment"
    : s.metadata?.supabase_user_id
      ? `subscription:${s.metadata?.plan ?? "pro"}`
      : "untagged";
  const pi = s.payment_intent ? "reached-payment-intent" : "no-payment-intent";
  const key = `${s.mode} | ${kind} | ${pi}`;
  groups[key] = (groups[key] || 0) + 1;
}
console.log(`total: ${sessions.data.length}${sessions.has_more ? "+ (has more)" : ""}`);
for (const [k, n] of Object.entries(groups).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${k}`);
}
const oldest = sessions.data.at(-1);
const newest = sessions.data[0];
if (newest && oldest) {
  console.log(
    `  range: ${new Date(oldest.created * 1000).toISOString().slice(0, 10)} → ${new Date(newest.created * 1000).toISOString().slice(0, 10)}`,
  );
}
console.log(
  "\nInterpretation: both session-creation call sites are click-only (auth'd upgrade button, quote-portal Pay button), so these are real users reaching checkout and not completing. Quote-payment groups point at the client payment flow; subscription groups at the upgrade flow. no-payment-intent means they left before entering a card.\n",
);
