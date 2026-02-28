"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { canEdit, type ReleaseRole } from "@/lib/permissions";
import type { ApprovalStatus } from "@/lib/portal-types";

type PortalSettingsEditorProps = {
  releaseId: string;
  initialShare: {
    id: string;
    share_token: string;
    show_direction: boolean;
    show_specs: boolean;
    show_references: boolean;
    show_payment_status: boolean;
    show_distribution: boolean;
    require_payment_for_download: boolean;
  } | null;
  role?: ReleaseRole;
};

export function PortalSettingsEditor({
  releaseId,
  initialShare,
  role,
}: PortalSettingsEditorProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [share, setShare] = useState(initialShare);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  // Approval status state — fetched client-side when share exists
  const [trackApprovals, setTrackApprovals] = useState<
    { track_id: string; track_title: string; approval_status: ApprovalStatus }[]
  >([]);

  useEffect(() => {
    if (!share?.id) return;
    async function loadApprovals() {
      // Fetch tracks for this release
      const { data: tracks } = await supabase
        .from("tracks")
        .select("id, title")
        .eq("release_id", releaseId)
        .order("track_number");

      if (!tracks || tracks.length === 0) return;

      // Fetch portal_track_settings
      const { data: settings } = await supabase
        .from("portal_track_settings")
        .select("track_id, approval_status")
        .eq("brief_share_id", share!.id);

      const settingsMap = new Map(
        (settings ?? []).map((s: { track_id: string; approval_status: string }) => [s.track_id, s.approval_status]),
      );

      setTrackApprovals(
        tracks.map((t: { id: string; title: string }) => ({
          track_id: t.id,
          track_title: t.title,
          approval_status: (settingsMap.get(t.id) as ApprovalStatus) ?? "awaiting_review",
        })),
      );
    }
    loadApprovals();
  }, [share?.id, releaseId, supabase]);

  if (!canEdit(role ?? "owner")) return null;

  async function ensureShare() {
    if (share) return share;
    setCreating(true);
    try {
      const { data: existing } = await supabase
        .from("brief_shares")
        .select("*")
        .eq("release_id", releaseId)
        .maybeSingle();

      if (existing) {
        setShare(existing);
        return existing;
      }

      const { data } = await supabase
        .from("brief_shares")
        .insert({ release_id: releaseId })
        .select("*")
        .single();

      if (data) setShare(data);
      return data;
    } finally {
      setCreating(false);
    }
  }

  async function handleCopyLink() {
    const s = await ensureShare();
    if (!s) return;
    const url = `${window.location.origin}/portal/${s.share_token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function updateField(field: string, value: unknown) {
    const s = await ensureShare();
    if (!s) return;
    setShare((prev) => (prev ? { ...prev, [field]: value } : prev));
    await supabase
      .from("brief_shares")
      .update({ [field]: value })
      .eq("id", s.id);
    router.refresh();
  }

  const portalUrl = share
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${share.share_token}`
    : null;

  return (
    <Panel>
      <PanelBody className="py-5 space-y-4">
        <div className="label-sm text-muted mb-1">CLIENT PORTAL</div>

        {/* Copy Link */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={handleCopyLink}
              disabled={creating}
              className="h-8 text-xs flex-1"
            >
              {copied ? (
                <Check size={14} />
              ) : (
                <Copy size={14} />
              )}
              {creating ? "Creating…" : copied ? "Copied!" : "Copy Portal Link"}
            </Button>
            {portalUrl && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted hover:text-text transition-colors border border-border"
                title="Preview portal"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Visibility Toggles */}
        {share && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="text-xs text-muted font-medium">Show on portal</div>
            <ToggleRow
              label="Mix direction"
              checked={share.show_direction}
              onChange={(v) => updateField("show_direction", v)}
            />
            <ToggleRow
              label="Specs (format, loudness)"
              checked={share.show_specs}
              onChange={(v) => updateField("show_specs", v)}
            />
            <ToggleRow
              label="References"
              checked={share.show_references}
              onChange={(v) => updateField("show_references", v)}
            />
            <ToggleRow
              label="Payment status"
              checked={share.show_payment_status}
              onChange={(v) => updateField("show_payment_status", v)}
            />
            <ToggleRow
              label="Distribution metadata"
              checked={share.show_distribution}
              onChange={(v) => updateField("show_distribution", v)}
            />

            <div className="pt-2 border-t border-border/50">
              <ToggleRow
                label="Require payment for download"
                checked={share.require_payment_for_download}
                onChange={(v) =>
                  updateField("require_payment_for_download", v)
                }
              />
            </div>

            {/* Approval status overview */}
            {trackApprovals.length > 0 && (
              <div className="pt-2 border-t border-border/50 space-y-2">
                <div className="text-xs text-muted font-medium">
                  Approval status
                </div>
                {trackApprovals.map((t) => (
                  <div
                    key={t.track_id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-text truncate mr-2">
                      {t.track_title}
                    </span>
                    <ApprovalBadge status={t.approval_status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle Row                                                         */
/* ------------------------------------------------------------------ */

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between text-sm cursor-pointer group">
      <span className="text-text">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? "bg-signal" : "bg-muted/30"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Approval Badge                                                     */
/* ------------------------------------------------------------------ */

const APPROVAL_BADGE: Record<string, { label: string; cls: string }> = {
  awaiting_review: { label: "Awaiting", cls: "bg-muted/10 text-muted" },
  changes_requested: { label: "Changes", cls: "bg-signal-muted text-signal" },
  approved: { label: "Approved", cls: "bg-status-green/10 text-status-green" },
  delivered: { label: "Delivered", cls: "bg-blue-500/10 text-blue-500" },
};

function ApprovalBadge({ status }: { status: string }) {
  const cfg = APPROVAL_BADGE[status] ?? APPROVAL_BADGE.awaiting_review;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}
