import { createSupabasePublicClient } from "@/lib/supabasePublicClient";
import type { ChangelogEntryPublic } from "@/types/changelog";

/**
 * Fetch published changelog entries, ordered by published_at DESC.
 * Supports pagination and optional category filter.
 */
export async function getPublishedEntries(
  page: number = 1,
  pageSize: number = 15,
  category?: string,
): Promise<{ entries: ChangelogEntryPublic[]; totalCount: number }> {
  const supabase = createSupabasePublicClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("changelog_entries")
    .select(
      "id, slug, title, summary, body, category, cover_image_path, video_url, published_at, is_published, is_highlighted, version_tag",
      { count: "exact" },
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[changelog] Failed to fetch entries:", error.message);
    return { entries: [], totalCount: 0 };
  }

  return {
    entries: (data ?? []) as ChangelogEntryPublic[],
    totalCount: count ?? 0,
  };
}

/**
 * Fetch a single published entry by slug.
 */
export async function getEntryBySlug(
  slug: string,
): Promise<ChangelogEntryPublic | null> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("changelog_entries")
    .select(
      "id, slug, title, summary, body, category, cover_image_path, video_url, published_at, is_published, is_highlighted, version_tag",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as ChangelogEntryPublic;
}

/**
 * Fetch the previous and next published entries relative to a given published_at date.
 */
export async function getAdjacentEntries(currentPublishedAt: string): Promise<{
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}> {
  const supabase = createSupabasePublicClient();

  const [prevResult, nextResult] = await Promise.all([
    supabase
      .from("changelog_entries")
      .select("slug, title")
      .eq("is_published", true)
      .lt("published_at", currentPublishedAt)
      .order("published_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("changelog_entries")
      .select("slug, title")
      .eq("is_published", true)
      .gt("published_at", currentPublishedAt)
      .order("published_at", { ascending: true })
      .limit(1)
      .single(),
  ]);

  return {
    previous: prevResult.data as { slug: string; title: string } | null,
    next: nextResult.data as { slug: string; title: string } | null,
  };
}

/**
 * Fetch all published slugs (for sitemap generation).
 */
export async function getAllPublishedSlugs(): Promise<string[]> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("changelog_entries")
    .select("slug")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[changelog] Failed to fetch slugs:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.slug);
}

/**
 * Fetch the N most recent published entries.
 */
export async function getRecentEntries(
  limit: number = 5,
): Promise<ChangelogEntryPublic[]> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("changelog_entries")
    .select(
      "id, slug, title, summary, body, category, cover_image_path, video_url, published_at, is_published, is_highlighted, version_tag",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[changelog] Failed to fetch recent entries:", error.message);
    return [];
  }

  return (data ?? []) as ChangelogEntryPublic[];
}

/**
 * Fetch just the published_at of the most recent published entry.
 */
export async function getLatestPublishedDate(): Promise<string | null> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("changelog_entries")
    .select("published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.published_at;
}
