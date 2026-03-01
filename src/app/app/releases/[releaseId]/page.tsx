import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import { TrackList } from "./track-list";
import { Plus, Settings, ArrowLeft } from "lucide-react";
import { EditableTitle } from "@/components/ui/editable-title";
import { PortalToggle } from "./portal-toggle";
import { CoverArtEditor, GlobalDirectionEditor, GlobalReferencesEditor, StatusEditor, PaymentEditor } from "./sidebar-editors";
import { getReleaseRole } from "@/lib/get-release-role";
import { canEdit } from "@/lib/permissions";
import { formatLabel } from "@/lib/format-labels";

type Props = {
  params: Promise<{ releaseId: string }>;
};

function typeLabel(t: string | undefined | null): string {
  if (!t) return "—";
  if (t === "ep") return "EP";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default async function ReleasePage({ params }: Props) {
  const { releaseId } = await params;
  const supabase = await createSupabaseServerClient();

  // Fire all independent queries in parallel
  const [releaseRes, userRes, tracksRes, globalRefsRes, briefShareRes] = await Promise.all([
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
    supabase
      .from("brief_shares")
      .select("*")
      .eq("release_id", releaseId)
      .maybeSingle(),
  ]);

  const release = releaseRes.data;
  if (!release) notFound();

  const user = userRes.data.user;
  if (!user) notFound();

  // Fetch role + user defaults in parallel
  const [role, defaultsRes2] = await Promise.all([
    getReleaseRole(supabase, releaseId, user.id),
    supabase
      .from("user_defaults")
      .select("payments_enabled")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const paymentsEnabled = defaultsRes2.data?.payments_enabled ?? false;

  const tracks = tracksRes.data;
  const globalRefs = globalRefsRes.data;

  // Fetch portal approval statuses if a brief share exists
  let portalApprovalMap: Record<string, string> = {};
  if (briefShareRes.data?.id) {
    const { data: portalSettings } = await supabase
      .from("portal_track_settings")
      .select("track_id, approval_status")
      .eq("brief_share_id", briefShareRes.data.id);
    if (portalSettings) {
      portalApprovalMap = Object.fromEntries(
        portalSettings.map((s) => [s.track_id, s.approval_status]),
      );
    }
  }

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
          {release.artist && (
            <>
              <Link
                href={`/app?artist=${encodeURIComponent(release.artist as string)}`}
                className="text-sm text-muted hover:text-signal transition-colors shrink-0"
              >
                {release.artist as string}
              </Link>
              <span className="text-faint">·</span>
            </>
          )}
          {canEdit(role) ? (
            <EditableTitle
              value={release.title as string}
              table="releases"
              id={releaseId}
              className="text-2xl font-semibold h2 text-text"
            />
          ) : (
            <h1 className="text-2xl font-semibold h2 text-text truncate">{release.title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canEdit(role) && (
            <PortalToggle
              releaseId={releaseId}
              initialShare={briefShareRes.data ? {
                id: briefShareRes.data.id,
                share_token: briefShareRes.data.share_token,
                active: briefShareRes.data.active ?? true,
                show_direction: briefShareRes.data.show_direction ?? true,
                show_specs: briefShareRes.data.show_specs ?? true,
                show_references: briefShareRes.data.show_references ?? true,
                show_payment_status: briefShareRes.data.show_payment_status ?? false,
                show_distribution: briefShareRes.data.show_distribution ?? false,
                show_lyrics: briefShareRes.data.show_lyrics ?? false,
                require_payment_for_download: briefShareRes.data.require_payment_for_download ?? false,
              } : null}
            />
          )}
          {canEdit(role) && (
            <Link href={`/app/releases/${releaseId}/settings`}>
              <Button variant="secondary" className="px-3">
                <Settings size={16} />
              </Button>
            </Link>
          )}
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
            {canEdit(role) && (
              <Link href={`/app/releases/${releaseId}/tracks/new`}>
                <Button variant="secondary" className="h-9 text-xs">
                  <Plus size={14} />
                  Add Track
                </Button>
              </Link>
            )}
          </div>

          {tracks && tracks.length > 0 ? (
            <TrackList
              releaseId={releaseId}
              tracks={tracks.map((t: Record<string, unknown> & { track_intent?: { mix_vision?: string } | { mix_vision?: string }[] }) => {
                const intent = Array.isArray(t.track_intent)
                  ? t.track_intent[0]
                  : t.track_intent;
                return {
                  id: t.id as string,
                  track_number: t.track_number as number,
                  title: t.title as string,
                  status: t.status as string,
                  intentPreview: intent?.mix_vision,
                  portalApprovalStatus: portalApprovalMap[t.id as string] ?? null,
                };
              })}
              canReorder={canEdit(role)}
              canDelete={canEdit(role)}
            />
          ) : (
            <EmptyState
              title="No tracks yet"
              description={canEdit(role) ? "Add your first track to get started." : "No tracks have been added yet."}
              action={canEdit(role) ? (
                <Link href={`/app/releases/${releaseId}/tracks/new`}>
                  <Button variant="primary">
                    <Plus size={16} />
                    Add Track
                  </Button>
                </Link>
              ) : undefined}
            />
          )}
        </div>

        {/* Inspector sidebar */}
        <aside className="space-y-4">
          {/* Cover Art */}
          <CoverArtEditor releaseId={releaseId} initialUrl={release.cover_art_url} role={role} />

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
                  <StatusEditor releaseId={releaseId} initialStatus={release.status} role={role} />
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
            role={role}
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
            role={role}
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
            <PaymentEditor
              releaseId={releaseId}
              initialPaymentStatus={release.payment_status ?? "no_fee"}
              initialFeeTotal={release.fee_total}
              initialPaidAmount={release.paid_amount ?? 0}
              initialFeeCurrency={release.fee_currency ?? "USD"}
              initialPaymentNotes={release.payment_notes}
              role={role}
            />
          )}

        </aside>
      </div>
    </div>
  );
}
