-- Change default payment_status from 'unpaid' to 'no_fee'
-- New releases start with no fee obligation by default.
-- Existing releases keep their current status.
ALTER TABLE releases ALTER COLUMN payment_status SET DEFAULT 'no_fee';
