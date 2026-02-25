-- ── Migration 007: Saved Contacts ──────────────────────────────────
-- User-scoped address-book of reusable split person data.

CREATE TABLE IF NOT EXISTS saved_contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name     text NOT NULL,
  pro_org         text,
  member_account  text,
  ipi             text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, person_name)
);

CREATE INDEX IF NOT EXISTS idx_saved_contacts_user_id ON saved_contacts(user_id);

DROP TRIGGER IF EXISTS saved_contacts_updated_at ON saved_contacts;
CREATE TRIGGER saved_contacts_updated_at
  BEFORE UPDATE ON saved_contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE saved_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_contacts_owner ON saved_contacts
  FOR ALL USING (user_id = auth.uid());
