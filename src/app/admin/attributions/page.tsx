import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import {
  type PresetKey,
  resolvePreset,
  parseDateISO,
  startOfDay,
  endOfDay,
  subDays,
} from "@/lib/admin-date-utils";
import { fetchUserDisplayMap, fetchUserPersonaMap } from "@/lib/admin-users";
import { AttributionsRangeSelector } from "./range-selector";
import { AttributionsExportButton } from "./export-button";

export const dynamic = "force-dynamic";

const PRESET_KEYS = ["today", "yesterday", "7d", "30d", "90d", "365d"];

interface Props {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
    source?: string;
  }>;
}

export default async function AttributionsDashboard({ searchParams }: Props) {
  const { range: rawRange, from: rawFrom, to: rawTo, source: sourceFilter } = await searchParams;

  const supabase = createSupabaseServiceClient();

  // Resolve date boundaries
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

  const since = periodFrom.toISOString();
  const until = periodTo.toISOString();

  // Week boundaries for week-over-week comparison
  const thisWeekStart = startOfDay(subDays(new Date(), 6)).toISOString();
  const lastWeekStart = startOfDay(subDays(new Date(), 13)).toISOString();
  const lastWeekEnd = endOfDay(subDays(new Date(), 7)).toISOString();

  // Build query with optional source filter
  let query = supabase
    .from("signup_attributions")
    .select("*")
    .gte("clicked_at", since)
    .lte("clicked_at", until);

  if (sourceFilter && sourceFilter !== "all") {
    query = query.eq("source", sourceFilter);
  }

  const [attrsRes, thisWeekRes, lastWeekRes] = await Promise.all([
    query.order("clicked_at", { ascending: false }),
    supabase
      .from("signup_attributions")
      .select("id, status")
      .gte("clicked_at", thisWeekStart)
      .eq("status", "signed_up"),
    supabase
      .from("signup_attributions")
      .select("id, status")
      .gte("clicked_at", lastWeekStart)
      .lte("clicked_at", lastWeekEnd)
      .eq("status", "signed_up"),
  ]);

  const attributions = attrsRes.data ?? [];
  const signupsThisWeek = thisWeekRes.data?.length ?? 0;
  const signupsLastWeek = lastWeekRes.data?.length ?? 0;

  // Summary stats
  const totalClicks = attributions.length;
  const totalSignups = attributions.filter((a) => a.status === "signed_up").length;
  const conversionRate = totalClicks > 0 ? ((totalSignups / totalClicks) * 100) : 0;
  const weekOverWeek = signupsLastWeek > 0
    ? ((signupsThisWeek - signupsLastWeek) / signupsLastWeek) * 100
    : signupsThisWeek > 0 ? 100 : 0;

  // By source breakdown
  const bySource = [
    { source: "Portal Branding", key: "portal_branding" },
    { source: "Post-Action Prompt", key: "post_action_prompt" },
  ].map(({ source, key }) => {
    const filtered = attributions.filter((a) => a.source === key);
    const clicks = filtered.length;
    const signups = filtered.filter((a) => a.status === "signed_up").length;
    return {
      source,
      clicks,
      signups,
      rate: clicks > 0 ? ((signups / clicks) * 100).toFixed(1) : "0.0",
    };
  });

  // Top users by attributed signups
  const userMap = new Map<string, { clicks: number; signups: number }>();
  for (const a of attributions) {
    if (!a.engineer_id) continue;
    const existing = userMap.get(a.engineer_id) ?? { clicks: 0, signups: 0 };
    existing.clicks++;
    if (a.status === "signed_up") existing.signups++;
    userMap.set(a.engineer_id, existing);
  }

  // Fetch user names and personas for all users in attributions
  const userIds = [...userMap.keys()];
  const [userNames, userPersonas] = userIds.length > 0
    ? await Promise.all([
        fetchUserDisplayMap(userIds),
        fetchUserPersonaMap(userIds),
      ])
    : [{} as Record<string, string>, {} as Record<string, string>];

  const topUsers = [...userMap.entries()]
    .sort((a, b) => b[1].signups - a[1].signups)
    .slice(0, 20)
    .map(([id, stats]) => ({
      id,
      name: userNames[id] ?? id.slice(0, 8),
      persona: userPersonas[id] ?? null,
      ...stats,
      rate: stats.clicks > 0 ? ((stats.signups / stats.clicks) * 100).toFixed(1) : "0.0",
    }));

  // Recent attributions (last 50)
  const recent = attributions.slice(0, 50);

  // CSV export data
  const exportRows: Record<string, unknown>[] = attributions.map((a) => ({
    ID: a.id,
    Source: a.source === "portal_branding" ? "Portal Branding" : "Post-Action Prompt",
    "Page Type": a.page_type ?? "delivery_portal",
    "User ID": a.engineer_id ?? "",
    User: a.engineer_id ? (userNames[a.engineer_id] ?? "") : "",
    Persona: a.engineer_id ? (userPersonas[a.engineer_id] ?? "") : "",
    Status: a.status === "signed_up" ? "Signed Up" : "Clicked",
    "Clicked At": a.clicked_at,
    "Signed Up At": a.signed_up_at ?? "",
  }));

  const isEmpty = totalClicks === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-text">Attribution Intelligence</h1>
        <div className="flex items-center gap-2">
          <AttributionsRangeSelector
            range={rawRange ?? "30d"}
            from={rawFrom}
            to={rawTo}
          />
          <AttributionsExportButton rows={exportRows} disabled={isEmpty} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} />
        <StatCard label="Signups" value={totalSignups.toLocaleString()} />
        <StatCard label="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} />
        <StatCard
          label="Week / Week"
          value={`${weekOverWeek >= 0 ? "+" : ""}${weekOverWeek.toFixed(0)}%`}
          accent={weekOverWeek >= 0 ? "green" : "red"}
        />
      </div>

      {/* Source Breakdown + Top Engineers */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* By Source */}
        <div className="rounded-lg border border-border bg-panel p-5">
          <h2 className="text-xs uppercase tracking-wider text-faint font-semibold mb-4">
            By Source
          </h2>
          {isEmpty ? (
            <p className="text-sm text-muted">No data yet</p>
          ) : (
            <div className="space-y-4">
              {bySource.map((s) => (
                <div key={s.source}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text font-medium">{s.source}</span>
                    <span className="text-muted">
                      {s.clicks} clicks, {s.signups} signups
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{
                          width: `${totalClicks > 0 ? (s.clicks / totalClicks) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted w-12 text-right">
                      {s.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Users */}
        <div className="rounded-lg border border-border bg-panel p-5">
          <h2 className="text-xs uppercase tracking-wider text-faint font-semibold mb-4">
            Top Users by Signups
          </h2>
          {topUsers.length === 0 ? (
            <p className="text-sm text-muted">No data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-faint text-xs font-medium pb-2">User</th>
                    <th className="text-left text-faint text-xs font-medium pb-2">Persona</th>
                    <th className="text-right text-faint text-xs font-medium pb-2">Clicks</th>
                    <th className="text-right text-faint text-xs font-medium pb-2">Signups</th>
                    <th className="text-right text-faint text-xs font-medium pb-2">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2 text-text truncate max-w-[180px]">{u.name}</td>
                      <td className="py-2 text-muted text-xs capitalize">{u.persona ?? "-"}</td>
                      <td className="py-2 text-muted text-right">{u.clicks}</td>
                      <td className="py-2 text-text text-right font-medium">{u.signups}</td>
                      <td className="py-2 text-muted text-right">{u.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Attributions */}
      <div className="rounded-lg border border-border bg-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-wider text-faint font-semibold">
            Recent Attributions
          </h2>
          {/* Source filter */}
          <div className="flex items-center gap-1">
            {[
              { label: "All", value: "" },
              { label: "Branding", value: "portal_branding" },
              { label: "Prompt", value: "post_action_prompt" },
            ].map((f) => {
              const isActive = (sourceFilter ?? "") === f.value;
              const href = new URL("/admin/attributions", "https://placeholder.com");
              if (rawRange) href.searchParams.set("range", rawRange);
              if (rawFrom) href.searchParams.set("from", rawFrom);
              if (rawTo) href.searchParams.set("to", rawTo);
              if (f.value) href.searchParams.set("source", f.value);
              return (
                <a
                  key={f.value}
                  href={`/admin/attributions${href.search}`}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    isActive
                      ? "bg-amber-600/15 text-amber-500 font-medium"
                      : "text-muted hover:text-text hover:bg-panel2"
                  }`}
                >
                  {f.label}
                </a>
              );
            })}
          </div>
        </div>

        {isEmpty ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted">
              No attributions recorded yet. Attribution tracking begins when clients interact with your delivery portals.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-faint text-xs font-medium pb-2">Source</th>
                  <th className="text-left text-faint text-xs font-medium pb-2 hidden sm:table-cell">User</th>
                  <th className="text-left text-faint text-xs font-medium pb-2 hidden md:table-cell">Persona</th>
                  <th className="text-left text-faint text-xs font-medium pb-2">Status</th>
                  <th className="text-right text-faint text-xs font-medium pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 text-text">
                      {a.source === "portal_branding" ? "Portal Branding" : "Post-Action"}
                    </td>
                    <td className="py-2 text-muted truncate max-w-[160px] hidden sm:table-cell">
                      {a.engineer_id ? (userNames[a.engineer_id] ?? a.engineer_id.slice(0, 8)) : "-"}
                    </td>
                    <td className="py-2 text-muted text-xs capitalize hidden md:table-cell">
                      {a.engineer_id ? (userPersonas[a.engineer_id] ?? "-") : "-"}
                    </td>
                    <td className="py-2">
                      {a.status === "signed_up" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-status-green font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
                          Signed up
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                          Clicked
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-muted text-right text-xs">
                      {new Date(a.clicked_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green" | "red";
}) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <div className="text-[10px] text-faint font-medium uppercase tracking-wider mb-1">
        {label}
      </div>
      <div
        className={`text-xl font-bold ${
          accent === "green"
            ? "text-status-green"
            : accent === "red"
              ? "text-red-500"
              : "text-text"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
