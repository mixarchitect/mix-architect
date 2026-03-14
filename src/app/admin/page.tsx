import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import {
  Users,
  AlertTriangle,
  Activity,
  CreditCard,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { displayUserName } from "@/lib/display-user";

export const dynamic = "force-dynamic";

const PRO_PRICE = 9; // $9/month

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

interface StatCard {
  label: string;
  value: string;
  icon: typeof Users;
  href?: string;
  color: string;
}

export default async function AdminDashboard() {
  const supabase = createSupabaseServiceClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Run all counts in parallel
  const [
    subsRes,
    proRes,
    churnRes,
    activityRes,
    profilesRes,
    signupsRes,
    cancellationsRes,
  ] = await Promise.all([
    supabase.from("subscriptions").select("id", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("plan", "pro")
      .eq("status", "active"),
    supabase
      .from("admin_churn_signals")
      .select("id", { count: "exact", head: true })
      .eq("resolved", false),
    supabase
      .from("admin_activity_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("admin_activity_log")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "signup")
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("admin_activity_log")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "subscription_cancelled")
      .gte("created_at", thirtyDaysAgo),
  ]);

  const activePro = proRes.count ?? 0;
  const totalUsers = profilesRes.count ?? 0;
  const cancellationsLast30d = cancellationsRes.count ?? 0;
  const newSignups7d = signupsRes.count ?? 0;

  // MRR
  const mrr = activePro * PRO_PRICE;

  // Churn rate (30d)
  const periodStartSubs = activePro + cancellationsLast30d;
  const churnRate =
    periodStartSubs > 0 ? (cancellationsLast30d / periodStartSubs) * 100 : 0;

  // Conversion rate
  const conversionRate =
    totalUsers > 0 ? (activePro / totalUsers) * 100 : 0;

  const churnColor =
    churnRate <= 5 ? "text-emerald-400" : churnRate <= 10 ? "text-amber-400" : "text-red-400";

  const row1: StatCard[] = [
    {
      label: "Total Users",
      value: String(totalUsers),
      icon: Users,
      href: "/admin/subscribers",
      color: "text-blue-400",
    },
    {
      label: "Active Pro",
      value: String(activePro),
      icon: CreditCard,
      href: "/admin/subscribers",
      color: "text-emerald-400",
    },
    {
      label: "New Signups (7d)",
      value: String(newSignups7d),
      icon: UserPlus,
      href: "/admin/activity",
      color: "text-purple-400",
    },
  ];

  const row2: StatCard[] = [
    {
      label: "MRR",
      value: currencyFmt.format(mrr),
      icon: DollarSign,
      color: "text-emerald-400",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate.toFixed(0)}%`,
      icon: ArrowUpRight,
      color: "text-blue-400",
    },
    {
      label: "Churn Rate (30d)",
      value: `${churnRate.toFixed(1)}%`,
      icon: TrendingDown,
      color: churnColor,
    },
  ];

  const row3: StatCard[] = [
    {
      label: "Open Churn Signals",
      value: String(churnRes.count ?? 0),
      icon: AlertTriangle,
      href: "/admin/churn",
      color: "text-amber-400",
    },
    {
      label: "Events (24h)",
      value: String(activityRes.count ?? 0),
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

  // Get user display names for recent events
  const eventUserIds = [
    ...new Set(
      (recentEvents ?? []).map((e: { user_id: string }) => e.user_id),
    ),
  ];
  const userNames: Record<string, string> = {};

  if (eventUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", eventUserIds);
    if (profiles) {
      for (const p of profiles) {
        userNames[p.id] = displayUserName(p);
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <AdminRefreshBar />
      </div>

      {/* Stat cards - Row 1: Users */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {row1.map((stat) => (
          <StatCardEl key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Stat cards - Row 2: Revenue & Health */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {row2.map((stat) => (
          <StatCardEl key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Stat cards - Row 3: Operational */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {row3.map((stat) => (
          <StatCardEl key={stat.label} stat={stat} />
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
                      {userNames[event.user_id] ?? event.user_id.slice(0, 8)}
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

function StatCardEl({ stat }: { stat: StatCard }) {
  const inner = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <stat.icon size={16} className={stat.color} />
        <span className="text-xs text-muted uppercase tracking-wider">
          {stat.label}
        </span>
      </div>
      <div className="text-3xl font-bold text-text">{stat.value}</div>
    </>
  );

  if (stat.href) {
    return (
      <Link
        href={stat.href}
        className="rounded-lg border border-border bg-panel px-4 py-4 hover:bg-panel2 transition-colors"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-4">
      {inner}
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
