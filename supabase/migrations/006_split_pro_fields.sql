-- ── Migration 006: PRO Fields for Splits + Sound Exchange ID ──────

-- Per-person PRO fields on track_splits
ALTER TABLE track_splits ADD COLUMN IF NOT EXISTS pro_org text;
ALTER TABLE track_splits ADD COLUMN IF NOT EXISTS member_account text;
ALTER TABLE track_splits ADD COLUMN IF NOT EXISTS ipi text;

-- Sound Exchange ID on track_distribution
ALTER TABLE track_distribution ADD COLUMN IF NOT EXISTS sound_exchange_id text;
