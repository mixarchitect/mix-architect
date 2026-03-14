"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LogIn,
  UserPlus,
  Disc3,
  Upload,
  UserCheck,
  CreditCard,
  XCircle,
  RefreshCcw,
  AlertTriangle,
  Download,
  Shuffle,
  Gift,
  Activity,
} from "lucide-react";

interface ActivityEvent {
  id: string;
  user_id: string;
  user_email: string;
  event_type: string;
  event_metadata: Record<string, unknown>;
  created_at: string;
}

const eventConfig: Record<string, { label: string; icon: typeof Activity; color: string }> = {
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
  comp_account_granted: { label: "Comp account granted", icon: Gift, color: "text-amber-400" },
  comp_account_revoked: { label: "Comp account revoked", icon: Gift, color: "text-red-400" },
};

type FilterType = "all" | "subscription" | "content" | "auth";

const filterGroups: Record<FilterType, string[] | null> = {
  all: null,
  auth: ["signup", "login"],
  content: ["release_created", "track_uploaded", "collaborator_invited", "export_requested", "conversion_completed"],
  subscription: ["subscription_started", "subscription_cancelled", "subscription_renewed", "payment_failed", "comp_account_granted", "comp_account_revoked"],
};

export function ActivityLogList({ events }: { events: ActivityEvent[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const filtered = events.filter((e) => {
    const matchesSearch =
      !search || e.user_email.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    const group = filterGroups[filter];
    if (group && !group.includes(e.event_type)) return false;

    return true;
  });

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-border bg-panel px-3 py-1.5 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
        />
        <div className="flex gap-1">
          {(["all", "auth", "content", "subscription"] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors capitalize",
                filter === tab
                  ? "bg-amber-600/15 text-amber-500 font-medium"
                  : "text-muted hover:text-text hover:bg-panel2",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-panel p-8 text-center">
          <Activity size={24} className="mx-auto mb-2 text-muted" />
          <p className="text-sm text-muted">No activity events found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-panel divide-y divide-border">
          {filtered.map((event) => {
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
                  <button
                    onClick={() => router.push(`/admin/subscribers/${event.user_id}`)}
                    className="text-sm font-medium text-text truncate hover:text-amber-500 transition-colors"
                  >
                    {event.user_email}
                  </button>
                  <span className="text-sm text-muted ml-2">{config.label}</span>
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
      )}
    </div>
  );
}
