import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Pill } from "@/components/ui/pill";
import { StatusIndicator } from "@/components/ui/status-dot";
import { TrackRow } from "@/components/ui/track-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, FileText, Settings, ArrowLeft } from "lucide-react";
import { CoverArtEditor, GlobalDirectionEditor, GlobalReferencesEditor, StatusEditor } from "./sidebar-editors";

type Props = {
  params: Promise<{ releaseId: string }>;
};

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

function paymentStatusColor(s: string): "green" | "orange" | "blue" {
  if (s === "paid") return "green";
  if (s === "partial") return "orange";
  return "blue";
}

function paymentStatusLabel(s: string): string {
  if (s === "paid") return "Paid";
  if (s === "partial") return "Partial";
  return "Unpaid";
}

function formatCurrency(amount: number | null, currency: string): string {
  if (amount == null) return "\u2014";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default async function ReleasePage({ params }: Props) {
  const { releaseId } = await params;
  const supabase = await createSupabaseServerClient();

  // Fire all independent queries in parallel
  const [releaseRes, userRes, tracksRes, globalRefsRes] = await Promise.all([
    supabase.from("releases").select("*").eq("id", releaseId).maybeSingle(),
    supabase.auth.getUser(),
    supabase
      .from("tracks")
      .select("*, track_intent(mix_vision)")
      .eq("release_id", releaseId)
      .order("track_number"),
    supabase
      .from("mix_references")
      .select("*")
      .eq("release_id", releaseId)
      .is("track_id", null)
      .order("sort_order"),
  ]);

  const release = releaseRes.data;
  if (!release) notFound();

  const user = userRes.data.user;
  let paymentsEnabled = false;
  if (user) {
    const { data: defaults } = await supabase
      .from("user_defaults")
      .select("payments_enabled")
      .eq("user_id", user.id)
      .maybeSingle();
    paymentsEnabled = defaults?.payments_enabled ?? false;
  }

  const tracks = tracksRes.data;
  const globalRefs = globalRefsRes.data;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/app"
            className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1 shrink-0"
          >
            <ArrowLeft size={14} />
            Releases
          </Link>
          <span className="text-faint">/</span>
          <h1 className="text-2xl font-semibold h2 text-text truncate">{release.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/app/releases/${releaseId}/brief`}>
            <Button variant="secondary">
              <FileText size={16} />
              Export Brief
            </Button>
          </Link>
          <Link href={`/app/releases/${releaseId}/settings`}>
            <Button variant="secondary" className="px-3">
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
          {/* Cover Art */}
          <CoverArtEditor releaseId={releaseId} initialUrl={release.cover_art_url} />

          {/* Release Info */}
          <Panel>
            <PanelBody className="py-5 space-y-3">
              <div className="label-sm text-muted mb-1">RELEASE INFO</div>
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
                  <StatusEditor releaseId={releaseId} initialStatus={release.status} />
                </div>
                {release.target_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Target Date</span>
                    <span className="text-text font-mono text-xs">
                      {new Date(release.target_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {Array.isArray(release.genre_tags) && release.genre_tags.length > 0 && (
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
          <GlobalDirectionEditor
            releaseId={releaseId}
            initialValue={release.global_direction}
            initialStatus={release.status}
          />

          {/* Global References */}
          <GlobalReferencesEditor
            releaseId={releaseId}
            initialRefs={(globalRefs ?? []).map((r: Record<string, unknown>) => ({
              id: r.id as string,
              song_title: r.song_title as string,
              artist: r.artist as string | null,
              note: r.note as string | null,
              url: r.url as string | null,
              artwork_url: r.artwork_url as string | null,
              sort_order: (r.sort_order as number) ?? 0,
            }))}
            initialStatus={release.status}
          />

          {/* Client Info */}
          {(release.client_name || release.client_email) && (
            <Panel>
              <PanelBody className="py-5">
                <div className="label-sm text-muted mb-2">CLIENT INFO</div>
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

          {/* Payment */}
          {paymentsEnabled && (
            <Panel>
              <PanelBody className="py-5 space-y-3">
                <div className="label-sm text-muted mb-1">PAYMENT</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted">Status</span>
                    <StatusIndicator
                      color={paymentStatusColor(release.payment_status ?? "unpaid")}
                      label={paymentStatusLabel(release.payment_status ?? "unpaid")}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Fee</span>
                    <span className="text-text font-mono text-xs">
                      {formatCurrency(release.fee_total, release.fee_currency ?? "USD")}
                    </span>
                  </div>
                  {release.payment_notes && (
                    <div className="text-xs text-muted italic pt-1 border-t border-border/50">
                      {release.payment_notes}
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
