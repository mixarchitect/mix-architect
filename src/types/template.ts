/** Row shape from the release_templates table */
export type ReleaseTemplate = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  release_type: "single" | "ep" | "album" | null;
  format: "stereo" | "atmos" | "both" | null;
  genre_tags: string[];
  default_sample_rate: string | null;
  default_bit_depth: string | null;
  delivery_formats: string[];
  default_special_reqs: string | null;
  default_emotional_tags: string[];
  distribution_fields: Record<string, unknown>;
  client_name: string | null;
  client_email: string | null;
  default_payment_status: string | null;
  default_fee_currency: string | null;
  default_payment_notes: string | null;
  is_default: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Shape for insert/update operations (omit server-managed fields) */
export type ReleaseTemplateInsert = Omit<
  ReleaseTemplate,
  "id" | "user_id" | "usage_count" | "last_used_at" | "created_at" | "updated_at"
>;
