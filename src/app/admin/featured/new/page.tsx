import { FeaturedReleaseForm } from "../featured-release-form";
import { createFeaturedReleaseAction } from "../actions";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import type { FeaturedRelease } from "@/types/featured-release";

export default async function NewFeaturedReleasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const fromSubmissionId = typeof sp.from_submission === "string" ? sp.from_submission : null;

  let prefill: Partial<FeaturedRelease> | undefined;
  let submissionId: string | undefined;

  if (fromSubmissionId) {
    const supabase = createSupabaseServiceClient();

    // Fetch submission + linked release data
    const { data: sub } = await supabase
      .from("feature_submissions")
      .select("*")
      .eq("id", fromSubmissionId)
      .single();

    if (sub) {
      submissionId = sub.id;

      // Fetch the release for genre tags, cover art, release type
      const { data: release } = await supabase
        .from("releases")
        .select("genre_tags, cover_art_url, release_type")
        .eq("id", sub.release_id)
        .single();

      prefill = {
        title: sub.release_title,
        artist_name: sub.artist_name,
        source: "platform",
        release_id: sub.release_id,
        release_type: (release?.release_type as FeaturedRelease["release_type"]) ?? "album",
        genre_tags: (release?.genre_tags as string[]) ?? [],
      };
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text mb-8">
        New Featured Release
      </h1>
      {submissionId && (
        <p className="text-xs text-teal-500 mb-4">
          Pre-filled from user submission. Complete the writeup and publish.
        </p>
      )}
      <FeaturedReleaseForm
        action={createFeaturedReleaseAction}
        release={prefill as FeaturedRelease | undefined}
        submissionId={submissionId}
      />
    </div>
  );
}
