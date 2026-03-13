import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { FeaturedRelease } from "@/types/featured-release";

export async function getActiveFeaturedRelease(): Promise<FeaturedRelease | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("featured_releases")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single();
  return data as FeaturedRelease | null;
}

export async function getFeaturedReleases(
  page = 1,
  pageSize = 12,
): Promise<{ releases: FeaturedRelease[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from("featured_releases")
    .select("*", { count: "exact" })
    .order("featured_date", { ascending: false })
    .range(from, to);

  return {
    releases: (data as FeaturedRelease[]) ?? [],
    total: count ?? 0,
  };
}

export async function getFeaturedReleaseBySlug(
  slug: string,
): Promise<FeaturedRelease | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("featured_releases")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as FeaturedRelease | null;
}

export async function getFeaturedReleaseSlugs(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("featured_releases")
    .select("slug")
    .order("featured_date", { ascending: false });
  return (data ?? []).map((r) => r.slug);
}

export async function getRecentFeaturedReleases(
  excludeSlug?: string,
  limit = 3,
): Promise<FeaturedRelease[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("featured_releases")
    .select("*")
    .order("featured_date", { ascending: false })
    .limit(limit);

  if (excludeSlug) {
    query = query.neq("slug", excludeSlug);
  }

  const { data } = await query;
  return (data as FeaturedRelease[]) ?? [];
}
