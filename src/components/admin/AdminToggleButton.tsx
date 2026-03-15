"use client";

import { useState } from "react";
import { Shield, ShieldOff } from "lucide-react";

export function AdminToggleButton({
  userId,
  isAdmin: initialIsAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleToggle() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    setConfirming(false);

    try {
      const res = await fetch("/api/admin/toggle-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: isAdmin ? "demote" : "promote",
        }),
      });

      if (res.ok) {
        setIsAdmin(!isAdmin);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update admin status");
      }
    } catch {
      alert("Failed to update admin status");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">
          {isAdmin ? "Remove admin?" : "Grant admin?"}
        </span>
        <button
          onClick={handleToggle}
          disabled={loading}
          className="text-xs px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Confirm"}
        </button>
        <button
          onClick={handleCancel}
          className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-text hover:bg-panel2 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors ${
        isAdmin
          ? "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          : "border-border text-muted hover:text-text hover:bg-panel2"
      }`}
    >
      {isAdmin ? (
        <>
          <ShieldOff size={12} />
          Remove Admin
        </>
      ) : (
        <>
          <Shield size={12} />
          Make Admin
        </>
      )}
    </button>
  );
}
