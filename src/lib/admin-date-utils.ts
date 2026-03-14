// Pure date utility functions for admin dashboard (no external deps)

export type PresetKey = "today" | "yesterday" | "7d" | "30d" | "90d" | "365d";
export type CompareKey = "none" | "previous_period" | "previous_year";

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function subDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
}

export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + n;
  d.setMonth(targetMonth);
  // Clamp day if the month overflowed (e.g. Jan 31 + 1mo = Mar 3 → clamp to Feb 28)
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0); // last day of previous month
  }
  return d;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns a 6-row x 7-column grid. Null cells are padding from adjacent months. */
export function getCalendarGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = getDaysInMonth(year, month);
  const grid: (Date | null)[][] = [];
  let day = 1;

  for (let row = 0; row < 6; row++) {
    const week: (Date | null)[] = [];
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < firstDay) {
        week.push(null);
      } else if (day > daysInMonth) {
        week.push(null);
      } else {
        week.push(new Date(year, month, day));
        day++;
      }
    }
    grid.push(week);
    if (day > daysInMonth) break;
  }

  return grid;
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateISO(str: string): Date | null {
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, ys, ms, ds] = match;
  const date = new Date(Number(ys), Number(ms) - 1, Number(ds));
  if (isNaN(date.getTime())) return null;
  return date;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isInRange(date: Date, from: Date, to: Date): boolean {
  const t = startOfDay(date).getTime();
  return t >= startOfDay(from).getTime() && t <= startOfDay(to).getTime();
}

export function resolvePreset(key: PresetKey): { from: Date; to: Date } {
  const today = startOfDay(new Date());
  const now = endOfDay(new Date());

  switch (key) {
    case "today":
      return { from: today, to: now };
    case "yesterday": {
      const y = subDays(today, 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "7d":
      return { from: startOfDay(subDays(today, 6)), to: now };
    case "30d":
      return { from: startOfDay(subDays(today, 29)), to: now };
    case "90d":
      return { from: startOfDay(subDays(today, 89)), to: now };
    case "365d":
      return { from: startOfDay(subDays(today, 364)), to: now };
  }
}

export function resolveComparison(
  from: Date,
  to: Date,
  compare: CompareKey,
): { from: Date; to: Date } | null {
  if (compare === "none") return null;

  const spanMs = endOfDay(to).getTime() - startOfDay(from).getTime();
  const spanDays = Math.round(spanMs / (24 * 60 * 60 * 1000));

  switch (compare) {
    case "previous_period": {
      const prevTo = subDays(from, 1);
      const prevFrom = subDays(from, spanDays);
      return { from: startOfDay(prevFrom), to: endOfDay(prevTo) };
    }
    case "previous_year": {
      const prevFrom = new Date(from);
      prevFrom.setFullYear(prevFrom.getFullYear() - 1);
      const prevTo = new Date(to);
      prevTo.setFullYear(prevTo.getFullYear() - 1);
      return { from: startOfDay(prevFrom), to: endOfDay(prevTo) };
    }
  }
}

export const PRESET_OPTIONS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "365d", label: "Last 365 days" },
];

export const COMPARE_OPTIONS: { key: CompareKey; label: string }[] = [
  { key: "none", label: "No comparison" },
  { key: "previous_period", label: "Previous period" },
  { key: "previous_year", label: "Previous year" },
];
