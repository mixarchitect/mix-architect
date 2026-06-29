-- Dual portal logo: optional dark-mode variant shown when the client portal
-- is viewed in dark mode. logo_path remains the default/light-mode logo and
-- the fallback when no dark variant is set.
ALTER TABLE public.workspace_branding
  ADD COLUMN IF NOT EXISTS logo_path_dark text;
