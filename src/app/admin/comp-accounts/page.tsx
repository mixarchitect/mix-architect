import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { CompAccountsPanel } from "@/components/admin/CompAccountsPanel";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { displayUserName } from "@/lib/display-user";

export const dynamic = "force-dynamic";

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  granted_by_admin: boolean;
  current_period_end: string | null;
  created_at: string;
}

export default async function CompAccountsPage() {
  const supabase = createSupabaseServiceClient();

  // Fetch all comp (admin-granted) subscriptions
  const { data: compSubs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("granted_by_admin", true)
    .order("created_at", { ascending: false });

  const rows = (compSubs ?? []) as SubscriptionRow[];

  // Get display names for comp account holders
  const compUserIds = rows.map((s) => s.user_id);
  const compNameMap: Record<string, string> = {};

  if (compUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", compUserIds);
    if (profiles) {
      for (const p of profiles) {
        compNameMap[p.id] = displayUserName(p);
      }
    }
  }

  const enrichedComps = rows.map((s) => ({
    ...s,
    user_email: compNameMap[s.user_id] ?? s.user_id.substring(0, 8),
  }));

  // Get all profiles for the autocomplete (users who could receive a comp)
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("email");

  const userOptions = (allProfiles ?? [])
    .filter((p: { id: string; email: string | null }) => p.email)
    .map((p: { id: string; full_name: string | null; email: string | null }) => ({
      userId: p.id,
      email: p.email as string,
      label: displayUserName(p),
    }));

  const activeCount = enrichedComps.filter(
    (c) => c.plan === "pro" && c.status === "active",
  ).length;

  const now = new Date();
  const expiringCount = enrichedComps.filter((c) => {
    if (!c.current_period_end || c.status !== "active") return false;
    const days = Math.ceil(
      (new Date(c.current_period_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days > 0 && days <= 7;
  }).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-text">Comp Accounts</h1>
        <AdminRefreshBar />
      </div>
      <p className="text-sm text-muted mb-6">
        Grant or revoke complimentary Pro access for users.
      </p>

      <div className="flex gap-4 mb-6">
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Active Comps</div>
          <div className="text-2xl font-bold text-amber-500">{activeCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Total Granted</div>
          <div className="text-2xl font-bold text-text">{enrichedComps.length}</div>
        </div>
        {expiringCount > 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 min-w-[120px]">
            <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">Expiring Soon</div>
            <div className="text-2xl font-bold text-amber-500">{expiringCount}</div>
          </div>
        )}
      </div>

      <CompAccountsPanel compAccounts={enrichedComps} userOptions={userOptions} />
    </div>
  );
}
