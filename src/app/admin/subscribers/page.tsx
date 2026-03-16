import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { SubscribersList } from "@/components/admin/SubscribersList";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { fetchAllUsers } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  granted_by_admin: boolean;
  created_at: string;
}

export default async function SubscribersPage() {
  const supabase = createSupabaseServiceClient();

  // Fetch all auth users, subscriptions, and test account flags in parallel
  const [allUsers, { data: subscriptions, error }, { data: profileFlags }] = await Promise.all([
    fetchAllUsers(),
    supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, is_test_account"),
  ]);

  if (error) {
    console.error("[admin/subscribers] Failed to fetch:", error.message);
  }

  const rows = (subscriptions ?? []) as SubscriptionRow[];
  const subByUser = new Map(rows.map((s) => [s.user_id, s]));
  const testAccountSet = new Set(
    (profileFlags ?? []).filter((p) => p.is_test_account).map((p) => p.id),
  );

  // Merge: every auth user gets a row, with subscription data if it exists
  const enriched = allUsers.map((user) => {
    const sub = subByUser.get(user.id);
    const base = {
      user_id: user.id,
      user_email: user.email ?? null,
      display_name: user.display_name ?? null,
      is_test_account: testAccountSet.has(user.id),
    };

    if (sub) {
      return {
        id: sub.id,
        ...base,
        plan: sub.plan,
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_end: sub.current_period_end,
        granted_by_admin: sub.granted_by_admin,
        created_at: sub.created_at,
        has_subscription: true,
      };
    }

    return {
      id: user.id,
      ...base,
      plan: "none",
      status: "none",
      cancel_at_period_end: false,
      current_period_end: null,
      granted_by_admin: false,
      created_at: "",
      has_subscription: false,
    };
  });

  const real = enriched.filter((s) => !s.is_test_account);
  const testCount = enriched.length - real.length;
  const proCount = real.filter((s) => s.plan === "pro" && s.status === "active").length;
  const freeCount = real.filter((s) => s.plan === "none" || s.plan === "free" || s.status === "canceled").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h1 className="text-2xl font-bold text-text">Users</h1>
        <AdminRefreshBar />
      </div>
      <p className="text-sm text-muted mb-6">All registered users.</p>

      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-0 sm:min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Pro</div>
          <div className="text-2xl font-bold text-emerald-500">{proCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-0 sm:min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Free / No Plan</div>
          <div className="text-2xl font-bold text-text">{freeCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-0 sm:min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Total</div>
          <div className="text-2xl font-bold text-text">{real.length}</div>
        </div>
        {testCount > 0 && (
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-4 py-3 min-w-0 sm:min-w-[120px]">
            <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">Test</div>
            <div className="text-2xl font-bold text-purple-400">{testCount}</div>
          </div>
        )}
      </div>

      <SubscribersList subscribers={enriched} />
    </div>
  );
}
