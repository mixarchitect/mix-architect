"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody } from "@/components/ui/panel";
import { canEdit, type ReleaseRole } from "@/lib/permissions";
import type { ApprovalStatus } from "@/lib/portal-types";

type PortalSettingsEditorProps = {
  releaseId: string;
  initialShare: {
    id: string;
    share_token: string;
    active: boolean;
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

  // Approval status state — fetched client-side when share exists
  const [trackApprovals, setTrackApprovals] = useState<
    { track_id: string; track_title: string; approval_status: ApprovalStatus }[]
  >([]);

  useEffect(() => {
    if (!share?.id) return;
    async function loadApprovals() {
      const { data: tracks } = await supabase
        .from("tracks")
        .select("id, title")
        .eq("release_id", releaseId)
        .order("track_number");

      if (!tracks || tracks.length === 0) return;

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
  if (!share?.active) return null;

  async function updateField(field: string, value: unknown) {
    if (!share) return;
    setShare((prev) => (prev ? { ...prev, [field]: value } : prev));
    await supabase
      .from("brief_shares")
      .update({ [field]: value })
      .eq("id", share.id);
    router.refresh();
  }

  return (
    <Panel>
      <PanelBody className="py-5 space-y-4">
        <div className="label-sm text-muted mb-1">CLIENT PORTAL</div>

        {/* Visibility Toggles */}
        <div className="space-y-2">
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
          checked ? "bg-signal" : "bg-black/20 dark:bg-white/20"
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
