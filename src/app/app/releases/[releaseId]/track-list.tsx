"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GripVertical, ChevronUp, ChevronDown, Trash2, Check, MessageCircle, Package } from "lucide-react";
import { StatusDot } from "@/components/ui/status-dot";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { cn } from "@/lib/cn";

type TrackItem = {
  id: string;
  track_number: number;
  title: string;
  status: string;
  intentPreview?: string | null;
  portalApprovalStatus?: string | null;
  /** Signed URL for the latest version's audio file. When present,
   *  hover/focus warms up the browser HTTP cache so the audio is
   *  ready to play by the time the user clicks through. */
  latestAudioUrl?: string | null;
};

type Props = {
  releaseId: string;
  tracks: TrackItem[];
  canReorder: boolean;
  canDelete?: boolean;
};

function statusColor(s: string): "green" | "orange" | "blue" {
  if (s === "complete") return "green";
  if (s === "in_progress") return "orange";
  return "blue";
}

const statusKeys: Record<string, string> = {
  complete: "trackApproved",
  in_progress: "trackInProgress",
  not_started: "trackNotStarted",
};

export function TrackList({ releaseId, tracks: initialTracks, canReorder, canDelete }: Props) {
  const t = useTranslations("releaseDetail");
  const tc = useTranslations("common");

  function statusLabel(s: string): string {
    return t(statusKeys[s] ?? "trackNotStarted");
  }

  const [localTracks, setLocalTracks] = useState(initialTracks);

  // Sync local state when server data changes (e.g. after Flow Simulator applies new order)
  useEffect(() => {
    setLocalTracks(initialTracks);
  }, [initialTracks]);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const prefetchedRef = useRef<Set<string>>(new Set());
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  // Hover/focus prefetch: warm the browser's HTTP cache for the
  // track's audio file as soon as the user signals interest. By the
  // time they click through to the track page, the persistent audio
  // element can hit cache instead of waiting on a fresh signed-URL
  // round-trip — collapsing cold playback start.
  function prefetchAudio(url: string | null | undefined) {
    if (!url) return;
    if (prefetchedRef.current.has(url)) return;
    prefetchedRef.current.add(url);
    // Range-limit to the first 1 MB so hovering the whole track list
    // doesn't drag down the network. That's enough to start playback
    // for almost any sample-rate/bit-depth combination; the rest
    // streams in once the audio element starts playing.
    fetch(url, {
      headers: { Range: "bytes=0-1048575" },
      credentials: "omit",
      // priority hint where supported (Chromium); harmless elsewhere.
      ...({ priority: "low" } as RequestInit),
    }).catch(() => {
      // Best-effort — drop the URL from the prefetched set so we can
      // retry on a future hover (e.g. transient network blip).
      prefetchedRef.current.delete(url);
    });
  }

  // Close confirmation on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (confirmRef.current && !confirmRef.current.contains(e.target as Node)) {
        setConfirmDeleteId(null);
      }
    }
    if (confirmDeleteId) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [confirmDeleteId]);

  const sorted = [...localTracks].sort((a, b) => a.track_number - b.track_number);

  async function handleDrop(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    const prevTracks = [...localTracks];
    const reordered = [...sorted];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Reassign track_number sequentially (1-based)
    const updated = reordered.map((t, i) => ({ ...t, track_number: i + 1 }));
    setLocalTracks(updated);
    setDragIdx(null);
    setDragOverIdx(null);

    try {
      const results = await Promise.all(
        updated.map((t) =>
          supabase.from("tracks").update({ track_number: t.track_number }).eq("id", t.id),
        ),
      );
      if (results.some((r) => r.error)) throw new Error("Reorder failed");
    } catch {
      setLocalTracks(prevTracks);
    }
  }

  // Mobile: swap adjacent track_numbers
  async function handleMove(trackId: string, direction: -1 | 1) {
    const idx = sorted.findIndex((t) => t.id === trackId);
    const neighborIdx = idx + direction;
    if (neighborIdx < 0 || neighborIdx >= sorted.length) return;

    const current = sorted[idx];
    const neighbor = sorted[neighborIdx];
    const prevTracks = [...localTracks];

    setLocalTracks((prev) =>
      prev.map((t) => {
        if (t.id === current.id) return { ...t, track_number: neighbor.track_number };
        if (t.id === neighbor.id) return { ...t, track_number: current.track_number };
        return t;
      }),
    );

    try {
      const [r1, r2] = await Promise.all([
        supabase.from("tracks").update({ track_number: neighbor.track_number }).eq("id", current.id),
        supabase.from("tracks").update({ track_number: current.track_number }).eq("id", neighbor.id),
      ]);
      if (r1.error || r2.error) throw new Error("Reorder failed");
    } catch {
      setLocalTracks(prevTracks);
    }
  }

  async function handleDeleteTrack(trackId: string) {
    setDeletingId(trackId);
    const prevTracks = [...localTracks];
    setLocalTracks((prev) => prev.filter((t) => t.id !== trackId));
    setConfirmDeleteId(null);

    try {
      const { error } = await supabase.from("tracks").delete().eq("id", trackId);
      if (error) throw error;
      router.refresh();
    } catch {
      setLocalTracks(prevTracks);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-2">
      {sorted.map((track, idx) => (
        <div
          key={track.id}
          draggable={canReorder}
          onDragStart={canReorder ? () => setDragIdx(idx) : undefined}
          onDragOver={canReorder ? (e) => { e.preventDefault(); setDragOverIdx(idx); } : undefined}
          onDrop={canReorder ? () => { if (dragIdx !== null) handleDrop(dragIdx, idx); } : undefined}
          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
          className={cn(
            "group/row flex items-center gap-2 rounded-md border bg-panel px-4 py-3 md:py-2.5 transition-all duration-150 active:bg-panel2 md:active:bg-panel",
            "border-border hover:border-border-strong",
            dragIdx === idx && "opacity-40",
            dragOverIdx === idx && dragIdx !== idx && "border-signal border-dashed",
          )}
        >
          {canReorder && (
            <>
              {/* Desktop: drag handle — visible on hover/focus */}
              <GripVertical
                size={14}
                className="hidden md:block text-faint cursor-grab shrink-0 active:cursor-grabbing opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 transition-opacity duration-150"
              />
              {/* Mobile: up/down arrows */}
              <div className="flex flex-col md:hidden shrink-0 -my-1">
                <button
                  type="button"
                  onClick={() => handleMove(track.id, -1)}
                  disabled={idx === 0}
                  className={cn(
                    "p-2 rounded transition-colors",
                    idx === 0 ? "text-transparent" : "text-faint hover:text-text active:text-text",
                  )}
                  title={t("moveUp")}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(track.id, 1)}
                  disabled={idx === sorted.length - 1}
                  className={cn(
                    "p-2 rounded transition-colors",
                    idx === sorted.length - 1 ? "text-transparent" : "text-faint hover:text-text active:text-text",
                  )}
                  title={t("moveDown")}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </>
          )}
          <Link
            href={`/app/releases/${releaseId}/tracks/${track.id}`}
            className="group flex-1 flex items-center gap-4 min-w-0"
            draggable={false}
            onMouseEnter={() => prefetchAudio(track.latestAudioUrl)}
            onFocus={() => prefetchAudio(track.latestAudioUrl)}
            onTouchStart={() => prefetchAudio(track.latestAudioUrl)}
            {...(idx === 0 ? { "data-tour": "track-link" } : {})}
          >
            <span className="w-8 text-right text-sm font-medium text-muted shrink-0">
              {String(track.track_number).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text text-sm group-hover:text-signal transition-colors truncate">
                {track.title}
              </div>
            </div>
            {track.portalApprovalStatus && track.portalApprovalStatus !== "awaiting_review" && (
              <PortalApprovalBadge status={track.portalApprovalStatus} />
            )}
            <span title={statusLabel(track.status)}>
              <StatusDot color={statusColor(track.status)} />
            </span>
          </Link>

          {/* Delete track */}
          {canDelete && (
            <div className={cn("relative shrink-0 transition-opacity duration-150", confirmDeleteId === track.id ? "opacity-100" : "md:opacity-0 md:group-hover/row:opacity-100 md:group-focus-within/row:opacity-100")} ref={confirmDeleteId === track.id ? confirmRef : undefined}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmDeleteId(confirmDeleteId === track.id ? null : track.id);
                }}
                className="p-1.5 rounded text-faint hover:text-red-500 transition-colors"
                title={t("deleteTrack")}
              >
                <Trash2 size={14} />
              </button>

              {confirmDeleteId === track.id && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-md border border-border bg-panel shadow-lg p-3 z-20 space-y-2">
                  <p className="text-xs text-muted">
                    {t("deleteTrackConfirm", { title: track.title })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteTrack(track.id);
                      }}
                      disabled={deletingId === track.id}
                      className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors disabled:opacity-50"
                    >
                      {deletingId === track.id ? tc("deleting") : tc("confirm")}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDeleteId(null);
                      }}
                      className="flex-1 px-2 py-1.5 text-xs font-medium text-muted hover:text-text border border-border rounded transition-colors"
                    >
                      {tc("cancel")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Portal Approval Badge ───────────────────────────────────────── */

const APPROVAL_CONFIG: Record<string, { labelKey: string; icon: typeof Check; color: string }> = {
  approved: { labelKey: "trackApproved", icon: Check, color: "text-status-green bg-status-green/10" },
  delivered: { labelKey: "trackDelivered", icon: Package, color: "text-status-blue bg-status-blue/10" },
  changes_requested: { labelKey: "trackChanges", icon: MessageCircle, color: "text-signal bg-signal-muted" },
};

function PortalApprovalBadge({ status }: { status: string }) {
  const t = useTranslations("releaseDetail");
  const config = APPROVAL_CONFIG[status];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
        config.color,
      )}
    >
      <Icon size={10} />
      {t(config.labelKey)}
    </span>
  );
}
