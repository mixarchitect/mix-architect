"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, XCircle, CreditCard, ArrowDownCircle, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { resolveSignal, unresolveSignal } from "@/app/admin/churn/actions";
import { formatAdminTime, formatAdminTimeTitle } from "@/lib/format-admin-time";

interface ChurnSignal {
  id: string;
  user_id: string;
  user_email: string;
  signal_type: string;
  severity: string;
  details: Record<string, unknown>;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

const signalConfig: Record<string, { label: string; icon: typeof AlertTriangle }> = {
  subscription_cancelled: { label: "Cancelled", icon: XCircle },
  payment_failed: { label: "Payment Failed", icon: CreditCard },
  downgraded: { label: "Downgraded", icon: ArrowDownCircle },
  inactive: { label: "Inactive", icon: Clock },
};

const severityColors: Record<string, string> = {
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  medium: "text-warning bg-warning/10 border-warning/20",
  high: "text-danger bg-danger/10 border-danger/20",
};

type FilterTab = "open" | "resolved" | "all";

export function ChurnSignalsList({ signals }: { signals: ChurnSignal[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>("open");
  const [isPending, startTransition] = useTransition();

  const filtered = signals.filter((s) => {
    if (filter === "open") return !s.resolved;
    if (filter === "resolved") return s.resolved;
    return true;
  });

  function handleToggle(signalId: string, currentlyResolved: boolean) {
    startTransition(async () => {
      if (currentlyResolved) {
        await unresolveSignal(signalId);
      } else {
        await resolveSignal(signalId);
      }
    });
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {(["open", "resolved", "all"] as FilterTab[]).map((tab) => (
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

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-panel p-8 text-center">
          <AlertTriangle size={24} className="mx-auto mb-2 text-muted" />
          <p className="text-sm text-muted">No {filter === "all" ? "" : filter} churn signals.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((signal) => {
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
                <Icon size={18} className={signal.resolved ? "text-muted" : "text-warning"} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <button
                      onClick={() => router.push(`/admin/subscribers/${signal.user_id}`)}
                      className="text-sm font-medium text-text truncate hover:text-amber-500 transition-colors"
                    >
                      {signal.user_email}
                    </button>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded border", sevClass)}>
                      {signal.severity}
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    {config.label}
                    {signal.details && Object.keys(signal.details).length > 0 && (
                      <span className="ml-1.5 text-faint">
                        {Object.entries(signal.details)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="text-xs text-faint shrink-0"
                  title={formatAdminTimeTitle(signal.created_at)}
                >
                  {formatAdminTime(signal.created_at)}
                </div>

                <button
                  onClick={() => handleToggle(signal.id, signal.resolved)}
                  disabled={isPending}
                  className={cn(
                    "shrink-0 text-xs px-2.5 py-1 rounded-md border transition-colors",
                    signal.resolved
                      ? "border-border text-muted hover:text-text hover:bg-panel2"
                      : "border-success/30 text-success hover:bg-success/10",
                    isPending && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {signal.resolved ? (
                    <span className="flex items-center gap-1">
                      <XCircle size={12} /> Reopen
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={12} /> Resolve
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
