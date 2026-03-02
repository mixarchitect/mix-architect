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
  /** Width in pixels */
  width: number;
  /** Is the bar clipped on the left edge? */
  clippedLeft: boolean;
  /** Is the bar clipped on the right edge? */
  clippedRight: boolean;
}

/** Minimum bar width so very short-span releases are still visible */
const MIN_BAR_PX = 24;

/**
 * Calculate the position and width of a release bar on the timeline.
 *
 * All release types render as a bar from created_at → target_date.
 * Very short spans (< 3 days) get a minimum width so they're clickable.
 * If created_at > target_date, bar starts at target_date with min width.
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

  // Bar: from created_at to target_date
  // If created > target (user set past date), use target as start with min width
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
    width: Math.max(x2 - x, MIN_BAR_PX),
    clippedLeft,
    clippedRight,
  };
}

/* ------------------------------------------------------------------ */
/*  Countdown — time remaining until target_date                       */
/* ------------------------------------------------------------------ */

export interface Countdown {
  /** Total milliseconds remaining (negative = overdue) */
  totalMs: number;
  months: number;
  days: number;
  hours: number;
  /** true when target_date is today */
  isToday: boolean;
  /** true when target_date is in the past */
  isOverdue: boolean;
  /** Formatted string: "02m 14d 08h", "Today", or "00m 03d 12h overdue" */
  label: string;
}

/**
 * Calculate countdown from now to a target date.
 * Returns months / days / hours remaining, or overdue info.
 *
 * Days are computed via UTC calendar math (immune to DST shifts).
 * Hours are computed from the local clock (hours remaining in the day).
 */
export function getCountdown(targetDateStr: string): Countdown {
  const now = new Date();

  const [y, mo, d] = targetDateStr.split("-").map(Number);

  // Calendar days between today and target — DST-safe via UTC
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const targetUTC = Date.UTC(y, mo - 1, d);
  const calendarDays = Math.round((targetUTC - todayUTC) / 86_400_000);

  // totalMs for sorting (local timestamps — DST skew acceptable here)
  const target = new Date(y, mo - 1, d);
  const totalMs = target.getTime() - now.getTime();

  const isToday = calendarDays === 0;
  const isOverdue = calendarDays < 0;

  if (isToday) {
    return { totalMs: 0, months: 0, days: 0, hours: 0, isToday: true, isOverdue: false, label: "Today" };
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  if (isOverdue) {
    const overdueDays = -calendarDays;
    const months = Math.floor(overdueDays / 30);
    const days = overdueDays % 30;
    const hours = now.getHours();
    const label = `${pad(months)}m ${pad(days)}d ${pad(hours)}h overdue`;
    return { totalMs, months, days, hours, isToday: false, isOverdue: true, label };
  }

  // Future: today is partially elapsed, so full remaining days = calendarDays - 1
  const fullDays = calendarDays - 1;
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const hours = Math.floor((nextMidnight.getTime() - now.getTime()) / 3_600_000);
  const months = Math.floor(fullDays / 30);
  const days = fullDays % 30;

  const label = `${pad(months)}m ${pad(days)}d ${pad(hours)}h`;
  return { totalMs, months, days, hours, isToday: false, isOverdue: false, label };
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
