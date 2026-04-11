import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getSignedAudioUrls, extractStoragePath } from "@/lib/storage-urls";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, IconButton } from "@/components/ui/button";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import { TrackList } from "./track-list";
import { Plus, Settings, ArrowLeft, ListMusic, DollarSign } from "lucide-react";
import { PortalToggle } from "./portal-toggle";
import { CoverArtEditor, GlobalDirectionEditor, GlobalReferencesEditor, StatusEditor, ReleaseNotesEditor, ClientNotesEditor } from "./sidebar-editors";
import { ExpensePanel } from "@/components/expenses/expense-panel";
import { getExpensesByRelease } from "./expense-actions";
import { ReleaseTimer } from "@/components/time-tracking/release-timer";
import { TimeEntryList } from "@/components/time-tracking/time-entry-list";
import { getTimeEntriesByRelease } from "./time-entry-actions";
import { FinancialSummary } from "@/components/payments/financial-summary";
import { TabbedContent } from "@/components/ui/tabbed-content";
import { FlowSimulatorButton } from "@/components/flow-simulator/flow-simulator-button";
import { FlowProvider, ReleaseFlowContent } from "@/components/flow-simulator/release-flow-context";
import { FlowBreadcrumbTitle } from "@/components/flow-simulator/flow-breadcrumb-title";
import { SaveAsTemplateButton } from "@/components/templates/save-as-template-button";
import { CalendarExportButton } from "./calendar-export-button";
import { MobileInspector } from "@/components/ui/mobile-inspector";
import { DistributionPanel } from "./distribution-panel";
import { ReleaseQuotesTab } from "./release-quotes-tab";
import type { FlowTrack } from "@/components/flow-simulator/use-flow-audio";
import { getReleaseRole } from "@/lib/get-release-role";
import { canEdit } from "@/lib/permissions";
import { formatLabel } from "@/lib/format-labels";
import { getLocale, getTranslations } from "next-intl/server";
import { resolveVisibility } from "@/lib/features/feature-registry";
import { SubmitForFeatureButton } from "@/components/feature-submissions/SubmitForFeatureButton";

