"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAudio } from "@/lib/audio-context";
import { appSection } from "@/lib/product-events";
import { setProductTrackingDisabled, trackOncePerSession } from "@/lib/track-event";

/**
 * Records the coarse shape of an app session: that a visit happened, which
 * sections were opened (never which release or track), and that a version
 * was played. Renders nothing.
 */
export function UsageTracker({ disabled }: { disabled: boolean }) {
  const pathname = usePathname();
  const { isPlaying, activeVersion, trackMeta } = useAudio();

  useEffect(() => {
    setProductTrackingDisabled(disabled);
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    const section = appSection(pathname);
    trackOncePerSession("session", "session_start", { entry: section });
    trackOncePerSession(`section:${section}`, "section_viewed", { section });
  }, [pathname, disabled]);

  const versionId = activeVersion?.id;
  const versionNumber = activeVersion?.version_number;
  const releaseId = trackMeta?.releaseId;
  const trackId = trackMeta?.trackId;
  useEffect(() => {
    if (disabled || !isPlaying || !versionId) return;
    trackOncePerSession(`play:${versionId}`, "audio_played", {
      releaseId,
      trackId,
      version: versionNumber,
    });
  }, [disabled, isPlaying, versionId, versionNumber, releaseId, trackId]);

  return null;
}
