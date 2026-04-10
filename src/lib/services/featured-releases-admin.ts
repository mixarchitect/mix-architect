import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import type { FeaturedRelease } from "@/types/featured-release";

type CreateInput = Omit<FeaturedRelease, "id" | "created_at" | "updated_at">;
type UpdateInput = Partial<Omit<FeaturedRelease, "id" | "created_at" | "updated_at">>;

export async function createFeaturedRelease(data: CreateInput) {
  const supabase = createSupabaseServiceClient();

  // Deactivate all if this one is active
  if (data.is_active) {
    await supabase
      .from("featured_releases")
      .update({ is_active: false })
      .eq("is_active", true);
  }

  const { data: row, error } = await supabase
    .from("featured_releases")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("[featured] Insert failed:", error.message, error.details, error.hint);
    throw error;
  }
  return row as FeaturedRelease;
}

export async function updateFeaturedRelease(id: string, data: UpdateInput) {
  const supabase = createSupabaseServiceClient();

  if (data.is_active) {
    await supabase
      .from("featured_releases")
      .update({ is_active: false })
      .eq("is_active", true);
  }

  const { data: row, error } = await supabase
    .from("featured_releases")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return row as FeaturedRelease;
}

export async function deleteFeaturedRelease(id: string) {
  const supabase = createSupabaseServiceClient();

  // Get the release to find cover art path
  const { data: release } = await supabase
    .from("featured_releases")
    .select("cover_art_path")
    .eq("id", id)
    .single();

  if (release?.cover_art_path) {
    await supabase.storage
      .from("featured-releases")
      .remove([release.cover_art_path]);
  }

  const { error } = await supabase
    .from("featured_releases")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function setActiveFeaturedRelease(id: string) {
  const supabase = createSupabaseServiceClient();

  // Deactivate all
  await supabase
    .from("featured_releases")
    .update({ is_active: false })
    .eq("is_active", true);

  // Activate the specified one
  const { data: row, error } = await supabase
    .from("featured_releases")
    .update({ is_active: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return row as FeaturedRelease;
}

export async function uploadCoverArt(
  file: File,
  slug: string,
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const rawExt = file.name.split(".").pop() ?? "jpg";
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const safeSlug = slug.replace(/[^a-zA-Z0-9\-_]/g, "");
  const path = `covers/${safeSlug}/cover.${ext}`;

  const { error } = await supabase.storage
    .from("featured-releases")
    .upload(path, file, { upsert: true });

  if (error) throw error;
  return path;
}

export async function getAllFeaturedReleasesAdmin(): Promise<FeaturedRelease[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("featured_releases")
    .select("*")
    .order("featured_date", { ascending: false });

  if (error) throw error;
  return (data as FeaturedRelease[]) ?? [];
}

export async function getFeaturedReleaseById(
  id: string,
): Promise<FeaturedRelease | null> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("featured_releases")
    .select("*")
    .eq("id", id)
    .single();
  return data as FeaturedRelease | null;
}
