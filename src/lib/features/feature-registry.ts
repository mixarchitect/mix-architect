export const FEATURE_KEYS = [
  "payment_tracking",
  "client_portal",
  "invoicing",
  "download_gating",
  "proposal_system",
  "expense_tracking",
  "time_tracking",
  "revision_limits",
  "release_planning",
  "mix_brief",
  "audio_review",
  "technical_specs",
  "delivery_formats",
  "audio_conversion",
  "distribution_checklist",
  "album_flow",
  "templates",
  "timeline_view",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type FeatureVisibility = Record<FeatureKey, boolean>;

/** Keys hidden for artist / self-releasing persona */
const ARTIST_HIDDEN_FEATURES: FeatureKey[] = [
  "payment_tracking",
  "client_portal",
  "invoicing",
  "download_gating",
  "proposal_system",
  "expense_tracking",
  "time_tracking",
  "revision_limits",
];

export function getDefaultVisibility(
  persona: "artist" | "engineer" | "both" | "other",
): FeatureVisibility {
  const visibility = {} as FeatureVisibility;
  for (const key of FEATURE_KEYS) {
    if (persona === "artist") {
      visibility[key] = !ARTIST_HIDDEN_FEATURES.includes(key);
    } else {
      // engineer, both, other → everything visible
      visibility[key] = true;
    }
  }
  return visibility;
}

/**
 * Merge stored JSONB with the full registry so new keys added later
 * default to true (visible) rather than silently hidden.
 */
export function resolveVisibility(
  stored: Partial<FeatureVisibility> | null | undefined,
): FeatureVisibility {
  const resolved = {} as FeatureVisibility;
  for (const key of FEATURE_KEYS) {
    resolved[key] = stored?.[key] ?? true;
  }
  return resolved;
}

/** Feature groups for the Settings UI */
export const FEATURE_GROUPS = [
  {
    heading: "Client & Business",
    keys: [
      "payment_tracking",
      "client_portal",
      "invoicing",
      "download_gating",
      "proposal_system",
      "expense_tracking",
      "time_tracking",
      "revision_limits",
    ] as FeatureKey[],
  },
  {
    heading: "Release & Audio",
    keys: [
      "release_planning",
      "mix_brief",
      "audio_review",
      "technical_specs",
      "delivery_formats",
      "audio_conversion",
      "distribution_checklist",
      "album_flow",
      "templates",
      "timeline_view",
    ] as FeatureKey[],
  },
] as const;

export const FEATURE_LABELS: Record<
  FeatureKey,
  { label: string; description: string }
> = {
  payment_tracking: {
    label: "Payment Tracking",
    description: "Track incoming payments per release",
  },
  client_portal: {
    label: "Client Portal",
    description: "Shareable portal for client review and delivery",
  },
  invoicing: {
    label: "Invoicing",
    description: "Generate and send invoices",
  },
  download_gating: {
    label: "Download Gating",
    description: "Require payment before file download",
  },
  proposal_system: {
    label: "Proposals",
    description: "Send project proposals to prospective clients",
  },
  expense_tracking: {
    label: "Expense Tracking",
    description: "Track expenses against releases",
  },
  time_tracking: {
    label: "Time Tracking",
    description: "Log time spent on releases",
  },
  revision_limits: {
    label: "Revision Limits",
    description: "Set and enforce revision count limits",
  },
  release_planning: {
    label: "Release Planning",
    description: "Plan and manage your releases",
  },
  mix_brief: {
    label: "Mix Brief Builder",
    description: "Structured briefs for mix projects",
  },
  audio_review: {
    label: "Audio Review",
    description: "Waveform playback with timestamped comments",
  },
  technical_specs: {
    label: "Technical Specs",
    description: "LUFS, sample rate, and bit depth analysis",
  },
  delivery_formats: {
    label: "Delivery Format Picker",
    description: "Choose output formats for final delivery",
  },
  audio_conversion: {
    label: "Audio Format Conversion",
    description: "Convert between audio formats",
  },
  distribution_checklist: {
    label: "Distribution Checklist",
    description: "Track distribution platform delivery",
  },
  album_flow: {
    label: "Album Flow Simulator",
    description: "Simulate album track sequencing",
  },
  templates: {
    label: "Templates",
    description: "Reusable release and project templates",
  },
  timeline_view: {
    label: "Timeline View",
    description: "Multi-release timeline visualization",
  },
};
