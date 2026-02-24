import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { notFound } from "next/navigation";
import { TrackDetailClient } from "./track-detail-client";

type Props = {
  params: Promise<{ releaseId: string; trackId: string }>;
};

export default async function TrackDetailPage({ params }: Props) {
  const { releaseId, trackId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: track } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", trackId)
    .maybeSingle();

  if (!track) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let paymentsEnabled = false;
  if (user) {
    const { data: defaults } = await supabase
      .from("user_defaults")
      .select("payments_enabled")
      .eq("user_id", user.id)
      .maybeSingle();
    paymentsEnabled = defaults?.payments_enabled ?? false;
  }

  const { data: release } = await supabase
    .from("releases")
    .select("title, format, cover_art_url")
    .eq("id", releaseId)
    .maybeSingle();

  const [intentRes, specsRes, elementsRes, notesRes, refsRes] = await Promise.all([
    supabase.from("track_intent").select("*").eq("track_id", trackId).maybeSingle(),
    supabase.from("track_specs").select("*").eq("track_id", trackId).maybeSingle(),
    supabase
      .from("track_elements")
      .select("*")
      .eq("track_id", trackId)
      .order("sort_order"),
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
  ]);

  return (
    <TrackDetailClient
      releaseId={releaseId}
      releaseTitle={release?.title ?? ""}
      releaseFormat={release?.format ?? "stereo"}
      releaseCoverArt={release?.cover_art_url ?? null}
      paymentsEnabled={paymentsEnabled}
      track={track}
      intent={intentRes.data}
      specs={specsRes.data}
      elements={elementsRes.data ?? []}
      notes={notesRes.data ?? []}
      references={refsRes.data ?? []}
    />
  );
}
