import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import type { FeatureSubmission } from "@/types/feature-submission";

/**
 * Check if a release is eligible for feature submission.
 * Requirements:
 *   - Release must have a title
 *   - Release must have an artist name
 *   - Release must have at least one track with an audio file uploaded
 *   - Release must NOT already have a submission (unique constraint)
 */
export async function checkSubmissionEligibility(
  releaseId: string,
  userId: string,
): Promise<{ eligible: boolean; reason?: string }> {
  const supabase = createSupabaseServiceClient();

  // Check release exists and belongs to user
  const { data: release } = await supabase
    .from("releases")
    .select("id, title, artist, user_id")
    .eq("id", releaseId)
    .single();

  if (!release) return { eligible: false, reason: "Release not found." };
  if (release.user_id !== userId)
    return { eligible: false, reason: "You can only submit your own releases." };
  if (!release.title) return { eligible: false, reason: "Release needs a title." };
  if (!release.artist) return { eligible: false, reason: "Release needs an artist name." };

  // Check for at least one track with audio
  const { count } = await supabase
    .from("track_audio_versions")
    .select("id", { count: "exact", head: true })
    .in(
      "track_id",
      (
        await supabase
          .from("tracks")
          .select("id")
          .eq("release_id", releaseId)
      ).data?.map((t) => t.id) ?? [],
    );

  if (!count || count === 0)
    return { eligible: false, reason: "Release needs at least one track with audio uploaded." };

  // Check for existing submission
  const { data: existing } = await supabase
    .from("feature_submissions")
    .select("id, status")
    .eq("release_id", releaseId)
    .maybeSingle();

  if (existing) return { eligible: false, reason: "This release has already been submitted." };

  return { eligible: true };
}

/**
 * Get the current submission status for a release (if any).
 */
export async function getSubmissionForRelease(
  releaseId: string,
): Promise<FeatureSubmission | null> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("feature_submissions")
    .select("*")
    .eq("release_id", releaseId)
    .maybeSingle();

  return data as FeatureSubmission | null;
}

/**
 * Submit a release for feature consideration.
 * Snapshots release_title and artist_name at submission time.
 */
export async function submitForFeature(params: {
  userId: string;
  releaseId: string;
  pitchNote?: string;
  permissionGranted: boolean;
}): Promise<FeatureSubmission> {
  const supabase = createSupabaseServiceClient();

  // Fetch release data for snapshot
  const { data: release } = await supabase
    .from("releases")
    .select("title, artist")
    .eq("id", params.releaseId)
    .single();

  if (!release) throw new Error("Release not found");

  const { data, error } = await supabase
    .from("feature_submissions")
    .insert({
      user_id: params.userId,
      release_id: params.releaseId,
      release_title: release.title,
      artist_name: release.artist ?? "",
      pitch_note: params.pitchNote || null,
      permission_granted: params.permissionGranted,
    })
    .select()
    .single();

  if (error) throw error;
  return data as FeatureSubmission;
}

/**
 * Withdraw a pending submission.
 */
export async function withdrawSubmission(
  submissionId: string,
  userId: string,
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("feature_submissions")
    .delete()
    .eq("id", submissionId)
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) throw error;
}
