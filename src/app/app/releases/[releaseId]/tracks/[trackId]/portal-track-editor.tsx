"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody } from "@/components/ui/panel";
import { canEdit, type ReleaseRole } from "@/lib/permissions";
import { cn } from "@/lib/cn";
import { Check, Globe, MessageCircle, Package, RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

type VersionInfo = { id: string; version_number: number };

type PortalApprovalEvent = {
  event_type: string;
  actor_name: string;
  note: string | null;
  created_at: string;
};

type PortalTrackEditorProps = {
  briefShareId: string | null;
  releaseId: string;
  trackId: string;
  audioVersions: VersionInfo[];
  role?: ReleaseRole;
  portalApprovalStatus?: string | null;
  portalApprovalEvents?: PortalApprovalEvent[];
};

type TrackSetting = {
  id: string;
  visible: boolean;
  download_enabled: boolean;
};

type VersionSetting = {
  id: string;
  audio_version_id: string;
  visible: boolean;
};

export function PortalTrackEditor({
  briefShareId,
  releaseId,
  trackId,
  audioVersions,
  role,
  portalApprovalStatus,
  portalApprovalEvents = [],
}: PortalTrackEditorProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [trackSetting, setTrackSetting] = useState<TrackSetting | null>(null);
  const [versionSettings, setVersionSettings] = useState<VersionSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!briefShareId) return;
    async function load() {
      const [trackRes, versionRes] = await Promise.all([
        supabase
          .from("portal_track_settings")
          .select("id, visible, download_enabled")
          .eq("brief_share_id", briefShareId!)
          .eq("track_id", trackId)
          .maybeSingle(),
        supabase
          .from("portal_version_settings")
          .select("id, audio_version_id, visible")
          .eq("brief_share_id", briefShareId!)
          .in(
            "audio_version_id",
            audioVersions.map((v) => v.id),
          ),
      ]);
      setTrackSetting(trackRes.data ?? null);
      setVersionSettings(versionRes.data ?? []);
      setLoading(false);
    }
    load();
  }, [briefShareId, trackId, audioVersions, supabase]);

  // Portal not activated at release level — show empty state for everyone
  if (!briefShareId) {
    return (
      <EmptyState
        icon={Globe}
        title="Client portal not active"
        description="Activate the client portal on the release page to share tracks, collect feedback, and manage approvals."
        action={{
          label: "Go to release",
          href: `/app/releases/${releaseId}`,
        }}
      />
    );
  }

  // Portal is active but user doesn't have edit permissions
  if (!canEdit(role ?? "owner")) return null;

  async function toggleTrackVisible(visible: boolean) {
    if (trackSetting) {
      setTrackSetting((prev) => (prev ? { ...prev, visible } : prev));
      await supabase
        .from("portal_track_settings")
        .update({ visible })
        .eq("id", trackSetting.id);
    } else {
      const { data } = await supabase
        .from("portal_track_settings")
        .upsert(
          { brief_share_id: briefShareId!, track_id: trackId, visible, download_enabled: true },
          { onConflict: "brief_share_id,track_id" },
        )
        .select("id, visible, download_enabled")
        .single();
      if (data) setTrackSetting(data);
    }
    router.refresh();
  }

  async function toggleDownloadEnabled(download_enabled: boolean) {
    if (trackSetting) {
      setTrackSetting((prev) => (prev ? { ...prev, download_enabled } : prev));
      await supabase
        .from("portal_track_settings")
        .update({ download_enabled })
        .eq("id", trackSetting.id);
    } else {
      const { data } = await supabase
        .from("portal_track_settings")
        .upsert(
          { brief_share_id: briefShareId!, track_id: trackId, visible: true, download_enabled },
          { onConflict: "brief_share_id,track_id" },
        )
        .select("id, visible, download_enabled")
        .single();
      if (data) setTrackSetting(data);
    }
    router.refresh();
  }

  async function toggleVersionVisible(versionId: string, visible: boolean) {
    const existing = versionSettings.find((v) => v.audio_version_id === versionId);
    if (existing) {
      setVersionSettings((prev) =>
        prev.map((v) => (v.audio_version_id === versionId ? { ...v, visible } : v)),
      );
      await supabase
        .from("portal_version_settings")
        .update({ visible })
        .eq("id", existing.id);
    } else {
      const { data } = await supabase
        .from("portal_version_settings")
        .upsert(
          { brief_share_id: briefShareId!, audio_version_id: versionId, visible },
          { onConflict: "brief_share_id,audio_version_id" },
        )
        .select("id, audio_version_id, visible")
        .single();
      if (data) setVersionSettings((prev) => [...prev, data]);
    }
    router.refresh();
  }

  const isVisible = trackSetting?.visible ?? true;
  const isDownloadEnabled = trackSetting?.download_enabled ?? true;

  if (loading) {
    return (
      <Panel>
        <PanelBody className="py-5">
          <div className="label-sm text-muted mb-1">TRACK PORTAL VISIBILITY</div>
          <div className="text-xs text-muted">Loading…</div>
        </PanelBody>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      {/* Client Approval Status */}
      {portalApprovalStatus && portalApprovalStatus !== "awaiting_review" && (
        <Panel>
          <PanelBody className="py-5 space-y-3">
            <div className="label-sm text-muted mb-1">CLIENT APPROVAL</div>
            <ApprovalStatusDisplay status={portalApprovalStatus} />
            {portalApprovalEvents.length > 0 && (
              <div className="pt-3 border-t border-border/50 space-y-3">
                {portalApprovalEvents.slice(0, 5).map((event, i) => (
                  <ApprovalEventRow key={i} event={event} />
                ))}
              </div>
            )}
          </PanelBody>
        </Panel>
      )}

      {/* Approval event history when awaiting but has past events */}
      {portalApprovalStatus === "awaiting_review" && portalApprovalEvents.length > 0 && (
        <Panel>
          <PanelBody className="py-5 space-y-3">
            <div className="label-sm text-muted mb-1">CLIENT APPROVAL</div>
            <ApprovalStatusDisplay status="awaiting_review" />
            <div className="pt-3 border-t border-border/50 space-y-3">
              {portalApprovalEvents.slice(0, 5).map((event, i) => (
                <ApprovalEventRow key={i} event={event} />
              ))}
            </div>
          </PanelBody>
        </Panel>
      )}

      <Panel>
        <PanelBody className="py-5 space-y-3">
          <div className="label-sm text-muted mb-1">TRACK PORTAL VISIBILITY</div>
          <p className="text-xs text-muted">
            Control what your client sees for this track on the portal.
          </p>

          <ToggleRow
            label="Visible on portal"
            checked={isVisible}
            onChange={toggleTrackVisible}
          />
          <ToggleRow
            label="Enable download"
            checked={isDownloadEnabled}
            onChange={toggleDownloadEnabled}
          />

          {audioVersions.length > 1 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="text-xs text-muted font-medium">Track version visibility</div>
              {audioVersions.map((v) => {
                const setting = versionSettings.find((s) => s.audio_version_id === v.id);
                const versionVisible = setting?.visible ?? true;
                return (
                  <ToggleRow
                    key={v.id}
                    label={`Version ${v.version_number}`}
                    checked={versionVisible}
                    onChange={(checked) => toggleVersionVisible(v.id, checked)}
                  />
                );
              })}
            </div>
          )}
        </PanelBody>
      </Panel>

      <p className="text-xs text-muted text-center">
        Portal activation and link can be found on the{" "}
        <Link
          href={`/app/releases/${releaseId}`}
          className="text-signal hover:underline"
        >
          release page
        </Link>
        .
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Approval Display Components                                        */
/* ------------------------------------------------------------------ */

const APPROVAL_STYLES: Record<string, { label: string; icon: typeof Check; color: string; bg: string }> = {
  approved: { label: "Approved", icon: Check, color: "text-status-green", bg: "bg-status-green/10" },
  delivered: { label: "Delivered", icon: Package, color: "text-status-blue", bg: "bg-status-blue/10" },
  changes_requested: { label: "Changes Requested", icon: MessageCircle, color: "text-signal", bg: "bg-signal-muted" },
  awaiting_review: { label: "Awaiting Review", icon: RotateCcw, color: "text-muted", bg: "bg-black/[0.04] dark:bg-white/[0.06]" },
};

function ApprovalStatusDisplay({ status }: { status: string }) {
  const style = APPROVAL_STYLES[status];
  if (!style) return null;
  const Icon = style.icon;
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg", style.bg)}>
      <Icon size={14} className={style.color} />
      <span className={cn("text-sm font-medium", style.color)}>{style.label}</span>
    </div>
  );
}

const EVENT_LABELS: Record<string, { label: string; icon: typeof Check; color: string }> = {
  approve: { label: "approved", icon: Check, color: "text-status-green" },
  request_changes: { label: "requested changes", icon: MessageCircle, color: "text-signal" },
  deliver: { label: "marked delivered", icon: Package, color: "text-status-blue" },
  reopen: { label: "reopened for review", icon: RotateCcw, color: "text-muted" },
};

function ApprovalEventRow({ event }: { event: PortalApprovalEvent }) {
  const config = EVENT_LABELS[event.event_type];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <div className="text-xs">
      <div className="flex items-center gap-1.5">
        <Icon size={11} className={config.color} />
        <span className="text-text font-medium">{event.actor_name}</span>
        <span className="text-muted">{config.label}</span>
        <span className="text-faint ml-auto whitespace-nowrap">
          {new Date(event.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      {event.note && (
        <p className="mt-1 ml-4 text-text italic leading-relaxed">
          &ldquo;{event.note}&rdquo;
        </p>
      )}
    </div>
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
