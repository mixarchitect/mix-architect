"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

/**
 * Reset a user to a first-run state: releases parked (soft-deleted, still
 * recoverable), onboarding replayed, sessions revoked, password reset email
 * sent. Follows the two-click inline confirm used by the other destructive
 * admin controls.
 */
export function ResetAccountButton({
  userId,
  releaseCount,
}: {
  userId: string;
  releaseCount: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleReset() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    setConfirming(false);

    try {
      const res = await fetch("/api/admin/reset-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(
          data.emailSent
            ? `Reset done. ${data.parkedCount} release(s) parked, password reset email sent.`
            : `Reset done. ${data.parkedCount} release(s) parked. Password reset email FAILED to send.`,
        );
        router.refresh();
      } else {
        setResult(data.error || "Failed to reset account");
      }
    } catch {
      setResult("Failed to reset account");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <span className="text-xs text-muted max-w-xs">
        {result}{" "}
        <button
          onClick={() => setResult(null)}
          className="text-signal hover:underline"
        >
          Dismiss
        </button>
      </span>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-amber-400 max-w-sm">
          Reset this account? {releaseCount} release(s) will be hidden until the
          user chooses to restore them, their sessions end, and they get a
          password reset email.
        </span>
        <button
          onClick={handleReset}
          disabled={loading}
          className="text-xs px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Reset"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-text hover:bg-panel2 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleReset}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-border text-muted hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10 transition-colors"
    >
      <RefreshCcw size={12} />
      Reset Account
    </button>
  );
}