type Props = {
  params: Promise<{ releaseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const VALID_TABS = ["tracks", "globals", "distribution", "financials"] as const;
type TabId = (typeof VALID_TABS)[number];

function typeLabel(t: string | undefined | null): string {
  if (!t) return "—";
  if (t === "ep") return "EP";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default async function ReleasePage({ params, searchParams }: Props) {
  const { releaseId } = await params;
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  // Fire all independent queries in parallel
  const [releaseRes, userRes, tracksRes, globalRefsRes, briefShareRes, distributionRes] = await Promise.all([
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
    supabase
      .from("release_distribution")
      .select("*")
      .eq("release_id", releaseId)
      .order("platform"),
  ]);

  const release = releaseRes.data;
  if (!release) notFound();

  const user = userRes.data.user;
  if (!user) notFound();

  // Fetch role + user defaults + expenses + time entries + locale in parallel
  const [role, defaultsRes2, expenses, timeEntries, locale, t] = await Promise.all([
    getReleaseRole(supabase, releaseId, user.id),
    supabase
      .from("user_defaults")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    getExpensesByRelease(releaseId),
    getTimeEntriesByRelease(releaseId),
    getLocale(),
    getTranslations("releaseDetail"),
  ]);
  const paymentsEnabled = defaultsRes2.data?.payments_enabled ?? false;
  const defaultHourlyRate = defaultsRes2.data?.default_hourly_rate ?? null;
  const features = resolveVisibility(defaultsRes2.data?.feature_visibility ?? null);

  // Fetch quotes for the merged Money tab (count badge + financial summary)
  let releaseQuotes: { id: string; total: number | string; status: string }[] = [];
  if (paymentsEnabled && features.payment_tracking) {
    const { data: quotesData } = await supabase
      .from("quotes")
      .select("id, total, status")
      .eq("release_id", releaseId)
      .eq("user_id", user.id);
    releaseQuotes = quotesData ?? [];
  }
  const activeQuotes = releaseQuotes.filter((q) => q.status !== "cancelled");
  const releaseQuoteCount = releaseQuotes.length;

  // Resolve current tab from search params (map legacy "quotes" → "financials")
  const rawTabInput = typeof sp.tab === "string" ? sp.tab : "";
  const rawTab = rawTabInput === "quotes" ? "financials" : rawTabInput;
  const isValidTab = VALID_TABS.includes(rawTab as TabId);
  // Fall back to tracks if the requested tab is hidden
  const tabAvailable =
    isValidTab &&
    (rawTab !== "financials" || (paymentsEnabled && features.payment_tracking)) &&
    (rawTab !== "distribution" || features.distribution_checklist);
  const currentTab: TabId = tabAvailable ? (rawTab as TabId) : "tracks";

  // Fetch client notes if client email is present
  let clientNotes = "";
  if (release.client_email) {
    const { data: cnData } = await supabase
      .from("client_notes")
      .select("notes")
      .eq("engineer_id", user.id)
      .eq("client_email", release.client_email)
      .maybeSingle();
    clientNotes = cnData?.notes ?? "";
  }

  const tracks = tracksRes.data;
  const globalRefs = globalRefsRes.data;

  // Fetch audio versions for Flow Simulator (latest version per track)
  const trackIds = (tracks ?? []).map((t: Record<string, unknown>) => t.id as string);
  let flowTracks: FlowTrack[] = [];
  let flowHiddenCount = 0;

  if (trackIds.length > 0) {
    const { data: audioVersions } = await supabase
      .from("track_audio_versions")
      .select("id, track_id, version_number, audio_url, duration_seconds, waveform_peaks")
      .in("track_id", trackIds)
      .order("version_number", { ascending: false });

    if (audioVersions && tracks) {
      // Pick the highest version_number per track_id
      const latestByTrack = new Map<string, typeof audioVersions[0]>();
      for (const av of audioVersions) {
        if (!latestByTrack.has(av.track_id)) {
          latestByTrack.set(av.track_id, av);
        }
      }

      // Build FlowTrack array in track_number order, only for tracks with audio
      const sorted = [...tracks].sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) =>
          (a.track_number as number) - (b.track_number as number),
      );
      for (const t of sorted) {
        const av = latestByTrack.get(t.id as string);
        if (av && av.audio_url && av.duration_seconds) {
          flowTracks.push({
            id: t.id as string,
            title: t.title as string,
            durationSeconds: Number(av.duration_seconds),
            audioUrl: av.audio_url,
            waveformPeaks: av.waveform_peaks as number[][] | null,
            versionId: av.id,
          });
        } else {
          flowHiddenCount++;
        }
      }
    }
  }

  // Sign audio URLs for flow tracks
  if (flowTracks.length > 0) {
    const paths = flowTracks.map((t) => extractStoragePath(t.audioUrl));
    const signedMap = await getSignedAudioUrls(paths);
    for (let i = 0; i < flowTracks.length; i++) {
      flowTracks[i].audioUrl = signedMap.get(paths[i]) ?? flowTracks[i].audioUrl;
    }
  }

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

  // Build tab list — conditionally include based on feature visibility
  const tabs = [
    { id: "tracks" as const, label: t("tabTracks"), count: tracks?.length ?? 0 },
    { id: "globals" as const, label: t("tabGlobals") },
    ...(features.distribution_checklist
      ? [{ id: "distribution" as const, label: t("tabDistribution") }]
      : []),
    ...(paymentsEnabled && features.payment_tracking
      ? [{ id: "financials" as const, label: t("tabFinancials"), count: releaseQuoteCount || undefined, moneyEasterEgg: true }]
      : []),
  ];

  return (
    <FlowProvider>
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/app"
            className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1 shrink-0"
          >
            <ArrowLeft size={14} />
            {t("breadcrumbReleases")}
          </Link>
          <span className="text-faint">/</span>
          <FlowBreadcrumbTitle
            title={release.title as string}
            releaseId={releaseId}
            canEdit={canEdit(role)}
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {canEdit(role) && features.client_portal && (
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
            <SubmitForFeatureButton
              releaseId={releaseId}
              releaseTitle={release.title as string}
              artist={release.artist as string ?? ""}
              releaseType={release.release_type as string}
              trackCount={tracks?.length ?? 0}
              coverArtUrl={release.cover_art_url as string | null}
            />
          )}
          {canEdit(role) && (
            <SaveAsTemplateButton
              releaseId={releaseId}
              releaseTitle={release.title as string}
            />
          )}
          {release.target_date && (
            <CalendarExportButton releaseId={releaseId} />
          )}
          {canEdit(role) && (
            <Link href={`/app/releases/${releaseId}/settings`}>
              <IconButton size="sm" title={t("releaseSettings")}>
                <Settings size={14} />
              </IconButton>
            </Link>
          )}
        </div>
      </div>

      {/* Two-panel layout (wrapped for Flow Simulator toggle) */}
      <ReleaseFlowContent
        flowTracks={flowTracks}
        flowHiddenCount={flowHiddenCount}
        releaseId={releaseId}
        releaseTitle={release.title as string}
      >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main content with tabs */}
        <div>
          <div data-tour="release-tabs">
          <TabbedContent tabs={tabs} initialTab={currentTab}>
            {/* Tracks tab */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlowSimulatorButton
                    tracks={flowTracks}
                  />
                </div>
                {canEdit(role) && (
                  <Link href={`/app/releases/${releaseId}/tracks/new`}>
                    <Button variant="secondary" className="h-9 text-xs">
                      <Plus size={14} />
                      {t("addTrack")}
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
                  icon={ListMusic}
                  size="md"
                  title={t("noTracksTitle")}
                  description={canEdit(role) ? t("noTracksDescEdit") : t("noTracksDescView")}
                  action={canEdit(role) ? { label: t("addATrack"), href: `/app/releases/${releaseId}/tracks/new`, variant: "primary" } : undefined}
                />
              )}
            </div>

            {/* Globals tab */}
            <div className="space-y-6">
              <GlobalDirectionEditor
                releaseId={releaseId}
                initialValue={release.global_direction}
                initialStatus={release.status}
                role={role}
              />
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
            </div>

            {/* Distribution tab (only rendered when distribution_checklist visible, matching tabs array) */}
            {features.distribution_checklist && (
              <DistributionPanel
                releaseId={releaseId}
                initialEntries={distributionRes.data ?? []}
                releaseTitle={release.title}
                releaseArtist={release.artist ?? ""}
                canEdit={canEdit(role)}
              />
            )}

            {/* Financials tab — unified Money view with quotes merged in */}
            {paymentsEnabled && features.payment_tracking && (() => {
              const noFee = !release.fee_total || release.payment_status === "no_fee";
              const hasNoFinancialData = activeQuotes.length === 0 && noFee && timeEntries.length === 0 && expenses.length === 0;

              if (hasNoFinancialData) {
                return (
                  <EmptyState
                    icon={DollarSign}
                    size="md"
                    title={t("noFinancialDataTitle")}
                    description={t("noFinancialDataDesc")}
                    action={{ label: t("newQuote"), href: `/app/releases/${releaseId}/quotes/new`, variant: "primary" }}
                    secondaryAction={{ label: t("logTime"), href: `/app/releases/${releaseId}?tab=financials` }}
                  />
                );
              }

              return (
                <div className="space-y-6">
                  {/* Quotes & Invoices section (top of Money tab) */}
                  <ReleaseQuotesTab releaseId={releaseId} locale={locale} />

                  {/* Financial Summary with inline editing + quote-derived mode */}
                  <FinancialSummary
                    releaseId={releaseId}
                    feeTotal={release.fee_total}
                    paidAmount={release.paid_amount ?? 0}
                    feeCurrency={release.fee_currency ?? "USD"}
                    paymentStatus={release.payment_status ?? "no_fee"}
                    expenses={expenses}
                    timeEntries={timeEntries}
                    locale={locale}
                    quotes={activeQuotes}
                  />

                  {/* Time Log */}
                  <TimeEntryList
                    releaseId={releaseId}
                    timeEntries={timeEntries}
                    currency={release.fee_currency ?? "USD"}
                    locale={locale}
                    defaultRate={defaultHourlyRate}
                  />

                  {/* Expenses */}
                  {/* TODO: Add "Invoice Expenses" button when expense ownership model
                      supports reliably identifying client-owed expenses (paid_by/owed_by
                      are free-text fields currently). */}
                  <ExpensePanel
                    releaseId={releaseId}
                    expenses={expenses}
                    currency={release.fee_currency ?? "USD"}
                    locale={locale}
                  />
                </div>
              );
            })()}
          </TabbedContent>
          </div>
        </div>

        {/* Inspector sidebar — inline on desktop, bottom sheet on mobile */}
        <div data-tour="release-sidebar">
        <MobileInspector title={t("releaseInfo")}>
          {/* Cover Art */}
          <CoverArtEditor releaseId={releaseId} initialUrl={release.cover_art_url} role={role} />

          {/* Release Info */}
          <Panel>
            <PanelBody className="py-5 space-y-3">
              <div className="label-sm text-muted mb-1">{t("releaseInfo")}</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t("artist")}</span>
                  {release.artist ? (
                    <Link
                      href={`/app?artist=${encodeURIComponent(release.artist)}`}
                      className="text-text font-medium hover:text-signal transition-colors"
                    >
                      {release.artist}
                    </Link>
                  ) : (
                    <span className="text-text font-medium">{"\u2014"}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted">{t("type")}</span>
                  <Pill>{typeLabel(release.release_type)}</Pill>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted">{t("format")}</span>
                  <Pill>{formatLabel(release.format)}</Pill>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted">{t("statusLabel")}</span>
                  <StatusEditor releaseId={releaseId} initialStatus={release.status} role={role} />
                </div>
                {release.target_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">{t("targetDate")}</span>
                    <span className="text-text text-xs">
                      {new Date(release.target_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {Array.isArray(release.genre_tags) && release.genre_tags.length > 0 && (
                  <div className="flex justify-between text-sm items-start">
                    <span className="text-muted shrink-0 mr-3">{t("genre")}</span>
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

          {/* Client Info */}
          {(release.client_name || release.client_email || release.client_phone) && (
            <Panel>
              <PanelBody className="py-5">
                <div className="label-sm text-muted mb-2">{t("clientInfo")}</div>
                <div className="space-y-2 text-sm">
                  {release.client_name && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t("name")}</span>
                      <span className="text-text">{release.client_name}</span>
                    </div>
                  )}
                  {release.client_email && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t("email")}</span>
                      <a href={`mailto:${release.client_email}`} className="text-signal text-xs hover:underline">
                        {release.client_email}
                      </a>
                    </div>
                  )}
                  {release.client_phone && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t("phone")}</span>
                      <a href={`tel:${release.client_phone}`} className="text-signal text-xs hover:underline">
                        {release.client_phone}
                      </a>
                    </div>
                  )}
                </div>
              </PanelBody>
            </Panel>
          )}

          {/* Internal Notes (engineer-only) */}
          <ReleaseNotesEditor
            releaseId={releaseId}
            initialValue={release.internal_notes ?? ""}
          />

          {release.client_email && (
            <ClientNotesEditor
              clientEmail={release.client_email}
              initialNotes={clientNotes}
            />
          )}

        </MobileInspector>
        </div>
      </div>
      </ReleaseFlowContent>

      {/* Floating Timer — desktop only, renders when time tracking is enabled */}
      {paymentsEnabled && features.time_tracking && (
        <div className="hidden md:block">
          <ReleaseTimer
            releaseId={releaseId}
            defaultRate={defaultHourlyRate}
            currency={release.fee_currency ?? "USD"}
            locale={locale}
          />
        </div>
      )}
    </div>
    </FlowProvider>
  );
}
