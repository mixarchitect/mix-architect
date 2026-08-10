"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { cn } from "@/lib/cn";
import {
  useAudio,
  useAudioCurrentTime,
  useAudioDuration,
  type AudioTrackMeta,
} from "@/lib/audio-context";
import { useTheme } from "next-themes";
import {
  SkipBack,
  SkipForward,
  RotateCcw,
  Download,
  ChevronDown,
  Lock,
  MessageCircle,
  X,
  Repeat,
  AlertTriangle,
  Check,
} from "lucide-react";
import type WaveSurfer from "wavesurfer.js";
import { loadWaveSurfer } from "@/lib/wavesurfer-loader";
import { trackGA4Event } from "@/lib/ga4-track";
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
import { FilledPlay, FilledPause } from "@/components/ui/filled-icon";
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
  onPromoTrigger?: (trigger: "approval" | "download" | "comment") => void;
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
  const t = useTranslations("portal");
  const format = useFormatter();
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  let text: string;
  if (diffMins < 1) text = t("player.justNow");
  else if (diffMins < 60) text = t("player.minutesAgo", { count: diffMins });
  else if (diffHrs < 24) text = t("player.hoursAgo", { count: diffHrs });
  else if (diffDays < 7) text = t("player.daysAgo", { count: diffDays });
  else text = format.dateTime(d, { month: "short", day: "numeric" });

  return <span className={className}>{text}</span>;
}

const CLIENT_NAME_KEY = "portal_client_name";
const DELETE_TOKEN_KEY_PREFIX = "portal_delete_token_";

/** Read a stored portal-comment delete token from localStorage. */
function readDeleteToken(commentId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${DELETE_TOKEN_KEY_PREFIX}${commentId}`);
  } catch {
    return null;
  }
}

/** Persist a delete token returned by POST /api/portal/comment. */
function writeDeleteToken(commentId: string, token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${DELETE_TOKEN_KEY_PREFIX}${commentId}`, token);
  } catch {
    /* localStorage full / disabled — delete UX gracefully degrades */
  }
}

