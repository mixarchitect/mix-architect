"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import { Timestamp } from "@/components/ui/timestamp";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useAudio, type AudioTrackMeta } from "@/lib/audio-context";
import { useTheme } from "next-themes";
import { sendNotification } from "@/lib/notifications/client";
import { logActivityClient } from "@/lib/activity-logger-client";
import { trackGA4Event } from "@/lib/ga4-track";
import { signAudioUrlsAction } from "@/lib/actions/sign-audio-urls";
import { extractStoragePath } from "@/lib/storage-urls";
import {
  SkipBack,
  SkipForward,
  RotateCcw,
  Upload,
  Download,
  Trash2,
  MessageCircle,
  ChevronDown,
  X,
  Repeat,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { perf } from "@/lib/perf";
import { perfReporter } from "@/lib/perf-reporter";
import {
  getWaveColors,
  formatTime,
  formatSampleRate,
  formatBitDepth,
  LUFS_REFERENCE,
  LOUDNESS_TARGETS,
  LOUDNESS_GROUPS,
  TRUE_PEAK_CEILING,
  TRUE_PEAK_TARGETS,
  computeQualitySnapshot,
  AUTHOR_COLORS,
} from "@/components/ui/audio-player-shared";
import {
  compareSpecs,
  hasTargetSpecs,
  formatChannels,
  type TrackTargetSpecs,
} from "@/lib/spec-validation";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { FilledPlay, FilledPause, FilledUpload } from "@/components/ui/filled-icon";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AudioVersionData = {
  id: string;
  track_id: string;
  version_number: number;
  audio_url: string;
  /** Raw storage path for deletions (set by signAudioVersions) */
  storage_path?: string;
  file_name: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  waveform_peaks: number[][] | null;
  measured_lufs: number | null;
  sample_rate: number | null;
  bit_depth: number | null;
  file_format: string | null;
  channels: number | null;
  codec: string | null;
  spec_analysis_status: "pending" | "analyzing" | "complete" | "failed" | null;
  /** Worker-side loudness pipeline version. NULL until worker runs. */
  analysis_version?: number | null;
  /** ITU-R BS.1770-4 true peak in dBTP. NULL until worker runs. */
  true_peak_dbtp?: number | null;
  /** Raw sample peak in dBFS (always ≤ 0). NULL until worker runs. */
  sample_peak_dbfs?: number | null;
  /** DC offset as a fraction (abs value). NULL until worker runs. */
  dc_offset?: number | null;
  /** Number of samples at ±full scale (strict clipping). NULL until worker runs. */
  clip_sample_count?: number | null;
  uploaded_by: string;
  created_at: string;
};

export type TimelineComment = {
  id: string;
  content: string;
  author: string;
  created_at: string;
  timecode_seconds: number | null;
  audio_version_id: string | null;
};

type AudioPlayerProps = {
  releaseId: string;
  trackId: string;
  versions: AudioVersionData[];
  comments: TimelineComment[];
  canUpload: boolean;
  canComment: boolean;
  canDelete: boolean;
  coverArtUrl: string | null;
  trackTitle: string;
  releaseTitle: string;
  currentUserName: string;
  onVersionsChange: (v: AudioVersionData[]) => void;
  onCommentsChange: (c: TimelineComment[]) => void;
  targetSpecs?: {
    target_sample_rate: number | null;
    target_bit_depth: number | null;
    target_channels: number | null;
    target_format: string | null;
  } | null;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACCEPTED_AUDIO_TYPES = [
  "audio/wav",
  "audio/x-wav",
  "audio/aiff",
  "audio/x-aiff",
  "audio/flac",
  "audio/mpeg",
  "audio/mp3",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ------------------------------------------------------------------ */
/*  Main AudioPlayer                                                   */
/* ------------------------------------------------------------------ */

export function AudioPlayer({
  releaseId,
  trackId,
  versions,
  comments,
  canUpload,
  canComment,
  canDelete,
  coverArtUrl,
  trackTitle,
  releaseTitle,
  currentUserName,
  onVersionsChange,
  onCommentsChange,
  targetSpecs,
}: AudioPlayerProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { resolvedTheme } = useTheme();

  // Shared audio context
  const audio = useAudio();
  const { audioElement, isPlaying, currentTime, duration } = audio;

  // Version state — sync with context if it's already playing a version for this track
  const [activeVersionId, setActiveVersionId] = useState<string | null>(() => {
    if (audio.activeVersion && audio.activeVersion.track_id === trackId) {
      return audio.activeVersion.id;
    }
    return versions.length > 0 ? versions[versions.length - 1].id : null;
  });
  const activeVersion = useMemo(
    () => versions.find((v) => v.id === activeVersionId) ?? null,
    [versions, activeVersionId],
  );

  // Playback state (local to WaveSurfer readiness)
  const [isReady, setIsReady] = useState(false);

  // Build track metadata for the audio context
  const trackMeta: AudioTrackMeta = useMemo(
    () => ({ trackId, releaseId, trackTitle, releaseTitle, coverArtUrl }),
    [trackId, releaseId, trackTitle, releaseTitle, coverArtUrl],
  );

  // Ref for restoring playback position/state after version switch or reconnect
  const pendingRestoreRef = useRef<{
    seekTime: number;
    shouldPlay: boolean;
  } | null>(null);

  // LUFS comes from the worker (populated on upload). We read it directly
  // from activeVersion rather than holding our own state, so the realtime
  // subscription update below triggers a render without extra wiring.
  const measuredLufs = activeVersion?.measured_lufs ?? null;
  // A version is "processing" when the worker hasn't completed a full
  // loudness analysis pass yet. Two cases qualify:
  //   (a) spec_analysis_status is pending/analyzing (new upload)
  //   (b) spec_analysis_status is complete but analysis_version is NULL
  //       (legacy row awaiting backfill)
  const isAnalysisProcessing =
    activeVersion != null &&
    (activeVersion.spec_analysis_status === "pending" ||
      activeVersion.spec_analysis_status === "analyzing" ||
      (activeVersion.spec_analysis_status === "complete" &&
        activeVersion.measured_lufs == null &&
        (activeVersion.analysis_version == null ||
          activeVersion.analysis_version === 0)));
  const [showStreamingInfo, setShowStreamingInfo] = useState(false);
  const [showTruePeakInfo, setShowTruePeakInfo] = useState(false);
  const [showQualityInfo, setShowQualityInfo] = useState(false);
  const lufsBadgeRef = useRef<HTMLSpanElement | null>(null);
  const truePeakBadgeRef = useRef<HTMLSpanElement | null>(null);
  const qualityBadgeRef = useRef<HTMLSpanElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [truePeakDropdownPos, setTruePeakDropdownPos] = useState<
    { top: number; right: number } | null
  >(null);
  const [qualityDropdownPos, setQualityDropdownPos] = useState<
    { top: number; right: number } | null
  >(null);
  const measuredTruePeak = activeVersion?.true_peak_dbtp ?? null;
  const qualitySnapshot = useMemo(
    () =>
      computeQualitySnapshot({
        clipSampleCount: activeVersion?.clip_sample_count,
        samplePeakDbfs: activeVersion?.sample_peak_dbfs,
        dcOffset: activeVersion?.dc_offset,
      }),
    [
      activeVersion?.clip_sample_count,
      activeVersion?.sample_peak_dbfs,
      activeVersion?.dc_offset,
    ],
  );

  // Position the streaming dropdown under the LUFS button (fixed, escapes overflow)
  useEffect(() => {
    if (!showStreamingInfo || !lufsBadgeRef.current) {
      setDropdownPos(null);
      return;
    }
    const update = () => {
      const rect = lufsBadgeRef.current?.getBoundingClientRect();
      if (rect) setDropdownPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [showStreamingInfo]);

  // Position the true peak dropdown under its pill (same pattern as LUFS)
  useEffect(() => {
    if (!showTruePeakInfo || !truePeakBadgeRef.current) {
      setTruePeakDropdownPos(null);
      return;
    }
    const update = () => {
      const rect = truePeakBadgeRef.current?.getBoundingClientRect();
      if (rect) setTruePeakDropdownPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [showTruePeakInfo]);

  // Position the quality issue dropdown under its pill
  useEffect(() => {
    if (!showQualityInfo || !qualityBadgeRef.current) {
      setQualityDropdownPos(null);
      return;
    }
    const update = () => {
      const rect = qualityBadgeRef.current?.getBoundingClientRect();
      if (rect) setQualityDropdownPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [showQualityInfo]);

  // Comment state
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ timecode: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Spec analysis Realtime subscription ──
  useEffect(() => {
    // Subscribe to rows still awaiting analysis. Three cases qualify:
    //   (a) status pending/analyzing (new upload, worker will process)
    //   (b) status complete but analysis_version is null (legacy row awaiting
    //       backfill to populate loudness fields)
    const pending = versions.filter((v) => {
      if (!v.spec_analysis_status) return false;
      if (v.spec_analysis_status === "pending" || v.spec_analysis_status === "analyzing") return true;
      if (v.spec_analysis_status === "complete" && v.analysis_version == null) return true;
      return false;
    });
    if (pending.length === 0) return;

    const channels = pending.map((v) => {
      const ch = supabase
        .channel(`spec-analysis-${v.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "track_audio_versions",
            filter: `id=eq.${v.id}`,
          },
          (payload: { new: Record<string, unknown> }) => {
            const updated = payload.new as unknown as AudioVersionData;
            onVersionsChange(
              versions.map((ver) => (ver.id === updated.id ? { ...ver, ...updated } : ver)),
            );
          },
        )
        .subscribe();
      return ch;
    });

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
    // Resubscribe whenever any version's analysis state changes.
  }, [versions.map((v) => `${v.id}:${v.spec_analysis_status}:${v.analysis_version ?? "null"}`).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Spec mismatch computation ──
  // Compare whenever we have any detected specs (from client-side parsing or worker analysis)
  const hasDetectedSpecs = activeVersion != null && (
    activeVersion.sample_rate != null || activeVersion.bit_depth != null ||
    activeVersion.channels != null || activeVersion.file_format != null
  );
  const specMismatches = useMemo(() => {
    if (!activeVersion || !targetSpecs || !hasTargetSpecs(targetSpecs)) return [];
    if (!hasDetectedSpecs) return [];
    return compareSpecs(targetSpecs, {
      sample_rate: activeVersion.sample_rate,
      bit_depth: activeVersion.bit_depth,
      channels: activeVersion.channels,
      file_format: activeVersion.file_format,
    });
  }, [activeVersion, targetSpecs, hasDetectedSpecs]);

  // Drag-and-drop state
  const [dragging, setDragging] = useState(false);
  const dragCounterRef = useRef(0);

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    if (!canUpload) return;
    dragCounterRef.current++;
    setDragging(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setDragging(false);
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragging(false);
    if (!canUpload) return;
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // WaveSurfer ref
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  // Keep a ref to latest versions so ready/LUFS callbacks never use stale closures
  const versionsRef = useRef(versions);
  versionsRef.current = versions;

  // Filtered comments for active version
  const versionComments = useMemo(
    () =>
      comments
        .filter(
          (c) =>
            c.audio_version_id === activeVersionId &&
            c.timecode_seconds != null,
        )
        .sort((a, b) => (a.timecode_seconds ?? 0) - (b.timecode_seconds ?? 0)),
    [comments, activeVersionId],
  );

  // Build a stable color map — unique authors get sequential colors (no collisions)
  const authorColorMap = useMemo(() => {
    const uniqueAuthors = [...new Set(comments.map((c) => c.author))].sort();
    const map = new Map<string, string>();
    uniqueAuthors.forEach((a, i) => map.set(a, AUTHOR_COLORS[i % AUTHOR_COLORS.length]));
    return map;
  }, [comments]);

  // Close any open metric popovers when switching versions.
  useEffect(() => {
    setShowStreamingInfo(false);
    setShowTruePeakInfo(false);
    setShowQualityInfo(false);
  }, [activeVersion?.id]);

  // Fire a warning-shown analytics event once per version when the quality
  // pill appears. Keyed on version + issue set so switching between tracks
  // re-fires (gives us usable per-track QC issue counts in analytics).
  useEffect(() => {
    if (!activeVersion) return;
    if (!qualitySnapshot || qualitySnapshot.issues.length === 0) return;
    trackGA4Event("audio_qc_warning_shown", {
      version_id: activeVersion.id,
      // GA4 parameter values are scalars; join issues for queryability.
      issue_types: qualitySnapshot.issues.join(","),
      severe: qualitySnapshot.severe,
      surface: "app",
    });
  }, [activeVersion?.id, qualitySnapshot?.issues.join(","), qualitySnapshot?.severe]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------------------------------------------------------- */
  /*  WaveSurfer lifecycle                                             */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!containerRef.current || !activeVersion) return;

    // Capture current audio state before WaveSurfer potentially pauses it.
    // On version switch the ref is already set by the onClick handler;
    // on initial mount / reconnect we capture from the live element.
    if (!pendingRestoreRef.current) {
      const wasPlaying = !audioElement.paused;
      const currentPos = audioElement.currentTime;
      if (wasPlaying || currentPos > 0) {
        pendingRestoreRef.current = { seekTime: currentPos, shouldPlay: wasPlaying };
      }
    }

    setIsReady(false);

    // Use a cancelled flag so nested RAFs & retry timeouts are safely ignored
    // after the effect cleans up (e.g. rapid version switches).
    let cancelled = false;
    let ws: WaveSurfer | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    const container = containerRef.current;

    function createWaveSurfer() {
      if (cancelled || !container || !container.isConnected || !activeVersion) return;

      const colors = getWaveColors();
      perf.setAudioFileInfo({
        sampleRate: activeVersion.sample_rate,
        bitDepth: activeVersion.bit_depth,
        channels: activeVersion.channels,
        format: activeVersion.file_format,
        fileName: activeVersion.file_name,
      });
      perfReporter.setAudioContext({
        trackId: activeVersion.track_id,
        versionId: activeVersion.id,
        fileFormat: activeVersion.file_format,
        fileSizeMb: activeVersion.file_size ? activeVersion.file_size / (1024 * 1024) : null,
        durationSec: activeVersion.duration_seconds,
        sampleRate: activeVersion.sample_rate,
        bitDepth: activeVersion.bit_depth,
        channels: activeVersion.channels,
      });
      // If the audio element already has a source loaded (reconnecting
      // after navigation), skip the url param entirely. Passing url
      // causes WaveSurfer to set audioElement.src which reloads the
      // source and creates a playback skip. We check for any loaded
      // source rather than play state, because ws.destroy() on the
      // previous unmount may have briefly paused the element.
      const audioHasSource = !!(audioElement.currentSrc || audioElement.src);

      perf.start("wavesurfer:init", { trackId: activeVersion.id });
      ws = WaveSurfer.create({
        container,
        media: audioElement,
        url: audioHasSource ? undefined : activeVersion.audio_url,
        barWidth: 3,
        barGap: 1,
        barRadius: 1,
        height: 80,
        waveColor: colors.wave,
        progressColor: colors.progress,
        cursorColor: "var(--signal)",
        cursorWidth: 2,
        normalize: true,
        peaks: activeVersion.waveform_peaks ?? undefined,
        duration: activeVersion.duration_seconds ?? undefined,
      });
      perf.end("wavesurfer:init");
      perf.start("waveform:render", { trackId: activeVersion.id });

      // Error handling — retry once after a short delay.
      // Freshly uploaded files may not be available at the CDN immediately.
      let retried = false;
      ws.on("error", (err) => {
        console.warn("[audio-player] WaveSurfer load error:", err);
        if (!retried && !cancelled && ws) {
          retried = true;
          retryTimeout = setTimeout(() => {
            if (!cancelled && ws && container.isConnected) {
              ws.load(activeVersion.audio_url);
            }
          }, 1500);
        }
      });

      ws.on("ready", () => {
        if (cancelled) return;
        perf.end("waveform:render");
        perf.captureMemory("memory:after-waveform-load");
        setIsReady(true);

        // Sync context state (URL already matches so this is state-only)
        audio.loadVersion(activeVersion, trackMeta);

        // Restore playback position and play/pause state.
        // Skip if audio is already at the right position and play state
        // to avoid a seek-triggered skip on reconnect after navigation.
        const restore = pendingRestoreRef.current;
        pendingRestoreRef.current = null;
        if (restore) {
          const maxDur =
            activeVersion.duration_seconds || audioElement.duration || Infinity;
          const alreadyNearPosition =
            Math.abs(audioElement.currentTime - restore.seekTime) < 0.5;
          if (!alreadyNearPosition && restore.seekTime > 0 && restore.seekTime <= maxDur) {
            audioElement.currentTime = restore.seekTime;
          }
          if (restore.shouldPlay && audioElement.paused) {
            audioElement.play().catch(() => {});
          }
        }

        // Cache peaks if not yet cached
        if (!activeVersion.waveform_peaks) {
          const peaks = ws!.exportPeaks();
          const dur = ws!.getDuration();
          supabase
            .from("track_audio_versions")
            .update({ waveform_peaks: peaks, duration_seconds: dur })
            .eq("id", activeVersion.id)
            .then(() => {
              if (cancelled) return;
              onVersionsChange(
                versionsRef.current.map((v) =>
                  v.id === activeVersion.id
                    ? { ...v, waveform_peaks: peaks, duration_seconds: dur }
                    : v,
                ),
              );
            });
        }

        // Loudness + file-metadata measurement moved to the worker
        // (see worker/src/loudness.ts). The player just reads the values
        // from the row once the worker has populated them.
      });

      ws.on("dblclick", () => {
        if (!canComment) return;
        const time = ws!.getCurrentTime();
        setCommentInput({ timecode: time });
        audioElement.pause();
      });

      // Perf: track seek interactions (waveform click → visual update)
      ws.on("interaction", () => {
        perf.start("waveform:seek", { trackId: activeVersion.id });
      });
      ws.on("seeking", () => {
        perf.end("waveform:seek");
      });

      wavesurferRef.current = ws;

      // Perf: measure waveform redraw time on window resize
      if (perf.enabled) {
        let resizeTimer: ReturnType<typeof setTimeout> | null = null;
        const onResize = () => {
          perf.start("waveform:resize", { trackId: activeVersion.id });
          // WaveSurfer redraws asynchronously via ResizeObserver — measure on next frame
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            requestAnimationFrame(() => {
              perf.end("waveform:resize");
            });
          }, 100);
        };
        window.addEventListener("resize", onResize);
        resizeCleanupRef.current = () => window.removeEventListener("resize", onResize);
      }
    }

    // Double-RAF: defer WaveSurfer creation by two frames so the container
    // has been fully laid-out with real dimensions. This is especially
    // important when transitioning from the empty state to the player
    // (v1 upload) where the DOM restructure is significant.
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        createWaveSurfer();
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (retryTimeout) clearTimeout(retryTimeout);
      // Preserve audio playback across WaveSurfer destroy.
      // Some WaveSurfer versions pause the media element on destroy.
      const wasPlaying = !audioElement.paused;
      if (ws) ws.destroy();
      if (wasPlaying && audioElement.paused) {
        audioElement.play().catch(() => {});
      }
      wavesurferRef.current = null;
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVersion?.id, audioElement]);

  // Update waveform colors when the theme changes.
  // Defer to the next frame so the browser has recomputed CSS variables
  // for the new theme before we read them via getComputedStyle.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (wavesurferRef.current) {
        const colors = getWaveColors();
        wavesurferRef.current.setOptions({
          waveColor: colors.wave,
          progressColor: colors.progress,
        });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [resolvedTheme]);

  /* ---------------------------------------------------------------- */
  /*  Playback controls                                                */
  /* ---------------------------------------------------------------- */

  const togglePlayPause = useCallback(() => {
    audio.togglePlayPause();
  }, [audio]);

  const returnToStart = useCallback(() => {
    audio.seekTo(0);
  }, [audio]);

  const skipBack = useCallback(() => {
    audio.seekTo(Math.max(0, currentTime - 10));
  }, [audio, currentTime]);

  const skipForward = useCallback(() => {
    audio.seekTo(Math.min(duration, currentTime + 10));
  }, [audio, duration, currentTime]);

  const seekToTime = useCallback(
    (seconds: number) => {
      audio.seekTo(seconds);
    },
    [audio],
  );

  /* ---------------------------------------------------------------- */
  /*  Upload handler                                                   */
  /* ---------------------------------------------------------------- */

  async function handleUpload(file: File) {
    if (!ACCEPTED_AUDIO_TYPES.includes(file.type)) {
      setUploadError("Unsupported format. Use WAV, AIFF, FLAC, MP3, or AAC/M4A.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File must be under 500MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    setUploadError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      if (!user || !session) throw new Error("Not authenticated");

      const nextVersion = versions.length + 1;
      const ext = file.name.split(".").pop() ?? "wav";
      const path = `${user.id}/${trackId}/v${nextVersion}.${ext}`;

      // Upload via XHR for progress tracking
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${supabaseUrl}/storage/v1/object/track-audio/${path}`);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.setRequestHeader("x-upsert", "true");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed (${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      // Store storage path (not public URL) — server signs at render time
      const { data, error } = await supabase
        .from("track_audio_versions")
        .insert({
          track_id: trackId,
          version_number: nextVersion,
          audio_url: path,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: currentUserName,
          spec_analysis_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        // Sign the URL for immediate playback
        const signedMap = await signAudioUrlsAction([path]);
        const signedVersion = {
          ...data,
          storage_path: path,
          audio_url: signedMap[path] ?? path,
        };
        const updated = [...versions, signedVersion];
        onVersionsChange(updated);
        setActiveVersionId(data.id);

        sendNotification({
          type: "audio_upload",
          title: `New version uploaded: ${trackTitle}`,
          body: `${currentUserName} uploaded v${nextVersion}`,
          releaseId,
          trackId,
        });

        logActivityClient("track_uploaded", { releaseId, trackId, version: nextVersion });
        trackGA4Event("audio_upload", { format: ext });
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadFileName(null);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Comment handler                                                  */
  /* ---------------------------------------------------------------- */

  async function handleSubmitComment() {
    if (!newCommentText.trim() || !commentInput || !activeVersionId) return;

    const { data } = await supabase
      .from("revision_notes")
      .insert({
        track_id: trackId,
        content: newCommentText.trim(),
        author: currentUserName,
        timecode_seconds: Math.round(commentInput.timecode * 100) / 100,
        audio_version_id: activeVersionId,
      })
      .select()
      .single();

    if (data) {
      onCommentsChange([...comments, data]);
      setNewCommentText("");
      setCommentInput(null);
      setHighlightedCommentId(data.id);

      // Notify + email release members about the new comment
      sendNotification({
        type: "comment",
        title: `${currentUserName} commented on "${trackTitle}"`,
        body: data.content.slice(0, 120),
        releaseId,
        trackId,
        actorName: currentUserName,
      });
    }
  }

  async function handleDeleteComment(commentId: string) {
    const prev = comments;
    onCommentsChange(comments.filter((c) => c.id !== commentId));
    if (highlightedCommentId === commentId) setHighlightedCommentId(null);

    const { error } = await supabase
      .from("revision_notes")
      .delete()
      .eq("id", commentId);

    if (error) {
      // Rollback on failure
      onCommentsChange(prev);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Delete version handler                                           */
  /* ---------------------------------------------------------------- */

  async function handleDeleteVersion(versionId: string) {
    const version = versions.find((v) => v.id === versionId);
    if (!version) return;

    setDeleting(true);
    try {
      // Stop playback if this version is active
      if (versionId === activeVersionId) {
        audioElement.pause();
        audioElement.src = "";
      }

      // Delete from storage using the raw storage path
      try {
        const storagePath = version.storage_path ?? extractStoragePath(version.audio_url);
        if (storagePath) {
          await supabase.storage.from("track-audio").remove([storagePath]);
        }
      } catch {
        // Storage delete is best-effort; row delete is what matters
      }

      // Delete associated timeline comments
      await supabase
        .from("revision_notes")
        .delete()
        .eq("audio_version_id", versionId);

      // Delete the audio version row
      const { error } = await supabase
        .from("track_audio_versions")
        .delete()
        .eq("id", versionId);

      if (error) throw error;

      // Update local state
      const remaining = versions.filter((v) => v.id !== versionId);
      onVersionsChange(remaining);

      // Remove associated comments from parent state
      const remainingComments = comments.filter((c) => c.audio_version_id !== versionId);
      onCommentsChange(remainingComments);

      // Switch active version
      if (versionId === activeVersionId) {
        const next = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        setActiveVersionId(next);
      }

      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete version:", err);
    } finally {
      setDeleting(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Empty state                                                      */
  /* ---------------------------------------------------------------- */

  if (versions.length === 0) {
    return (
      <div className="space-y-3">
        <div
          className={cn(
            "rounded-lg border border-dashed bg-panel px-6 py-10 text-center transition-colors",
            dragging ? "border-signal bg-signal-muted/30" : "border-border",
          )}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="mx-auto flex items-center justify-center text-muted mb-4">
            <Upload size={32} strokeWidth={1.5} />
          </div>
          <div className="text-sm font-semibold text-text">
            {dragging ? "Drop audio file here" : "No audio files yet"}
          </div>
          <p className="text-sm text-muted mt-1.5 mx-auto max-w-sm">
            {dragging
              ? "Release to upload"
              : "Drag and drop a file, or click below to browse. Supports WAV, AIFF, FLAC, MP3, and AAC."}
          </p>
          {canUpload && (
            <div className="mt-5">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_AUDIO_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
              />
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <FilledUpload size={16} />
                {uploading ? "Uploading..." : "Upload audio"}
              </Button>
              {uploadError && (
                <p className="text-xs text-signal mt-2">{uploadError}</p>
              )}
            </div>
          )}
        </div>
        {uploading && <UploadProgressBar fileName={uploadFileName} progress={uploadProgress} />}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Player render                                                    */
  /* ---------------------------------------------------------------- */

  return (
    <div
      className="space-y-2"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Main player card */}
      <div className="relative rounded-lg border border-border bg-panel overflow-hidden">
        {/* Drag-and-drop overlay */}
        {dragging && canUpload && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-panel/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-signal">
            <div className="flex items-center gap-2 text-sm text-signal font-medium">
              <Upload size={16} />
              Drop to upload new version
            </div>
          </div>
        )}
        {/* Upload dim overlay (no text — progress bar is below) */}
        {uploading && (
          <div className="absolute inset-0 z-20 bg-panel/60 backdrop-blur-[2px] rounded-lg pointer-events-none" />
        )}
        {/* Header: track info + version switcher */}
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-3">
            {coverArtUrl ? (
              <img
                src={coverArtUrl}
                alt=""
                className="w-10 h-10 rounded-md object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-panel2 flex items-center justify-center text-lg text-faint">
                ♪
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-text leading-tight">
                {releaseTitle}
              </div>
              <div className="text-xs text-muted">{trackTitle}</div>
            </div>
          </div>

          {/* Version pills */}
          <div className="flex items-center gap-1 bg-panel2 rounded-md p-0.5">
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  if (v.id === activeVersionId) return;
                  // Capture current position & play state for the ready callback
                  pendingRestoreRef.current = {
                    seekTime: currentTime,
                    shouldPlay: isPlaying,
                  };
                  setActiveVersionId(v.id);
                  setHighlightedCommentId(null);
                  setCommentInput(null);
                }}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-colors",
                  v.id === activeVersionId
                    ? "bg-signal text-signal-on"
                    : "text-muted hover:text-text",
                )}
              >
                v{v.version_number}
              </button>
            ))}
            {canUpload && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-2 py-1 text-xs text-muted hover:text-text transition-colors disabled:opacity-50"
                title="Upload new version"
              >
                +
              </button>
            )}
          </div>
        </div>

        {/* Version metadata lines */}
        <div className="px-5 pt-2 flex items-center gap-2">
          <span className="text-[10px] text-faint uppercase tracking-wider">
            v{activeVersion?.version_number} ·{" "}
            {activeVersion?.created_at
              ? new Date(activeVersion.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>
          <span className="text-[10px] text-faint">
            · {versionComments.length} comment
            {versionComments.length !== 1 ? "s" : ""}
          </span>
          {activeVersion && (
            <span className="text-[10px] text-faint inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  const fileName = activeVersion.file_name || `v${activeVersion.version_number}`;
                  try {
                    const res = await fetch(activeVersion.audio_url);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch {
                    // Fallback: open in new tab
                    window.open(activeVersion.audio_url, "_blank");
                  }
                }}
                className="text-signal hover:opacity-70 transition-opacity"
                title={`Download ${activeVersion.file_name || `v${activeVersion.version_number}`}`}
              >
                <Download size={14} />
              </button>
              {canDelete && (
                deleteConfirmId === activeVersion.id ? (
                  <span className="inline-flex items-center gap-1 ml-1">
                    <span className="text-red-500">Delete v{activeVersion.version_number}?</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVersion(activeVersion.id)}
                      disabled={deleting}
                      className="text-red-500 hover:opacity-70 transition-colors font-semibold"
                    >
                      {deleting ? "…" : "Yes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="text-muted hover:text-text transition-colors"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(activeVersion.id)}
                    className="text-faint hover:text-signal transition-colors"
                    title={`Delete v${activeVersion.version_number}`}
                  >
                    <Trash2 size={13} />
                  </button>
                )
              )}
            </span>
          )}
          {/* Loudness metrics (worker-populated) */}
          {measuredLufs == null &&
            measuredTruePeak == null &&
            qualitySnapshot == null &&
            isAnalysisProcessing && (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-faint">
                <Loader2 size={10} className="animate-spin" />
                Measurements processing
              </span>
            )}
          {(measuredLufs != null ||
            measuredTruePeak != null ||
            (qualitySnapshot != null && qualitySnapshot.issues.length > 0)) && (
            <span className="ml-auto inline-flex items-center gap-3 text-[10px]">
              {measuredLufs != null && (() => {
                const delta = measuredLufs - LUFS_REFERENCE;
                return (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-faint">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!showStreamingInfo && activeVersion) {
                          trackGA4Event("audio_qc_panel_opened", {
                            panel_type: "lufs",
                            version_id: activeVersion.id,
                            surface: "app",
                          });
                        }
                        setShowTruePeakInfo(false);
                        setShowQualityInfo(false);
                        setShowStreamingInfo((v) => !v);
                      }}
                      className="inline-flex items-center gap-1 text-muted hover:text-text transition-colors"
                      title="Show streaming normalization"
                    >
                      {measuredLufs.toFixed(1)} LUFS
                      <ChevronDown
                        size={10}
                        className={cn(
                          "transition-transform",
                          showStreamingInfo && "rotate-180",
                        )}
                      />
                    </button>
                    <span
                      ref={lufsBadgeRef}
                      className={cn(
                        "px-1.5 py-px rounded text-[10px]",
                        Math.abs(delta) <= 0.5
                          ? "bg-status-green/10 text-status-green"
                          : Math.abs(delta) <= 1.5
                            ? "bg-signal-muted text-signal"
                            : "bg-red-500/10 text-red-500",
                      )}
                    >
                      {delta > 0 ? "+" : ""}{delta.toFixed(1)} dB
                    </span>
                  </span>
                );
              })()}
              {measuredTruePeak != null && (() => {
                // True peak is a ceiling: below common target (-1 dBTP) is safe,
                // above it risks lossy-codec clipping, above 0 is inter-sample
                // overs that will clip DSP chains.
                const headroom = TRUE_PEAK_CEILING - measuredTruePeak;
                const colorClass =
                  measuredTruePeak > 0
                    ? "bg-red-500/10 text-red-500"
                    : measuredTruePeak > TRUE_PEAK_CEILING
                      ? "bg-signal-muted text-signal"
                      : "bg-status-green/10 text-status-green";
                const badgeText =
                  headroom >= 0
                    ? `${headroom.toFixed(1)} dB`
                    : `+${Math.abs(headroom).toFixed(1)} dB`;
                return (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-faint">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!showTruePeakInfo && activeVersion) {
                          trackGA4Event("audio_qc_panel_opened", {
                            panel_type: "peak",
                            version_id: activeVersion.id,
                            surface: "app",
                          });
                        }
                        setShowStreamingInfo(false);
                        setShowQualityInfo(false);
                        setShowTruePeakInfo((v) => !v);
                      }}
                      className="inline-flex items-center gap-1 text-muted hover:text-text transition-colors"
                      title="Show true peak targets"
                    >
                      {measuredTruePeak.toFixed(1)} dBTP
                      <ChevronDown
                        size={10}
                        className={cn(
                          "transition-transform",
                          showTruePeakInfo && "rotate-180",
                        )}
                      />
                    </button>
                    <span
                      ref={truePeakBadgeRef}
                      className={cn("px-1.5 py-px rounded text-[10px]", colorClass)}
                      title={
                        headroom >= 0
                          ? `${headroom.toFixed(1)} dB below the ${TRUE_PEAK_CEILING} dBTP ceiling`
                          : `${Math.abs(headroom).toFixed(1)} dB over the ${TRUE_PEAK_CEILING} dBTP ceiling`
                      }
                    >
                      {badgeText}
                    </span>
                  </span>
                );
              })()}
              {qualitySnapshot != null && qualitySnapshot.issues.length > 0 && (() => {
                const { issues, severe } = qualitySnapshot;
                const colorClass = severe
                  ? "bg-red-500/10 text-red-500"
                  : "bg-signal-muted text-signal";
                const label =
                  issues.length > 1
                    ? `${issues.length} issues`
                    : issues[0] === "clipping"
                      ? "Clipping detected"
                      : issues[0] === "peak_at_full_scale"
                        ? "Peak at full scale"
                        : "DC offset detected";
                return (
                  <span ref={qualityBadgeRef} className="inline-flex items-center gap-1.5">
                    <span className="text-faint">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!showQualityInfo && activeVersion) {
                          trackGA4Event("audio_qc_panel_opened", {
                            panel_type: "quality",
                            version_id: activeVersion.id,
                            surface: "app",
                          });
                        }
                        setShowStreamingInfo(false);
                        setShowTruePeakInfo(false);
                        setShowQualityInfo((v) => !v);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-px rounded text-[10px] transition-colors",
                        colorClass,
                      )}
                      title="Show audio quality issues"
                    >
                      <AlertTriangle size={10} />
                      {label}
                      <ChevronDown
                        size={10}
                        className={cn(
                          "transition-transform",
                          showQualityInfo && "rotate-180",
                        )}
                      />
                    </button>
                  </span>
                );
              })()}
            </span>
          )}
        </div>

        {/* File info line */}
        {activeVersion && (
          <div className="px-5 pt-1 flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[10px] text-faint">
              {activeVersion.file_name && (
                <span className="truncate max-w-[360px]">{activeVersion.file_name}</span>
              )}
              {activeVersion.file_format && (
                <>
                  {activeVersion.file_name && <span>·</span>}
                  <span>{activeVersion.file_format}</span>
                </>
              )}
              {activeVersion.sample_rate != null && (
                <>
                  <span>·</span>
                  <span>{formatSampleRate(activeVersion.sample_rate)}</span>
                </>
              )}
              {activeVersion.bit_depth != null && (
                <>
                  <span>·</span>
                  <span>{formatBitDepth(activeVersion.bit_depth, activeVersion.file_format)}</span>
                </>
              )}
              {activeVersion.channels != null && (
                <>
                  <span>·</span>
                  <span>{formatChannels(activeVersion.channels)}</span>
                </>
              )}
              {/* Analysis status indicator — only show when specs not yet populated */}
              {!hasDetectedSpecs && (activeVersion.spec_analysis_status === "pending" || activeVersion.spec_analysis_status === "analyzing") ? (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Loader2 size={9} className="animate-spin" />
                    Analyzing
                  </span>
                </>
              ) : null}
            </div>

            {/* Spec match / mismatch indicator */}
            {hasDetectedSpecs && targetSpecs && hasTargetSpecs(targetSpecs) && (
              specMismatches.length === 0 ? (
                <div className="flex items-center gap-1 text-[10px] text-status-green">
                  <CheckCircle2 size={10} />
                  <span>Specs match target</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5 text-[10px] text-amber-500">
                  <AlertTriangle size={10} className="mt-px shrink-0" />
                  <span>
                    Mismatch: {specMismatches.map((m) => `${m.label} (${m.actual}, target ${m.expected})`).join(", ")}
                  </span>
                </div>
              )
            )}

            {activeVersion.spec_analysis_status === "failed" && !hasDetectedSpecs && (
              <div className="flex items-center gap-1 text-[10px] text-faint">
                <AlertTriangle size={10} />
                <span>Could not analyze audio specs</span>
              </div>
            )}
          </div>
        )}

        {/* Comment markers above waveform */}
        <div className="relative px-5 mt-3 h-5">
          {(() => {
            const markerDuration = duration || activeVersion?.duration_seconds || 0;
            return isReady && markerDuration > 0 && versionComments.map((c) => {
              const pos = ((c.timecode_seconds ?? 0) / markerDuration) * 100;
              const color = authorColorMap.get(c.author) ?? AUTHOR_COLORS[0];
              const isActive = highlightedCommentId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setHighlightedCommentId(isActive ? null : c.id);
                    seekToTime(c.timecode_seconds ?? 0);
                  }}
                  className="absolute top-0 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                  style={{
                    left: `${pos}%`,
                    background: isActive ? color : "transparent",
                    border: `1.5px solid ${color}`,
                    color: isActive ? "#fff" : color,
                    zIndex: isActive ? 10 : 1,
                  }}
                  title={`${c.author}: ${c.content}`}
                >
                  <MessageCircle size={10} />
                </button>
              );
            });
          })()}
        </div>

        {/* Waveform container */}
        <div className="px-5">
          <div className="relative">
            <div
              ref={containerRef}
              className={cn(
                "w-full transition-opacity",
                isReady ? "opacity-100" : "opacity-0 absolute inset-0",
              )}
            />
            {!isReady && (
              <div className="flex items-end gap-[1px] h-[80px] animate-pulse">
                {Array.from({ length: 150 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-[2px] rounded-sm bg-muted/25"
                    style={{ height: `${20 + Math.abs(Math.sin(i * 0.3)) * 55}%` }}
                  />
                ))}
              </div>
            )}
          </div>
          {canComment && isReady && (
            <p className="text-center text-[10px] text-faint mt-1.5 select-none">
              double-click waveform to add comment
            </p>
          )}
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-muted min-w-[42px]">
            {formatTime(currentTime)}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={returnToStart}
              className="text-muted hover:text-text transition-colors p-1"
              title="Return to start"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={skipBack}
              className="text-muted hover:text-text transition-colors p-1"
              title="Skip -10s"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={togglePlayPause}
              disabled={!isReady}
              className="w-10 h-10 rounded-full bg-signal text-signal-on flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
            >
              {isPlaying ? <FilledPause size={18} /> : <FilledPlay size={18} className="ml-0.5" />}
            </button>
            <button
              onClick={skipForward}
              className="text-muted hover:text-text transition-colors p-1"
              title="Skip +10s"
            >
              <SkipForward size={16} />
            </button>
            <button
              onClick={audio.toggleLoop}
              className={cn(
                "transition-colors p-1",
                audio.isLooping
                  ? "text-signal"
                  : "text-muted hover:text-text",
              )}
              title={audio.isLooping ? "Loop (on)" : "Loop"}
            >
              <Repeat size={16} />
            </button>
          </div>
          <span className="text-xs text-faint min-w-[42px] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Comments section */}
      <div className="rounded-lg border border-border bg-panel overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            Feedback
          </span>
          <span className="text-[11px] text-faint">
            {versionComments.length} note
            {versionComments.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-2">
          {/* New comment input */}
          {commentInput && (
            <NewCommentInput
              timecode={commentInput.timecode}
              text={newCommentText}
              onTextChange={setNewCommentText}
              onSubmit={handleSubmitComment}
              onCancel={() => {
                setCommentInput(null);
                setNewCommentText("");
              }}
            />
          )}

          {/* Comment thread */}
          {versionComments.length > 0 ? (
            <div className="space-y-px">
              {versionComments.map((c) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  color={authorColorMap.get(c.author) ?? AUTHOR_COLORS[0]}
                  isActive={highlightedCommentId === c.id}
                  onDelete={
                    c.author === currentUserName
                      ? () => handleDeleteComment(c.id)
                      : undefined
                  }
                  onClick={() => {
                    setHighlightedCommentId(
                      highlightedCommentId === c.id ? null : c.id,
                    );
                    seekToTime(c.timecode_seconds ?? 0);
                  }}
                />
              ))}
            </div>
          ) : (
            !commentInput && (
              <div className="text-center py-8">
                <MessageCircle size={24} strokeWidth={1.5} className="mx-auto text-muted mb-2" />
                <p className="text-sm font-semibold text-text">No comments yet</p>
                <p className="text-xs text-muted mt-1">Click anywhere on the waveform to leave a timestamped note.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Streaming normalization dropdown — fixed position to escape overflow-hidden */}
      {showStreamingInfo && measuredLufs != null && dropdownPos && (
        <div
          className="fixed z-50 rounded-md border border-border shadow-lg overflow-hidden"
          style={{ top: dropdownPos.top, right: dropdownPos.right, background: "var(--panel-2)" }}
        >
          <table className="text-[11px]">
            <tbody>
              {LOUDNESS_GROUPS.map((group) => {
                const targets = LOUDNESS_TARGETS.filter((t) => t.group === group);
                return [
                  <tr key={`h-${group}`}>
                    <td colSpan={3} className="px-3 pt-2 pb-1 text-[9px] font-semibold text-faint uppercase tracking-wider font-sans">
                      {group}
                    </td>
                  </tr>,
                  ...targets.map((t) => {
                    const adj = measuredLufs - t.lufs;
                    return (
                      <tr key={t.name} className="leading-6">
                        <td
                          className="pl-3 pr-4 text-muted font-sans whitespace-nowrap cursor-help"
                          title={t.description}
                        >
                          {t.name}
                        </td>
                        <td className="pr-4 text-faint text-right whitespace-nowrap">{t.lufs}</td>
                        <td
                          className={cn(
                            "pr-3 text-right whitespace-nowrap",
                            Math.abs(adj) < 0.05
                              ? "text-status-green"
                              : adj > 0
                                ? "text-signal"
                                : "text-muted",
                          )}
                        >
                          {Math.abs(adj) < 0.05
                            ? "no change"
                            : adj > 0
                              ? `−${adj.toFixed(1)} dB`
                              : `+${Math.abs(adj).toFixed(1)} dB`}
                        </td>
                      </tr>
                    );
                  }),
                ];
              })}
            </tbody>
          </table>
          <div className="h-1.5" />
        </div>
      )}

      {/* True peak target dropdown — same pattern as LUFS, but measures
          against a ceiling (pass if ≤ target, over if > target). */}
      {showTruePeakInfo && measuredTruePeak != null && truePeakDropdownPos && (
        <div
          className="fixed z-50 rounded-md border border-border shadow-lg overflow-hidden"
          style={{ top: truePeakDropdownPos.top, right: truePeakDropdownPos.right, background: "var(--panel-2)" }}
        >
          <table className="text-[11px]">
            <tbody>
              {LOUDNESS_GROUPS.map((group) => {
                const targets = TRUE_PEAK_TARGETS.filter((t) => t.group === group);
                return [
                  <tr key={`tp-h-${group}`}>
                    <td colSpan={3} className="px-3 pt-2 pb-1 text-[9px] font-semibold text-faint uppercase tracking-wider font-sans">
                      {group}
                    </td>
                  </tr>,
                  ...targets.map((t) => {
                    const headroom = t.dbtp - measuredTruePeak;
                    // headroom > 0 = under ceiling (green), == 0 = exactly at,
                    // < 0 = over (amber/red depending on how far).
                    const over = headroom < 0;
                    const rightColor = over
                      ? Math.abs(headroom) > 1
                        ? "text-red-500"
                        : "text-signal"
                      : "text-status-green";
                    return (
                      <tr key={`tp-${t.name}`} className="leading-6">
                        <td
                          className="pl-3 pr-4 text-muted font-sans whitespace-nowrap cursor-help"
                          title={t.description}
                        >
                          {t.name}
                        </td>
                        <td className="pr-4 text-faint text-right whitespace-nowrap">{t.dbtp}</td>
                        <td className={cn("pr-3 text-right whitespace-nowrap", rightColor)}>
                          {over
                            ? `+${Math.abs(headroom).toFixed(1)} dB over`
                            : `${headroom.toFixed(1)} dB headroom`}
                        </td>
                      </tr>
                    );
                  }),
                ];
              })}
            </tbody>
          </table>
          <div className="h-1.5" />
        </div>
      )}

      {/* Quality check dropdown — shows per-issue detail and remediation tips.
          Pill only appears when at least one issue is detected, so this block
          always has something meaningful to display when open. */}
      {showQualityInfo && qualitySnapshot != null && qualityDropdownPos && (
        <div
          className="fixed z-50 rounded-md border border-border shadow-lg overflow-hidden max-w-[320px]"
          style={{ top: qualityDropdownPos.top, right: qualityDropdownPos.right, background: "var(--panel-2)" }}
        >
          <div className="px-3 pt-2 pb-1 text-[9px] font-semibold text-faint uppercase tracking-wider font-sans">
            Quality check
          </div>
          <div className="flex flex-col gap-2 px-3 py-2 text-[11px] font-sans">
            {qualitySnapshot.issues.includes("clipping") && (
              <div>
                <div className="text-text font-semibold">Clipping</div>
                <div className="text-muted">
                  {qualitySnapshot.clipSampleCount?.toLocaleString() ?? "?"} clipped samples detected. Reduce output gain or check your limiter ceiling.
                </div>
              </div>
            )}
            {qualitySnapshot.issues.includes("peak_at_full_scale") && (
              <div>
                <div className="text-text font-semibold">Sample peak at full scale</div>
                <div className="text-muted">
                  Peak {qualitySnapshot.samplePeakDbfs != null ? `${qualitySnapshot.samplePeakDbfs.toFixed(2)} dBFS` : "at 0 dBFS"}. Leave at least 0.3 dB of headroom for DSP processing.
                </div>
              </div>
            )}
            {qualitySnapshot.issues.includes("dc_offset") && (
              <div>
                <div className="text-text font-semibold">DC offset</div>
                <div className="text-muted">
                  {qualitySnapshot.dcOffset != null ? `Offset of ${qualitySnapshot.dcOffset.toFixed(4)} detected. ` : ""}
                  Apply a high-pass filter at 20 Hz or lower to remove.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_AUDIO_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = "";
        }}
      />

      {uploadError && (
        <p className="text-xs text-red-500 text-center">{uploadError}</p>
      )}

      {uploading && <UploadProgressBar fileName={uploadFileName} progress={uploadProgress} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  UploadProgressBar                                                  */
/* ------------------------------------------------------------------ */

function UploadProgressBar({
  fileName,
  progress,
}: {
  fileName: string | null;
  progress: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0 text-muted animate-spin">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="32 16" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-text truncate">{fileName ?? "Uploading..."}</span>
            <span className="text-sm text-muted tabular-nums shrink-0 ml-3">{progress}%</span>
          </div>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-signal transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CommentRow                                                         */
/* ------------------------------------------------------------------ */

function CommentRow({
  comment,
  color,
  isActive,
  onDelete,
  onClick,
}: {
  comment: TimelineComment;
  color: string;
  isActive: boolean;
  onDelete?: () => void;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isActive]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "group flex gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-colors",
        isActive
          ? "bg-black/[0.06]"
          : "hover:bg-black/[0.03]",
      )}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{ background: color }}
      >
        {getInitials(comment.author)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-text">
            {comment.author}
          </span>
          <span className="text-[11px] text-signal bg-signal-muted px-1.5 py-px rounded">
            {formatTime(comment.timecode_seconds ?? 0)}
          </span>
          <span className="text-xs text-muted">&middot;</span>
          <Timestamp date={comment.created_at} className="text-xs text-muted" />
        </div>
        <p className="text-xs text-muted leading-relaxed">{comment.content}</p>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted hover:text-red-500 transition-all shrink-0 self-center"
          title="Delete comment"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NewCommentInput                                                    */
/* ------------------------------------------------------------------ */

function NewCommentInput({
  timecode,
  text,
  onTextChange,
  onSubmit,
  onCancel,
}: {
  timecode: number;
  text: string;
  onTextChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="bg-signal-muted border border-signal/20 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-1.5 mb-2 text-[11px] text-signal">
        <MessageCircle size={12} />
        Comment at {formatTime(timecode)}
      </div>
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Add your feedback…"
        rows={2}
        className="input text-sm w-full resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && text.trim()) {
            e.preventDefault();
            onSubmit();
          }
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onCancel}
          className="text-xs text-muted hover:text-text transition-colors px-3 py-1.5 border border-border rounded"
        >
          Cancel
        </button>
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!text.trim()}
          className="!h-auto !py-1.5 !px-3 !text-xs"
        >
          Add Comment
        </Button>
      </div>
    </div>
  );
}
