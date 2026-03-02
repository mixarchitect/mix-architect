import type { DashboardRelease } from "@/types/release";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Default pixels per day — ~135 px per 30-day month */
export const DEFAULT_PX_PER_DAY = 4.5;

/** Maximum date range in months to prevent absurdly wide timelines */
const MAX_RANGE_MONTHS = 18;

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

/** Midnight UTC for a date string or Date */
export function toUTCMidnight(d: string | Date): Date {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/** Start of a month (UTC) */
function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/** End of a month (last day, UTC) */
function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}

/** Add N months to a date (UTC) */
function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate()));
}

/** Days between two UTC-midnight dates */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Abbreviated month name */
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* ------------------------------------------------------------------ */
/*  getDateRange — visible range for the timeline                      */
/* ------------------------------------------------------------------ */

export interface DateRange {
  start: Date; // first day (UTC midnight)
  end: Date;   // last day  (UTC midnight)
}

/**
 * Determine the visible date range for the timeline.
 *
 * Default: 2 months before today → 4 months after today,
 * expanded if any release falls outside that window.
 * Capped at MAX_RANGE_MONTHS total.
 */
export function getDateRange(releases: DashboardRelease[]): DateRange {
  const today = toUTCMidnight(new Date());
  let start = startOfMonth(addMonths(today, -2));
  let end = endOfMonth(addMonths(today, 4));

  for (const r of releases) {
    if (r.target_date) {
      const td = toUTCMidnight(r.target_date);
      if (td < start) start = startOfMonth(td);
      if (td > end) end = endOfMonth(td);
    }
    const ca = toUTCMidnight(r.created_at);
    if (ca < start) start = startOfMonth(ca);
  }

  // Cap at MAX_RANGE_MONTHS
  const maxEnd = endOfMonth(addMonths(start, MAX_RANGE_MONTHS));
  if (end > maxEnd) end = maxEnd;

  return { start, end };
}

/* ------------------------------------------------------------------ */
/*  getMonthColumns — month labels + pixel positions                    */
/* ------------------------------------------------------------------ */

export interface MonthColumn {
  label: string;     // "Jan", "Feb", etc.
  year: number;
  startX: number;    // left edge in pixels
  width: number;     // column width in pixels
  date: Date;        // first day of the month (UTC)
}

export function getMonthColumns(
  range: DateRange,
  pxPerDay: number,
): MonthColumn[] {
  const columns: MonthColumn[] = [];
  let cursor = startOfMonth(range.start);

  while (cursor <= range.end) {
    const monthStart = cursor < range.start ? range.start : cursor;
    const monthEnd = endOfMonth(cursor);
    const clippedEnd = monthEnd > range.end ? range.end : monthEnd;

    const startX = daysBetween(range.start, monthStart) * pxPerDay;
    const width = (daysBetween(monthStart, clippedEnd) + 1) * pxPerDay;

    columns.push({
      label: MONTH_LABELS[cursor.getUTCMonth()],
      year: cursor.getUTCFullYear(),
      startX,
      width,
      date: new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1)),
    });

    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }

  return columns;
}

/* ------------------------------------------------------------------ */
/*  dateToPixel — convert a date to an x-offset in pixels              */
/* ------------------------------------------------------------------ */

export function dateToPixel(
  date: Date | string,
  rangeStart: Date,
  pxPerDay: number,
): number {
  const d = typeof date === "string" ? toUTCMidnight(date) : date;
  return daysBetween(rangeStart, d) * pxPerDay;
}

/* ------------------------------------------------------------------ */
/*  getWeekLines — positions of weekly dashed lines                    */
/* ------------------------------------------------------------------ */

export function getWeekLines(
  range: DateRange,
  pxPerDay: number,
): number[] {
  const lines: number[] = [];
  // Start from the first Monday on or after range.start
  const cursor = new Date(range.start);
  const dayOfWeek = cursor.getUTCDay(); // 0=Sun
  const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  cursor.setUTCDate(cursor.getUTCDate() + daysToMonday);

  while (cursor <= range.end) {
    const x = daysBetween(range.start, cursor) * pxPerDay;
    lines.push(x);
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/*  Release bar geometry                                               */
/* ------------------------------------------------------------------ */

export interface ReleaseBarGeometry {
  /** Left edge in pixels */
  x: number;
  /** Width in pixels (0 if point marker) */
  width: number;
  /** true → render as a dot/diamond, false → render as a bar */
  isPoint: boolean;
  /** Is the bar clipped on the left edge? */
  clippedLeft: boolean;
  /** Is the bar clipped on the right edge? */
  clippedRight: boolean;
}

/**
 * Calculate the position and width of a release bar on the timeline.
 *
 * Singles always render as a point marker.
 * EPs/Albums render as a bar from created_at → target_date,
 * unless the span is < 3 days (then also a point marker).
 * If created_at > target_date, treat as a point at target_date.
 */
export function getReleaseBarGeometry(
  release: DashboardRelease,
  range: DateRange,
  pxPerDay: number,
): ReleaseBarGeometry | null {
  if (!release.target_date) return null;

  const target = toUTCMidnight(release.target_date);
  const created = toUTCMidnight(release.created_at);
  const totalWidth = daysBetween(range.start, range.end) * pxPerDay;

  // Determine if this should be a bar or point
  const isSingle = release.release_type === "single";
  const spanDays = daysBetween(created, target);
  const isPoint = isSingle || spanDays < 3;

  if (isPoint) {
    const x = dateToPixel(target, range.start, pxPerDay);
    return {
      x: Math.max(0, Math.min(x, totalWidth)),
      width: 0,
      isPoint: true,
      clippedLeft: x < 0,
      clippedRight: x > totalWidth,
    };
  }

  // Bar: from created_at to target_date
  // If created > target (user set past date), clamp to point at target
  const barStart = created <= target ? created : target;
  const barEnd = target;

  let x = dateToPixel(barStart, range.start, pxPerDay);
  let x2 = dateToPixel(barEnd, range.start, pxPerDay);
  const clippedLeft = x < 0;
  const clippedRight = x2 > totalWidth;

  x = Math.max(0, x);
  x2 = Math.min(totalWidth, x2);

  return {
    x,
    width: Math.max(x2 - x, 4), // minimum 4px so it's visible
    isPoint: false,
    clippedLeft,
    clippedRight,
  };
}

/* ------------------------------------------------------------------ */
/*  Status → color mapping                                             */
/* ------------------------------------------------------------------ */

export type StatusColor = "blue" | "green" | "orange";

export function getStatusColor(status: string): StatusColor {
  if (status === "ready") return "green";
  if (status === "in_progress") return "orange";
  return "blue";
}
