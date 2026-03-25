-- ============================================================
-- STRIPE CONNECT + QUOTES + WORKFLOW TRIGGERS
-- ============================================================

-- ── STRIPE CONNECTED ACCOUNTS ─────────────────────────────────

CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_account_id   text NOT NULL,
  access_token        text,
  refresh_token       text,
  scope               text,
  livemode            boolean DEFAULT false,
  charges_enabled     boolean DEFAULT false,
  payouts_enabled     boolean DEFAULT false,
  details_submitted   boolean DEFAULT false,
  business_name       text,
  default_currency    text DEFAULT 'usd',
  country             text,
  connected_at        timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  CONSTRAINT stripe_account_id_unique UNIQUE(stripe_account_id)
);

ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connected account"
  ON stripe_connected_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own connected account"
  ON stripe_connected_accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE TRIGGER set_stripe_connected_accounts_updated_at
  BEFORE UPDATE ON stripe_connected_accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── QUOTES ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotes (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  release_id                  uuid REFERENCES releases(id) ON DELETE SET NULL,
  quote_number                text NOT NULL,
  title                       text,
  status                      text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'paid', 'expired', 'cancelled')),
  subtotal                    numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount             numeric(10,2) DEFAULT 0,
  tax_amount                  numeric(10,2) DEFAULT 0,
  total                       numeric(10,2) NOT NULL DEFAULT 0,
  currency                    text NOT NULL DEFAULT 'USD',
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  paid_at                     timestamptz,
  payment_method              text,
  schedule_group_id           uuid,
  schedule_label              text,
  schedule_order              int,
  client_name                 text,
  client_email                text,
  portal_token                text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  issued_at                   timestamptz,
  due_date                    date,
  expires_at                  timestamptz,
  notes                       text,
  internal_notes              text,
  terms                       text,
  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quotes"
  ON quotes FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX idx_quotes_user ON quotes(user_id);
CREATE INDEX idx_quotes_release ON quotes(release_id);
CREATE INDEX idx_quotes_portal_token ON quotes(portal_token);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_schedule_group ON quotes(schedule_group_id) WHERE schedule_group_id IS NOT NULL;

CREATE TRIGGER set_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── QUOTE LINE ITEMS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quote_line_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id    uuid REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  track_id    uuid REFERENCES tracks(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity    numeric(10,2) NOT NULL DEFAULT 1,
  unit_price  numeric(10,2) NOT NULL,
  total       numeric(10,2) NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage line items on their own quotes"
  ON quote_line_items FOR ALL
  USING (
    quote_id IN (SELECT id FROM quotes WHERE user_id = auth.uid())
  );

CREATE INDEX idx_line_items_quote ON quote_line_items(quote_id);

-- ── WORKFLOW TRIGGERS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workflow_triggers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trigger_event     text NOT NULL
    CHECK (trigger_event IN (
      'release_delivered',
      'all_tracks_approved',
      'payment_received',
      'quote_accepted',
      'release_closed'
    )),
  action_type       text NOT NULL
    CHECK (action_type IN (
      'send_invoice',
      'unlock_downloads',
      'send_email_thank_you',
      'send_email_testimonial_request',
      'send_payment_reminder',
      'update_release_status'
    )),
  config            jsonb DEFAULT '{}',
  enabled           boolean DEFAULT true,
  release_id        uuid REFERENCES releases(id) ON DELETE CASCADE,
  last_triggered_at timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE(user_id, trigger_event, action_type, release_id)
);

ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own triggers"
  ON workflow_triggers FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX idx_triggers_user ON workflow_triggers(user_id);
CREATE INDEX idx_triggers_event ON workflow_triggers(trigger_event);

CREATE TRIGGER set_workflow_triggers_updated_at
  BEFORE UPDATE ON workflow_triggers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── WORKFLOW TRIGGER LOG ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS workflow_trigger_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id    uuid REFERENCES workflow_triggers(id) ON DELETE SET NULL,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  release_id    uuid REFERENCES releases(id) ON DELETE SET NULL,
  trigger_event text NOT NULL,
  action_type   text NOT NULL,
  status        text NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'failed', 'skipped')),
  details       jsonb DEFAULT '{}',
  executed_at   timestamptz DEFAULT now()
);

ALTER TABLE workflow_trigger_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trigger logs"
  ON workflow_trigger_log FOR SELECT
  USING (user_id = auth.uid());

CREATE INDEX idx_trigger_log_user ON workflow_trigger_log(user_id);
CREATE INDEX idx_trigger_log_release ON workflow_trigger_log(release_id);
