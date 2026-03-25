// ── Stripe Connected Account ──────────────────────────────────

export interface StripeConnectedAccount {
  id: string;
  user_id: string;
  stripe_account_id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  business_name: string | null;
  default_currency: string;
  country: string | null;
  livemode: boolean;
  connected_at: string;
}

// ── Quotes ────────────────────────────────────────────────────

export interface Quote {
  id: string;
  user_id: string;
  release_id: string | null;
  quote_number: string;
  title: string | null;
  status:
    | "draft"
    | "sent"
    | "viewed"
    | "accepted"
    | "paid"
    | "expired"
    | "cancelled";
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  payment_method: "stripe" | "manual" | "external" | null;
  schedule_group_id: string | null;
  schedule_label: string | null;
  schedule_order: number | null;
  client_name: string | null;
  client_email: string | null;
  portal_token: string;
  issued_at: string | null;
  due_date: string | null;
  expires_at: string | null;
  notes: string | null;
  internal_notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string;
  line_items?: QuoteLineItem[];
}

export interface QuoteLineItem {
  id: string;
  quote_id: string;
  track_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
}

// A payment schedule is a logical grouping of quotes sharing the
// same schedule_group_id. UI convenience — not a DB entity.
export interface PaymentSchedule {
  group_id: string;
  release_id: string;
  installments: Quote[];
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  is_fully_paid: boolean;
}

// ── Workflow Triggers ─────────────────────────────────────────

export type TriggerEvent =
  | "release_delivered"
  | "all_tracks_approved"
  | "payment_received"
  | "quote_accepted"
  | "release_closed";

export type ActionType =
  | "send_invoice"
  | "unlock_downloads"
  | "send_email_thank_you"
  | "send_email_testimonial_request"
  | "send_payment_reminder"
  | "update_release_status";

export interface WorkflowTrigger {
  id: string;
  user_id: string;
  trigger_event: TriggerEvent;
  action_type: ActionType;
  config: Record<string, unknown>;
  enabled: boolean;
  release_id: string | null;
  last_triggered_at: string | null;
}
