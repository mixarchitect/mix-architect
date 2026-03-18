import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { ReleaseCard } from "@/components/ui/release-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { ArtistInfoBar } from "@/components/dashboard/artist-sidebar";
import { Plus, Sparkles, Music, Search } from "lucide-react";
import { formatMoney } from "@/lib/format-money";
import { getLocale, getTranslations } from "next-intl/server";
import type { DashboardRelease } from "@/types/release";

const VALID_FILTERS = ["outstanding", "earned"] as const;
type PaymentFilter = (typeof VALID_FILTERS)[number];

const VALID_SORTS = ["modified", "created", "az"] as const;
type SortOption = (typeof VALID_SORTS)[number];

type Props = {
  searchParams: Promise<{ payment?: string; sort?: string; artist?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const locale = await getLocale();
  const t = await getTranslations("dashboard");
  const { payment, sort, artist: artistFilter } = await searchParams;
  const activeSort: SortOption =
    sort && VALID_SORTS.includes(sort as SortOption) ? (sort as SortOption) : "modified";

  const supabase = await createSupabaseServerClient();

  // Build releases query with pinned-first + user sort
  let releasesQuery = supabase
    .from("releases")
    .select("*, tracks(id, status)")
    .order("pinned", { ascending: false });

  if (activeSort === "az") {
    releasesQuery = releasesQuery.order("title", { ascending: true });
  } else if (activeSort === "created") {
    releasesQuery = releasesQuery.order("created_at", { ascending: false });
  } else {
    releasesQuery = releasesQuery.order("updated_at", { ascending: false });
  }

  // Fire all independent queries in parallel
  const [userRes, releasesRes] = await Promise.all([
    supabase.auth.getUser(),
    releasesQuery,
  ]);

  const user = userRes.data.user;
  let paymentsEnabled = false;

  // Fetch user defaults + shared release memberships in parallel
  type MemberRow = { release_id: string; role: string };
  let sharedMemberships: MemberRow[] = [];
  let subPlan = "free";
  let subStatus = "active";

  if (user) {
    const [defaultsRes, membersRes, subRes] = await Promise.all([
      supabase
        .from("user_defaults")
        .select("payments_enabled")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("release_members")
        .select("release_id, role")
        .eq("user_id", user.id)
        .not("accepted_at", "is", null),
      supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    paymentsEnabled = defaultsRes.data?.payments_enabled ?? false;
    sharedMemberships = (membersRes.data ?? []) as MemberRow[];
    subPlan = (subRes.data?.plan as string) ?? "free";
    subStatus = (subRes.data?.status as string) ?? "active";
  }

  // Separate owned vs shared releases (RLS returns both; filter by membership)
  const allReleases = releasesRes.data;
  const sharedReleaseIds = new Set(sharedMemberships.map((m) => m.release_id));
  const roleByReleaseId = new Map(sharedMemberships.map((m) => [m.release_id, m.role]));

  const releases = allReleases?.filter((r) => !sharedReleaseIds.has(r.id as string)) ?? null;
  const sharedReleases = allReleases?.filter((r) => sharedReleaseIds.has(r.id as string)) ?? [];

  const isPro = subPlan === "pro" && (subStatus === "active" || subStatus === "trialing");
  const ownedReleaseCount = releases?.length ?? 0;
  const atFreeLimit = !isPro && ownedReleaseCount >= 1;

  let outstandingTotal = 0;
  let outstandingCount = 0;
  let earnedTotal = 0;
  let earnedCount = 0;
  let feeGrandTotal = 0;
  let feeReleaseCount = 0;
  let primaryCurrency = "USD";

  if (releases) {
    for (const r of releases) {
      const fee = r.fee_total as number | null;
      const status = (r.payment_status as string) ?? "no_fee";
      if (status === "no_fee") continue;
      if (fee != null) {
        if (!feeReleaseCount) primaryCurrency = (r.fee_currency as string) || "USD";
        feeReleaseCount++;
        feeGrandTotal += fee;
        const paid = (r.paid_amount as number) ?? 0;
        if (status === "paid") {
          earnedTotal += fee;
          earnedCount++;
        } else {
          outstandingTotal += fee - paid;
          earnedTotal += paid;
          outstandingCount++;
          if (paid > 0) earnedCount++;
        }
      }
    }
  }

  const hasAnyFees = feeReleaseCount > 0;

  const activeFilter: PaymentFilter | null =
    paymentsEnabled && hasAnyFees && payment && VALID_FILTERS.includes(payment as PaymentFilter)
      ? (payment as PaymentFilter)
      : null;

  let displayReleases = activeFilter && releases
    ? releases.filter((r) => {
        const status = (r.payment_status as string) ?? "no_fee";
        if (status === "no_fee") return false;
        return activeFilter === "outstanding" ? status !== "paid" : status === "paid";
      })
    : releases;

  // Artist filter
  if (artistFilter && displayReleases) {
    const lowerArtist = artistFilter.toLowerCase();
    displayReleases = displayReleases.filter(
      (r) => (r.artist as string | null)?.toLowerCase() === lowerArtist,
    );
  }

  // ── Fetch client info + artist photo for artist sidebar ──
  let artistClientName = "";
  let artistClientEmail = "";
  let artistClientPhone = "";
  let artistClientNotes = "";
  let artistCustomPhotoUrl: string | null = null;
  let artistFallbackCoverUrl: string | null = null;

  if (artistFilter && displayReleases && user) {
    const match = displayReleases.find((r) => r.client_email);
    artistClientName = (match?.client_name as string) ?? "";
    artistClientEmail = (match?.client_email as string) ?? "";
    artistClientPhone = (match?.client_phone as string) ?? "";

    // Get latest cover art as fallback photo
    const coverMatch = displayReleases.find((r) => r.cover_art_url);
    artistFallbackCoverUrl = (coverMatch?.cover_art_url as string | null) ?? null;

    // Look up notes and custom photo in parallel
    const noteKey = artistClientEmail || `artist:${artistFilter.toLowerCase()}`;
    const [cnRes, photoRes] = await Promise.all([
      supabase
        .from("client_notes")
        .select("notes")
        .eq("engineer_id", user.id)
        .eq("client_email", noteKey)
        .maybeSingle(),
      supabase
        .from("artist_photos")
        .select("photo_url")
        .eq("user_id", user.id)
        .eq("artist_name_key", artistFilter.toLowerCase())
        .maybeSingle(),
    ]);
    artistClientNotes = cnRes.data?.notes ?? "";
    artistCustomPhotoUrl = (photoRes.data?.photo_url as string | null) ?? null;
  }

  // ── Build DashboardRelease[] for the timeline ──
  const dashboardReleases: DashboardRelease[] = (displayReleases ?? []).map(
    (r: Record<string, unknown> & { tracks?: { id: string; status: string }[] }) => ({
      id: r.id as string,
      title: r.title as string,
      artist: (r.artist as string | null) ?? null,
      release_type: r.release_type as DashboardRelease["release_type"],
      format: r.format as DashboardRelease["format"],
      status: r.status as DashboardRelease["status"],
      target_date: (r.target_date as string | null) ?? null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
      track_count: r.tracks?.length ?? 0,
      completed_tracks: r.tracks?.filter((t) => t.status === "complete").length ?? 0,
      pinned: (r.pinned as boolean) ?? false,
      payment_status: (r.payment_status as string | null) ?? null,
      fee_total: (r.fee_total as number | null) ?? null,
      fee_currency: (r.fee_currency as string | null) ?? null,
      cover_art_url: (r.cover_art_url as string | null) ?? null,
    }),
  );

  // ── Grid content (server-rendered cards) ──
  const gridContent =
    displayReleases && displayReleases.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayReleases.map((r: Record<string, unknown> & { tracks?: { id: string; status: string }[] }) => {
          const trackCount = r.tracks?.length ?? 0;
          const completedTracks =
            r.tracks?.filter((t) => t.status === "complete").length ?? 0;
          return (
            <ReleaseCard
              key={r.id as string}
              id={r.id as string}
              title={r.title as string}
              artist={r.artist as string | null}
              releaseType={r.release_type as string}
              format={r.format as string}
              status={r.status as string}
              trackCount={trackCount}
              completedTracks={completedTracks}
              updatedAt={r.updated_at as string | null}
              paymentsEnabled={paymentsEnabled}
              paymentStatus={r.payment_status as string | null}
              feeTotal={r.fee_total as number | null}
              feeCurrency={r.fee_currency as string | null}
              coverArtUrl={r.cover_art_url as string | null}
              pinned={r.pinned as boolean}
              role="owner"
              hasNotes={!!r.internal_notes}
            />
          );
        })}
      </div>
    ) : (
      <EmptyState
        icon={Search}
        size="md"
        title={t("noFilteredReleases", { filter: activeFilter ?? "" })}
        description={t("noFilteredReleasesDesc")}
        action={{ label: t("clearFilters"), href: "/app", variant: "ghost" }}
      />
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold h2 text-text">{t("title")}</h1>
        <div className="flex items-center gap-2">
          {atFreeLimit && (
            <Link href="/app/settings">
              <Button variant="secondary">
                <Sparkles size={16} />
                {t("upgrade")}
              </Button>
            </Link>
          )}
          <Link href="/app/releases/new">
            <Button variant="primary">
              <Plus size={16} />
              {t("newRelease")}
            </Button>
          </Link>
        </div>
      </div>

      <div>

      {artistFilter && (
        <>
        <div className="flex items-center gap-2 text-sm text-muted mb-4">
          {t("showingBy")} <span className="font-semibold text-text">{artistFilter}</span>
          <Link href="/app" className="text-signal hover:underline text-xs">
            {t("showAll")}
          </Link>
        </div>
        {user && (
          <ArtistInfoBar
            artistName={artistFilter}
            userId={user.id}
            initialClientName={artistClientName}
            initialClientEmail={artistClientEmail}
            initialClientPhone={artistClientPhone}
            initialNotes={artistClientNotes}
            customPhotoUrl={artistCustomPhotoUrl}
            fallbackCoverUrl={artistFallbackCoverUrl}
          />
        )}
        </>
      )}

      {paymentsEnabled && hasAnyFees && (
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 rounded-lg text-xs mb-6"
          style={{ background: "var(--panel2)" }}
        >
          <span className="text-muted">
            {t("outstanding")}:{" "}
            <span className={outstandingTotal > 0 ? "font-semibold text-signal" : "font-semibold text-text"}>
              {formatMoney(outstandingTotal, primaryCurrency, locale)}
            </span>
            <Link
              href={activeFilter === "outstanding" ? "/app" : "/app?payment=outstanding"}
              className={cn(
                "ml-1 hover:underline",
                activeFilter === "outstanding" ? "text-text font-semibold" : "text-faint",
              )}
            >
              ({t("releaseCount", { count: outstandingCount })})
            </Link>
          </span>
          <span className="text-faint hidden sm:inline">·</span>
          <span className="text-muted">
            {t("earned")}:{" "}
            <span className="font-semibold text-text">
              {formatMoney(earnedTotal, primaryCurrency, locale)}
            </span>
            <Link
              href={activeFilter === "earned" ? "/app" : "/app?payment=earned"}
              className={cn(
                "ml-1 hover:underline",
                activeFilter === "earned" ? "text-text font-semibold" : "text-faint",
              )}
            >
              ({t("releaseCount", { count: earnedCount })})
            </Link>
          </span>
          <span className="text-faint hidden sm:inline">·</span>
          <span className="text-muted">
            {t("total")}:{" "}
            <span className="font-semibold text-text">
              {formatMoney(feeGrandTotal, primaryCurrency, locale)}
            </span>
            <span className="text-faint ml-1">
              {t("paidOf", { earnedCount, feeReleaseCount })}
            </span>
          </span>
          <span className="text-faint hidden sm:inline">·</span>
          <Link
            href="/app/payments"
            className="text-signal text-xs font-medium hover:underline hidden sm:inline"
          >
            {t("viewAll")} &rarr;
          </Link>
          {activeFilter && (
            <span className="basis-full flex items-center gap-2 text-muted pt-1 border-t border-border mt-1">
              {t("showingFiltered", { filter: activeFilter, count: displayReleases?.length ?? 0 })}
              <Link href="/app" className="text-signal hover:underline">
                {t("showAll")}
              </Link>
            </span>
          )}
        </div>
      )}

      {releases && releases.length > 0 ? (
        <DashboardContent
          releases={dashboardReleases}
          gridContent={gridContent}
        />
      ) : !sharedReleases.length ? (
        <EmptyState
          icon={Music}
          size="lg"
          title={t("noReleases")}
          description={t("noReleasesDesc")}
          action={{ label: t("createFirst"), href: "/app/releases/new", variant: "primary" }}
        />
      ) : null}

      {sharedReleases.length > 0 && (
        <>
          <h2 className="text-base font-semibold text-text mt-10 mb-4">{t("sharedWithYou")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sharedReleases.map((r: Record<string, unknown> & { tracks?: { id: string; status: string }[] }) => {
              const trackCount = r.tracks?.length ?? 0;
              const completedTracks =
                r.tracks?.filter((t) => t.status === "complete").length ?? 0;
              const memberRole = roleByReleaseId.get(r.id as string);
              return (
                <ReleaseCard
                  key={r.id as string}
                  id={r.id as string}
                  title={r.title as string}
                  artist={r.artist as string | null}
                  releaseType={r.release_type as string}
                  format={r.format as string}
                  status={r.status as string}
                  trackCount={trackCount}
                  completedTracks={completedTracks}
                  updatedAt={r.updated_at as string | null}
                  paymentsEnabled={paymentsEnabled}
                  paymentStatus={r.payment_status as string | null}
                  feeTotal={r.fee_total as number | null}
                  feeCurrency={r.fee_currency as string | null}
                  coverArtUrl={r.cover_art_url as string | null}
                  pinned={r.pinned as boolean}
                  role={(memberRole as "collaborator" | "client") ?? "client"}
                />
              );
            })}
          </div>
        </>
      )}

      </div>
    </div>
  );
}
