"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import { Timestamp } from "@/components/ui/timestamp";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useAudio, type AudioTrackMeta } from "@/lib/audio-context";
import { useTheme } from "next-themes";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload,
  Download,
  Trash2,
  MessageCircle,
  ChevronDown,
  X,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import {
  getWaveColors,
  formatTime,
  formatSampleRate,
  formatBitDepth,
  LUFS_REFERENCE,
  LOUDNESS_TARGETS,
  LOUDNESS_GROUPS,
  AUTHOR_COLORS,
} from "@/components/ui/audio-player-shared";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AudioVersionData = {
  id: string;
  track_id: string;
  version_number: number;
  audio_url: string;
  file_name: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  waveform_peaks: number[][] | null;
  measured_lufs: number | null;
  sample_rate: number | null;
  bit_depth: number | null;
  file_format: string | null;
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

  // LUFS measurement state
  const [measuredLufs, setMeasuredLufs] = useState<number | null>(
    activeVersion?.measured_lufs ?? null,
  );
  const [measuring, setMeasuring] = useState(false);
  const [showStreamingInfo, setShowStreamingInfo] = useState(false);
  const measureAbortRef = useRef<AbortController | null>(null);
  const lufsBadgeRef = useRef<HTMLSpanElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

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

  // Comment state
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ timecode: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // WaveSurfer ref
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Sync measuredLufs when active version changes
  useEffect(() => {
    setMeasuredLufs(activeVersion?.measured_lufs ?? null);
    setShowStreamingInfo(false);
  }, [activeVersion?.id, activeVersion?.measured_lufs]);

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
      ws = WaveSurfer.create({
        container,
        media: audioElement,
        url: activeVersion.audio_url,
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
        setIsReady(true);

        // Sync context state (URL already matches so this is state-only)
        audio.loadVersion(activeVersion, trackMeta);

        // Restore playback position and play/pause state
        const restore = pendingRestoreRef.current;
        pendingRestoreRef.current = null;
        if (restore) {
          const maxDur =
            activeVersion.duration_seconds || audioElement.duration || Infinity;
          if (restore.seekTime > 0 && restore.seekTime <= maxDur) {
            audioElement.currentTime = restore.seekTime;
          }
          if (restore.shouldPlay) {
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

        // Measure LUFS + extract file metadata if not cached.
        // Both share the same fetch/decode pipeline to avoid double-downloading.
        const needsLufs = activeVersion.measured_lufs == null;
        const needsMeta = activeVersion.sample_rate == null;

        if (needsLufs || needsMeta) {
          measureAbortRef.current?.abort();
          const controller = new AbortController();
          measureAbortRef.current = controller;
          if (needsLufs) setMeasuring(true);

          (async () => {
            try {
              const [{ decodeAudioWithRawBuffer }, { measureLUFS }, { parseAudioHeaderMetadata }] =
                await Promise.all([
                  import("@/lib/decode-audio"),
                  import("@/lib/lufs"),
                  import("@/lib/parse-audio-metadata"),
                ]);

              const { audioBuffer, rawBuffer } = await decodeAudioWithRawBuffer(
                activeVersion.audio_url,
                controller.signal,
              );
              if (controller.signal.aborted || cancelled) return;

              // Parse binary headers for bit depth + format
              const headerMeta = needsMeta
                ? parseAudioHeaderMetadata(rawBuffer, activeVersion.file_name)
                : null;

              // Measure LUFS
              const lufs = needsLufs ? measureLUFS(audioBuffer) : null;
              if (controller.signal.aborted || cancelled) return;

              // Build DB update payload
              const dbUpdate: Record<string, unknown> = {};
              let roundedLufs: number | null = null;
              if (lufs != null) {
                roundedLufs = Math.round(lufs * 100) / 100;
                dbUpdate.measured_lufs = roundedLufs;
              }
              if (headerMeta) {
                dbUpdate.sample_rate = audioBuffer.sampleRate;
                dbUpdate.bit_depth = headerMeta.bitDepth;
                dbUpdate.file_format = headerMeta.fileFormat;
              }

              await supabase
                .from("track_audio_versions")
                .update(dbUpdate)
                .eq("id", activeVersion.id);

              if (controller.signal.aborted || cancelled) return;

              if (roundedLufs != null) setMeasuredLufs(roundedLufs);

              onVersionsChange(
                versionsRef.current.map((v) =>
                  v.id === activeVersion.id
                    ? {
                        ...v,
                        ...(roundedLufs != null ? { measured_lufs: roundedLufs } : {}),
                        ...(headerMeta
                          ? {
                              sample_rate: audioBuffer.sampleRate,
                              bit_depth: headerMeta.bitDepth,
                              file_format: headerMeta.fileFormat,
                            }
                          : {}),
                      }
                    : v,
                ),
              );
            } catch (err) {
              if (err instanceof DOMException && err.name === "AbortError") return;
              console.warn("Audio analysis failed:", err);
            } finally {
              if (!controller.signal.aborted && !cancelled) setMeasuring(false);
            }
          })();
        }
      });

      ws.on("dblclick", () => {
        if (!canComment) return;
        const time = ws!.getCurrentTime();
        setCommentInput({ timecode: time });
        audioElement.pause();
      });

      wavesurferRef.current = ws;
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
      if (ws) ws.destroy();
      wavesurferRef.current = null;
      measureAbortRef.current?.abort();
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

  const skipBack = useCallback(() => {
    audio.seekTo(0);
  }, [audio]);

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
    setUploadError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const nextVersion = versions.length + 1;
      const ext = file.name.split(".").pop() ?? "wav";
      const path = `${user.id}/${trackId}/v${nextVersion}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("track-audio")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("track-audio")
        .getPublicUrl(path);

      const { data, error } = await supabase
        .from("track_audio_versions")
        .insert({
          track_id: trackId,
          version_number: nextVersion,
          audio_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: currentUserName,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const updated = [...versions, data];
        onVersionsChange(updated);
        setActiveVersionId(data.id);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
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

      // Delete from storage — extract path from public URL
      try {
        const url = new URL(version.audio_url);
        const pathMatch = url.pathname.match(/\/track-audio\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from("track-audio").remove([decodeURIComponent(pathMatch[1])]);
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
      <div className="rounded-lg border border-dashed border-border bg-panel px-6 py-10 text-center">
        <div className="mx-auto flex items-center justify-center text-muted mb-4">
          <Upload size={32} strokeWidth={1.5} />
        </div>
        <div className="text-sm font-semibold text-text">No audio files yet</div>
        <p className="text-sm text-muted mt-1.5 mx-auto max-w-sm">
          Upload a mix to start the review process with waveform playback, versioning, and timestamped comments.
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
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload audio"}
            </Button>
            {uploadError && (
              <p className="text-xs text-signal mt-2">{uploadError}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Player render                                                    */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-2">
      {/* Main player card */}
      <div className="rounded-lg border border-border bg-panel overflow-hidden">
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
                    ? "bg-signal text-white"
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
                    <span className="text-signal">Delete v{activeVersion.version_number}?</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVersion(activeVersion.id)}
                      disabled={deleting}
                      className="text-signal hover:text-red-500 transition-colors font-semibold"
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
          {/* LUFS measurement */}
          {measuring && (
            <span className="text-[10px] text-faint animate-pulse">
              · measuring…
            </span>
          )}
          {measuredLufs != null && !measuring && (() => {
            const delta = measuredLufs - LUFS_REFERENCE;
            return (
              <span className="ml-auto inline-flex items-center gap-1.5 text-[10px]">
                <span className="text-faint">·</span>
                <button
                  type="button"
                  onClick={() => setShowStreamingInfo((v) => !v)}
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
        </div>

        {/* File info line */}
        {activeVersion && (
          <div className="px-5 pt-1 flex items-center gap-1 text-[10px] text-faint">
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
              onClick={skipBack}
              className="text-muted hover:text-text transition-colors p-1"
              title="Restart"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={togglePlayPause}
              disabled={!isReady}
              className="w-10 h-10 rounded-full bg-signal text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button
              onClick={skipForward}
              className="text-muted hover:text-text transition-colors p-1"
              title="Skip +10s"
            >
              <SkipForward size={16} />
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
                        <td className="pl-3 pr-4 text-muted font-sans whitespace-nowrap">{t.name}</td>
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
