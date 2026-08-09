export type AttributionSource =
  | "portal_branding"
  | "post_action_prompt"
  | "utm"
  | "organic"
  | "direct";

export type AttributionPageType = "delivery_portal" | "landing";

export type AttributionStatus = "clicked" | "signed_up";

export interface SignupAttribution {
  id: string;
  engineer_id: string | null;
  attributed_user_id: string | null;
  source: AttributionSource;
  page_type: AttributionPageType | null;
  status: AttributionStatus;
  clicked_at: string;
  signed_up_at: string | null;
  created_at: string;
  referrer: string | null;
  landing_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}
