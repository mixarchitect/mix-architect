-- Integrations: OAuth connections to cloud providers (Google Drive, Dropbox)

CREATE TABLE integrations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider            text NOT NULL CHECK (provider IN ('google_drive', 'dropbox')),
  provider_account_id text,
  provider_email      text,
  access_token_enc    text NOT NULL,
  refresh_token_enc   text,
  token_expires_at    timestamptz,
  scopes              text[] DEFAULT '{}',
  metadata            jsonb DEFAULT '{}',
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

CREATE TABLE integration_sync_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  action         text NOT NULL,
  status         text NOT NULL CHECK (status IN ('started', 'success', 'failed')),
  details        jsonb DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integration_sync_log_integration_id ON integration_sync_log(integration_id);

-- Updated-at trigger (reuses existing set_updated_at function)
CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY integrations_owner ON integrations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY integration_sync_log_owner ON integration_sync_log
  FOR ALL USING (
    integration_id IN (SELECT id FROM integrations WHERE user_id = auth.uid())
  );
