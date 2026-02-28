"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle, RefreshCw, Package } from "lucide-react";

import type { ApprovalStatus } from "@/lib/portal-types";

const CLIENT_NAME_KEY = "portal_client_name";

export const STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  awaiting_review: {
    label: "Awaiting Review",
    color: "text-muted",
    bg: "bg-black/[0.04] dark:bg-white/[0.06]",
    dot: "bg-muted",
  },
  changes_requested: {
    label: "Changes Requested",
    color: "text-signal",
    bg: "bg-signal-muted",
    dot: "bg-signal",
  },
  approved: {
    label: "Approved",
    color: "text-status-green",
    bg: "bg-status-green/10",
    dot: "bg-status-green",
  },
  delivered: {
    label: "Delivered",
    color: "text-status-blue",
    bg: "bg-status-blue/10",
    dot: "bg-status-blue",
  },
};

/* ------------------------------------------------------------------ */
/*  Standalone Status Badge (used in track card header)                 */
/* ------------------------------------------------------------------ */

export function PortalStatusBadge({ status }: { status: ApprovalStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap",
        config.bg,
        config.color,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Approval Controls (action buttons + request changes form)           */
/* ------------------------------------------------------------------ */

type ApprovalControlsProps = {
  shareToken: string;
  trackId: string;
  initialStatus: ApprovalStatus;
  approvalDate: string | null;
  onStatusChange?: (newStatus: ApprovalStatus) => void;
};

export function ApprovalControls({
  shareToken,
  trackId,
  initialStatus,
  approvalDate,
  onStatusChange,
}: ApprovalControlsProps) {
  const [status, setStatus] = useState<ApprovalStatus>(initialStatus);
  const clientName = typeof window !== "undefined" ? localStorage.getItem(CLIENT_NAME_KEY) || "Client" : "Client";
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleApprove() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_token: shareToken,
          track_id: trackId,
          action: "approve",
          actor_name: clientName || "Client",
        }),
      });
      if (res.ok) {
        setStatus("approved");
        onStatusChange?.("approved");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestChanges() {
    if (!changeNote.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_token: shareToken,
          track_id: trackId,
          action: "request_changes",
          note: changeNote.trim(),
          actor_name: clientName || "Client",
        }),
      });
      if (res.ok) {
        setStatus("changes_requested");
        onStatusChange?.("changes_requested");
        setChangeNote("");
        setShowRequestForm(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUndo() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_token: shareToken,
          track_id: trackId,
          action: "reopen",
          actor_name: clientName || "Client",
        }),
      });
      if (res.ok) {
        setStatus("awaiting_review");
        onStatusChange?.("awaiting_review");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Delivered is read-only — set by the engineer
  if (status === "delivered") {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Action buttons — awaiting or changes_requested */}
      {(status === "awaiting_review" || status === "changes_requested") && (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={submitting}
            className="!h-9 !text-xs !bg-status-green hover:!bg-status-green/90"
          >
            <Check size={14} />
            Approve
          </Button>
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium text-muted hover:text-text border border-border rounded-md transition-colors"
          >
            <MessageCircle size={14} />
            Request Changes
          </button>
        </div>
      )}

      {/* Approved confirmation — show date + undo */}
      {status === "approved" && (
        <div className="flex items-center gap-3 bg-status-green/[0.06] rounded-lg px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm text-status-green font-medium">
            <Check size={14} />
            Approved
            {approvalDate && (
              <span className="text-status-green/70 font-normal ml-1">
                on{" "}
                {new Date(approvalDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          <button
            onClick={handleUndo}
            disabled={submitting}
            className="text-xs text-muted hover:text-text transition-colors ml-auto underline underline-offset-2"
          >
            Undo
          </button>
        </div>
      )}

      {/* Request changes form */}
      {showRequestForm && (
        <div className="bg-signal-muted border border-signal/20 rounded-lg p-3">
          <div className="text-[11px] text-signal font-medium mb-2">
            What needs to change?
          </div>
          <textarea
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder="e.g., Vocals too quiet in the chorus, needs more low end..."
            rows={3}
            className="input text-sm w-full resize-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowRequestForm(false);
                setChangeNote("");
              }
            }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setShowRequestForm(false);
                setChangeNote("");
              }}
              className="text-xs text-muted hover:text-text transition-colors px-3 py-1.5 border border-border rounded"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              onClick={handleRequestChanges}
              disabled={!changeNote.trim() || submitting}
              className="!h-auto !py-1.5 !px-3 !text-xs"
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