/** Remove a token after a successful delete. */
function clearDeleteToken(commentId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${DELETE_TOKEN_KEY_PREFIX}${commentId}`);
  } catch {
    /* ignore */
  }
}

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
  onPromoTrigger,
}: PortalAudioPlayerProps) {
  const t = useTranslations("portal");
  const format = useFormatter();
  const { resolvedTheme } = useTheme();
  const audio = useAudio();
  const isThisTrackActive = audio.activeVersion?.track_id === trackId;
  const audioElement = audio.audioElement;
  const isPlaying = isThisTrackActive ? audio.isPlaying : false;
  // Subscribe directly to the audio element for time. The
  // isThisTrackActive gate keeps the displayed cursor at 0 for
  // tracks that aren't the currently-playing one.
  const sharedCurrentTime = useAudioCurrentTime();
  const sharedDuration = useAudioDuration();
  const currentTime = isThisTrackActive ? sharedCurrentTime : 0;
  const duration = isThisTrackActive ? sharedDuration : 0;

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

  // When user clicks play on a non-active track, we set this flag so
  // the WaveSurfer "ready" handler auto-plays after re-creation.
  const pendingPlayRef = useRef(false);

  const pendingRestoreRef = useRef<{
    seekTime: number;
    shouldPlay: boolean;
  } | null>(null);

  // LUFS + true peak + quality display state
  const measuredLufs = activeVersion?.measured_lufs ?? null;
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
  const hasQualityIssues =
    qualitySnapshot != null && qualitySnapshot.issues.length > 0;
  const hasMetrics =
    measuredLufs != null || measuredTruePeak != null || hasQualityIssues;
  // Clients see a single plain-language status line by default; the raw
  // LUFS / dBTP chips live behind this "Technical details" expander.
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [showStreamingInfo, setShowStreamingInfo] = useState(false);
  const [showTruePeakInfo, setShowTruePeakInfo] = useState(false);
  const [showQualityInfo, setShowQualityInfo] = useState(false);
  const lufsBadgeRef = useRef<HTMLSpanElement | null>(null);
  const truePeakBadgeRef = useRef<HTMLSpanElement | null>(null);
  // qualityBadgeRef already wraps the whole pill, doubles as trigger ref.
  const qualityBadgeRef = useRef<HTMLSpanElement | null>(null);
  // Trigger-group refs wrap button + delta badge for click-outside.
  const lufsTriggerRef = useRef<HTMLSpanElement | null>(null);
  const truePeakTriggerRef = useRef<HTMLSpanElement | null>(null);
  // Popover content refs for click-outside.
  const streamingDropdownElRef = useRef<HTMLDivElement | null>(null);
  const truePeakDropdownElRef = useRef<HTMLDivElement | null>(null);
  const qualityDropdownElRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [truePeakDropdownPos, setTruePeakDropdownPos] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [qualityDropdownPos, setQualityDropdownPos] = useState<{
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

  // Position true peak dropdown (same pattern as LUFS)
  useEffect(() => {
    if (!showTruePeakInfo || !truePeakBadgeRef.current) {
      setTruePeakDropdownPos(null);
      return;
    }
    const update = () => {
      const rect = truePeakBadgeRef.current?.getBoundingClientRect();
      if (rect)
        setTruePeakDropdownPos({
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
  }, [showTruePeakInfo]);

  // Position quality dropdown
  useEffect(() => {
    if (!showQualityInfo || !qualityBadgeRef.current) {
      setQualityDropdownPos(null);
      return;
    }
    const update = () => {
      const rect = qualityBadgeRef.current?.getBoundingClientRect();
      if (rect)
        setQualityDropdownPos({
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
  }, [showQualityInfo]);

  useEffect(() => {
    setShowTechDetails(false);
    setShowStreamingInfo(false);
    setShowTruePeakInfo(false);
    setShowQualityInfo(false);
  }, [activeVersion?.id]);

  // Click-outside to close an open metric popover (see audio-player.tsx
  // for detailed reasoning; this mirrors that handler).
  useEffect(() => {
    if (!showStreamingInfo && !showTruePeakInfo && !showQualityInfo) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (showStreamingInfo) {
        if (lufsTriggerRef.current?.contains(target)) return;
        if (streamingDropdownElRef.current?.contains(target)) return;
        setShowStreamingInfo(false);
      }
      if (showTruePeakInfo) {
        if (truePeakTriggerRef.current?.contains(target)) return;
        if (truePeakDropdownElRef.current?.contains(target)) return;
        setShowTruePeakInfo(false);
      }
      if (showQualityInfo) {
        if (qualityBadgeRef.current?.contains(target)) return;
        if (qualityDropdownElRef.current?.contains(target)) return;
        setShowQualityInfo(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showStreamingInfo, showTruePeakInfo, showQualityInfo]);

  // Fire warning-shown analytics event once per version when the quality
  // pill appears with issues. Portal surface is tagged separately so we can
  // distinguish engineer-side QC views from client-side QC views.
  useEffect(() => {
    if (!activeVersion) return;
    if (!qualitySnapshot || qualitySnapshot.issues.length === 0) return;
    trackGA4Event("audio_qc_warning_shown", {
      version_id: activeVersion.id,
      issue_types: qualitySnapshot.issues.join(","),
      severe: qualitySnapshot.severe,
      surface: "portal",
    });
  }, [activeVersion?.id, qualitySnapshot?.issues.join(","), qualitySnapshot?.severe]); // eslint-disable-line react-hooks/exhaustive-deps

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
    let cancelled = false;
    const raf = requestAnimationFrame(async () => {
      if (cancelled || !container || !container.isConnected) return;

      // Dynamic import keeps wavesurfer out of the initial portal
      // bundle. Cached at the loader's module scope.
      const WaveSurfer = await loadWaveSurfer();
      if (cancelled || !container.isConnected || !activeVersion) return;

      const colors = getWaveColors();

      // Only bind to the shared audio element if this track is already active.
      // Otherwise render a static waveform from peaks — the media element is
      // connected on play via audio.loadVersion().
      const shouldBindMedia =
        audio.activeVersion?.track_id === trackId;

      ws = WaveSurfer.create({
        container,
        ...(shouldBindMedia ? { media: audioElement } : {}),
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

        // If this track isn't bound to the media yet, load it now
        // (this happens when user first visits and no track is active)
        if (shouldBindMedia) {
          audio.loadVersion(activeVersion, trackMeta);
        }

        // Auto-play if the user clicked play before WaveSurfer was ready
        if (pendingPlayRef.current) {
          pendingPlayRef.current = false;
          audioElement.play().catch(() => {});
        }

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
            // On a version switch, audio.loadVersion() may have just called
            // el.load() on a new src, so the element isn't ready to play
            // yet. Calling play() now silently no-ops; wait for the browser
            // to buffer enough data (canplay) before starting.
            if (audioElement.readyState >= 3 /* HAVE_FUTURE_DATA */) {
              audioElement.play().catch(() => {});
            } else {
              const onCanPlay = () => {
                audioElement.removeEventListener("canplay", onCanPlay);
                audioElement.play().catch(() => {});
              };
              audioElement.addEventListener("canplay", onCanPlay);
            }
          }
        }
      });

      wavesurferRef.current = ws;
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (ws) ws.destroy();
      wavesurferRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVersion?.id, audioElement, isThisTrackActive]);

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
    // If this track isn't active yet, load its version first.
    // isThisTrackActive will change, triggering the useEffect to re-create
    // WaveSurfer with media bound. The "ready" handler checks pendingPlayRef.
    if (!isThisTrackActive && activeVersion) {
      pendingPlayRef.current = true;
      audio.loadVersion(activeVersion, trackMeta);
      return;
    }
    audio.togglePlayPause();
  }, [audio, isThisTrackActive, activeVersion, trackMeta]);

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
    (time: number) => {
      audio.seekTo(time);
    },
    [audio],
  );

  const effectiveDuration = duration || activeVersion?.duration_seconds || 0;

  const handleWaveformKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (effectiveDuration <= 0) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        audio.seekTo(Math.max(0, currentTime - 5));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        audio.seekTo(Math.min(effectiveDuration, currentTime + 5));
      } else if (e.key === "Home") {
        e.preventDefault();
        audio.seekTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        audio.seekTo(effectiveDuration);
      }
    },
    [audio, currentTime, effectiveDuration],
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
    onPromoTrigger?.("download");
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
      // Persist the server-issued delete_token so this client can
      // later authorize deleting its own comment. Other portal
      // visitors don't have it and thus can't delete the comment.
      if (data?.id && data?.delete_token) {
        writeDeleteToken(data.id, data.delete_token);
      }
      setComments((prev) => [data, ...prev]);
      setNewCommentText("");
      setCommentInput(null);
      setHighlightedCommentId(data.id);
      onPromoTrigger?.("comment");
    } catch {
      // Silently fail
    }
  }

  async function handleDeleteComment(commentId: string) {
    const deleteToken = readDeleteToken(commentId);
    if (!deleteToken) return; // No token → not the author of this comment

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
          delete_token: deleteToken,
        }),
      });

      if (!res.ok) {
        setComments(prev);
      } else {
        clearDeleteToken(commentId);
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
        <p className="text-sm text-muted">{t("player.noVersions")}</p>
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
                  aria-label={t("player.versionN", { number: v.version_number })}
                  aria-pressed={v.id === activeVersionId}
                  className={cn(
                    "relative px-3 py-1 text-xs font-medium rounded transition-colors after:absolute after:content-[''] after:inset-x-0 after:-inset-y-2.5",
                    v.id === activeVersionId
                      ? "bg-signal text-signal-on"
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
                {t("player.paymentPending")}
              </span>
            )}
            {showDownload && activeVersion && (
              <button
                type="button"
                onClick={handleDownload}
                className="relative text-signal hover:opacity-70 transition-opacity after:absolute after:content-[''] after:-inset-[15px]"
                title={t("player.downloadFile", {
                  name: `${trackTitle} · v${activeVersion.version_number}`,
                })}
                aria-label={t("player.downloadFile", {
                  name: `${trackTitle} · v${activeVersion.version_number}`,
                })}
              >
                <Download size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Version metadata line */}
        <div className="px-5 pt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[10px] text-faint uppercase tracking-wider whitespace-nowrap">
            v{activeVersion?.version_number} &middot;{" "}
            {activeVersion?.created_at
              ? format.dateTime(new Date(activeVersion.created_at), {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>
          <span className="text-[10px] text-faint whitespace-nowrap">
            &middot; {t("player.commentCount", { count: versionComments.length })}
          </span>
          {/* Plain-language audio status + technical-details expander. The
              raw LUFS / dBTP chips render below only once expanded, so a
              client never sees a bare acronym first. */}
          {hasMetrics && (
            <span className="ml-auto inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[10px]">
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  hasQualityIssues ? "text-signal" : "text-status-green",
                )}
              >
                {hasQualityIssues ? (
                  <AlertTriangle size={10} />
                ) : (
                  <Check size={10} />
                )}
                {hasQualityIssues
                  ? t("player.audioCheckNeedsAttention")
                  : t("player.loudnessReady")}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (showTechDetails) {
                    setShowStreamingInfo(false);
                    setShowTruePeakInfo(false);
                    setShowQualityInfo(false);
                  }
                  setShowTechDetails(!showTechDetails);
                }}
                aria-expanded={showTechDetails}
                className="relative inline-flex items-center gap-1 text-muted hover:text-text transition-colors after:absolute after:content-[''] after:-inset-y-3.5 after:-inset-x-1"
              >
                {t("player.technicalDetails")}
                <ChevronDown
                  size={10}
                  className={cn(
                    "transition-transform",
                    showTechDetails && "rotate-180",
                  )}
                />
              </button>
            </span>
          )}
        </div>

        {/* Technical details: raw loudness / peak / quality chips with
            their per-platform popovers, gated behind the expander above. */}
        {hasMetrics && showTechDetails && (
          <div className="px-5 pt-1.5 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[10px]">
              {measuredLufs != null &&
                (() => {
                  const delta = measuredLufs - LUFS_REFERENCE;
                  return (
                    <span ref={lufsTriggerRef} className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (!showStreamingInfo && activeVersion) {
                            trackGA4Event("audio_qc_panel_opened", {
                              panel_type: "lufs",
                              version_id: activeVersion.id,
                              surface: "portal",
                            });
                          }
                          setShowTruePeakInfo(false);
                          setShowQualityInfo(false);
                          setShowStreamingInfo((v) => !v);
                        }}
                        className="relative inline-flex items-center gap-1 text-muted hover:text-text transition-colors after:absolute after:content-[''] after:-inset-y-3.5 after:inset-x-0"
                        title={t("player.streamingTooltip")}
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
              {measuredTruePeak != null &&
                (() => {
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
                    <span ref={truePeakTriggerRef} className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (!showTruePeakInfo && activeVersion) {
                            trackGA4Event("audio_qc_panel_opened", {
                              panel_type: "peak",
                              version_id: activeVersion.id,
                              surface: "portal",
                            });
                          }
                          setShowStreamingInfo(false);
                          setShowQualityInfo(false);
                          setShowTruePeakInfo((v) => !v);
                        }}
                        className="relative inline-flex items-center gap-1 text-muted hover:text-text transition-colors after:absolute after:content-[''] after:-inset-y-3.5 after:inset-x-0"
                        title={t("player.truePeakTooltip")}
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
                            ? t("player.belowCeiling", {
                                amount: headroom.toFixed(1),
                                ceiling: TRUE_PEAK_CEILING,
                              })
                            : t("player.overCeiling", {
                                amount: Math.abs(headroom).toFixed(1),
                                ceiling: TRUE_PEAK_CEILING,
                              })
                        }
                      >
                        {badgeText}
                      </span>
                    </span>
                  );
                })()}
              {qualitySnapshot != null &&
                qualitySnapshot.issues.length > 0 &&
                (() => {
                  const { issues, severe } = qualitySnapshot;
                  const colorClass = severe
                    ? "bg-red-500/10 text-red-500"
                    : "bg-signal-muted text-signal";
                  const label =
                    issues.length > 1
                      ? t("player.issueCount", { count: issues.length })
                      : issues[0] === "clipping"
                        ? t("player.clippingDetected")
                        : issues[0] === "peak_at_full_scale"
                          ? t("player.peakAtFullScale")
                          : t("player.dcOffsetDetected");
                  return (
                    <span ref={qualityBadgeRef} className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (!showQualityInfo && activeVersion) {
                            trackGA4Event("audio_qc_panel_opened", {
                              panel_type: "quality",
                              version_id: activeVersion.id,
                              surface: "portal",
                            });
                          }
                          setShowStreamingInfo(false);
                          setShowTruePeakInfo(false);
                          setShowQualityInfo((v) => !v);
                        }}
                        className={cn(
                          "relative inline-flex items-center gap-1 px-1.5 py-px rounded text-[10px] transition-colors after:absolute after:content-[''] after:-inset-y-3 after:inset-x-0",
                          colorClass,
                        )}
                        title={t("player.qualityTooltip")}
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
          </div>
        )}

        {/* File info line */}
        {activeVersion && (
          <div className="px-5 pt-1 flex items-center gap-1 text-[10px] text-faint">
            {/* Clients see the track title + version; the raw uploaded
                filename is tooltip-only. */}
            <span
              className="truncate max-w-[360px]"
              title={activeVersion.file_name || undefined}
            >
              {trackTitle} · v{activeVersion.version_number}
            </span>
            {activeVersion.file_format && (
              <>
                <span>·</span>
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
              tabIndex={0}
              role="slider"
              aria-label={t("player.seekPosition")}
              aria-valuemin={0}
              aria-valuemax={Math.round(effectiveDuration)}
              aria-valuenow={Math.min(
                Math.round(currentTime),
                Math.round(effectiveDuration),
              )}
              aria-valuetext={formatTime(currentTime)}
              onKeyDown={handleWaveformKeyDown}
              className={cn(
                "w-full transition-opacity rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
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
                      height: `${Math.round(20 + Math.abs(Math.sin(i * 0.3)) * 55)}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Comments are added via double-click, which has no touch
              equivalent here, so the hint hides on coarse pointers rather
              than advertising an impossible interaction. */}
          {isReady && (
            <p className="pointer-coarse:hidden text-center text-[10px] text-faint mt-1.5 select-none">
              {t("player.doubleClickHint")}
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
              aria-label={t("player.returnToStart")}
              className="relative text-muted hover:text-text transition-colors p-1 after:absolute after:content-[''] after:-inset-[11px]"
              title={t("player.returnToStart")}
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={skipBack}
              aria-label={t("player.skipBack")}
              className="relative text-muted hover:text-text transition-colors p-1 after:absolute after:content-[''] after:-inset-2.5"
              title={t("player.skipBack")}
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={togglePlayPause}
              disabled={!isReady}
              aria-label={isPlaying ? t("player.pause") : t("player.play")}
              className="relative w-10 h-10 rounded-full bg-signal text-signal-on flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md after:absolute after:content-[''] after:-inset-0.5"
            >
              {isPlaying ? (
                <FilledPause size={18} />
              ) : (
                <FilledPlay size={18} className="ml-0.5" />
              )}
            </button>
            <button
              onClick={skipForward}
              aria-label={t("player.skipForward")}
              className="relative text-muted hover:text-text transition-colors p-1 after:absolute after:content-[''] after:-inset-2.5"
              title={t("player.skipForward")}
            >
              <SkipForward size={16} />
            </button>
            <button
              onClick={audio.toggleLoop}
              aria-label={t("player.loop")}
              aria-pressed={audio.isLooping}
              className={cn(
                "relative transition-colors p-1 after:absolute after:content-[''] after:-inset-2.5",
                audio.isLooping
                  ? "text-signal"
                  : "text-muted hover:text-text",
              )}
              title={audio.isLooping ? t("player.loopOn") : t("player.loop")}
            >
              <Repeat size={16} />
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
                {t("player.whatsYourName")}
              </div>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t("player.yourName")}
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
                  {t("cancel")}
                </button>
                <Button
                  variant="primary"
                  onClick={handleNameSubmit}
                  disabled={!clientName.trim()}
                  className="!h-auto !py-1.5 !px-3 !text-xs"
                >
                  {t("player.postComment")}
                </Button>
              </div>
            </div>
          )}

          {/* New comment input */}
          {commentInput && !showNameInput && (
            <div className="bg-signal-muted border border-signal/20 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-1.5 mb-2 text-[11px] text-signal">
                <MessageCircle size={12} />
                {t("player.commentAt", { time: formatTime(commentInput.timecode) })}
                {clientName && (
                  <span className="ml-auto text-muted">
                    {t("player.asName", { name: clientName })}
                  </span>
                )}
              </div>
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={t("player.feedbackPlaceholder")}
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
                  {t("cancel")}
                </button>
                <Button
                  variant="primary"
                  onClick={handleSubmitComment}
                  disabled={!newCommentText.trim()}
                  className="!h-auto !py-1.5 !px-3 !text-xs"
                >
                  {t("player.addComment")}
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
                // The user can delete a comment only if they hold its
                // server-issued delete token in localStorage. This
                // matches the server's authorization check and avoids
                // showing a delete button that would 403.
                const canDelete = readDeleteToken(c.id) !== null;
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
                {t("player.noCommentsYet")}
              </p>
            )
          )}
        </div>
      </div>

      {/* Streaming normalization dropdown */}
      {showStreamingInfo && measuredLufs != null && dropdownPos && (
        <div
          ref={streamingDropdownElRef}
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
                  ...targets.map((target) => {
                    const adj = measuredLufs - target.lufs;
                    return (
                      <tr key={target.name} className="leading-6">
                        <td
                          className="pl-3 pr-4 text-muted font-sans whitespace-nowrap cursor-help"
                          title={target.description}
                        >
                          {target.name}
                        </td>
                        <td className="pr-4 text-faint text-right whitespace-nowrap">
                          {target.lufs}
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
                            ? t("player.noChange")
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

      {/* True peak target dropdown — ceiling-based comparison */}
      {showTruePeakInfo && measuredTruePeak != null && truePeakDropdownPos && (
        <div
          ref={truePeakDropdownElRef}
          className="fixed z-50 rounded-md border border-border shadow-lg overflow-hidden"
          style={{
            top: truePeakDropdownPos.top,
            right: truePeakDropdownPos.right,
            background: "var(--panel-2)",
          }}
        >
          <table className="text-[11px]">
            <tbody>
              {LOUDNESS_GROUPS.map((group) => {
                const targets = TRUE_PEAK_TARGETS.filter((t) => t.group === group);
                return [
                  <tr key={`tp-h-${group}`}>
                    <td
                      colSpan={3}
                      className="px-3 pt-2 pb-1 text-[9px] font-semibold text-faint uppercase tracking-wider font-sans"
                    >
                      {group}
                    </td>
                  </tr>,
                  ...targets.map((target) => {
                    const headroom = target.dbtp - measuredTruePeak;
                    const over = headroom < 0;
                    const rightColor = over
                      ? Math.abs(headroom) > 1
                        ? "text-red-500"
                        : "text-signal"
                      : "text-status-green";
                    return (
                      <tr key={`tp-${target.name}`} className="leading-6">
                        <td
                          className="pl-3 pr-4 text-muted font-sans whitespace-nowrap cursor-help"
                          title={target.description}
                        >
                          {target.name}
                        </td>
                        <td className="pr-4 text-faint text-right whitespace-nowrap">
                          {target.dbtp}
                        </td>
                        <td className={cn("pr-3 text-right whitespace-nowrap", rightColor)}>
                          {over
                            ? t("player.dbOver", {
                                amount: Math.abs(headroom).toFixed(1),
                              })
                            : t("player.dbHeadroom", {
                                amount: headroom.toFixed(1),
                              })}
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

      {/* Quality check dropdown */}
      {showQualityInfo && qualitySnapshot != null && qualityDropdownPos && (
        <div
          ref={qualityDropdownElRef}
          className="fixed z-50 rounded-md border border-border shadow-lg overflow-hidden max-w-[320px]"
          style={{
            top: qualityDropdownPos.top,
            right: qualityDropdownPos.right,
            background: "var(--panel-2)",
          }}
        >
          <div className="px-3 pt-2 pb-1 text-[9px] font-semibold text-faint uppercase tracking-wider font-sans">
            {t("player.qualityCheck")}
          </div>
          <div className="flex flex-col gap-2 px-3 py-2 text-[11px] font-sans">
            {qualitySnapshot.issues.includes("clipping") && (
              <div>
                <div className="text-text font-semibold">
                  {t("player.clippingTitle")}
                </div>
                <div className="text-muted">
                  {t("player.clippingDesc", {
                    count: qualitySnapshot.clipSampleCount?.toLocaleString() ?? "?",
                  })}
                </div>
              </div>
            )}
            {qualitySnapshot.issues.includes("peak_at_full_scale") && (
              <div>
                <div className="text-text font-semibold">
                  {t("player.fullScaleTitle")}
                </div>
                <div className="text-muted">
                  {t("player.fullScaleDesc", {
                    peak:
                      qualitySnapshot.samplePeakDbfs != null
                        ? `${qualitySnapshot.samplePeakDbfs.toFixed(2)} dBFS`
                        : "0 dBFS",
                  })}
                </div>
              </div>
            )}
            {qualitySnapshot.issues.includes("dc_offset") && (
              <div>
                <div className="text-text font-semibold">
                  {t("player.dcOffsetTitle")}
                </div>
                <div className="text-muted">
                  {qualitySnapshot.dcOffset != null
                    ? `${t("player.dcOffsetValue", {
                        value: qualitySnapshot.dcOffset.toFixed(4),
                      })} `
                    : ""}
                  {t("player.dcOffsetFix")}
                </div>
              </div>
            )}
          </div>
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
  const t = useTranslations("portal");
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
          title={t("player.deleteComment")}
          aria-label={t("player.deleteComment")}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
