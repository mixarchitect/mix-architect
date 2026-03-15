import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { ChurnSignalsList } from "@/components/admin/ChurnSignalsList";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { fetchUserDisplayMap } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

interface ChurnSignalRow {
  id: string;
  user_id: string;
  signal_type: string;
  severity: string;
  details: Record<string, unknown>;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export default async function ChurnSignalsPage() {
  const supabase = createSupabaseServiceClient();

  // Fetch churn signals ordered by newest first
  const { data: signals, error } = await supabase
    .from("admin_churn_signals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[admin/churn] Failed to fetch signals:", error.message);
  }

  const rows = (signals ?? []) as ChurnSignalRow[];

  // Get user display names from auth.users
  const userIds = [...new Set(rows.map((s) => s.user_id))];
  const userNameMap = await fetchUserDisplayMap(userIds);

  const enrichedSignals = rows.map((s) => ({
    ...s,
    user_email: userNameMap[s.user_id] ?? s.user_id.substring(0, 8),
  }));

  const openCount = enrichedSignals.filter((s) => !s.resolved).length;
  const resolvedCount = enrichedSignals.filter((s) => s.resolved).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h1 className="text-2xl font-bold text-text">Churn Signals</h1>
        <AdminRefreshBar />
      </div>
      <p className="text-sm text-muted mb-6">
        Detected risk indicators for subscriber retention.
      </p>

      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="rounded-lg border border-border bg-panel px-4 py-3">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Open</div>
          <div className="text-2xl font-bold text-amber-500">{openCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-panel px-4 py-3">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Resolved</div>
          <div className="text-2xl font-bold text-emerald-500">{resolvedCount}</div>
        </div>
      </div>

      <ChurnSignalsList signals={enrichedSignals} />
    </div>
  );
}
