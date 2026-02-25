import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Rule } from "@/components/ui/rule";
import { ArrowLeft } from "lucide-react";
import { BriefActions } from "./brief-actions";
import { getReleaseRole } from "@/lib/get-release-role";

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

  const trackIds = (tracks ?? []).map((t: Record<string, unknown>) => t.id as string);

  const [intentRes, specsRes, elementsRes, trackRefsRes, globalRefsRes] =
    await Promise.all([
      trackIds.length > 0
        ? supabase.from("track_intent").select("*").in("track_id", trackIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      trackIds.length > 0
        ? supabase.from("track_specs").select("*").in("track_id", trackIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      trackIds.length > 0
        ? supabase
            .from("track_elements")
            .select("*")
            .in("track_id", trackIds)
            .order("sort_order")
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      trackIds.length > 0
        ? supabase
            .from("mix_references")
            .select("*")
            .in("track_id", trackIds)
            .order("sort_order")
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      supabase
        .from("mix_references")
        .select("*")
        .eq("release_id", releaseId)
        .is("track_id", null)
        .order("sort_order"),
    ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const intents = (intentRes.data ?? []) as any[];
  const allSpecs = (specsRes.data ?? []) as any[];
  const allElements = (elementsRes.data ?? []) as any[];
  const trackRefs = (trackRefsRes.data ?? []) as any[];
  const globalRefs = (globalRefsRes.data ?? []) as any[];

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
          <p className="text-sm text-faint mt-3 font-mono">
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
                  <li key={ref.id as string}>
                    &bull; {ref.song_title as string}
                    {ref.artist ? ` \u2014 ${ref.artist}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Per-track briefs */}
        {tracks?.map((track: any) => {
          const intent = intents.find(
            (i: any) => i.track_id === track.id,
          );
          const trackSpec = allSpecs.find(
            (s: any) => s.track_id === track.id,
          );
          const elems = allElements.filter(
            (e: any) => e.track_id === track.id,
          );
          const refs = trackRefs.filter(
            (r: any) => r.track_id === track.id,
          );

          return (
            <section key={track.id} className="mb-10 break-inside-avoid">
              <Rule className="mb-6" />
              <h2 className="text-lg font-bold text-text mb-4">
                <span className="font-mono text-muted mr-2">
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

              {intent?.emotional_tags?.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-muted font-medium">Keywords: </span>
                  <span className="text-sm text-text">
                    {intent.emotional_tags.join(", ")}
                  </span>
                </div>
              )}

              {trackSpec && (
                <div className="mb-3 flex flex-wrap gap-4 text-sm">
                  {trackSpec.target_loudness && (
                    <span>
                      <span className="text-muted">Loudness: </span>
                      <span className="font-mono text-text">
                        {trackSpec.target_loudness}
                      </span>
                    </span>
                  )}
                  <span>
                    <span className="text-muted">Format: </span>
                    <span className="font-mono text-text">
                      {trackSpec.format_override || release.format}
                    </span>
                  </span>
                </div>
              )}

              {refs.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-muted font-medium mb-1">
                    References
                  </div>
                  <ul className="text-sm text-text space-y-1">
                    {refs.map((ref: any, idx: number) => (
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

              {elems.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-muted font-medium mb-1">
                    Element Notes
                  </div>
                  <ul className="text-sm text-text space-y-1">
                    {elems.map((el: any) => (
                      <li key={el.id}>
                        &bull;{" "}
                        <span className="font-medium">{el.name}:</span>{" "}
                        {el.notes || "\u2014"}
                        {el.flagged && (
                          <span className="text-signal text-xs ml-1">&starf;</span>
                        )}
                      </li>
                    ))}
                  </ul>
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
