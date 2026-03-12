-- Persistent per-client notes, keyed by engineer + client email
CREATE TABLE IF NOT EXISTS client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_email text NOT NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(engineer_id, client_email)
);

-- RLS: only the engineer who wrote the note can access it
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_notes_owner ON client_notes
  FOR ALL
  USING (engineer_id = auth.uid())
  WITH CHECK (engineer_id = auth.uid());

-- Reuse existing set_updated_at trigger function from migration 001
CREATE TRIGGER client_notes_updated_at
  BEFORE UPDATE ON client_notes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
