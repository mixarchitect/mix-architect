import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import {
  Users,
  AlertTriangle,
  Activity,
  CreditCard,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { DashboardRangeSelector } from "@/components/admin/DashboardRangeSelector";
import { fetchUserDisplayMap } from "@/lib/admin-users";
import {
  type PresetKey,
  type CompareKey,
  resolvePreset,
  resolveComparison,
  parseDateISO,
  startOfDay,
  endOfDay,
} from "@/lib/admin-date-utils";

export const dynamic = "force-dynamic";

const PRO_PRICE = 14; // $14/month

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

const PRESET_KEYS = ["today", "yesterday", "7d", "30d", "90d", "365d"];
const COMPARE_KEYS = ["none", "previous_period", "previous_year"];

interface StatCard {
  label: string;
  value: string;
  icon: typeof Users;
  href?: string;
  color: string;
  currentRaw?: number;
  previousRaw?: number;
}

interface Props {
  searchParams: Promise<{
    range?: string;
    from?: string;
    to?: string;
    compare?: string;
  }>;
}

export default async function AdminDashboard({ searchParams }: Props) {
  const {
    range: rawRange,
    from: rawFrom,
    to: rawTo,
    compare: rawCompare,
  } = await searchParams;

  const supabase = createSupabaseServiceClient();

  // Resolve date boundaries
  let periodFrom: Date;
  let periodTo: Date;
  let periodLabel: string;
  const isCustom = rawRange === "custom" && rawFrom && rawTo;

  if (isCustom) {
    periodFrom = parseDateISO(rawFrom) ?? startOfDay(new Date());
    periodTo = endOfDay(parseDateISO(rawTo) ?? new Date());
    const fmtOpts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    periodLabel = `${periodFrom.toLocaleDateString("en-US", fmtOpts)} - ${periodTo.toLocaleDateString("en-US", fmtOpts)}`;
  } else {
    const presetKey: PresetKey = PRESET_KEYS.includes(rawRange ?? "")
      ? (rawRange as PresetKey)
      : "today";
    const preset = resolvePreset(presetKey);
    periodFrom = preset.from;
    periodTo = preset.to;
    const labels: Record<string, string> = {
      today: "Today",
      yesterday: "Yesterday",
      "7d": "7d",
      "30d": "30d",
      "90d": "90d",
      "365d": "365d",
    };
    periodLabel = labels[presetKey] ?? "Today";
  }

  const since = periodFrom.toISOString();
  const until = periodTo.toISOString();

  // Resolve comparison period
  const compareKey: CompareKey = COMPARE_KEYS.includes(rawCompare ?? "")
    ? (rawCompare as CompareKey)
    : "none";
  const compPeriod = resolveComparison(periodFrom, periodTo, compareKey);

  // Helper: apply date range filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function withRange(query: any, s: string, u: string) {
    return query.gte("created_at", s).lte("created_at", u);
  }

  // Run current period queries
  const [proRes, churnRes, activityRes, profilesRes, signupsRes, cancellationsRes] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan", "pro")
        .eq("status", "active"),
      supabase
        .from("admin_churn_signals")
        .select("id", { count: "exact", head: true })
        .eq("resolved", false),
      withRange(
        supabase
          .from("admin_activity_log")
          .select("id", { count: "exact", head: true }),
        since,
        until,
      ),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      withRange(
        supabase
          .from("admin_activity_log")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "signup"),
        since,
        until,
      ),
      withRange(
        supabase
          .from("admin_activity_log")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "subscription_cancelled"),
        since,
        until,
      ),
    ]);

  // Run comparison period queries (if active)
  let compSignups: number | undefined;
  let compCancellations: number | undefined;
  let compActivity: number | undefined;

  if (compPeriod) {
    const cs = compPeriod.from.toISOString();
    const cu = compPeriod.to.toISOString();

    const [cSignupsRes, cCancRes, cActivityRes] = await Promise.all([
      withRange(
        supabase
          .from("admin_activity_log")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "signup"),
        cs,
        cu,
      ),
      withRange(
        supabase
          .from("admin_activity_log")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "subscription_cancelled"),
        cs,
        cu,
      ),
      withRange(
        supabase
          .from("admin_activity_log")
          .select("id", { count: "exact", head: true }),
        cs,
        cu,
      ),
    ]);

    compSignups = cSignupsRes.count ?? 0;
    compCancellations = cCancRes.count ?? 0;
    compActivity = cActivityRes.count ?? 0;
  }

  const activePro = proRes.count ?? 0;
  const totalUsers = profilesRes.count ?? 0;
  const cancellations = cancellationsRes.count ?? 0;
  const newSignups = signupsRes.count ?? 0;
  const events = activityRes.count ?? 0;

  // MRR (always current)
  const mrr = activePro * PRO_PRICE;

  // Churn rate for selected period
  const periodStartSubs = activePro + cancellations;
  const churnRate =
    periodStartSubs > 0 ? (cancellations / periodStartSubs) * 100 : 0;

  // Conversion rate (always current)
  const conversionRate =
    totalUsers > 0 ? (activePro / totalUsers) * 100 : 0;

  const churnColor =
    churnRate <= 5
      ? "text-emerald-400"
      : churnRate <= 10
        ? "text-amber-400"
        : "text-red-400";

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
      label: `New Signups (${periodLabel})`,
      value: String(newSignups),
      icon: UserPlus,
      href: "/admin/activity",
      color: "text-purple-400",
      currentRaw: newSignups,
      previousRaw: compSignups,
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
      label: `Churn Rate (${periodLabel})`,
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
      label: `Events (${periodLabel})`,
      value: String(events),
      icon: Activity,
      href: "/admin/activity",
      color: "text-purple-400",
      currentRaw: events,
      previousRaw: compActivity,
    },
  ];

  // Recent activity for the feed (also date-filtered)
  const { data: recentEvents } = await withRange(
    supabase
      .from("admin_activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    since,
    until,
  );

  // Get user display names for recent events
  const events2 = (recentEvents ?? []) as { user_id: string }[];
  const eventUserIds = [...new Set(events2.map((e) => e.user_id))];
  const userNames = await fetchUserDisplayMap(eventUserIds);

  // Build range props for the selector
  const currentRange = isCustom ? "custom" : (rawRange ?? "today");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <div className="flex items-center gap-3">
          <DashboardRangeSelector
            range={currentRange}
            from={isCustom ? rawFrom : undefined}
            to={isCustom ? rawTo : undefined}
            compare={rawCompare}
          />
          <AdminRefreshBar />
        </div>
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
  const hasDelta =
    stat.currentRaw !== undefined &&
    stat.previousRaw !== undefined;

  let deltaEl: React.ReactNode = null;

  if (hasDelta) {
    const curr = stat.currentRaw!;
    const prev = stat.previousRaw!;

    if (prev === 0 && curr > 0) {
      deltaEl = (
        <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1">
          <ArrowUp size={10} /> New
        </span>
      );
    } else if (prev > 0) {
      const pctChange = ((curr - prev) / prev) * 100;
      if (Math.abs(pctChange) >= 0.5) {
        const isUp = pctChange > 0;
        deltaEl = (
          <span
            className={`text-[11px] flex items-center gap-0.5 mt-1 ${isUp ? "text-emerald-400" : "text-red-400"}`}
          >
            {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {isUp ? "+" : ""}
            {pctChange.toFixed(1)}%
          </span>
        );
      }
    }
  }

  const inner = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <stat.icon size={16} className={stat.color} />
        <span className="text-xs text-muted uppercase tracking-wider">
          {stat.label}
        </span>
      </div>
      <div className="text-3xl font-bold text-text">{stat.value}</div>
      {deltaEl}
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
