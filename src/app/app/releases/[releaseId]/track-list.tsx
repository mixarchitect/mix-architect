"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function TrackList({ releaseId, tracks: initialTracks, canReorder, canDelete }: Props) {
  const [localTracks, setLocalTracks] = useState(initialTracks);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

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
      {sorted.map((t, idx) => (
        <div
          key={t.id}
          draggable={canReorder}
          onDragStart={canReorder ? () => setDragIdx(idx) : undefined}
          onDragOver={canReorder ? (e) => { e.preventDefault(); setDragOverIdx(idx); } : undefined}
          onDrop={canReorder ? () => { if (dragIdx !== null) handleDrop(dragIdx, idx); } : undefined}
          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
          className={cn(
            "flex items-center gap-2 rounded-md border bg-panel px-5 py-4 transition-all duration-150",
            "border-border hover:border-border-strong hover:shadow-sm",
            dragIdx === idx && "opacity-40",
            dragOverIdx === idx && dragIdx !== idx && "border-signal border-dashed",
          )}
        >
          {canReorder && (
            <>
              {/* Desktop: drag handle */}
              <GripVertical
                size={14}
                className="hidden md:block text-faint cursor-grab shrink-0 active:cursor-grabbing"
              />
              {/* Mobile: up/down arrows */}
              <div className="flex flex-col md:hidden shrink-0 -my-1">
                <button
                  type="button"
                  onClick={() => handleMove(t.id, -1)}
                  disabled={idx === 0}
                  className={cn(
                    "p-0.5 rounded transition-colors",
                    idx === 0 ? "text-transparent" : "text-faint hover:text-text active:text-text",
                  )}
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(t.id, 1)}
                  disabled={idx === sorted.length - 1}
                  className={cn(
                    "p-0.5 rounded transition-colors",
                    idx === sorted.length - 1 ? "text-transparent" : "text-faint hover:text-text active:text-text",
                  )}
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </>
          )}
          <Link
            href={`/app/releases/${releaseId}/tracks/${t.id}`}
            className="group flex-1 flex items-center gap-4 min-w-0"
            draggable={false}
          >
            <span className="w-8 text-right font-mono text-sm font-medium text-faint shrink-0">
              {String(t.track_number).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text text-sm group-hover:text-signal transition-colors truncate">
                {t.title}
              </div>
              <div className="mt-0.5 text-xs text-muted truncate">
                {t.intentPreview
                  ? t.intentPreview.length > 60
                    ? t.intentPreview.slice(0, 60) + "\u2026"
                    : t.intentPreview
                  : "No intent defined"}
              </div>
            </div>
            {t.portalApprovalStatus && t.portalApprovalStatus !== "awaiting_review" && (
              <PortalApprovalBadge status={t.portalApprovalStatus} />
            )}
            <StatusDot color={statusColor(t.status)} />
          </Link>

          {/* Delete track */}
          {canDelete && (
            <div className="relative shrink-0" ref={confirmDeleteId === t.id ? confirmRef : undefined}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmDeleteId(confirmDeleteId === t.id ? null : t.id);
                }}
                className="p-1.5 rounded text-faint hover:text-red-500 transition-colors"
                title="Delete track"
              >
                <Trash2 size={14} />
              </button>

              {confirmDeleteId === t.id && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-md border border-border bg-panel shadow-lg p-3 z-20 space-y-2">
                  <p className="text-xs text-muted">
                    Delete <strong className="text-text">{t.title}</strong>? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteTrack(t.id);
                      }}
                      disabled={deletingId === t.id}
                      className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors disabled:opacity-50"
                    >
                      {deletingId === t.id ? "Deleting\u2026" : "Confirm"}
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
                      Cancel
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

const APPROVAL_CONFIG: Record<string, { label: string; icon: typeof Check; color: string }> = {
  approved: { label: "Approved", icon: Check, color: "text-status-green bg-status-green/10" },
  delivered: { label: "Delivered", icon: Package, color: "text-status-blue bg-status-blue/10" },
  changes_requested: { label: "Changes", icon: MessageCircle, color: "text-signal bg-signal-muted" },
};

function PortalApprovalBadge({ status }: { status: string }) {
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
      {config.label}
    </span>
  );
}
