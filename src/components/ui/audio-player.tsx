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
  MessageCircle,
  ChevronDown,
  X,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";

/** Read waveform CSS variables from the live document. */
function getWaveColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    wave: s.getPropertyValue("--wave").trim() || "rgba(20, 20, 20, 0.15)",
    progress: s.getPropertyValue("--wave-progress").trim() || "rgba(20, 20, 20, 0.38)",
  };
}

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
  targetLoudness: string | null;
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

const AUTHOR_COLORS = [
  "#FE5E0E", "#6B8AFF", "#8B5CF6", "#22C55E", "#EAB308",
  "#EC4899", "#14B8A6", "#F97316",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Parse numeric LUFS value from a string like "-14 LUFS". Defaults to -14. */
function parseLufsTarget(target: string | null): number {
  if (!target) return -14;
  const match = target.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : -14;
}

/** Loudness targets for the streaming / broadcast / social normalization table. */
const LOUDNESS_TARGETS = [
  { name: "Spotify",         lufs: -14, group: "Streaming" },
  { name: "Apple Music",     lufs: -16, group: "Streaming" },
  { name: "YouTube",         lufs: -14, group: "Streaming" },
  { name: "Tidal",           lufs: -14, group: "Streaming" },
  { name: "Amazon Music",    lufs: -14, group: "Streaming" },
  { name: "Deezer",          lufs: -15, group: "Streaming" },
  { name: "Qobuz",           lufs: -14, group: "Streaming" },
  { name: "Pandora",         lufs: -14, group: "Streaming" },
  { name: "EBU R128",        lufs: -23, group: "Broadcast" },
  { name: "ATSC A/85",       lufs: -24, group: "Broadcast" },
  { name: "ITU-R BS.1770",   lufs: -24, group: "Broadcast" },
  { name: "Instagram/Reels", lufs: -14, group: "Social" },
  { name: "TikTok",          lufs: -14, group: "Social" },
  { name: "Facebook",        lufs: -16, group: "Social" },
] as const;

const LOUDNESS_GROUPS = ["Streaming", "Broadcast", "Social"] as const;

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
  targetLoudness,
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

  // Comment state
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ timecode: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WaveSurfer ref
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Defer WaveSurfer creation to the next frame so the container has
    // been laid-out and has real dimensions.  This fixes the blank
    // waveform that sometimes appears on initial mount.
    const container = containerRef.current;
    let ws: WaveSurfer | null = null;
    const raf = requestAnimationFrame(() => {
      if (!container || !container.isConnected) return;

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

      ws.on("ready", () => {
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
          supabase
            .from("track_audio_versions")
            .update({
              waveform_peaks: peaks,
              duration_seconds: ws!.getDuration(),
            })
            .eq("id", activeVersion.id)
            .then(() => {
              onVersionsChange(
                versions.map((v) =>
                  v.id === activeVersion.id
                    ? { ...v, waveform_peaks: peaks, duration_seconds: ws!.getDuration() }
                    : v,
                ),
              );
            });
        }

        // Measure LUFS if not cached
        if (activeVersion.measured_lufs == null) {
          measureAbortRef.current?.abort();
          const controller = new AbortController();
          measureAbortRef.current = controller;
          setMeasuring(true);

          (async () => {
            try {
              const [{ decodeAudioFromUrl }, { measureLUFS }] = await Promise.all([
                import("@/lib/decode-audio"),
                import("@/lib/lufs"),
              ]);
              const audioBuffer = await decodeAudioFromUrl(
                activeVersion.audio_url,
                controller.signal,
              );
              if (controller.signal.aborted) return;

              const lufs = measureLUFS(audioBuffer);
              if (controller.signal.aborted) return;

              const rounded = Math.round(lufs * 100) / 100;

              await supabase
                .from("track_audio_versions")
                .update({ measured_lufs: rounded })
                .eq("id", activeVersion.id);

              if (controller.signal.aborted) return;

              setMeasuredLufs(rounded);
              onVersionsChange(
                versions.map((v) =>
                  v.id === activeVersion.id ? { ...v, measured_lufs: rounded } : v,
                ),
              );
            } catch (err) {
              if (err instanceof DOMException && err.name === "AbortError") return;
              console.warn("LUFS measurement failed:", err);
            } finally {
              if (!controller.signal.aborted) setMeasuring(false);
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
    });

    return () => {
      cancelAnimationFrame(raf);
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
  /*  Empty state                                                      */
  /* ---------------------------------------------------------------- */

  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-panel p-8 text-center">
        <div className="text-3xl mb-3 opacity-20">♪</div>
        <p className="text-sm text-muted mb-4">
          Upload an audio file to start reviewing this track.
        </p>
        {canUpload && (
          <>
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
              {uploading ? "Uploading…" : "Upload Audio"}
            </Button>
            {uploadError && (
              <p className="text-xs text-red-500 mt-2">{uploadError}</p>
            )}
          </>
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

        {/* Version metadata line */}
        <div className="px-5 pt-2 flex items-center gap-2">
          <span className="text-[10px] font-mono text-faint uppercase tracking-wider">
            v{activeVersion?.version_number} ·{" "}
            {activeVersion?.created_at
              ? new Date(activeVersion.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>
          <span className="text-[10px] font-mono text-faint">
            · {versionComments.length} comment
            {versionComments.length !== 1 ? "s" : ""}
          </span>
          {activeVersion && (
            <span className="text-[10px] font-mono text-faint inline-flex items-center gap-1.5">
              {activeVersion.file_name && <>· {activeVersion.file_name}</>}
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
            </span>
          )}
          {/* LUFS measurement */}
          {measuring && (
            <span className="text-[10px] font-mono text-faint animate-pulse">
              · measuring…
            </span>
          )}
          {measuredLufs != null && !measuring && (() => {
            const target = parseLufsTarget(targetLoudness);
            const delta = measuredLufs - target;
            return (
              <span className="relative">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono">
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
                {/* Streaming normalization dropdown */}
                {showStreamingInfo && (
                  <div className="absolute left-0 top-full mt-2 z-20 rounded-md bg-panel2 border border-border overflow-hidden">
                    <table className="text-[11px] font-mono">
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
              </span>
            );
          })()}
        </div>

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
          <span className="font-mono text-xs text-muted min-w-[42px]">
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
          <span className="font-mono text-xs text-faint min-w-[42px] text-right">
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
          <span className="text-[11px] font-mono text-faint">
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
              <p className="text-center py-8 text-sm text-faint">
                No comments on this version yet
              </p>
            )
          )}
        </div>
      </div>

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
          <span className="text-[11px] font-mono text-signal bg-signal-muted px-1.5 py-px rounded">
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
      <div className="flex items-center gap-1.5 mb-2 text-[11px] font-mono text-signal">
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
