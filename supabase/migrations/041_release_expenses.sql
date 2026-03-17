-- Release expenses: line-item table for tracking project costs
-- Engineer-side only — never exposed to client portal

CREATE TABLE public.release_expenses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id  uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  description text NOT NULL,
  amount      numeric(10,2) NOT NULL,
  paid_by     text,
  owed_by     text,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fetching expenses by release
CREATE INDEX idx_release_expenses_release_id ON release_expenses(release_id);

-- RLS
ALTER TABLE release_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expenses"
  ON release_expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update timestamp (reuse existing set_updated_at function)
CREATE TRIGGER release_expenses_updated
  BEFORE UPDATE ON release_expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
