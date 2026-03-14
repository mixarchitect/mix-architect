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

  // Fetch all auth users and all subscriptions in parallel
  const [allUsers, { data: subscriptions, error }] = await Promise.all([
    fetchAllUsers(),
    supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  if (error) {
    console.error("[admin/subscribers] Failed to fetch:", error.message);
  }

  const rows = (subscriptions ?? []) as SubscriptionRow[];
  const subByUser = new Map(rows.map((s) => [s.user_id, s]));

  // Merge: every auth user gets a row, with subscription data if it exists
  const enriched = allUsers.map((user) => {
    const sub = subByUser.get(user.id);
    const displayName =
      user.display_name || user.email || user.phone || user.id.substring(0, 8);

    if (sub) {
      return {
        id: sub.id,
        user_id: user.id,
        user_email: displayName,
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
      user_id: user.id,
      user_email: displayName,
      plan: "none",
      status: "none",
      cancel_at_period_end: false,
      current_period_end: null,
      granted_by_admin: false,
      created_at: "",
      has_subscription: false,
    };
  });

  const proCount = enriched.filter((s) => s.plan === "pro" && s.status === "active").length;
  const freeCount = enriched.filter((s) => s.plan === "none" || s.plan === "free" || s.status === "canceled").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-text">Users</h1>
        <AdminRefreshBar />
      </div>
      <p className="text-sm text-muted mb-6">All registered users.</p>

      <div className="flex gap-4 mb-6">
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Pro</div>
          <div className="text-2xl font-bold text-emerald-500">{proCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Free / No Plan</div>
          <div className="text-2xl font-bold text-text">{freeCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Total</div>
          <div className="text-2xl font-bold text-text">{enriched.length}</div>
        </div>
      </div>

      <SubscribersList subscribers={enriched} />
    </div>
  );
}
