import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import type { ChangelogEntry } from "@/types/changelog";

/**
 * Fetch ALL entries (published + drafts), ordered by published_at DESC.
 */
export async function getAllEntries(): Promise<ChangelogEntry[]> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("changelog_entries")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[changelog-admin] Failed to fetch entries:", error.message);
    return [];
  }

  return (data ?? []) as ChangelogEntry[];
}

/**
 * Fetch a single entry by ID (published or draft).
 */
export async function getEntryById(
  id: string,
): Promise<ChangelogEntry | null> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("changelog_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as ChangelogEntry;
}

/**
 * Generate a URL-safe slug from a title.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Create a new changelog entry.
 */
export async function createEntry(
  data: Omit<ChangelogEntry, "id" | "created_at" | "updated_at">,
): Promise<ChangelogEntry | null> {
  const supabase = createSupabaseServiceClient();

  const slug = data.slug || generateSlug(data.title);

  const { data: created, error } = await supabase
    .from("changelog_entries")
    .insert({ ...data, slug })
    .select("*")
    .single();

  if (error) {
    console.error("[changelog-admin] Failed to create entry:", error.message);
    return null;
  }

  return created as ChangelogEntry;
}

/**
 * Update an existing changelog entry.
 */
export async function updateEntry(
  id: string,
  data: Partial<Omit<ChangelogEntry, "id" | "created_at" | "updated_at">>,
): Promise<ChangelogEntry | null> {
  const supabase = createSupabaseServiceClient();

  const { data: updated, error } = await supabase
    .from("changelog_entries")
    .update(data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[changelog-admin] Failed to update entry:", error.message);
    return null;
  }

  return updated as ChangelogEntry;
}

/**
 * Delete a changelog entry (hard delete).
 */
export async function deleteEntry(id: string): Promise<boolean> {
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase
    .from("changelog_entries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[changelog-admin] Failed to delete entry:", error.message);
    return false;
  }

  return true;
}

/**
 * Upload a cover image for a changelog entry.
 * Stores in the featured-releases bucket under changelog/{slug}/.
 */
export async function uploadChangelogImage(
  file: File,
  slug: string,
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const rawExt = file.name.split(".").pop() ?? "png";
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "") || "png";
  const safeSlug = slug.replace(/[^a-zA-Z0-9\-_]/g, "");
  const path = `changelog/${safeSlug}/cover.${ext}`;

  const { error } = await supabase.storage
    .from("featured-releases")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/featured-releases/${path}`;
}

/**
 * Toggle the is_published flag on an entry.
 */
export async function togglePublished(
  id: string,
): Promise<ChangelogEntry | null> {
  const supabase = createSupabaseServiceClient();

  // Fetch current state
  const { data: current } = await supabase
    .from("changelog_entries")
    .select("is_published")
    .eq("id", id)
    .single();

  if (!current) return null;

  const { data: updated, error } = await supabase
    .from("changelog_entries")
    .update({ is_published: !current.is_published })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[changelog-admin] Failed to toggle published:", error.message);
    return null;
  }

  return updated as ChangelogEntry;
}
