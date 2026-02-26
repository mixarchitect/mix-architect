import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { notFound } from "next/navigation";
import { TrackDetailClient } from "./track-detail-client";
import { getReleaseRole } from "@/lib/get-release-role";

type Props = {
  params: Promise<{ releaseId: string; trackId: string }>;
};

export default async function TrackDetailPage({ params }: Props) {
  const { releaseId, trackId } = await params;
  const supabase = await createSupabaseServerClient();

  // Fire all queries in parallel — track, release, and sub-tables
  const [trackRes, releaseRes, intentRes, specsRes, notesRes, refsRes, distributionRes, splitsRes, audioVersionsRes] = await Promise.all([
    supabase.from("tracks").select("*").eq("id", trackId).maybeSingle(),
    supabase.from("releases").select("title, format, cover_art_url").eq("id", releaseId).maybeSingle(),
    supabase.from("track_intent").select("*").eq("track_id", trackId).maybeSingle(),
    supabase.from("track_specs").select("*").eq("track_id", trackId).maybeSingle(),
    supabase
      .from("revision_notes")
      .select("*")
      .eq("track_id", trackId)
      .order("created_at", { ascending: false }),
    supabase
      .from("mix_references")
      .select("*")
      .eq("track_id", trackId)
      .order("sort_order"),
    supabase.from("track_distribution").select("*").eq("track_id", trackId).maybeSingle(),
    supabase.from("track_splits").select("*").eq("track_id", trackId).order("sort_order"),
    supabase
      .from("track_audio_versions")
      .select("*")
      .eq("track_id", trackId)
      .order("version_number"),
  ]);

  const track = trackRes.data;
  if (!track) notFound();

  const release = releaseRes.data;

  // Fetch user + role
  const { data: { user } } = await supabase.auth.getUser();
  const role = user ? await getReleaseRole(supabase, releaseId, user.id) : null;
  const currentUserName = user?.user_metadata?.display_name || user?.email || "You";

  return (
    <TrackDetailClient
      releaseId={releaseId}
      releaseTitle={release?.title ?? ""}
      releaseFormat={release?.format ?? "stereo"}
      releaseCoverArt={release?.cover_art_url ?? null}
      track={track}
      intent={intentRes.data}
      specs={specsRes.data}
      samplyUrl={track.samply_url ?? null}
      audioVersions={audioVersionsRes.data ?? []}
      notes={notesRes.data ?? []}
      references={refsRes.data ?? []}
      distribution={distributionRes.data}
      splits={splitsRes.data ?? []}
      role={role}
      currentUserName={currentUserName}
    />
  );
}
