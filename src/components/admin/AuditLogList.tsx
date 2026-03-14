"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  Shield,
  Gift,
  Mail,
  XCircle,
  Users,
  Download,
} from "lucide-react";
import { downloadCsv } from "@/lib/csv-export";

interface AuditEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  action_metadata: Record<string, unknown>;
  created_at: string;
}

const actionConfig: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  comp_grant: { label: "Granted comp", icon: Gift, color: "text-amber-400" },
  comp_revoke: { label: "Revoked comp", icon: XCircle, color: "text-red-400" },
  bulk_comp_grant: { label: "Bulk comp grant", icon: Users, color: "text-amber-400" },
  send_notification: { label: "Sent notification", icon: Mail, color: "text-blue-400" },
  bulk_email: { label: "Sent bulk email", icon: Mail, color: "text-blue-400" },
};

export function AuditLogList({ entries }: { entries: AuditEntry[] }) {
  const [search, setSearch] = useState("");

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      e.admin_name.toLowerCase().includes(s) ||
      e.action.toLowerCase().includes(s) ||
      JSON.stringify(e.action_metadata).toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search audit entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm rounded-md border border-border bg-panel px-3 py-1.5 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
        />
        {filtered.length > 0 && (
          <button
            onClick={() =>
              downloadCsv(
                filtered.map((e) => ({
                  admin: e.admin_name,
                  action: e.action,
                  metadata: JSON.stringify(e.action_metadata),
                  date: e.created_at,
                })),
                "audit-log.csv",
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted hover:text-text hover:bg-panel2 border border-border transition-colors"
          >
            <Download size={12} />
            CSV
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-panel p-8 text-center">
          <Shield size={24} className="mx-auto mb-2 text-muted" />
          <p className="text-sm text-muted">No audit entries found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-panel divide-y divide-border">
          {filtered.map((entry) => {
            const config = actionConfig[entry.action] ?? {
              label: entry.action.replace(/_/g, " "),
              icon: Shield,
              color: "text-muted",
            };
            const Icon = config.icon;

            return (
              <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                <Icon size={16} className={cn(config.color, "shrink-0")} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text truncate">
                      {entry.admin_name}
                    </span>
                    <span className="text-sm text-muted">{config.label}</span>
                  </div>
                  {entry.action_metadata &&
                    Object.keys(entry.action_metadata).length > 0 && (
                      <div className="text-xs text-faint mt-0.5">
                        {Object.entries(entry.action_metadata)
                          .filter(([, v]) => v !== undefined && v !== null)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </div>
                    )}
                </div>

                <span className="text-xs text-faint shrink-0">
                  {new Date(entry.created_at).toLocaleDateString("en-US", {
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
