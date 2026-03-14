"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  Activity,
  AlertTriangle,
  Disc3,
  LogIn,
  UserPlus,
  Upload,
  UserCheck,
  CreditCard,
  XCircle,
  RefreshCcw,
  Download,
  Shuffle,
  Gift,
  CheckCircle,
  Clock,
  ArrowDownCircle,
} from "lucide-react";

interface ActivityEvent {
  id: string;
  event_type: string;
  event_metadata: Record<string, unknown>;
  created_at: string;
}

interface ChurnSignal {
  id: string;
  signal_type: string;
  severity: string;
  details: Record<string, unknown>;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

interface Release {
  id: string;
  title: string;
  artist: string | null;
  release_type: string | null;
  created_at: string;
  updated_at: string;
}

type Tab = "activity" | "releases" | "churn";

const eventConfig: Record<
  string,
  { label: string; icon: typeof Activity; color: string }
> = {
  signup: { label: "Signed up", icon: UserPlus, color: "text-emerald-400" },
  login: { label: "Logged in", icon: LogIn, color: "text-blue-400" },
  release_created: { label: "Created release", icon: Disc3, color: "text-purple-400" },
  track_uploaded: { label: "Uploaded track", icon: Upload, color: "text-purple-400" },
  collaborator_invited: { label: "Invited collaborator", icon: UserCheck, color: "text-teal-400" },
  subscription_started: { label: "Started subscription", icon: CreditCard, color: "text-emerald-400" },
  subscription_cancelled: { label: "Cancelled subscription", icon: XCircle, color: "text-red-400" },
  subscription_renewed: { label: "Renewed subscription", icon: RefreshCcw, color: "text-emerald-400" },
  payment_failed: { label: "Payment failed", icon: AlertTriangle, color: "text-amber-400" },
  export_requested: { label: "Exported data", icon: Download, color: "text-blue-400" },
  conversion_completed: { label: "Converted audio", icon: Shuffle, color: "text-purple-400" },
  comp_account_granted: { label: "Comp granted", icon: Gift, color: "text-amber-400" },
  comp_account_revoked: { label: "Comp revoked", icon: Gift, color: "text-red-400" },
};

const signalConfig: Record<string, { label: string; icon: typeof AlertTriangle }> = {
  subscription_cancelled: { label: "Cancelled", icon: XCircle },
  payment_failed: { label: "Payment Failed", icon: CreditCard },
  downgraded: { label: "Downgraded", icon: ArrowDownCircle },
  inactive: { label: "Inactive", icon: Clock },
};

const severityColors: Record<string, string> = {
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  high: "text-red-400 bg-red-500/10 border-red-500/20",
};

export function UserDetailTabs({
  activities,
  churnSignals,
  releases,
  userId,
}: {
  activities: ActivityEvent[];
  churnSignals: ChurnSignal[];
  releases: Release[];
  userId: string;
}) {
  const [tab, setTab] = useState<Tab>("activity");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "activity", label: "Activity", count: activities.length },
    { key: "releases", label: "Releases", count: releases.length },
    { key: "churn", label: "Churn Signals", count: churnSignals.length },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              tab === t.key
                ? "bg-amber-600/15 text-amber-500 font-medium"
                : "text-muted hover:text-text hover:bg-panel2",
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-faint">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "activity" && <ActivityTab events={activities} />}
      {tab === "releases" && <ReleasesTab releases={releases} userId={userId} />}
      {tab === "churn" && <ChurnTab signals={churnSignals} />}
    </div>
  );
}

function ActivityTab({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-panel p-8 text-center">
        <Activity size={24} className="mx-auto mb-2 text-muted" />
        <p className="text-sm text-muted">No activity events.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-panel divide-y divide-border">
      {events.map((event) => {
        const config = eventConfig[event.event_type] ?? {
          label: event.event_type.replace(/_/g, " "),
          icon: Activity,
          color: "text-muted",
        };
        const Icon = config.icon;

        return (
          <div key={event.id} className="px-4 py-3 flex items-center gap-3">
            <Icon size={16} className={cn(config.color, "shrink-0")} />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-text">{config.label}</span>
              {event.event_metadata &&
                Object.keys(event.event_metadata).length > 0 && (
                  <span className="text-xs text-faint ml-2">
                    {Object.entries(event.event_metadata)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </span>
                )}
            </div>
            <span className="text-xs text-faint shrink-0">
              {new Date(event.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ReleasesTab({
  releases,
  userId,
}: {
  releases: Release[];
  userId: string;
}) {
  if (releases.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-panel p-8 text-center">
        <Disc3 size={24} className="mx-auto mb-2 text-muted" />
        <p className="text-sm text-muted">No releases.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-panel divide-y divide-border">
      {releases.map((release) => (
        <div key={release.id} className="px-4 py-3 flex items-center gap-3">
          <Disc3 size={16} className="text-purple-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-text truncate">
              {release.title}
            </span>
            {release.artist && (
              <span className="text-sm text-muted ml-2">{release.artist}</span>
            )}
            {release.release_type && (
              <span className="text-xs text-faint ml-2 capitalize">
                {release.release_type}
              </span>
            )}
          </div>
          <span className="text-xs text-faint shrink-0">
            {new Date(release.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChurnTab({ signals }: { signals: ChurnSignal[] }) {
  if (signals.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-panel p-8 text-center">
        <CheckCircle size={24} className="mx-auto mb-2 text-emerald-500" />
        <p className="text-sm text-muted">No churn signals. User is healthy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {signals.map((signal) => {
        const config = signalConfig[signal.signal_type] ?? {
          label: signal.signal_type,
          icon: AlertTriangle,
        };
        const Icon = config.icon;
        const sevClass = severityColors[signal.severity] ?? severityColors.low;

        return (
          <div
            key={signal.id}
            className={cn(
              "rounded-lg border border-border bg-panel px-4 py-3 flex items-center gap-4",
              signal.resolved && "opacity-60",
            )}
          >
            <Icon
              size={18}
              className={signal.resolved ? "text-muted" : "text-amber-500"}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm text-text">{config.label}</span>
                <span className={cn("text-xs px-1.5 py-0.5 rounded border", sevClass)}>
                  {signal.severity}
                </span>
                {signal.resolved && (
                  <span className="text-xs text-emerald-500">Resolved</span>
                )}
              </div>
              {signal.details && Object.keys(signal.details).length > 0 && (
                <div className="text-xs text-faint">
                  {Object.entries(signal.details)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")}
                </div>
              )}
            </div>
            <span className="text-xs text-faint shrink-0">
              {new Date(signal.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
