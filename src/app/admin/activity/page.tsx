import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { ActivityLogList } from "@/components/admin/ActivityLogList";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { DateRangeSelector } from "@/components/ui/date-range-selector";
import { fetchUserDisplayMap } from "@/lib/admin-users";
import {
  type PresetKey,
  resolvePreset,
  parseDateISO,
  startOfDay,
  endOfDay,
} from "@/lib/admin-date-utils";

export const dynamic = "force-dynamic";

interface ActivityRow {
  id: string;
  user_id: string;
  event_type: string;
  event_metadata: Record<string, unknown>;
  created_at: string;
}

const PRESET_KEYS = ["today", "yesterday", "7d", "30d", "90d", "365d"];

interface Props {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
    compare?: string;
  }>;
}

export default async function ActivityLogPage({ searchParams }: Props) {
  const {
    range: rawRange,
    from: rawFrom,
    to: rawTo,
    compare: rawCompare,
  } = await searchParams;

  const supabase = createSupabaseServiceClient();

  // Resolve date boundaries (same pattern as admin dashboard)
  let periodFrom: Date;
  let periodTo: Date;
  const isCustom = rawRange === "custom" && rawFrom && rawTo;

  if (isCustom) {
    periodFrom = parseDateISO(rawFrom) ?? startOfDay(new Date());
    periodTo = endOfDay(parseDateISO(rawTo) ?? new Date());
  } else {
    const presetKey: PresetKey = PRESET_KEYS.includes(rawRange ?? "")
      ? (rawRange as PresetKey)
      : "7d";
    const preset = resolvePreset(presetKey);
    periodFrom = preset.from;
    periodTo = preset.to;
  }

  const since = periodFrom.toISOString();
  const until = periodTo.toISOString();

  const { data: events, error } = await supabase
    .from("admin_activity_log")
    .select("*")
    .gte("created_at", since)
    .lte("created_at", until)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/activity] Failed to fetch:", error.message);
  }

  const rows = (events ?? []) as ActivityRow[];

  // Get user display names from auth.users
  const userIds = [...new Set(rows.map((e) => e.user_id))];
  const userNameMap = await fetchUserDisplayMap(userIds);

  const enriched = rows.map((e) => ({
    ...e,
    user_email: userNameMap[e.user_id] ?? e.user_id.substring(0, 8),
  }));

  const currentRange = isCustom ? "custom" : (rawRange ?? "7d");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h1 className="text-2xl font-bold text-text">Activity Log</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <DateRangeSelector
            range={currentRange}
            from={isCustom ? rawFrom : undefined}
            to={isCustom ? rawTo : undefined}
            compare={rawCompare}
            basePath="/admin/activity"
            variant="admin"
            showCompare={false}
          />
          <AdminRefreshBar />
        </div>
      </div>
      <p className="text-sm text-muted mb-6">
        Recent user actions across the platform.
      </p>

      <ActivityLogList events={enriched} />
    </div>
  );
}
