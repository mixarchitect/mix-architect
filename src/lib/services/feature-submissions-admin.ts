import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import type { FeatureSubmission } from "@/types/feature-submission";

export interface SubmissionWithMeta extends FeatureSubmission {
  submitter_name: string | null;
  cover_art_url: string | null;
  track_count: number;
  genre_tags: string[];
  release_type: string;
}

export async function getSubmissions(
  status?: "pending" | "approved" | "declined" | "all",
): Promise<SubmissionWithMeta[]> {
  const supabase = createSupabaseServiceClient();

  let query = supabase
    .from("feature_submissions")
    .select(`
      *,
      releases!inner (cover_art_url, genre_tags, release_type)
    `)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];

  // Fetch submitter names from profiles
  const userIds = [...new Set(rows.map((s: Record<string, unknown>) => s.user_id as string))];
  let profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    if (profiles) {
      for (const p of profiles) {
        if (p.display_name) profileMap[p.id] = p.display_name;
      }
    }
  }

  // Fetch track counts for each release
  const releaseIds = rows.map((s: Record<string, unknown>) => s.release_id as string);
  let trackCountMap: Record<string, number> = {};
  if (releaseIds.length > 0) {
    const { data: tracks } = await supabase
      .from("tracks")
      .select("release_id")
      .in("release_id", releaseIds);
    if (tracks) {
      for (const t of tracks) {
        trackCountMap[t.release_id] = (trackCountMap[t.release_id] ?? 0) + 1;
      }
    }
  }

  return rows.map((row: Record<string, unknown>) => {
    const release = row.releases as Record<string, unknown> | null;
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      release_id: row.release_id as string,
      release_title: row.release_title as string,
      artist_name: row.artist_name as string,
      pitch_note: row.pitch_note as string | null,
      permission_granted: row.permission_granted as boolean,
      status: row.status as FeatureSubmission["status"],
      admin_notes: row.admin_notes as string | null,
      reviewed_at: row.reviewed_at as string | null,
      featured_release_id: row.featured_release_id as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      submitter_name: profileMap[row.user_id as string] ?? null,
      cover_art_url: (release?.cover_art_url as string) ?? null,
      track_count: trackCountMap[row.release_id as string] ?? 0,
      genre_tags: (release?.genre_tags as string[]) ?? [],
      release_type: (release?.release_type as string) ?? "album",
    };
  });
}

export async function updateSubmissionStatus(
  id: string,
  status: "approved" | "declined",
  adminNotes?: string,
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("feature_submissions")
    .update({
      status,
      admin_notes: adminNotes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function linkSubmissionToFeaturedRelease(
  submissionId: string,
  featuredReleaseId: string,
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("feature_submissions")
    .update({ featured_release_id: featuredReleaseId })
    .eq("id", submissionId);

  if (error) throw error;
}
