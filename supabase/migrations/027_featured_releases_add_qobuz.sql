-- Add Qobuz streaming link column
ALTER TABLE featured_releases ADD COLUMN IF NOT EXISTS link_qobuz text;
