export type ArticleCategory =
  | "getting-started"
  | "releases"
  | "audio"
  | "tasks"
  | "timeline"
  | "account"
  | "billing";

export interface HelpArticle {
  id: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  content: ArticleSection[];
  tags: string[];
  updatedAt: string;
}

export interface ArticleSection {
  heading?: string;
  body: string;
  tip?: string;
  warning?: string;
  mockup?: string;
}

export type BugSeverity = "low" | "medium" | "high" | "critical";

export type FeatureCategory =
  | "workflow"
  | "audio"
  | "collaboration"
  | "integrations"
  | "distribution"
  | "payments"
  | "mobile"
  | "other";

export type FeatureStatus =
  | "new"
  | "under_review"
  | "planned"
  | "in_progress"
  | "shipped"
  | "declined";

// --- Feature Request (full row from DB) ---
export interface FeatureRequest {
  id: string;
  created_at: string;
  user_id: string | null;
  email: string | null;
  title: string;
  description: string;
  category: FeatureCategory;
  vote_count: number;
  status: FeatureStatus;
  admin_notes: string | null;
  tags: string[];
  merged_into_id: string | null;
  status_changed_at: string | null;
  admin_response: string | null;
}

// For admin list view with aggregated data
export interface FeatureRequestAdmin extends FeatureRequest {
  merge_count: number;
  total_votes: number;
  submitter_name: string | null;
}

// --- Changelog Suggester (for feature request → changelog attribution) ---
export interface ChangelogSuggester {
  changelog_entry_id: string;
  feature_request_id: string;
  request_title: string;
  user_id: string | null;
  display_name: string;
  vote_count: number;
}
