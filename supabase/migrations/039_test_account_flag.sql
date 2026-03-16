-- Add test account flag to exclude from admin metrics
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN NOT NULL DEFAULT false;
