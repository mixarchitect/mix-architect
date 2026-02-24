-- Add paid_amount column to track partial payments
ALTER TABLE releases ADD COLUMN IF NOT EXISTS paid_amount numeric(10,2) DEFAULT 0;
