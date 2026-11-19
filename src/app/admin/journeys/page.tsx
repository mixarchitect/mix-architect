import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { DateRangeSelector } from "@/components/ui/date-range-selector";
import { LocalTime } from "./local-time";
import { classifySignupSource, type SignupSourceRow } from "@/lib/attribution-source";
import { describeDevice } from "@/lib/product-events";
import {
  type PresetKey,
  resolvePreset,
  parseDateISO,
  startOfDay,
  endOfDay,
} from "@/lib/admin-date-utils";

export const dynamic = "force-dynamic";

const PRESET_KEYS = ["today", "yesterday", "7d", "30d", "90d", "365d"];
const MAX_TIMELINE_EVENTS = 80;
// Activity separated by a quiet gap this long counts as a separate visit.
// Gap-based (not calendar-day) so the count does not depend on a timezone.
const VISIT_GAP_MS = 4 * 60 * 60 * 1000;

function countVisits(timestamps: string[]): number {
  const times = timestamps.map((t) => new Date(t).getTime()).sort((a, b) => a - b);
  let visits = 0;
  let last = -Infinity;
  for (const t of times) {
    if (t - last > VISIT_GAP_MS) visits++;
    last = t;
  }
  return visits;
}

const MILESTONES = [
  { key: "onboarded", label: "Onboarded" },
  { key: "release", label: "Release" },
  { key: "audio", label: "Audio" },
  { key: "played", label: "Played" },
  { key: "portal", label: "Portal" },
  { key: "paid", label: "Paid" },
] as const;
type MilestoneKey = (typeof MILESTONES)[number]["key"];

const EVENT_LABELS: Record<string, string> = {
  signup: "Signed up",
  login: "Signed in",
  session_start: "Started a session",
  section_viewed: "Opened a section",
  onboarding_completed: "Finished onboarding",
  release_created: "Created a release",
  track_uploaded: "Uploaded audio",
  audio_played: "Played audio",
  comment_added: "Left a timestamped comment",
  audio_downloaded: "Downloaded audio",
  portal_enabled: "Turned on the client portal",
  portal_link_copied: "Copied the portal link",
  brief_link_copied: "Copied the brief link",
  flow_opened: "Opened the Flow Simulator",
  checkout_started: "Started checkout",
  subscription_started: "Subscribed",
  subscription_renewed: "Subscription renewed",
  subscription_cancelled: "Cancelled subscription",
  payment_failed: "Payment failed",
  export_requested: "Requested an export",
  conversion_completed: "Converted a file",
  collaborator_invited: "Invited a collaborator",
};

// Only these metadata keys are echoed in the timeline; ids stay out of view.
const DETAIL_KEYS = ["section", "entry", "persona", "plan", "format", "version", "method", "releaseType", "from", "role"];

interface EventRow {
  user_id: string;
  event_type: string;
  event_metadata: Record<string, unknown> | null;
  created_at: string;
  user_agent: string | null;
}

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string; compare?: string }>;
}

