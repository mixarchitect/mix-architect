import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { notFound } from "next/navigation";
import { PortalClient } from "./portal-client";
import type { Metadata } from "next";
import type {
  PortalShare,
  PortalTrackSetting,
  PortalVersionSetting,
  PortalTrack,
  PortalRelease,
  PortalDistribution,
  PortalReleaseDistribution,
} from "@/lib/portal-types";
import type {
  BriefIntent,
  BriefSpec,
  BriefReference,
} from "@/lib/db-types";
import type { AudioVersionData, TimelineComment } from "@/components/ui/audio-player";

type Props = { params: Promise<{ shareToken: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareToken } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: share } = await supabase
    .from("brief_shares")
    .select("release_id")
    .eq("share_token", shareToken)
    .maybeSingle();

  if (!share) return { title: "Portal | Mix Architect" };

  const { data: release } = await supabase
    .from("releases")
    .select("title, artist, cover_art_url")
    .eq("id", share.release_id)
    .maybeSingle();

  if (!release) return { title: "Portal | Mix Architect" };

  const { count } = await supabase
    .from("tracks")
    .select("id", { count: "exact", head: true })
    .eq("release_id", share.release_id);

  const title = `${release.title}${release.artist ? ` — ${release.artist}` : ""} | Mix Architect`;
  const description = `${release.artist || "Artist"} · ${count ?? 0} track${count !== 1 ? "s" : ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(release.cover_art_url ? { images: [{ url: release.cover_art_url }] } : {}),
    },
  };
}

export default async function PortalPage({ params }: Props) {
  const { shareToken } = await params;
  const supabase = await createSupabaseServerClient();

  /* ── 1. Fetch share record ──────────────────────────────────────── */

  const { data: share, error: shareErr } = await supabase
    .from("brief_shares")
    .select("*")
    .eq("share_token", shareToken)
    .maybeSingle();

  if (shareErr || !share) notFound();

  const portalShare = share as PortalShare;

  /* ── 2. Fetch release ───────────────────────────────────────────── */

  const { data: release, error: releaseErr } = await supabase
    .from("releases")
    .select("*")
    .eq("id", portalShare.release_id)
    .maybeSingle();

  if (releaseErr || !release) notFound();

  /* ── 3. Fetch tracks ────────────────────────────────────────────── */

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .eq("release_id", portalShare.release_id)
    .order("track_number");

  const trackIds = (tracks ?? []).map((t) => t.id as string);

  /* ── 4. Parallel fetch: intents, specs, refs, versions, settings, distribution, approvals ─ */

  const empty = <T,>() => Promise.resolve({ data: [] as T[] });

  const [
    intentRes,
    specsRes,
    trackRefsRes,
    globalRefsRes,
    audioVersionsRes,
    commentsRes,
    trackSettingsRes,
    versionSettingsRes,
    distributionRes,
    approvalEventsRes,
  ] = await Promise.all([
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
      .eq("release_id", portalShare.release_id)
      .is("track_id", null)
      .order("sort_order"),
    trackIds.length > 0
      ? supabase
          .from("track_audio_versions")
          .select("*")
          .in("track_id", trackIds)
          .order("version_number")
      : empty<AudioVersionData>(),
    trackIds.length > 0
      ? supabase
          .from("revision_notes")
          .select("*")
          .in("track_id", trackIds)
          .order("created_at", { ascending: false })
      : empty<TimelineComment>(),
    supabase
      .from("portal_track_settings")
      .select("*")
      .eq("brief_share_id", portalShare.id),
    supabase
      .from("portal_version_settings")
      .select("*")
      .eq("brief_share_id", portalShare.id),
    trackIds.length > 0 && portalShare.show_distribution
      ? supabase.from("track_distribution").select("*").in("track_id", trackIds)
      : empty<PortalDistribution & { track_id: string }>(),
    supabase
      .from("portal_approval_events")
      .select("track_id, event_type, created_at")
      .eq("brief_share_id", portalShare.id)
      .eq("event_type", "approve")
      .order("created_at", { ascending: false }),
  ]);

  const intents = (intentRes.data ?? []) as BriefIntent[];
  const allSpecs = (specsRes.data ?? []) as BriefSpec[];
  const trackRefs = (trackRefsRes.data ?? []) as BriefReference[];
  const globalRefs = (globalRefsRes.data ?? []) as BriefReference[];
  const audioVersions = (audioVersionsRes.data ?? []) as AudioVersionData[];
  const allComments = (commentsRes.data ?? []) as (TimelineComment & { track_id: string })[];
  const trackSettings = (trackSettingsRes.data ?? []) as PortalTrackSetting[];
  const versionSettings = (versionSettingsRes.data ?? []) as PortalVersionSetting[];
  const allDistribution = (distributionRes.data ?? []) as (PortalDistribution & { track_id: string })[];
  const approvalEvents = (approvalEventsRes.data ?? []) as { track_id: string; event_type: string; created_at: string }[];

  /* ── 4b. Fetch engineer name (requires service client for RLS) ── */

  let engineerName: string | null = null;
  try {
    const serviceClient = createSupabaseServiceClient();
    const { data: userDefaults } = await serviceClient
      .from("user_defaults")
      .select("company_name")
      .eq("user_id", release.user_id)
      .maybeSingle();
    engineerName = userDefaults?.company_name ?? null;
  } catch {
    // Silently fail — engineer name is optional
  }

  /* ── 5. Build visibility + approval maps ──────────────────────── */

  const trackSettingsMap = new Map(
    trackSettings.map((ts) => [ts.track_id, ts]),
  );
  const versionSettingsMap = new Map(
    versionSettings.map((vs) => [vs.audio_version_id, vs]),
  );

  // Build approval date map (latest approve event per track)
  const approvalDateMap = new Map<string, string>();
  for (const event of approvalEvents) {
    if (!approvalDateMap.has(event.track_id)) {
      approvalDateMap.set(event.track_id, event.created_at);
    }
  }

  /* ── 6. Build filtered portal tracks ────────────────────────────── */

  const portalTracks: PortalTrack[] = (tracks ?? [])
    .filter((track) => {
      const setting = trackSettingsMap.get(track.id);
      // Default: visible if no setting row exists
      return setting ? setting.visible : true;
    })
    .map((track) => {
      const setting = trackSettingsMap.get(track.id);
      const intent = intents.find((i) => i.track_id === track.id) ?? null;
      const specs = allSpecs.find((s) => s.track_id === track.id) ?? null;
      const refs = trackRefs.filter((r) => r.track_id === track.id);

      // Filter audio versions by portal_version_settings
      const trackVersions = audioVersions
        .filter((v) => v.track_id === track.id)
        .filter((v) => {
          const vs = versionSettingsMap.get(v.id);
          return vs ? vs.visible : true;
        });

      const trackComments = allComments.filter((c) => c.track_id === track.id);

      // Distribution metadata
      const distRow = allDistribution.find((d) => d.track_id === track.id);
      const distribution: PortalDistribution | null = distRow
        ? {
            isrc: distRow.isrc,
            iswc: distRow.iswc,
            producer: distRow.producer,
            composers: distRow.composers,
            language: distRow.language,
            explicit_lyrics: distRow.explicit_lyrics,
            featured_artist: distRow.featured_artist,
            instrumental: distRow.instrumental,
            cover_song: distRow.cover_song,
          }
        : null;

      // Approval date
      const approvalStatus = setting?.approval_status ?? "awaiting_review";
      const approvalDate =
        approvalStatus === "approved" || approvalStatus === "delivered"
          ? approvalDateMap.get(track.id) ?? null
          : null;

      return {
        id: track.id,
        track_number: track.track_number,
        title: track.title,
        intent,
        specs,
        references: refs,
        versions: trackVersions,
        comments: trackComments,
        downloadEnabled: setting ? setting.download_enabled : true,
        approvalStatus,
        distribution,
        approvalDate,
      };
    });

  /* ── 7. Build release props ─────────────────────────────────────── */

  const releaseDistribution: PortalReleaseDistribution | null = portalShare.show_distribution
    ? {
        distributor: release.distributor ?? null,
        record_label: release.record_label ?? null,
        upc: release.upc ?? null,
        copyright_holder: release.copyright_holder ?? null,
        copyright_year: release.copyright_year ?? null,
        phonogram_copyright: release.phonogram_copyright ?? null,
        catalog_number: release.catalog_number ?? null,
      }
    : null;

  const portalRelease: PortalRelease = {
    id: release.id,
    title: release.title,
    artist: release.artist,
    release_type: release.release_type,
    format: release.format,
    cover_art_url: release.cover_art_url,
    global_direction: release.global_direction,
    payment_status: release.payment_status,
    fee_total: release.fee_total,
    fee_currency: release.fee_currency,
    paid_amount: release.paid_amount ?? 0,
    engineer_name: engineerName,
    distribution: releaseDistribution,
  };

  /* ── 8. Render ──────────────────────────────────────────────────── */

  return (
    <PortalClient
      shareToken={shareToken}
      share={portalShare}
      release={portalRelease}
      tracks={portalTracks}
      globalDirection={portalShare.show_direction ? release.global_direction : null}
      globalRefs={portalShare.show_references ? globalRefs : []}
    />
  );
}
