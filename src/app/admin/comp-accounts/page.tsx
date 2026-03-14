import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { CompAccountsPanel } from "@/components/admin/CompAccountsPanel";

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  granted_by_admin: boolean;
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

  // Get emails for comp account holders
  const compUserIds = rows.map((s) => s.user_id);
  const compEmails: Record<string, string> = {};

  if (compUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", compUserIds);
    if (profiles) {
      for (const p of profiles) {
        compEmails[p.id] = p.email ?? "Unknown";
      }
    }
  }

  const enrichedComps = rows.map((s) => ({
    ...s,
    user_email: compEmails[s.user_id] ?? "Unknown",
  }));

  // Get all profiles for the autocomplete (users who could receive a comp)
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, email")
    .order("email");

  const userOptions = (allProfiles ?? [])
    .filter((p: { id: string; email: string | null }) => p.email)
    .map((p: { id: string; email: string | null }) => ({
      userId: p.id,
      email: p.email as string,
    }));

  const activeCount = enrichedComps.filter(
    (c) => c.plan === "pro" && c.status === "active",
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-text">Comp Accounts</h1>
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
      </div>

      <CompAccountsPanel compAccounts={enrichedComps} userOptions={userOptions} />
    </div>
  );
}
