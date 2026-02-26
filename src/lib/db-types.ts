/**
 * Lightweight row types for Supabase tables used across brief pages.
 * These mirror the DB columns actually accessed in the brief templates.
 */

export type BriefTrack = {
  id: string;
  track_number: number;
  title: string;
  samply_url: string | null;
};

export type BriefIntent = {
  track_id: string;
  mix_vision: string | null;
  emotional_tags: string[] | null;
  anti_references: string | null;
};

export type BriefSpec = {
  track_id: string;
  target_loudness: string | null;
  format_override: string | null;
};

export type BriefReference = {
  id: string;
  track_id: string | null;
  song_title: string;
  artist: string | null;
  note: string | null;
};

export type BriefAudioVersion = {
  id: string;
  track_id: string;
};

/* ── Payment tracker types ────────────────────────────────────────── */

export type PaymentRelease = {
  id: string;
  title: string;
  artist: string | null;
  feeTotal: number;
  feeCurrency: string;
  paymentStatus: "unpaid" | "partial" | "paid";
  paidAmount: number;
  paymentNotes: string | null;
  createdAt: string;
  updatedAt: string;
  tracks: PaymentTrack[];
};

export type PaymentTrack = {
  id: string;
  title: string;
  trackNumber: number;
  fee: number | null;
  feePaid: boolean;
};

export type PaymentSummary = {
  outstandingTotal: number;
  earnedTotal: number;
  grandTotal: number;
  outstandingCount: number;
  paidCount: number;
  totalCount: number;
  primaryCurrency: string;
};
