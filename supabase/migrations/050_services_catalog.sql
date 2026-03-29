-- Services catalog: reusable line items for quotes/invoices
CREATE TABLE IF NOT EXISTS services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text NOT NULL,
  description text,
  default_rate numeric(10,2) NOT NULL DEFAULT 0,
  unit        text NOT NULL DEFAULT 'flat'
    CHECK (unit IN ('flat','hourly','per_track','per_song','per_stem','custom')),
  sort_order  int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own services"
  ON services FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX idx_services_user ON services(user_id);
