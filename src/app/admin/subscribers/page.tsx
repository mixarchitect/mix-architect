import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { SubscribersList } from "@/components/admin/SubscribersList";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";

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

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/subscribers] Failed to fetch:", error.message);
  }

  const rows = (subscriptions ?? []) as SubscriptionRow[];

  // Get user emails
  const userIds = [...new Set(rows.map((s) => s.user_id))];
  const userEmails: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    if (profiles) {
      for (const p of profiles) {
        userEmails[p.id] = p.email ?? "Unknown";
      }
    }
  }

  const enriched = rows.map((s) => ({
    ...s,
    user_email: userEmails[s.user_id] ?? "Unknown",
  }));

  const proCount = enriched.filter((s) => s.plan === "pro" && s.status === "active").length;
  const freeCount = enriched.filter((s) => s.plan === "free" || s.status === "canceled").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-text">Subscribers</h1>
        <AdminRefreshBar />
      </div>
      <p className="text-sm text-muted mb-6">All users with subscription records.</p>

      <div className="flex gap-4 mb-6">
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Pro</div>
          <div className="text-2xl font-bold text-emerald-500">{proCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-panel px-4 py-3 min-w-[120px]">
          <div className="text-xs text-muted uppercase tracking-wider mb-1">Free / Cancelled</div>
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
