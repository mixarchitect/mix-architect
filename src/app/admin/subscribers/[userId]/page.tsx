import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { fetchUserDisplayMap } from "@/lib/admin-users";
import { AdminRefreshBar } from "@/components/admin/AdminRefreshBar";
import { UserDetailTabs } from "@/components/admin/UserDetailTabs";
import { UserDetailHeader } from "@/components/admin/UserDetailHeader";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Gift,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { notFound } from "next/navigation";
import { AdminToggleButton } from "@/components/admin/AdminToggleButton";
import { TestAccountToggle } from "@/components/admin/UserDetailHeader";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { ResetAccountButton } from "@/components/admin/ResetAccountButton";
import { SubscriptionPlanControl } from "@/components/admin/SubscriptionPlanControl";
import { formatAdminTime, formatAdminTimeTitle } from "@/lib/format-admin-time";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { userId } = await params;
  const supabase = createSupabaseServiceClient();

  // Fetch all user data in parallel
  const [profileRes, subRes, activityRes, churnRes, releasesRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single(),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("admin_activity_log")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("admin_churn_signals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("releases")
        .select("id, title, artist, release_type, created_at, updated_at, deleted_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

  if (profileRes.error) {
    console.error("[admin/user-detail] Profile fetch error:", profileRes.error.message);
  }
  if (!profileRes.data) notFound();

  const profile = profileRes.data as Record<string, unknown>;
  const subscription = subRes.data;
  const activities = activityRes.data ?? [];
  const churnSignals = churnRes.data ?? [];
  const releases = releasesRes.data ?? [];

  // Get user display info from auth.users
  const userDisplayMap = await fetchUserDisplayMap([userId]);
  const name = userDisplayMap[userId] ?? userId.substring(0, 8);

  // Get email + persona from auth.users and user_defaults
  const [authUser, personaRes] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase
      .from("user_defaults")
      .select("persona")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  const userEmail = authUser.data?.user?.email ?? null;
  const userPhone = authUser.data?.user?.phone ?? null;
  const persona = (personaRes.data?.persona as string) ?? null;
  const isTestAccount = profile.is_test_account === true;
  const isComp = subscription?.granted_by_admin === true;

  // Determine effective status
  let status = "Free";
  let statusColor = "text-muted bg-panel2 border-border";
  if (subscription) {
    if (isComp && subscription.plan === "pro" && subscription.status === "active") {
      status = "Comp";
      statusColor = "text-warning bg-warning/10 border-warning/20";
    } else if (subscription.plan === "pro" && subscription.status === "active") {
      status = "Pro";
      statusColor = "text-success bg-success/10 border-success/20";
    } else if (subscription.status === "canceled") {
      status = "Cancelled";
      statusColor = "text-danger bg-danger/10 border-danger/20";
    } else if (subscription.status === "past_due") {
      status = "Past Due";
      statusColor = "text-warning bg-warning/10 border-warning/20";
    }
  }

  // Last active: most recent activity event
  const lastActive = activities.length > 0 ? activities[0].created_at : null;

  return (
    <div>
      {/* Back link + refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <Link
          href="/admin/subscribers"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Subscribers
        </Link>
        <AdminRefreshBar />
      </div>

      {/* Header */}
      <div className="rounded-lg border border-border bg-panel p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <UserDetailHeader
            userId={userId}
            name={name}
            email={userEmail}
            persona={persona}
            isTestAccount={isTestAccount}
          />
          <span
            className={`text-xs font-medium px-2 py-1 rounded border shrink-0 ${statusColor}`}
          >
            {status}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-muted">
          {profile.created_at && (
            <span
              className="flex items-center gap-1.5"
              title={formatAdminTimeTitle(String(profile.created_at))}
            >
              <Calendar size={12} />
              Joined{" "}
              {new Date(String(profile.created_at)).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}

          {lastActive && (
            <span
              className="flex items-center gap-1.5"
              title={formatAdminTimeTitle(lastActive)}
            >
              <Calendar size={12} />
              Last active {formatAdminTime(lastActive)}
            </span>
          )}

          {subscription && (
            <span className="flex items-center gap-1.5">
              <CreditCard size={12} />
              {subscription.plan.toUpperCase()} / {subscription.status}
            </span>
          )}

          {isComp && (
            <span className="flex items-center gap-1.5 text-warning">
              <Gift size={12} />
              Comp account
            </span>
          )}

          {subscription?.stripe_customer_id && (
            <a
              href={`https://dashboard.stripe.com/customers/${subscription.stripe_customer_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={12} />
              Stripe
            </a>
          )}

        </div>

        {/* Action buttons row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <TestAccountToggle userId={userId} initial={isTestAccount} />
          <AdminToggleButton userId={userId} isAdmin={profile.is_admin === true} />
          <SubscriptionPlanControl
            userId={userId}
            subscription={
              subscription
                ? {
                    plan: subscription.plan ?? null,
                    status: subscription.status ?? null,
                    granted_by_admin: subscription.granted_by_admin ?? null,
                    stripe_subscription_id:
                      subscription.stripe_subscription_id ?? null,
                    cancel_at_period_end:
                      subscription.cancel_at_period_end ?? null,
                  }
                : null
            }
          />
          <ResetAccountButton
            userId={userId}
            releaseCount={
              releases.filter(
                (r) => !(r as { deleted_at?: string | null }).deleted_at,
              ).length
            }
          />
          <DeleteUserButton userId={userId} />
        </div>

        {subscription?.current_period_end && (
          <div
            className="mt-3 text-xs text-faint"
            title={formatAdminTimeTitle(subscription.current_period_end)}
          >
            Current period ends{" "}
            {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {subscription.cancel_at_period_end && (
              <span className="text-warning ml-2">
                (cancels at period end)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <UserDetailTabs
        activities={activities}
        churnSignals={churnSignals}
        releases={releases}
        userId={userId}
      />
    </div>
  );
}
