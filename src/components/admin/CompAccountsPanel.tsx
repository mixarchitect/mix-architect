"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Gift, UserPlus, XCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface CompAccount {
  id: string;
  user_id: string;
  user_email: string;
  plan: string;
  status: string;
  created_at: string;
}

interface UserOption {
  userId: string;
  email: string;
}

export function CompAccountsPanel({
  compAccounts,
  userOptions,
}: {
  compAccounts: CompAccount[];
  userOptions: UserOption[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const [revoking, setRevoking] = useState<string | null>(null);

  const selectedUser = userOptions.find((u) => u.email === email);

  function handleGrant() {
    if (!selectedUser) {
      setStatusMsg("Please select a valid user email.");
      setStatus("error");
      return;
    }

    // Check if already a comp account
    if (compAccounts.some((c) => c.user_id === selectedUser.userId)) {
      setStatusMsg("This user already has a comp account.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/comp-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUser.userId,
            action: "grant",
            reason: reason || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to grant");
        }

        setStatus("success");
        setStatusMsg("Comp account granted");
        setEmail("");
        setReason("");
        router.refresh();
        setTimeout(() => setStatus("idle"), 3000);
      } catch (err) {
        setStatusMsg(err instanceof Error ? err.message : "Failed to grant");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    });
  }

  function handleRevoke(userId: string) {
    setRevoking(userId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/comp-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action: "revoke" }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to revoke");
        }

        router.refresh();
      } catch (err) {
        setStatusMsg(err instanceof Error ? err.message : "Failed to revoke");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      } finally {
        setRevoking(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Grant form */}
      <div className="rounded-lg border border-border bg-panel p-5">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-amber-500" />
          Grant Comp Account
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
              User Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              list="comp-user-emails"
              placeholder="user@example.com"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
            />
            <datalist id="comp-user-emails">
              {userOptions.map((u) => (
                <option key={u.userId} value={u.email} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
              Reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Beta tester, press comp, partnership"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGrant}
              disabled={isPending || !email}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isPending || !email
                  ? "bg-amber-600/30 text-amber-500/50 cursor-not-allowed"
                  : "bg-amber-600 text-white hover:bg-amber-500",
              )}
            >
              <Gift size={14} />
              {isPending && !revoking ? "Granting..." : "Grant Pro Access"}
            </button>

            {status === "success" && (
              <span className="flex items-center gap-1 text-sm text-emerald-500">
                <CheckCircle size={14} /> {statusMsg}
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1 text-sm text-red-400">
                <AlertTriangle size={14} /> {statusMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active comp accounts */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <Gift size={18} className="text-muted" />
          Active Comp Accounts
        </h2>

        {compAccounts.length === 0 ? (
          <div className="rounded-lg border border-border bg-panel p-8 text-center">
            <Gift size={24} className="mx-auto mb-2 text-muted" />
            <p className="text-sm text-muted">No comp accounts granted yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-panel divide-y divide-border">
            {compAccounts.map((comp) => (
              <div key={comp.id} className="px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-text truncate">
                      {comp.user_email}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded border capitalize",
                        comp.status === "active"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-red-400 bg-red-500/10 border-red-500/20",
                      )}
                    >
                      {comp.plan} / {comp.status}
                    </span>
                  </div>
                  <div className="text-xs text-faint">
                    Granted{" "}
                    {new Date(comp.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(comp.user_id)}
                  disabled={isPending}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    revoking === comp.user_id
                      ? "bg-red-500/20 text-red-400/50 cursor-not-allowed"
                      : "text-red-400 hover:bg-red-500/10 border border-red-500/20",
                  )}
                >
                  <XCircle size={12} />
                  {revoking === comp.user_id ? "Revoking..." : "Revoke"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
