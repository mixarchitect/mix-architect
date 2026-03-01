import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Rule } from "@/components/ui/rule";
import { ArrowLeft, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { BriefActions } from "./brief-actions";
import { getReleaseRole } from "@/lib/get-release-role";
import type { BriefTrack, BriefIntent, BriefSpec, BriefReference, BriefAudioVersion } from "@/lib/db-types";

type Props = { params: Promise<{ releaseId: string }> };

export default async function BriefPage({ params }: Props) {
  const { releaseId } = await params;
  const supabase = await createSupabaseServerClient();

  const [releaseRes, { data: { user } }] = await Promise.all([
    supabase.from("releases").select("*").eq("id", releaseId).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const release = releaseRes.data;
  if (!release) notFound();

  const role = user ? await getReleaseRole(supabase, releaseId, user.id) : null;

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .eq("release_id", releaseId)
    .order("track_number");

  const trackIds = (tracks ?? []).map((t) => t.id as string);

  const empty = <T,>() => Promise.resolve({ data: [] as T[] });

  const [intentRes, specsRes, trackRefsRes, globalRefsRes, audioVersionsRes] =
    await Promise.all([
      trackIds.length > 0
        ? supabase.from("track_intent").select("*").in("track_id", trackIds)
        : empty<BriefIntent>(),
      trackIds.length > 0
        ? supabase.from("track_specs").select("*").in("track_id", trackIds)
        : empty<BriefSpec>(),
      trackIds.length > 0
        ? supabase
            .from("mix_references")
            .select("*")
            .in("track_id", trackIds)
            .order("sort_order")
        : empty<BriefReference>(),
      supabase
        .from("mix_references")
        .select("*")
        .eq("release_id", releaseId)
        .is("track_id", null)
        .order("sort_order"),
      trackIds.length > 0
        ? supabase
            .from("track_audio_versions")
            .select("id, track_id")
            .in("track_id", trackIds)
        : empty<BriefAudioVersion>(),
    ]);

  const intents = (intentRes.data ?? []) as BriefIntent[];
  const allSpecs = (specsRes.data ?? []) as BriefSpec[];
  const trackRefs = (trackRefsRes.data ?? []) as BriefReference[];
  const globalRefs = (globalRefsRes.data ?? []) as BriefReference[];
  const audioVersions = (audioVersionsRes.data ?? []) as BriefAudioVersion[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link
          href={`/app/releases/${releaseId}`}
          className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          {release.title}
        </Link>
        <BriefActions releaseId={releaseId} role={role} />
      </div>

      {/* Brief document */}
      <div className="max-w-3xl mx-auto bg-panel border border-border rounded-lg p-10 shadow-sm print:shadow-none print:border-none print:p-0 print:max-w-none">
        {/* Header */}
        <div className="text-center mb-10">
          {release.cover_art_url && (
            <img
              src={release.cover_art_url}
              alt={`${release.title} cover art`}
              className="w-[120px] h-[120px] rounded-lg object-cover mx-auto mb-4"
            />
          )}
          <div className="label-sm text-faint mb-3">MIX BRIEF</div>
          <h1 className="text-3xl font-bold h1 text-text">{release.title}</h1>
          {release.artist && (
            <p className="text-lg text-muted mt-1">{release.artist}</p>
          )}
          <p className="text-sm text-faint mt-3">
            Prepared:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <Rule className="my-8" />

        {/* Release overview */}
        <section className="mb-10">
          <h2 className="label-sm text-faint mb-4">RELEASE OVERVIEW</h2>
          <div className="flex flex-wrap gap-6 text-sm mb-4">
            <span>
              <span className="text-muted">Type: </span>
              <span className="font-medium text-text">
                {release.release_type === "ep"
                  ? "EP"
                  : release.release_type.charAt(0).toUpperCase() +
                    release.release_type.slice(1)}
              </span>
            </span>
            <span>
              <span className="text-muted">Format: </span>
              <span className="font-medium text-text">{release.format}</span>
            </span>
            <span>
              <span className="text-muted">Tracks: </span>
              <span className="font-medium text-text">{tracks?.length ?? 0}</span>
            </span>
          </div>

          {release.global_direction && (
            <div className="mt-4">
              <div className="text-xs text-muted font-medium mb-1">
                Global Direction
              </div>
              <p className="text-sm text-text leading-relaxed italic">
                &ldquo;{release.global_direction}&rdquo;
              </p>
            </div>
          )}

          {globalRefs.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-muted font-medium mb-1">
                Global References
              </div>
              <ul className="text-sm text-text space-y-1">
                {globalRefs.map((ref) => (
                  <li key={ref.id}>
                    &bull; {ref.song_title}
                    {ref.artist ? ` \u2014 ${ref.artist}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Per-track briefs */}
        {(!tracks || tracks.length === 0) && (
          <EmptyState
            icon={FileText}
            size="md"
            title="No tracks in this release"
            description="Add tracks to the release to generate a complete mix brief."
            action={{ label: "Add a track", href: `/app/releases/${releaseId}/tracks/new`, variant: "primary" }}
          />
        )}

        {(tracks as BriefTrack[] | null)?.map((track) => {
          const intent = intents.find(
            (i) => i.track_id === track.id,
          );
          const trackSpec = allSpecs.find(
            (s) => s.track_id === track.id,
          );
          const refs = trackRefs.filter(
            (r) => r.track_id === track.id,
          );
          const audioVersionCount = audioVersions.filter(
            (v) => v.track_id === track.id,
          ).length;

          return (
            <section key={track.id} className="mb-10 break-inside-avoid">
              <Rule className="mb-6" />
              <h2 className="text-lg font-bold text-text mb-4">
                <span className="text-muted mr-2">
                  TRACK {String(track.track_number).padStart(2, "0")}
                </span>
                &mdash; {String(track.title).toUpperCase()}
              </h2>

              {intent?.mix_vision && (
                <div className="mb-3">
                  <span className="text-xs text-muted font-medium">Intent: </span>
                  <span className="text-sm text-text">{intent.mix_vision}</span>
                </div>
              )}

              {(intent?.emotional_tags?.length ?? 0) > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-muted font-medium">Keywords: </span>
                  <span className="text-sm text-text">
                    {intent!.emotional_tags!.join(", ")}
                  </span>
                </div>
              )}

              {!intent?.mix_vision && !(intent?.emotional_tags?.length) && (
                <div className="py-3 px-4 border border-dashed border-border rounded-md text-sm text-muted">
                  <span>Intent not yet defined.</span>
                  <Link href={`/app/releases/${releaseId}/tracks/${track.id}?tab=intent`} className="ml-2 text-signal hover:underline">
                    Add intent &rarr;
                  </Link>
                </div>
              )}

              {trackSpec && (
                <div className="mb-3 flex flex-wrap gap-4 text-sm">
                  <span>
                    <span className="text-muted">Format: </span>
                    <span className="text-text">
                      {trackSpec.format_override || release.format}
                    </span>
                  </span>
                </div>
              )}

              {!trackSpec && (
                <div className="py-3 px-4 border border-dashed border-border rounded-md text-sm text-muted">
                  <span>Specs not configured.</span>
                  <Link href={`/app/releases/${releaseId}/tracks/${track.id}?tab=specs`} className="ml-2 text-signal hover:underline">
                    Configure specs &rarr;
                  </Link>
                </div>
              )}

              {refs.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-muted font-medium mb-1">
                    References
                  </div>
                  <ul className="text-sm text-text space-y-1">
                    {refs.map((ref, idx) => (
                      <li key={ref.id}>
                        {idx + 1}. {ref.song_title}
                        {ref.artist ? ` \u2014 ${ref.artist}` : ""}
                        {ref.note && (
                          <span className="text-muted italic">
                            {" "}&ldquo;{ref.note}&rdquo;
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {refs.length === 0 && (
                <div className="py-3 px-4 border border-dashed border-border rounded-md text-sm text-muted">
                  <span>No reference tracks.</span>
                  <Link href={`/app/releases/${releaseId}/tracks/${track.id}?tab=intent`} className="ml-2 text-signal hover:underline">
                    Add references &rarr;
                  </Link>
                </div>
              )}

              {intent?.anti_references && (
                <div className="mb-3">
                  <div className="text-xs text-muted font-medium mb-1">
                    Anti-references
                  </div>
                  <p className="text-sm text-text italic">
                    &ldquo;{intent.anti_references}&rdquo;
                  </p>
                </div>
              )}

              {audioVersionCount > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-muted font-medium">Audio: </span>
                  <span className="text-sm text-text">
                    {audioVersionCount} version{audioVersionCount > 1 ? "s" : ""} uploaded
                  </span>
                </div>
              )}

              {track.samply_url && (
                <div className="mb-3">
                  <span className="text-xs text-muted font-medium">Samply: </span>
                  <a
                    href={track.samply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-signal hover:underline"
                  >
                    View on Samply &rarr;
                  </a>
                </div>
              )}
            </section>
          );
        })}

        {/* Footer */}
        <Rule className="my-8" />
        <div className="flex items-center justify-center gap-2">
          <img src="/mix-architect-logo.svg" alt="Mix Architect" className="h-4 w-auto opacity-40" />
          <span className="text-xs text-faint">· mixarchitect.com</span>
        </div>
      </div>
    </div>
  );
}
