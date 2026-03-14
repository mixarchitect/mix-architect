"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { CreditCard, Gift, Users } from "lucide-react";

interface Subscriber {
  id: string;
  user_id: string;
  user_email: string;
  plan: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  granted_by_admin: boolean;
  created_at: string;
}

type FilterTab = "all" | "pro" | "free" | "churned";

const statusColors: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  past_due: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  canceled: "text-red-400 bg-red-500/10 border-red-500/20",
  trialing: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  incomplete: "text-faint bg-panel2 border-border",
};

export function SubscribersList({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = subscribers.filter((s) => {
    const matchesSearch =
      !search || s.user_email.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    switch (filter) {
      case "pro":
        return s.plan === "pro" && s.status === "active";
      case "free":
        return s.plan === "free";
      case "churned":
        return s.status === "canceled" || s.cancel_at_period_end;
      default:
        return true;
    }
  });

  return (
    <div>
      {/* Search and filter */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-border bg-panel px-3 py-1.5 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
        />
        <div className="flex gap-1">
          {(["all", "pro", "free", "churned"] as FilterTab[]).map((tab) => (
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
          <Users size={24} className="mx-auto mb-2 text-muted" />
          <p className="text-sm text-muted">No subscribers found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-panel divide-y divide-border">
          {filtered.map((sub) => {
            const sevClass = statusColors[sub.status] ?? statusColors.incomplete;

            return (
              <div
                key={sub.id}
                onClick={() => router.push(`/admin/subscribers/${sub.user_id}`)}
                className="px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-panel2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-text truncate">
                      {sub.user_email}
                    </span>
                    {sub.granted_by_admin && (
                      <span title="Comp account"><Gift size={12} className="text-amber-500 shrink-0" /></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <CreditCard size={12} />
                    <span className="uppercase">{sub.plan}</span>
                    {sub.cancel_at_period_end && (
                      <span className="text-amber-400">cancels at period end</span>
                    )}
                    {sub.current_period_end && (
                      <span className="text-faint">
                        expires{" "}
                        {new Date(sub.current_period_end).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <span className={cn("text-xs px-1.5 py-0.5 rounded border capitalize", sevClass)}>
                  {sub.status}
                </span>

                <span className="text-xs text-faint shrink-0">
                  {new Date(sub.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
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
