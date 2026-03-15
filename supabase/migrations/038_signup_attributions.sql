-- Signup attribution tracking for organic growth loop
-- Tracks how users discover Mix Architect through client-facing portal pages

CREATE TABLE public.signup_attributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  engineer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attributed_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  page_type TEXT DEFAULT 'delivery_portal',
  status TEXT NOT NULL DEFAULT 'clicked',
  clicked_at TIMESTAMPTZ DEFAULT now(),
  signed_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_source CHECK (source IN ('portal_branding', 'post_action_prompt')),
  CONSTRAINT valid_status CHECK (status IN ('clicked', 'signed_up'))
);

ALTER TABLE public.signup_attributions ENABLE ROW LEVEL SECURITY;

-- Engineers can view attributions linked to them (for future dashboard use)
CREATE POLICY "Engineers can view own attributions"
  ON public.signup_attributions FOR SELECT
  USING (auth.uid() = engineer_id);

-- Admins can view all attributions
CREATE POLICY "Admins can view all attributions"
  ON public.signup_attributions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE INDEX idx_attributions_engineer ON public.signup_attributions(engineer_id);
CREATE INDEX idx_attributions_status ON public.signup_attributions(status);
CREATE INDEX idx_attributions_clicked_at ON public.signup_attributions(clicked_at);

-- Track which engineer's portal page led to this user's signup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS attributed_to_engineer UUID REFERENCES auth.users(id) ON DELETE SET NULL;
