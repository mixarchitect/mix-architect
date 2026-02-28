"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody } from "@/components/ui/panel";
import { canEdit, type ReleaseRole } from "@/lib/permissions";

type VersionInfo = { id: string; version_number: number };

type PortalTrackEditorProps = {
  briefShareId: string | null;
  releaseId: string;
  trackId: string;
  audioVersions: VersionInfo[];
  role?: ReleaseRole;
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
}: PortalTrackEditorProps) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [trackSetting, setTrackSetting] = useState<TrackSetting | null>(null);
  const [versionSettings, setVersionSettings] = useState<VersionSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const shouldRender = !!briefShareId && canEdit(role ?? "owner");

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

  if (!shouldRender) return null;

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
