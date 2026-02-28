"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle, RefreshCw } from "lucide-react";

import type { ApprovalStatus } from "@/lib/portal-types";

const CLIENT_NAME_KEY = "portal_client_name";

type ApprovalControlsProps = {
  shareToken: string;
  trackId: string;
  initialStatus: ApprovalStatus;
};

const STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; color: string; bg: string }
> = {
  awaiting_review: {
    label: "Awaiting Review",
    color: "text-muted",
    bg: "bg-muted/10",
  },
  changes_requested: {
    label: "Changes Requested",
    color: "text-signal",
    bg: "bg-signal-muted",
  },
  approved: {
    label: "Approved",
    color: "text-status-green",
    bg: "bg-status-green/10",
  },
  delivered: {
    label: "Delivered",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
};

export function ApprovalControls({
  shareToken,
  trackId,
  initialStatus,
}: ApprovalControlsProps) {
  const [status, setStatus] = useState<ApprovalStatus>(initialStatus);
  const clientName = typeof window !== "undefined" ? localStorage.getItem(CLIENT_NAME_KEY) || "Client" : "Client";
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const config = STATUS_CONFIG[status];

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
        setChangeNote("");
        setShowRequestForm(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Delivered is read-only — set by the engineer
  if (status === "delivered") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
            config.bg,
            config.color,
          )}
        >
          <Check size={12} />
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
            config.bg,
            config.color,
          )}
        >
          {status === "approved" && <Check size={12} />}
          {status === "changes_requested" && <RefreshCw size={12} />}
          {config.label}
        </span>
      </div>

      {/* Action buttons — only show if not already approved */}
      {status !== "approved" && (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={submitting}
            className="!h-8 !text-xs !bg-status-green hover:!bg-status-green/90"
          >
            <Check size={14} />
            Approve
          </Button>
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-muted hover:text-text border border-border rounded-md transition-colors"
          >
            <MessageCircle size={14} />
            Request Changes
          </button>
        </div>
      )}

      {/* Approved confirmation — allow reopening */}
      {status === "approved" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRequestForm(true)}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
          >
            <MessageCircle size={12} />
            Actually, request changes…
          </button>
        </div>
      )}

      {/* Request changes form */}
      {showRequestForm && (
        <div className="bg-signal-muted border border-signal/20 rounded-lg p-3">
          <div className="text-[11px] text-signal font-medium mb-2">
            Describe the changes needed
          </div>
          <textarea
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder="What changes would you like to see?"
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
              Submit Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
