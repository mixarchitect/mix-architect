import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { StatusIndicator } from "@/components/ui/status-dot";
import { TrackRow } from "@/components/ui/track-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, FileText, Settings, ArrowLeft } from "lucide-react";

type Props = {
  params: { releaseId: string };
};

function statusColor(s: string): "green" | "orange" | "blue" {
  if (s === "ready") return "green";
  if (s === "in_progress") return "orange";
  return "blue";
}

function statusLabel(s: string): string {
  if (s === "ready") return "Ready";
  if (s === "in_progress") return "In Progress";
  return "Draft";
}

function typeLabel(t: string | undefined | null): string {
  if (!t) return "—";
  if (t === "ep") return "EP";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function formatLabel(f: string | undefined | null): string {
  if (!f) return "Stereo";
  if (f === "atmos") return "Dolby Atmos";
  if (f === "both") return "Stereo + Atmos";
  return "Stereo";
}

export default async function ReleasePage({ params }: Props) {
  const { releaseId } = params;
  const supabase = await createSupabaseServerClient();

  const { data: release } = await supabase
    .from("releases")
    .select("*")
    .eq("id", releaseId)
    .maybeSingle();

  if (!release) notFound();

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*, track_intent(mix_vision)")
    .eq("release_id", releaseId)
    .order("track_number");

  const { data: globalRefs } = await supabase
    .from("mix_references")
    .select("*")
    .eq("release_id", releaseId)
    .is("track_id", null)
    .order("sort_order");

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Releases
          </Link>
          <span className="text-faint">/</span>
          <h1 className="text-xl font-semibold h2 text-text">{release.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/app/releases/${releaseId}/brief`}>
            <Button variant="secondary">
              <FileText size={16} />
              Export Brief
            </Button>
          </Link>
          <Link href={`/app/releases/${releaseId}/settings`}>
            <Button variant="ghost" className="px-3">
              <Settings size={16} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main: Track list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">
              Tracks
              <span className="ml-2 text-xs text-muted font-mono">
                {tracks?.length ?? 0}
              </span>
            </h2>
            <Link href={`/app/releases/${releaseId}/tracks/new`}>
              <Button variant="secondary" className="h-9 text-xs">
                <Plus size={14} />
                Add Track
              </Button>
            </Link>
          </div>

          {tracks && tracks.length > 0 ? (
            <div className="space-y-2">
              {tracks.map((t: Record<string, unknown> & { track_intent?: { mix_vision?: string } | { mix_vision?: string }[] }) => {
                const intent = Array.isArray(t.track_intent)
                  ? t.track_intent[0]
                  : t.track_intent;
                return (
                  <TrackRow
                    key={t.id as string}
                    releaseId={releaseId}
                    trackId={t.id as string}
                    trackNumber={t.track_number as number}
                    title={t.title as string}
                    status={t.status as string}
                    intentPreview={intent?.mix_vision}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No tracks yet"
              description="Add your first track to get started."
              action={
                <Link href={`/app/releases/${releaseId}/tracks/new`}>
                  <Button variant="primary">
                    <Plus size={16} />
                    Add Track
                  </Button>
                </Link>
              }
            />
          )}
        </div>

        {/* Inspector sidebar */}
        <aside className="space-y-4">
          {/* Release Info */}
          <Panel>
            <PanelBody className="py-5 space-y-3">
              <div className="label text-faint text-[10px] mb-1">RELEASE INFO</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Artist</span>
                  <span className="text-text font-medium">{release.artist || "\u2014"}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted">Type</span>
                  <Pill>{typeLabel(release.release_type)}</Pill>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted">Format</span>
                  <Pill>{formatLabel(release.format)}</Pill>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted">Status</span>
                  <StatusIndicator
                    color={statusColor(release.status)}
                    label={statusLabel(release.status)}
                  />
                </div>
                {release.target_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Target Date</span>
                    <span className="text-text font-mono text-xs">
                      {new Date(release.target_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {release.genre_tags?.length > 0 && (
                  <div className="flex justify-between text-sm items-start">
                    <span className="text-muted shrink-0 mr-3">Genre</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {(release.genre_tags as string[]).map((g: string) => (
                        <Pill key={g} className="text-[10px]">{g}</Pill>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PanelBody>
          </Panel>

          {/* Global Mix Direction */}
          <Panel>
            <PanelBody className="py-5">
              <div className="label text-faint text-[10px] mb-2">GLOBAL MIX DIRECTION</div>
              {release.global_direction ? (
                <p className="text-sm text-text leading-relaxed">
                  {release.global_direction}
                </p>
              ) : (
                <p className="text-sm text-muted italic">
                  No global direction set yet.
                </p>
              )}
            </PanelBody>
          </Panel>

          {/* Global References */}
          <Panel>
            <PanelBody className="py-5">
              <div className="label text-faint text-[10px] mb-2">GLOBAL REFERENCES</div>
              {globalRefs && globalRefs.length > 0 ? (
                <div className="space-y-2">
                  {globalRefs.map((ref: any) => (
                    <div key={ref.id} className="text-sm">
                      <div className="font-medium text-text">{ref.song_title}</div>
                      {ref.artist && (
                        <div className="text-xs text-muted">{ref.artist}</div>
                      )}
                      {ref.note && (
                        <div className="text-xs text-muted mt-0.5 italic">
                          &ldquo;{ref.note}&rdquo;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted italic">No references added yet.</p>
              )}
            </PanelBody>
          </Panel>

          {/* Client Info */}
          {(release.client_name || release.client_email) && (
            <Panel>
              <PanelBody className="py-5">
                <div className="label text-faint text-[10px] mb-2">CLIENT INFO</div>
                <div className="space-y-2 text-sm">
                  {release.client_name && (
                    <div className="flex justify-between">
                      <span className="text-muted">Name</span>
                      <span className="text-text">{release.client_name}</span>
                    </div>
                  )}
                  {release.client_email && (
                    <div className="flex justify-between">
                      <span className="text-muted">Email</span>
                      <span className="text-text font-mono text-xs">
                        {release.client_email}
                      </span>
                    </div>
                  )}
                </div>
              </PanelBody>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  );
}
