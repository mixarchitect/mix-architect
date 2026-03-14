import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { ActivityLogList } from "@/components/admin/ActivityLogList";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { fetchUserDisplayMap } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

interface ActivityRow {
  id: string;
  user_id: string;
  event_type: string;
  event_metadata: Record<string, unknown>;
  created_at: string;
}

type Range = "24h" | "7d" | "30d" | "90d" | "all";

const rangeDays: Record<Range, number | null> = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: null,
};

interface Props {
  searchParams: Promise<{ range?: string }>;
}

export default async function ActivityLogPage({ searchParams }: Props) {
  const { range: rawRange } = await searchParams;
  const range: Range = rawRange && rawRange in rangeDays ? (rawRange as Range) : "7d";
  const supabase = createSupabaseServiceClient();

  let query = supabase
    .from("admin_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const days = rangeDays[range];
  if (days !== null) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    query = query.gte("created_at", since.toISOString());
  }

  const { data: events, error } = await query;

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

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-text">Activity Log</h1>
        <AdminRefreshBar />
      </div>
      <p className="text-sm text-muted mb-6">
        Recent user actions across the platform.
      </p>

      <ActivityLogList events={enriched} range={range} />
    </div>
  );
}
