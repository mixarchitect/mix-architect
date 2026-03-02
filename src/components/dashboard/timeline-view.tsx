"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { StatusDot } from "@/components/ui/status-dot";
import { TimelineHeader } from "./timeline-header";
import { TimelineLane } from "./timeline-lane";
import { TimelineReleaseCard } from "./timeline-release-card";
import {
  DEFAULT_PX_PER_DAY,
  getDateRange,
  getMonthColumns,
  getWeekLines,
  dateToPixel,
  daysBetween,
  toUTCMidnight,
  getStatusColor,
  getCountdown,
} from "@/lib/timeline-utils";
import type { DashboardRelease } from "@/types/release";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SIDEBAR_WIDTH = 200;
const SIDEBAR_WIDTH_TABLET = 160;
const LANE_HEIGHT = 64;

/* ------------------------------------------------------------------ */
/*  TimelineView                                                       */
/* ------------------------------------------------------------------ */

interface TimelineViewProps {
  releases: DashboardRelease[];
}

export function TimelineView({ releases }: TimelineViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [unscheduledOpen, setUnscheduledOpen] = useState(false);

  // Split into scheduled / unscheduled
  const { scheduled, unscheduled } = useMemo(() => {
    const s: DashboardRelease[] = [];
    const u: DashboardRelease[] = [];
    for (const r of releases) {
      if (r.target_date) s.push(r);
      else u.push(r);
    }
    return { scheduled: s, unscheduled: u };
  }, [releases]);

  // Default unscheduled section: expanded if ALL releases are unscheduled
  useEffect(() => {
    if (scheduled.length === 0 && unscheduled.length > 0) {
      setUnscheduledOpen(true);
    }
  }, [scheduled.length, unscheduled.length]);

  // Timeline geometry
  const pxPerDay = DEFAULT_PX_PER_DAY;
  const dateRange = useMemo(() => getDateRange(releases), [releases]);
  const months = useMemo(
    () => getMonthColumns(dateRange, pxPerDay),
    [dateRange, pxPerDay],
  );
  const weekLines = useMemo(
    () => getWeekLines(dateRange, pxPerDay),
    [dateRange, pxPerDay],
  );
  const totalDays = daysBetween(dateRange.start, dateRange.end);
  const totalWidth = totalDays * pxPerDay;
  const todayX = dateToPixel(toUTCMidnight(new Date()), dateRange.start, pxPerDay);

  // Auto-scroll to put "today" roughly 1/3 from the left edge
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const targetScroll = Math.max(0, todayX - el.clientWidth / 3);
    // Use requestAnimationFrame to wait for layout
    requestAnimationFrame(() => {
      el.scrollTo({ left: targetScroll, behavior: "smooth" });
    });
  }, [todayX]);

  // All scheduled releases are empty → show empty timeline state
  if (scheduled.length === 0) {
    return (
      <div>
        <div
          className="rounded-lg border border-dashed border-border px-6 py-14 flex flex-col items-center justify-center text-center"
        >
          <Calendar size={32} strokeWidth={1.5} className="text-muted mb-4" />
          <div className="text-sm font-semibold text-text">
            No scheduled releases
          </div>
          <p className="text-sm text-muted mt-1.5 max-w-sm">
            Add target dates to your releases to see them on the timeline.
          </p>
        </div>

        {unscheduled.length > 0 && (
          <UnscheduledSection
            releases={unscheduled}
            open={unscheduledOpen}
            onToggle={() => setUnscheduledOpen((v) => !v)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Timeline container */}
      <div
        className="rounded-lg border border-border overflow-hidden"
        style={{ background: "var(--panel)" }}
      >
        <div className="flex">
          {/* ── Fixed sidebar ── */}
          <div
            className="shrink-0 border-r border-white/5 z-10"
            style={{ width: SIDEBAR_WIDTH, background: "var(--panel)" }}
          >
            {/* Sidebar header (matches timeline header height: h-4 + h-6) */}
            <div className="border-b border-white/5 flex items-end px-3 pb-1" style={{ height: 40 }}>
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider select-none">
                Releases
              </span>
            </div>

            {/* Sidebar lanes */}
            {scheduled.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => router.push(`/app/releases/${r.id}`)}
                className="w-full flex items-center gap-2 px-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
                style={{ height: LANE_HEIGHT }}
              >
                <StatusDot color={getStatusColor(r.status)} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  {r.artist && (
                    <div className="text-[10px] text-muted truncate leading-tight">
                      {r.artist}
                    </div>
                  )}
                  <div className="text-sm font-medium text-text truncate leading-tight">
                    {r.title}
                  </div>
                  {r.target_date && <CountdownLabel targetDate={r.target_date} />}
                </div>
              </button>
            ))}
          </div>

          {/* ── Scrollable timeline area ── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto no-scrollbar"
          >
            <div style={{ width: totalWidth, minWidth: "100%" }}>
              {/* Header row */}
              <TimelineHeader
                months={months}
                todayX={todayX}
                totalWidth={totalWidth}
              />

              {/* Lane rows */}
              <div className="relative">
                {/* Week lines (behind bars) */}
                {weekLines.map((x) => (
                  <div
                    key={x}
                    className="absolute top-0 bottom-0 border-l border-dashed border-white/5 pointer-events-none"
                    style={{ left: x }}
                  />
                ))}

                {/* Month boundary lines */}
                {months.map((m) => (
                  <div
                    key={`ml-${m.year}-${m.label}`}
                    className="absolute top-0 bottom-0 border-l border-white/10 pointer-events-none"
                    style={{ left: m.startX }}
                  />
                ))}

                {/* Today line */}
                {todayX >= 0 && todayX <= totalWidth && (
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none z-10 timeline-today-line"
                    style={{
                      left: todayX,
                      width: 2,
                      background: "var(--signal)",
                    }}
                  />
                )}

                {/* Release lanes */}
                {scheduled.map((r) => (
                  <TimelineLane
                    key={r.id}
                    release={r}
                    dateRange={dateRange}
                    pxPerDay={pxPerDay}
                    totalWidth={totalWidth}
                    onClick={() => router.push(`/app/releases/${r.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Single-release hint */}
      {scheduled.length === 1 && unscheduled.length === 0 && (
        <p className="text-xs text-muted mt-3 text-center">
          Add target dates to more releases to build your pipeline view.
        </p>
      )}

      {/* Unscheduled section */}
      {unscheduled.length > 0 && (
        <UnscheduledSection
          releases={unscheduled}
          open={unscheduledOpen}
          onToggle={() => setUnscheduledOpen((v) => !v)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CountdownLabel — compact time-remaining badge in the sidebar       */
/* ------------------------------------------------------------------ */

function CountdownLabel({ targetDate }: { targetDate: string }) {
  const cd = getCountdown(targetDate);

  if (cd.isToday) {
    return (
      <span className="text-[10px] font-semibold leading-tight" style={{ color: "var(--signal)" }}>
        Release day!
      </span>
    );
  }

  if (cd.isOverdue) {
    return (
      <span className="text-[10px] text-faint leading-tight">
        {cd.label}
      </span>
    );
  }

  return (
    <span className="text-[10px] text-faint leading-tight">
      {cd.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Unscheduled Releases Section                                       */
/* ------------------------------------------------------------------ */

function UnscheduledSection({
  releases,
  open,
  onToggle,
}: {
  releases: DashboardRelease[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text transition-colors"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Unscheduled Releases
        <span className="text-xs text-faint">({releases.length})</span>
      </button>

      {open && (
        <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar pb-1">
          {releases.map((r) => (
            <TimelineReleaseCard key={r.id} release={r} />
          ))}
        </div>
      )}
    </div>
  );
}
