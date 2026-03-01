"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import { useAudio, type AudioTrackMeta } from "@/lib/audio-context";
import { useTheme } from "next-themes";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  ChevronDown,
  Lock,
  MessageCircle,
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
import { Button } from "@/components/ui/button";
import type { AudioVersionData, TimelineComment } from "@/components/ui/audio-player";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

type PortalAudioPlayerProps = {
  shareToken: string;
  trackId: string;
  releaseId: string;
  versions: AudioVersionData[];
  initialComments: TimelineComment[];
  coverArtUrl: string | null;
  trackTitle: string;
  releaseTitle: string;
  downloadEnabled: boolean;
  paymentGated: boolean;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Timestamp({ date, className }: { date: string; className?: string }) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  let text: string;
  if (diffMins < 1) text = "just now";
  else if (diffMins < 60) text = `${diffMins}m ago`;
  else if (diffHrs < 24) text = `${diffHrs}h ago`;
  else if (diffDays < 7) text = `${diffDays}d ago`;
  else text = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return <span className={className}>{text}</span>;
}

const CLIENT_NAME_KEY = "portal_client_name";

/* ------------------------------------------------------------------ */
/*  PortalAudioPlayer                                                  */
/* ------------------------------------------------------------------ */

export function PortalAudioPlayer({
  shareToken,
  trackId,
  releaseId,
  versions,
  initialComments,
  coverArtUrl,
  trackTitle,
  releaseTitle,
  downloadEnabled,
  paymentGated,
}: PortalAudioPlayerProps) {
  const { resolvedTheme } = useTheme();
  const audio = useAudio();
  const { audioElement, isPlaying, currentTime, duration } = audio;

  // Version state
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

  const [isReady, setIsReady] = useState(false);

  const trackMeta: AudioTrackMeta = useMemo(
    () => ({ trackId, releaseId, trackTitle, releaseTitle, coverArtUrl }),
    [trackId, releaseId, trackTitle, releaseTitle, coverArtUrl],
  );

  const pendingRestoreRef = useRef<{
    seekTime: number;
    shouldPlay: boolean;
  } | null>(null);

  // LUFS display state
  const measuredLufs = activeVersion?.measured_lufs ?? null;
  const [showStreamingInfo, setShowStreamingInfo] = useState(false);
  const lufsBadgeRef = useRef<HTMLSpanElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    right: number;
  } | null>(null);

  // Comment state
  const [comments, setComments] = useState<TimelineComment[]>(initialComments);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ timecode: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [clientName, setClientName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(CLIENT_NAME_KEY) || "";
  });
  const [showNameInput, setShowNameInput] = useState(false);

  // Filtered comments for active version
  const versionComments = useMemo(
    () =>
      comments
        .filter((c) => c.audio_version_id === activeVersionId && c.timecode_seconds != null)
        .sort((a, b) => (a.timecode_seconds ?? 0) - (b.timecode_seconds ?? 0)),
    [comments, activeVersionId],
  );

  // Author color map
  const authorColorMap = useMemo(() => {
    const uniqueAuthors = [...new Set(comments.map((c) => c.author))].sort();
    return new Map(
      uniqueAuthors.map((a, i) => [a, AUTHOR_COLORS[i % AUTHOR_COLORS.length]]),
    );
  }, [comments]);

  // Position streaming dropdown
  useEffect(() => {
    if (!showStreamingInfo || !lufsBadgeRef.current) {
      setDropdownPos(null);
      return;
    }
    const update = () => {
      const rect = lufsBadgeRef.current?.getBoundingClientRect();
      if (rect)
        setDropdownPos({
          top: rect.bottom + 6,
          right: window.innerWidth - rect.right,
        });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [showStreamingInfo]);

  useEffect(() => {
    setShowStreamingInfo(false);
  }, [activeVersion?.id]);

  // WaveSurfer refs
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------------------- */
  /*  WaveSurfer lifecycle                                             */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!containerRef.current || !activeVersion) return;

    if (!pendingRestoreRef.current) {
      const wasPlaying = !audioElement.paused;
      const currentPos = audioElement.currentTime;
      if (wasPlaying || currentPos > 0) {
        pendingRestoreRef.current = {
          seekTime: currentPos,
          shouldPlay: wasPlaying,
        };
      }
    }

    setIsReady(false);

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

      // Double-click to add comment
      ws.on("dblclick", (relativeX: number) => {
        const dur = activeVersion.duration_seconds || audioElement.duration || 0;
        if (dur <= 0) return;
        const time = relativeX * dur;
        setCommentInput({ timecode: time });
        setHighlightedCommentId(null);
      });

      ws.on("ready", () => {
        setIsReady(true);
        audio.loadVersion(activeVersion, trackMeta);

        const restore = pendingRestoreRef.current;
        pendingRestoreRef.current = null;
        if (restore) {
          const maxDur =
            activeVersion.duration_seconds ||
            audioElement.duration ||
            Infinity;
          if (restore.seekTime > 0 && restore.seekTime <= maxDur) {
            audioElement.currentTime = restore.seekTime;
          }
          if (restore.shouldPlay) {
            audioElement.play().catch(() => {});
          }
        }
      });

      wavesurferRef.current = ws;
    });

    return () => {
      cancelAnimationFrame(raf);
      if (ws) ws.destroy();
      wavesurferRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVersion?.id, audioElement]);

  // Update waveform colors on theme change
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
    (time: number) => {
      audio.seekTo(time);
    },
    [audio],
  );

  /* ---------------------------------------------------------------- */
  /*  Download handler                                                 */
  /* ---------------------------------------------------------------- */

  async function handleDownload() {
    if (!activeVersion) return;
    const fileName =
      activeVersion.file_name || `v${activeVersion.version_number}`;
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
      window.open(activeVersion.audio_url, "_blank");
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Comment handlers                                                 */
  /* ---------------------------------------------------------------- */

  async function handleSubmitComment() {
    if (!newCommentText.trim() || !commentInput || !activeVersionId) return;

    // Ensure we have a name
    const name = clientName.trim() || "";
    if (!name) {
      setShowNameInput(true);
      return;
    }

    // Save name to localStorage
    localStorage.setItem(CLIENT_NAME_KEY, name);

    try {
      const res = await fetch("/api/portal/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_token: shareToken,
          track_id: trackId,
          audio_version_id: activeVersionId,
          content: newCommentText.trim(),
          timecode_seconds: Math.round(commentInput.timecode * 100) / 100,
          author_name: name,
        }),
      });

      if (!res.ok) return;
      const data = await res.json();
      setComments((prev) => [data, ...prev]);
      setNewCommentText("");
      setCommentInput(null);
      setHighlightedCommentId(data.id);
    } catch {
      // Silently fail
    }
  }

  async function handleDeleteComment(commentId: string) {
    const prev = comments;
    setComments(comments.filter((c) => c.id !== commentId));
    if (highlightedCommentId === commentId) setHighlightedCommentId(null);

    try {
      const res = await fetch("/api/portal/comment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_token: shareToken,
          comment_id: commentId,
          author_name: clientName.trim() || "Client",
        }),
      });

      if (!res.ok) {
        setComments(prev);
      }
    } catch {
      setComments(prev);
    }
  }

  function handleNameSubmit() {
    const name = clientName.trim();
    if (!name) return;
    localStorage.setItem(CLIENT_NAME_KEY, name);
    setShowNameInput(false);
    // Retry comment submission
    handleSubmitComment();
  }

  /* ---------------------------------------------------------------- */
  /*  Empty state                                                      */
  /* ---------------------------------------------------------------- */

  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-panel p-8 text-center">
        <div className="text-3xl mb-3 opacity-20">&#9835;</div>
        <p className="text-sm text-muted">
          No audio versions available for this track yet.
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  const showDownload = downloadEnabled && !paymentGated;

  return (
    <div>
      <div className="rounded-lg border border-border bg-panel overflow-hidden">
        {/* Version pills + metadata */}
        <div className="flex items-center justify-between px-5 pt-4">
          {versions.length > 1 && (
            <div className="flex items-center gap-1 bg-panel2 rounded-md p-0.5">
              {versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    if (v.id === activeVersionId) return;
                    pendingRestoreRef.current = {
                      seekTime: currentTime,
                      shouldPlay: isPlaying,
                    };
                    setActiveVersionId(v.id);
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
            </div>
          )}

          {/* Right side: download + LUFS */}
          <div className="flex items-center gap-2 ml-auto">
            {downloadEnabled && paymentGated && (
              <span className="inline-flex items-center gap-1 text-[10px] text-faint">
                <Lock size={10} />
                Payment pending
              </span>
            )}
            {showDownload && activeVersion && (
              <button
                type="button"
                onClick={handleDownload}
                className="text-signal hover:opacity-70 transition-opacity"
                title={`Download ${activeVersion.file_name || `v${activeVersion.version_number}`}`}
              >
                <Download size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Version metadata line */}
        <div className="px-5 pt-2 flex items-center gap-2">
          <span className="text-[10px] text-faint uppercase tracking-wider">
            v{activeVersion?.version_number} &middot;{" "}
            {activeVersion?.created_at
              ? new Date(activeVersion.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>
          {activeVersion?.file_name && (
            <span className="text-[10px] text-faint">
              &middot; {activeVersion.file_name}
            </span>
          )}
          {activeVersion?.file_format && (
            <span className="text-[10px] text-faint">
              &middot; {activeVersion.file_format}
              {activeVersion.sample_rate != null && (
                <> &middot; {formatSampleRate(activeVersion.sample_rate)}</>
              )}
              {activeVersion.bit_depth != null && (
                <> &middot; {formatBitDepth(activeVersion.bit_depth, activeVersion.file_format)}</>
              )}
            </span>
          )}
          <span className="text-[10px] text-faint">
            &middot; {versionComments.length} comment
            {versionComments.length !== 1 ? "s" : ""}
          </span>
          {/* LUFS display */}
          {measuredLufs != null &&
            (() => {
              const delta = measuredLufs - LUFS_REFERENCE;
              return (
                <span className="ml-auto inline-flex items-center gap-1.5 text-[10px]">
                  <span className="text-faint">&middot;</span>
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
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(1)} dB
                  </span>
                </span>
              );
            })()}
        </div>

        {/* Comment markers above waveform */}
        <div className="relative px-5 mt-3 h-5">
          {(() => {
            const markerDuration = duration || activeVersion?.duration_seconds || 0;
            return (
              isReady &&
              markerDuration > 0 &&
              versionComments.map((c) => {
                const pos =
                  ((c.timecode_seconds ?? 0) / markerDuration) * 100;
                const color =
                  authorColorMap.get(c.author) ?? AUTHOR_COLORS[0];
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
              })
            );
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
                    style={{
                      height: `${20 + Math.abs(Math.sin(i * 0.3)) * 55}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          {isReady && (
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
              {isPlaying ? (
                <Pause size={18} />
              ) : (
                <Play size={18} className="ml-0.5" />
              )}
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

        {/* Comments section (inline below transport) */}
        <div className="border-t border-border p-2">
          {/* Name input prompt */}
          {showNameInput && (
            <div className="bg-signal-muted border border-signal/20 rounded-lg p-3 mb-2">
              <div className="text-[11px] text-signal font-medium mb-2">
                What&apos;s your name?
              </div>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Your name"
                className="input text-sm w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && clientName.trim()) {
                    handleNameSubmit();
                  }
                  if (e.key === "Escape") {
                    setShowNameInput(false);
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowNameInput(false)}
                  className="text-xs text-muted hover:text-text transition-colors px-3 py-1.5 border border-border rounded"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  onClick={handleNameSubmit}
                  disabled={!clientName.trim()}
                  className="!h-auto !py-1.5 !px-3 !text-xs"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* New comment input */}
          {commentInput && !showNameInput && (
            <div className="bg-signal-muted border border-signal/20 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-1.5 mb-2 text-[11px] text-signal">
                <MessageCircle size={12} />
                Comment at {formatTime(commentInput.timecode)}
                {clientName && (
                  <span className="ml-auto text-muted">
                    as {clientName}
                  </span>
                )}
              </div>
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add your feedback…"
                rows={2}
                className="input text-sm w-full resize-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && newCommentText.trim()) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                  if (e.key === "Escape") {
                    setCommentInput(null);
                    setNewCommentText("");
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setCommentInput(null);
                    setNewCommentText("");
                  }}
                  className="text-xs text-muted hover:text-text transition-colors px-3 py-1.5 border border-border rounded"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  onClick={handleSubmitComment}
                  disabled={!newCommentText.trim()}
                  className="!h-auto !py-1.5 !px-3 !text-xs"
                >
                  Add Comment
                </Button>
              </div>
            </div>
          )}

          {/* Comment thread */}
          {versionComments.length > 0 ? (
            <div className="space-y-px">
              {versionComments.map((c) => {
                const color =
                  authorColorMap.get(c.author) ?? AUTHOR_COLORS[0];
                const isActive = highlightedCommentId === c.id;
                const canDelete =
                  c.author === (clientName.trim() || "Client");
                return (
                  <CommentRow
                    key={c.id}
                    comment={c}
                    color={color}
                    isActive={isActive}
                    onDelete={
                      canDelete ? () => handleDeleteComment(c.id) : undefined
                    }
                    onClick={() => {
                      setHighlightedCommentId(isActive ? null : c.id);
                      seekToTime(c.timecode_seconds ?? 0);
                    }}
                  />
                );
              })}
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

      {/* Streaming normalization dropdown */}
      {showStreamingInfo && measuredLufs != null && dropdownPos && (
        <div
          className="fixed z-50 rounded-md border border-border shadow-lg overflow-hidden"
          style={{
            top: dropdownPos.top,
            right: dropdownPos.right,
            background: "var(--panel-2)",
          }}
        >
          <table className="text-[11px]">
            <tbody>
              {LOUDNESS_GROUPS.map((group) => {
                const targets = LOUDNESS_TARGETS.filter(
                  (t) => t.group === group,
                );
                return [
                  <tr key={`h-${group}`}>
                    <td
                      colSpan={3}
                      className="px-3 pt-2 pb-1 text-[9px] font-semibold text-faint uppercase tracking-wider font-sans"
                    >
                      {group}
                    </td>
                  </tr>,
                  ...targets.map((t) => {
                    const adj = measuredLufs - t.lufs;
                    return (
                      <tr key={t.name} className="leading-6">
                        <td className="pl-3 pr-4 text-muted font-sans whitespace-nowrap">
                          {t.name}
                        </td>
                        <td className="pr-4 text-faint text-right whitespace-nowrap">
                          {t.lufs}
                        </td>
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
                              ? `\u2212${adj.toFixed(1)} dB`
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
        isActive ? "bg-black/[0.06]" : "hover:bg-black/[0.03]",
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
