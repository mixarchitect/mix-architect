import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { AuditLogList } from "@/components/admin/AuditLogList";
import { fetchUserDisplayMap } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

interface AuditRow {
  id: string;
  admin_id: string;
  action: string;
  action_metadata: Record<string, unknown>;
  created_at: string;
}

export default async function AuditLogPage() {
  const supabase = createSupabaseServiceClient();

  const { data: entries, error } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/audit] Failed to fetch:", error.message);
  }

  const rows = (entries ?? []) as AuditRow[];

  // Get admin display names from auth.users
  const adminIds = [...new Set(rows.map((e) => e.admin_id))];
  const adminNameMap = await fetchUserDisplayMap(adminIds);

  const enriched = rows.map((e) => ({
    ...e,
    admin_name: adminNameMap[e.admin_id] ?? e.admin_id.substring(0, 8),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-text">Audit Log</h1>
        <AdminRefreshBar />
      </div>
      <p className="text-sm text-muted mb-6">
        All admin actions. Showing last 200 entries.
      </p>

      <AuditLogList entries={enriched} />
    </div>
  );
}
