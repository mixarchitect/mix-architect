"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/cn";
import { StatusDot } from "@/components/ui/status-dot";
import type { DashboardRelease } from "@/types/release";
import {
  getReleaseBarGeometry,
  getStatusColor,
  type DateRange,
} from "@/lib/timeline-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LANE_HEIGHT = 64;
const BAR_HEIGHT = 30;

/* ------------------------------------------------------------------ */
/*  Status → bar style mapping                                         */
/* ------------------------------------------------------------------ */

function barClasses(status: string): string {
  if (status === "ready") return "bg-signal text-signal-on";
  if (status === "in_progress") return "border text-muted";
  return "text-muted"; // draft
}

function barInlineStyle(status: string): React.CSSProperties {
  if (status === "ready") return { background: "var(--signal)" };
  if (status === "in_progress")
    return {
      background: "rgba(13,148,136,0.15)",
      borderColor: "rgba(13,148,136,0.45)",
    };
  // draft
  return { background: "var(--panel-2)" };
}

/** Format a date string as "Jun 15" */
function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

interface TooltipData {
  release: DashboardRelease;
  x: number;
  y: number;
}

function ReleaseTooltip({ release, x, y }: TooltipData) {
  const color = getStatusColor(release.status);
  const statusLabel =
    release.status === "ready"
      ? "Ready"
      : release.status === "in_progress"
        ? "In Progress"
        : "Draft";

  return (
    <div
      className="fixed z-50 px-3.5 py-2.5 rounded-lg border shadow-xl pointer-events-none"
      style={{
        left: x,
        top: y,
        background: "var(--panel)",
        borderColor: "var(--border)",
        transform: "translate(-50%, -100%)",
        marginTop: -8,
      }}
    >
      <div className="text-sm font-semibold text-text truncate max-w-[220px]">
        {release.title}
      </div>
      {release.artist && (
        <div className="text-xs text-muted mt-0.5">{release.artist}</div>
      )}
      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
        <StatusDot color={color} />
        <span>{statusLabel}</span>
        <span className="text-faint">·</span>
        <span className="capitalize">{release.release_type}</span>
        <span className="text-faint">·</span>
        <span className="capitalize">{release.format}</span>
      </div>
      <div className="text-xs text-muted mt-1">
        {release.completed_tracks} of {release.track_count} track
        {release.track_count !== 1 ? "s" : ""} complete
      </div>
      {release.target_date && (
        <div className="text-xs text-faint mt-1">
          {new Date(release.target_date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TimelineLane                                                       */
/* ------------------------------------------------------------------ */

interface TimelineLaneProps {
  release: DashboardRelease;
  dateRange: DateRange;
  pxPerDay: number;
  totalWidth: number;
  onClick: () => void;
}

export function TimelineLane({
  release,
  dateRange,
  pxPerDay,
  totalWidth,
  onClick,
}: TimelineLaneProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const geo = getReleaseBarGeometry(release, dateRange, pxPerDay);
  if (!geo) return <EmptyLane height={LANE_HEIGHT} />;

  const showInnerText = geo.width > 80;
  const showDateLabel = geo.width > 50;
  const typeLabel =
    release.release_type === "single"
      ? "Single"
      : release.release_type === "ep"
        ? "EP"
        : "Album";

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top });
  };

  return (
    <div
      className="relative border-b border-white/5 group/lane hover:bg-white/[0.02] transition-colors cursor-pointer"
      style={{ height: LANE_HEIGHT, width: totalWidth }}
      onClick={onClick}
    >
      {/* Horizontal bar */}
      <div
        ref={barRef}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-2 gap-1.5 transition-all duration-200 overflow-hidden",
          barClasses(release.status),
        )}
        style={{
          left: geo.x,
          width: geo.width,
          height: BAR_HEIGHT,
          ...barInlineStyle(release.status),
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Clipped-left arrow */}
        {geo.clippedLeft && (
          <ChevronLeft size={12} className="shrink-0 opacity-50" />
        )}

        {showInnerText && (
          <>
            <span className="text-[11px] font-medium truncate">
              {typeLabel}
            </span>
            <span className="text-[11px] opacity-60">·</span>
            <span className="text-[11px] opacity-80 shrink-0">
              {release.completed_tracks}/{release.track_count}
            </span>
          </>
        )}

        {/* Target date label — pushed to the right end of the bar */}
        {showDateLabel && release.target_date && (
          <span className="text-[10px] opacity-50 ml-auto shrink-0">
            {formatShortDate(release.target_date)}
          </span>
        )}

        {/* Clipped-right arrow */}
        {geo.clippedRight && (
          <ChevronRight size={12} className="shrink-0 opacity-50 ml-auto" />
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <ReleaseTooltip release={release} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty lane (for releases with no geometry — shouldn't happen)      */
/* ------------------------------------------------------------------ */

function EmptyLane({ height }: { height: number }) {
  return (
    <div
      className="border-b border-white/5"
      style={{ height }}
    />
  );
}
