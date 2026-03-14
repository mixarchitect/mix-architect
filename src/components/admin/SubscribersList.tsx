"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  CreditCard,
  Gift,
  Users,
  CheckCircle,
  AlertTriangle,
  Mail,
  X,
  Download,
} from "lucide-react";
import { downloadCsv } from "@/lib/csv-export";

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
  has_subscription: boolean;
}

type FilterTab = "all" | "pro" | "free" | "churned";

const statusColors: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  past_due: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  canceled: "text-red-400 bg-red-500/10 border-red-500/20",
  trialing: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  none: "text-faint bg-panel2 border-border",
  incomplete: "text-faint bg-panel2 border-border",
};

type Duration = "indefinite" | "30d" | "90d" | "6m" | "1y";

export function SubscribersList({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  // Bulk comp state
  const [showCompForm, setShowCompForm] = useState(false);
  const [compDuration, setCompDuration] = useState<Duration>("indefinite");
  const [compReason, setCompReason] = useState("");

  // Bulk email state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailHeading, setEmailHeading] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const filtered = subscribers.filter((s) => {
    const matchesSearch =
      !search || s.user_email.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    switch (filter) {
      case "pro":
        return s.plan === "pro" && s.status === "active";
      case "free":
        return s.plan === "free" || s.plan === "none";
      case "churned":
        return s.status === "canceled" || s.cancel_at_period_end;
      default:
        return true;
    }
  });

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.user_id));

  function toggleSelect(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.user_id)));
    }
  }

  function clearSelection() {
    setSelected(new Set());
    setShowCompForm(false);
    setShowEmailForm(false);
  }

  function showFeedback(type: "success" | "error", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }

  function handleBulkComp() {
    const userIds = Array.from(selected);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/bulk-comp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userIds,
            duration: compDuration,
            reason: compReason || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed");
        }
        showFeedback("success", `Granted comp to ${userIds.length} user${userIds.length > 1 ? "s" : ""}`);
        clearSelection();
        router.refresh();
      } catch (err) {
        showFeedback("error", err instanceof Error ? err.message : "Failed to grant comps");
      }
    });
  }

  function handleBulkEmail() {
    const recipients = Array.from(selected).map((userId) => {
      const sub = subscribers.find((s) => s.user_id === userId);
      return { userId, email: sub?.user_email ?? "" };
    }).filter((r) => r.email && r.email.includes("@"));

    if (recipients.length === 0) {
      showFeedback("error", "No valid email addresses in selection");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/bulk-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients,
            subject: emailSubject,
            heading: emailHeading,
            body: emailBody,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed");
        }
        showFeedback("success", `Email sent to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}`);
        clearSelection();
        setEmailSubject("");
        setEmailHeading("");
        setEmailBody("");
      } catch (err) {
        showFeedback("error", err instanceof Error ? err.message : "Failed to send emails");
      }
    });
  }

  return (
    <div>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-amber-500">
            {selected.size} selected
          </span>
          <button
            onClick={() => { setShowCompForm(!showCompForm); setShowEmailForm(false); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              showCompForm
                ? "bg-amber-600 text-white"
                : "text-amber-400 hover:bg-amber-500/10 border border-amber-500/20",
            )}
          >
            <Gift size={12} />
            Grant Comp
          </button>
          <button
            onClick={() => { setShowEmailForm(!showEmailForm); setShowCompForm(false); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              showEmailForm
                ? "bg-amber-600 text-white"
                : "text-amber-400 hover:bg-amber-500/10 border border-amber-500/20",
            )}
          >
            <Mail size={12} />
            Send Email
          </button>
          <button
            onClick={clearSelection}
            className="ml-auto text-xs text-muted hover:text-text transition-colors"
          >
            <X size={14} />
          </button>

          {feedback && (
            <div className="w-full">
              <span className={cn("flex items-center gap-1 text-sm", feedback.type === "success" ? "text-emerald-500" : "text-red-400")}>
                {feedback.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                {feedback.msg}
              </span>
            </div>
          )}

          {/* Inline comp form */}
          {showCompForm && (
            <div className="w-full mt-2 flex items-end gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">Duration</label>
                <select
                  value={compDuration}
                  onChange={(e) => setCompDuration(e.target.value as Duration)}
                  className="rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-text focus:outline-none focus:border-amber-500/50"
                >
                  <option value="indefinite">Indefinite</option>
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                  <option value="6m">6 months</option>
                  <option value="1y">1 year</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={compReason}
                  onChange={(e) => setCompReason(e.target.value)}
                  placeholder="e.g. Beta tester"
                  className="w-full rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button
                onClick={handleBulkComp}
                disabled={isPending}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  isPending
                    ? "bg-amber-600/30 text-amber-500/50 cursor-not-allowed"
                    : "bg-amber-600 text-white hover:bg-amber-500",
                )}
              >
                {isPending ? "Granting..." : "Confirm"}
              </button>
            </div>
          )}

          {/* Inline email form */}
          {showEmailForm && (
            <div className="w-full mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted block mb-1">Subject *</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject line"
                    className="w-full rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Heading *</label>
                  <input
                    type="text"
                    value={emailHeading}
                    onChange={(e) => setEmailHeading(e.target.value)}
                    placeholder="Email heading"
                    className="w-full rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Body *</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email body text..."
                  rows={3}
                  className="w-full rounded-md border border-border bg-panel px-2 py-1.5 text-xs text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>
              <button
                onClick={handleBulkEmail}
                disabled={isPending || !emailSubject || !emailHeading || !emailBody}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  isPending || !emailSubject || !emailHeading || !emailBody
                    ? "bg-amber-600/30 text-amber-500/50 cursor-not-allowed"
                    : "bg-amber-600 text-white hover:bg-amber-500",
                )}
              >
                {isPending ? "Sending..." : `Send to ${selected.size} recipient${selected.size > 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search and filter */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-border bg-panel px-3 py-1.5 text-sm text-text placeholder:text-faint focus:outline-none focus:border-amber-500/50"
        />
        <button
          onClick={() =>
            downloadCsv(
              filtered.map((s) => ({
                user: s.user_email,
                plan: s.plan === "none" ? "no plan" : s.plan,
                status: s.status === "none" ? "no plan" : s.status,
                comp: s.granted_by_admin ? "yes" : "no",
                cancel_at_period_end: s.cancel_at_period_end ? "yes" : "no",
                period_end: s.current_period_end ?? "",
                created: s.created_at,
              })),
              "users.csv",
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted hover:text-text hover:bg-panel2 border border-border transition-colors"
          title="Export CSV"
        >
          <Download size={12} />
          CSV
        </button>
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
          <p className="text-sm text-muted">No users found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-panel divide-y divide-border">
          {/* Select all header */}
          <div className="px-4 py-2 flex items-center gap-3 bg-panel2/50">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
              className="rounded border-border accent-amber-500"
            />
            <span className="text-xs text-muted">
              {allFilteredSelected ? "Deselect all" : "Select all"} ({filtered.length})
            </span>
          </div>

          {filtered.map((sub) => {
            const sevClass = statusColors[sub.status] ?? statusColors.incomplete;
            const isSelected = selected.has(sub.user_id);

            return (
              <div
                key={sub.id}
                className={cn(
                  "px-4 py-3 flex items-center gap-3 transition-colors",
                  isSelected ? "bg-amber-500/5" : "hover:bg-panel2",
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(sub.user_id)}
                  className="rounded border-border accent-amber-500 shrink-0"
                />

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => router.push(`/admin/subscribers/${sub.user_id}`)}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-text truncate">
                      {sub.user_email}
                    </span>
                    {sub.granted_by_admin && (
                      <span title="Comp account"><Gift size={12} className="text-amber-500 shrink-0" /></span>
                    )}
                  </div>
                  {sub.has_subscription ? (
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
                ) : (
                  <div className="flex items-center gap-2 text-xs text-faint">
                    No plan
                  </div>
                )}
                </div>

                <span className={cn("text-xs px-1.5 py-0.5 rounded border capitalize", sevClass)}>
                  {sub.status === "none" ? "No plan" : sub.status}
                </span>

                {sub.created_at && (
                  <span className="text-xs text-faint shrink-0">
                    {new Date(sub.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
