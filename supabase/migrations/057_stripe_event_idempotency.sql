-- Stripe webhook idempotency.
--
-- Stripe retries delivery on the same event.id; the previous handler
-- relied on per-row state checks (e.g. `if (quote.status === 'paid')`)
-- which protected the quote-payment branch but NOT
-- customer.subscription.updated, payment_succeeded, account.updated,
-- etc. Those branches sent emails and fired workflow triggers without
-- checking event.id, so a Stripe retry could re-fire welcome emails,
-- payment-received emails, and "payment_received" workflow triggers.
--
-- This table records every event the handler accepts. The handler
-- INSERTs ON CONFLICT DO NOTHING at the very top of the body; if the
-- row already existed (Stripe retry), the handler returns 200 immediately.
--
-- service_role only — no end users touch this table.

CREATE TABLE IF NOT EXISTS stripe_processed_events (
  event_id     text PRIMARY KEY,
  event_type   text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- RLS lockdown: nobody but service-role reads/writes.
ALTER TABLE stripe_processed_events ENABLE ROW LEVEL SECURITY;

-- Useful for ops: which event types have we recently processed?
CREATE INDEX IF NOT EXISTS idx_stripe_processed_events_type_time
  ON stripe_processed_events(event_type, processed_at DESC);

-- Auto-purge old rows so the table doesn't grow forever. Keep 90 days
-- which is well past Stripe's typical retry window (~3 days).
COMMENT ON TABLE stripe_processed_events IS
  'Idempotency log for Stripe webhook deliveries. Rows keyed by event.id; handler INSERTs ON CONFLICT DO NOTHING and returns early on conflict. Old rows can be safely purged after ~7 days.';
