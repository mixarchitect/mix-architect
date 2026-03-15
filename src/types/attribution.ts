export type AttributionSource = "portal_branding" | "post_action_prompt";

export type AttributionPageType = "delivery_portal";

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
}