function pseudonym(userId: string): string {
  return `User ${userId.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

function eventDetail(e: EventRow): string {
  const meta = e.event_metadata ?? {};
  return DETAIL_KEYS.filter((k) => meta[k] != null && meta[k] !== "")
    .map((k) => (k === "version" ? `v${meta[k]}` : String(meta[k]).replace(/_/g, " ")))
    .join(" · ");
}

export default async function JourneysPage({ searchParams }: Props) {
  await requireAdmin();
  const { range: rawRange, from: rawFrom, to: rawTo, compare: rawCompare } = await searchParams;

  let periodFrom: Date;
  let periodTo: Date;
  const isCustom = rawRange === "custom" && rawFrom && rawTo;
  if (isCustom) {
    periodFrom = parseDateISO(rawFrom) ?? startOfDay(new Date());
    periodTo = endOfDay(parseDateISO(rawTo) ?? new Date());
  } else {
    const presetKey: PresetKey = PRESET_KEYS.includes(rawRange ?? "")
      ? (rawRange as PresetKey)
      : "30d";
    const preset = resolvePreset(presetKey);
    periodFrom = preset.from;
    periodTo = preset.to;
  }
  const currentRange = isCustom ? "custom" : (rawRange ?? "30d");

  const supabase = createSupabaseServiceClient();

  // Signups in the period. Identity fields (email, name) are never read
  // into this page: it works from ids and timestamps only.
  const signups: { id: string; created_at: string }[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      const created = new Date(u.created_at);
      if (created >= periodFrom && created <= periodTo) {
        signups.push({ id: u.id, created_at: u.created_at });
      }
    }
    if (data.users.length < 200) break;
  }

  const allIds = signups.map((s) => s.id);
  const { data: profileRows } = allIds.length
    ? await supabase.from("profiles").select("id, is_admin, is_test_account").in("id", allIds)
    : { data: [] };
  const excluded = new Set(
    (profileRows ?? [])
      .filter((p) => p.is_admin === true || p.is_test_account === true)
      .map((p) => p.id as string),
  );
  const users = signups
    .filter((s) => !excluded.has(s.id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const ids = users.map((u) => u.id);

  const [attrRes, defaultsRes, subsRes, eventsRes, releasesRes] = ids.length
    ? await Promise.all([
        supabase
          .from("signup_attributions")
          .select("attributed_user_id, source, referrer, utm_source, engineer_id")
          .in("attributed_user_id", ids),
        supabase.from("user_defaults").select("user_id, persona, onboarding_completed").in("user_id", ids),
        supabase.from("subscriptions").select("user_id, plan, status").in("user_id", ids),
        supabase
          .from("admin_activity_log")
          .select("user_id, event_type, event_metadata, created_at, user_agent")
          .in("user_id", ids)
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase.from("releases").select("id, user_id").in("user_id", ids),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const releases = (releasesRes.data ?? []) as { id: string; user_id: string }[];
  const releaseIds = releases.map((r) => r.id);
  const [tracksRes, sharesRes] = releaseIds.length
    ? await Promise.all([
        supabase.from("tracks").select("id, release_id").in("release_id", releaseIds),
        supabase.from("brief_shares").select("release_id").in("release_id", releaseIds),
      ])
    : [{ data: [] }, { data: [] }];
  const tracks = (tracksRes.data ?? []) as { id: string; release_id: string }[];
  const trackIds = tracks.map((t) => t.id);
  const { data: versionRows } = trackIds.length
    ? await supabase.from("track_audio_versions").select("track_id").in("track_id", trackIds)
    : { data: [] };

  const releaseOwner = new Map(releases.map((r) => [r.id, r.user_id]));
  const trackOwner = new Map(tracks.map((t) => [t.id, releaseOwner.get(t.release_id)]));
  const countBy = (owners: (string | undefined)[]) => {
    const m = new Map<string, number>();
    for (const o of owners) if (o) m.set(o, (m.get(o) ?? 0) + 1);
    return m;
  };
  const releaseCount = countBy(releases.map((r) => r.user_id));
  const audioCount = countBy(
    ((versionRows ?? []) as { track_id: string }[]).map((v) => trackOwner.get(v.track_id)),
  );
  const portalOwners = new Set(
    ((sharesRes.data ?? []) as { release_id: string }[]).map((s) => releaseOwner.get(s.release_id)),
  );

  const attrByUser = new Map(
    ((attrRes.data ?? []) as (SignupSourceRow & { attributed_user_id: string })[]).map((a) => [
      a.attributed_user_id,
      a,
    ]),
  );
  const defaultsByUser = new Map(
    ((defaultsRes.data ?? []) as { user_id: string; persona: string | null; onboarding_completed: boolean | null }[]).map(
      (d) => [d.user_id, d],
    ),
  );
  const subByUser = new Map(
    ((subsRes.data ?? []) as { user_id: string; plan: string | null; status: string | null }[]).map((s) => [
      s.user_id,
      s,
    ]),
  );
  const eventsByUser = new Map<string, EventRow[]>();
  for (const e of (eventsRes.data ?? []) as EventRow[]) {
    const list = eventsByUser.get(e.user_id) ?? [];
    list.push(e);
    eventsByUser.set(e.user_id, list);
  }

  const journeys = users.map((u) => {
    const events = (eventsByUser.get(u.id) ?? []).slice().reverse();
    const types = new Set(events.map((e) => e.event_type));
    const sub = subByUser.get(u.id);
    const paid = !!sub?.plan && sub.plan !== "free" && sub.status !== "canceled";
    const done: Record<MilestoneKey, boolean> = {
      onboarded: defaultsByUser.get(u.id)?.onboarding_completed === true,
      release: (releaseCount.get(u.id) ?? 0) > 0,
      audio: (audioCount.get(u.id) ?? 0) > 0,
      played: types.has("audio_played"),
      portal: portalOwners.has(u.id) || types.has("portal_enabled"),
      paid,
    };
    const visits = countVisits([u.created_at, ...events.map((e) => e.created_at)]);
    const lastSeen = events.length ? events[events.length - 1].created_at : u.created_at;
    const device = describeDevice([...events].reverse().find((e) => e.user_agent)?.user_agent);
    return {
      id: u.id,
      createdAt: u.created_at,
      source: classifySignupSource(attrByUser.get(u.id)),
      persona: defaultsByUser.get(u.id)?.persona ?? null,
      plan: sub?.plan ?? "free",
      done,
      visits,
      lastSeen,
      device,
      releases: releaseCount.get(u.id) ?? 0,
      audio: audioCount.get(u.id) ?? 0,
      events,
    };
  });

  const total = journeys.length;
  const sourceCounts = new Map<string, number>();
  for (const j of journeys) sourceCounts.set(j.source.label, (sourceCounts.get(j.source.label) ?? 0) + 1);
  const sources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);
  const returned = journeys.filter((j) => j.visits > 1).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h1 className="text-2xl font-bold text-text">User Journeys</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <DateRangeSelector
            range={currentRange}
            from={isCustom ? rawFrom : undefined}
            to={isCustom ? rawTo : undefined}
            compare={rawCompare}
            basePath="/admin/journeys"
            variant="admin"
            showCompare={false}
          />
          <AdminRefreshBar />
        </div>
      </div>
      <p className="text-sm text-muted mb-6 max-w-3xl">
        Where each new signup came from and what they did next. People are shown by a short
        code, not by name or email. Admin and test accounts are left out.
      </p>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="text-xs font-medium text-muted uppercase tracking-wider">Signups</div>
          <div className="text-3xl font-bold text-text mt-1">{total}</div>
          <div className="text-xs text-muted mt-1">
            {returned} came back for another visit
          </div>
        </div>

        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Where they came from</div>
          {sources.length === 0 ? (
            <div className="text-sm text-muted">No signups in this period.</div>
          ) : (
            <ul className="space-y-1.5">
              {sources.map(([label, count]) => (
                <li key={label} className="flex items-center gap-2 text-sm">
                  <span className="text-text flex-1 truncate">{label}</span>
                  <span className="h-1.5 rounded-full bg-signal" style={{ width: `${Math.max(8, (count / total) * 96)}px` }} />
                  <span className="text-muted tabular-nums w-5 text-right">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="text-xs font-medium text-muted uppercase tracking-wider mb-2">How far they got</div>
          <ul className="space-y-1.5">
            {MILESTONES.map((m) => {
              const count = journeys.filter((j) => j.done[m.key]).length;
              return (
                <li key={m.key} className="flex items-center gap-2 text-sm">
                  <span className="text-text flex-1">{m.label}</span>
                  <span
                    className="h-1.5 rounded-full bg-signal"
                    style={{ width: total ? `${Math.max(count ? 8 : 0, (count / total) * 96)}px` : 0 }}
                  />
                  <span className="text-muted tabular-nums w-10 text-right">
                    {count}/{total}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {journeys.length === 0 ? (
        <div className="rounded-lg border border-border bg-panel p-8 text-center text-sm text-muted">
          No signups in this period.
        </div>
      ) : (
        <div className="space-y-2">
          {journeys.map((j) => (
            <details key={j.id} className="group rounded-lg border border-border bg-panel">
              <summary className="cursor-pointer list-none p-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="min-w-[150px]">
                  <div className="text-sm font-semibold text-text font-mono">{pseudonym(j.id)}</div>
                  <div className="text-xs text-muted">Signed up <LocalTime iso={j.createdAt} /></div>
                </div>
                <div className="min-w-[150px]">
                  <div className="text-sm text-text">{j.source.label}</div>
                  <div className="text-xs text-muted capitalize">
                    {[j.persona, j.plan !== "free" ? j.plan : null, j.device].filter(Boolean).join(" · ") || "No details yet"}
                  </div>
                </div>
                <div className="flex items-center gap-1.5" aria-label="Milestones reached">
                  {MILESTONES.map((m) => (
                    <span
                      key={m.key}
                      title={`${m.label}: ${j.done[m.key] ? "yes" : "not yet"}`}
                      className={
                        j.done[m.key]
                          ? "px-2 py-0.5 rounded-full text-2xs font-medium bg-signal-muted text-signal"
                          : "px-2 py-0.5 rounded-full text-2xs font-medium border border-border text-faint"
                      }
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm text-text tabular-nums">
                    {j.visits} {j.visits === 1 ? "visit" : "visits"}
                  </div>
                  <div className="text-xs text-muted">Last seen <LocalTime iso={j.lastSeen} /></div>
                </div>
              </summary>

              <div className="border-t border-border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-xs text-muted">
                    {j.releases} {j.releases === 1 ? "release" : "releases"} · {j.audio} audio{" "}
                    {j.audio === 1 ? "upload" : "uploads"} · {j.events.length} recorded events
                  </div>
                  <Link href={`/admin/subscribers/${j.id}`} className="text-xs text-signal hover:underline">
                    Open full profile (shows identity)
                  </Link>
                </div>
                {j.events.length === 0 ? (
                  <p className="text-sm text-muted">Nothing recorded after signup.</p>
                ) : (
                  <ol className="space-y-1">
                    {j.events.slice(-MAX_TIMELINE_EVENTS).map((e, i) => {
                      const detail = eventDetail(e);
                      return (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="text-xs text-muted tabular-nums w-40 shrink-0 pt-0.5">
                            <LocalTime iso={e.created_at} />
                          </span>
                          <span className="text-text">
                            {EVENT_LABELS[e.event_type] ?? e.event_type.replace(/_/g, " ")}
                            {detail && <span className="text-muted"> · {detail}</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
                {j.events.length > MAX_TIMELINE_EVENTS && (
                  <p className="text-xs text-muted mt-2">
                    Showing the latest {MAX_TIMELINE_EVENTS} of {j.events.length} events.
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      )}

      <p className="text-xs text-muted mt-6 max-w-3xl">
        Sessions, section views, plays, comments and downloads are recorded from mid-November 2026
        onward, so earlier signups show only releases, uploads and billing. Usage events store no IP
        address and no content: only the action, a coarse device type and the time.
      </p>
    </div>
  );
}
