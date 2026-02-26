-- Migration 009: Release Pinning
-- Adds a pinned boolean to releases for dashboard pin-to-top feature.

ALTER TABLE releases ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;

-- Replace trigger so pin-only changes don't bump updated_at
CREATE OR REPLACE FUNCTION releases_set_updated_at()
RETURNS trigger AS $$
BEGIN
  -- Skip updated_at bump when the only change is to the pinned column
  IF NEW.pinned IS DISTINCT FROM OLD.pinned
     AND ROW(NEW.title, NEW.artist, NEW.release_type, NEW.format, NEW.status,
             NEW.global_direction, NEW.target_date, NEW.genre_tags,
             NEW.client_name, NEW.client_email, NEW.delivery_notes,
             NEW.fee_total, NEW.fee_currency, NEW.payment_status, NEW.payment_notes,
             NEW.cover_art_url, NEW.distributor, NEW.record_label, NEW.upc,
             NEW.copyright_holder, NEW.copyright_year, NEW.phonogram_copyright,
             NEW.catalog_number, NEW.paid_amount)
        IS NOT DISTINCT FROM
        ROW(OLD.title, OLD.artist, OLD.release_type, OLD.format, OLD.status,
            OLD.global_direction, OLD.target_date, OLD.genre_tags,
            OLD.client_name, OLD.client_email, OLD.delivery_notes,
            OLD.fee_total, OLD.fee_currency, OLD.payment_status, OLD.payment_notes,
            OLD.cover_art_url, OLD.distributor, OLD.record_label, OLD.upc,
            OLD.copyright_holder, OLD.copyright_year, OLD.phonogram_copyright,
            OLD.catalog_number, OLD.paid_amount)
  THEN
    NEW.updated_at = OLD.updated_at;
  ELSE
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS releases_updated_at ON releases;
CREATE TRIGGER releases_updated_at
  BEFORE UPDATE ON releases
  FOR EACH ROW EXECUTE FUNCTION releases_set_updated_at();
