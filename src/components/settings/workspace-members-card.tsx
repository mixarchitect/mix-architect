"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Lock, Loader2, Trash2, UserPlus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useSubscription } from "@/lib/subscription-context";
import { getEntitlements } from "@/lib/entitlements";

type Member = {
  id: string;
  invited_email: string;
  role: string;
  accepted_at: string | null;
  user_id: string | null;
};

const ASSIGNABLE_ROLES = ["admin", "engineer", "viewer"] as const;

/**
 * Studio team management: invite members to the workspace, set roles, remove.
 * Gated on the `teamWorkspace` entitlement — Free/Pro see an upgrade prompt.
 * Reads/mutates workspace_members directly under owner-only RLS; invites go
 * through /api/workspace/invite (Studio gate + email).
 */
export function WorkspaceMembersCard() {
  const sub = useSubscription();
  const gated = !getEntitlements(sub.plan).teamWorkspace;

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<(typeof ASSIGNABLE_ROLES)[number]>("engineer");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("workspace_members")
      .select("id, invited_email, role, accepted_at, user_id")
      .order("invited_at", { ascending: true });
    setMembers((data as Member[] | null) ?? []);
  }, []);

  useEffect(() => {
    if (gated) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await loadMembers();
      } finally {
        setLoading(false);
      }
    })();
  }, [gated, loadMembers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInviting(true);
    try {
      const res = await fetch("/api/workspace/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite.");
      setInviteEmail("");
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite.");
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(id: string, role: string) {
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.from("workspace_members").update({ role }).eq("id", id);
    if (err) {
      setError(err.message);
      return;
    }
    await loadMembers();
  }

  async function handleRemove(id: string) {
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.from("workspace_members").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  /* ── Gated (Free / Pro) ─────────────────────────────────────────── */
  if (gated) {
    return (
      <div className="rounded-xl border border-border p-6" style={{ background: "var(--panel)" }}>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-muted" />
          <h2 className="text-sm font-semibold text-text">Team members</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          Invite your team to collaborate on releases with shared access and roles. Available on Studio.
        </p>
        <Link
          href="/app/settings?upgrade=studio"
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{ background: "var(--signal)", color: "var(--signal-on)" }}
        >
          Upgrade to Studio
        </Link>
      </div>
    );
  }

  /* ── Active (Studio) ────────────────────────────────────────────── */
  return (
    <div className="rounded-xl border border-border p-6 space-y-5" style={{ background: "var(--panel)" }}>
      <div>
        <h2 className="text-sm font-semibold text-text">Team members</h2>
        <p className="mt-1 text-sm text-muted">
          Invite teammates to your workspace. They get access to all releases, gated by role.
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          {/* Member list */}
          <div className="space-y-1.5">
            {members.map((m) => {
              const isOwner = m.role === "owner";
              const pending = !m.accepted_at;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
                  style={{ background: "var(--panel-2)" }}
                >
                  <Users size={14} className="text-muted shrink-0" />
                  <span className="text-sm text-text truncate flex-1">{m.invited_email}</span>
                  {pending && (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-amber-500">Pending</span>
                  )}
                  {isOwner ? (
                    <span className="text-xs text-muted capitalize px-2">Owner</span>
                  ) : (
                    <>
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="rounded-md border border-border bg-panel px-2 py-1 text-xs text-text focus:outline-none"
                      >
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemove(m.id)}
                        className="text-muted hover:text-red-500 transition-colors shrink-0"
                        aria-label={`Remove ${m.invited_email}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Invite form */}
          <form onSubmit={handleInvite} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@email.com"
              className="input text-sm flex-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as (typeof ASSIGNABLE_ROLES)[number])}
              className="rounded-md border border-border bg-panel px-2 py-2 text-sm text-text focus:outline-none"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
              style={{ background: "var(--signal)", color: "var(--signal-on)" }}
            >
              {inviting ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
              Invite
            </button>
          </form>
          <p className="text-[10px] text-faint">
            Admin/Engineer can edit releases; Viewer is read-only. Only owner &amp; admin can delete.
          </p>
        </>
      )}
    </div>
  );
}
