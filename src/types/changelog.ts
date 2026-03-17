export type ChangelogCategory = "feature" | "improvement" | "fix" | "announcement";

export interface ChangelogEntry {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: ChangelogCategory;
  cover_image_path: string | null;
  video_url: string | null;
  published_at: string;
  is_published: boolean;
  is_highlighted: boolean;
  version_tag: string | null;
  created_at: string;
  updated_at: string;
}

/** Public-facing subset — omits admin-only timestamp fields. */
export type ChangelogEntryPublic = Omit<ChangelogEntry, "created_at" | "updated_at">;
