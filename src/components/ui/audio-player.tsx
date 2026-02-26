"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload,
  MessageCircle,
  X,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";

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

/* ------------------------------------------------------------------ */
/*  Main AudioPlayer                                                   */
/* ------------------------------------------------------------------ */

export function AudioPlayer({
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

  // Version state
  const [activeVersionId, setActiveVersionId] = useState<string | null>(
    versions.length > 0 ? versions[versions.length - 1].id : null,
  );
  const activeVersion = useMemo(
    () => versions.find((v) => v.id === activeVersionId) ?? null,
    [versions, activeVersionId],
  );

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

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

  /* ---------------------------------------------------------------- */
  /*  WaveSurfer lifecycle                                             */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!containerRef.current || !activeVersion) return;

    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      barWidth: 3,
      barGap: 1,
      barRadius: 1,
      height: 80,
      progressColor: "var(--signal)",
      waveColor: "rgba(20, 20, 20, 0.15)",
      cursorColor: "var(--signal)",
      cursorWidth: 2,
      normalize: true,
      peaks: activeVersion.waveform_peaks ?? undefined,
      url: activeVersion.audio_url,
    });

    ws.on("ready", () => {
      setDuration(ws.getDuration());
      setIsReady(true);

      // Cache peaks if not yet cached
      if (!activeVersion.waveform_peaks) {
        const peaks = ws.exportPeaks();
        supabase
          .from("track_audio_versions")
          .update({
            waveform_peaks: peaks,
            duration_seconds: ws.getDuration(),
          })
          .eq("id", activeVersion.id)
          .then(() => {
            // Update local version data
            onVersionsChange(
              versions.map((v) =>
                v.id === activeVersion.id
                  ? { ...v, waveform_peaks: peaks, duration_seconds: ws.getDuration() }
                  : v,
              ),
            );
          });
      }
    });

    ws.on("timeupdate", (time: number) => setCurrentTime(time));
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    ws.on("dblclick", () => {
      if (!canComment) return;
      const time = ws.getCurrentTime();
      setCommentInput({ timecode: time });
      ws.pause();
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVersion?.id, activeVersion?.audio_url]);

  /* ---------------------------------------------------------------- */
  /*  Playback controls                                                */
  /* ---------------------------------------------------------------- */

  const togglePlayPause = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const skipBack = useCallback(() => {
    wavesurferRef.current?.setTime(0);
  }, []);

  const skipForward = useCallback(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    ws.setTime(Math.min(ws.getDuration(), ws.getCurrentTime() + 10));
  }, []);

  const seekToTime = useCallback((seconds: number) => {
    wavesurferRef.current?.setTime(seconds);
  }, []);

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
          {activeVersion?.file_name && (
            <span className="text-[10px] font-mono text-faint">
              · {activeVersion.file_name}
            </span>
          )}
        </div>

        {/* Comment markers above waveform */}
        <div className="relative px-5 mt-3 h-5">
          {isReady &&
            duration > 0 &&
            versionComments.map((c) => {
              const pos = ((c.timecode_seconds ?? 0) / duration) * 100;
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
            })}
        </div>

        {/* Waveform container */}
        <div className="px-5">
          <div
            ref={containerRef}
            className={cn(
              "w-full transition-opacity",
              !isReady && "opacity-30",
            )}
          />
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

        <div className="max-h-[260px] overflow-y-auto p-2">
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
          ? "bg-signal-muted border-l-2 border-signal"
          : "border-l-2 border-transparent hover:bg-panel2",
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
        </div>
        <p className="text-xs text-muted leading-relaxed">{comment.content}</p>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-faint hover:text-red-500 transition-all shrink-0 self-center"
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
