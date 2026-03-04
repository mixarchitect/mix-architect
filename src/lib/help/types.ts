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
  | "under_review"
  | "planned"
  | "in_progress"
  | "shipped";
