import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { ActivityLogList } from "@/components/admin/ActivityLogList";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { displayUserName } from "@/lib/display-user";

export const dynamic = "force-dynamic";

interface ActivityRow {
  id: string;
  user_id: string;
  event_type: string;
  event_metadata: Record<string, unknown>;
  created_at: string;
}

export default async function ActivityLogPage() {
  const supabase = createSupabaseServiceClient();

  const { data: events, error } = await supabase
    .from("admin_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/activity] Failed to fetch:", error.message);
  }

  const rows = (events ?? []) as ActivityRow[];

  // Get user display names
  const userIds = [...new Set(rows.map((e) => e.user_id))];
  const userNameMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);
    if (profiles) {
      for (const p of profiles) {
        userNameMap[p.id] = displayUserName(p);
      }
    }
  }

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
        Recent user actions across the platform. Showing last 200 events.
      </p>

      <ActivityLogList events={enriched} />
    </div>
  );
}
