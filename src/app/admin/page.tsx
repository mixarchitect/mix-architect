import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { Users, AlertTriangle, Activity, CreditCard } from "lucide-react";
import Link from "next/link";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";

export const dynamic = "force-dynamic";

interface StatCard {
  label: string;
  value: number;
  icon: typeof Users;
  href: string;
  color: string;
}

export default async function AdminDashboard() {
  const supabase = createSupabaseServiceClient();

  // Run all counts in parallel
  const [subsRes, churnRes, activityRes, proRes] = await Promise.all([
    supabase.from("subscriptions").select("id", { count: "exact", head: true }),
    supabase
      .from("admin_churn_signals")
      .select("id", { count: "exact", head: true })
      .eq("resolved", false),
    supabase
      .from("admin_activity_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("plan", "pro")
      .eq("status", "active"),
  ]);

  const stats: StatCard[] = [
    {
      label: "Total Subscribers",
      value: subsRes.count ?? 0,
      icon: Users,
      href: "/admin/subscribers",
      color: "text-blue-400",
    },
    {
      label: "Active Pro",
      value: proRes.count ?? 0,
      icon: CreditCard,
      href: "/admin/subscribers",
      color: "text-emerald-400",
    },
    {
      label: "Open Churn Signals",
      value: churnRes.count ?? 0,
      icon: AlertTriangle,
      href: "/admin/churn",
      color: "text-amber-400",
    },
    {
      label: "Events (24h)",
      value: activityRes.count ?? 0,
      icon: Activity,
      href: "/admin/activity",
      color: "text-purple-400",
    },
  ];

  // Recent activity for the feed
  const { data: recentEvents } = await supabase
    .from("admin_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  // Get emails for recent events
  const eventUserIds = [
    ...new Set(
      (recentEvents ?? []).map((e: { user_id: string }) => e.user_id),
    ),
  ];
  const userEmails: Record<string, string> = {};

  if (eventUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", eventUserIds);
    if (profiles) {
      for (const p of profiles) {
        userEmails[p.id] = p.email ?? "Unknown";
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <AdminRefreshBar />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-border bg-panel px-4 py-4 hover:bg-panel2 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs text-muted uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-text">{stat.value}</div>
          </Link>
        ))}
      </div>

      {/* Recent activity feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">Recent Activity</h2>
          <Link
            href="/admin/activity"
            className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
          >
            View all
          </Link>
        </div>

        {!recentEvents || recentEvents.length === 0 ? (
          <div className="rounded-lg border border-border bg-panel p-6 text-center">
            <p className="text-sm text-muted">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-panel divide-y divide-border">
            {recentEvents.map(
              (event: {
                id: string;
                user_id: string;
                event_type: string;
                event_metadata: Record<string, unknown>;
                created_at: string;
              }) => (
                <div key={event.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-text">
                      {userEmails[event.user_id] ?? event.user_id.slice(0, 8)}
                    </span>
                    <span className="text-sm text-muted ml-2">
                      {formatEventType(event.event_type)}
                    </span>
                  </div>
                  <span className="text-xs text-faint shrink-0">
                    {formatRelativeTime(event.created_at)}
                  </span>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const eventLabels: Record<string, string> = {
  signup: "signed up",
  login: "logged in",
  release_created: "created release",
  track_uploaded: "uploaded track",
  collaborator_invited: "invited collaborator",
  subscription_started: "started subscription",
  subscription_cancelled: "cancelled subscription",
  subscription_renewed: "renewed subscription",
  payment_failed: "payment failed",
  export_requested: "exported data",
  conversion_completed: "converted audio",
  comp_account_granted: "comp account granted",
  comp_account_revoked: "comp account revoked",
};

function formatEventType(type: string): string {
  return eventLabels[type] ?? type.replace(/_/g, " ");
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
