import { createEvent, type EventAttributes, type DateArray } from "ics";

interface CalendarRelease {
  id: string;
  title: string;
  artist: string | null;
  target_date: string | null;
}

function toDateArray(dateStr: string): DateArray {
  const d = new Date(dateStr + "T00:00:00");
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}

function generateReleaseEvent(
  release: CalendarRelease,
  baseUrl: string,
): EventAttributes | null {
  if (!release.target_date) return null;

  const artistLabel = release.artist ? ` - ${release.artist}` : "";
  return {
    title: `${release.title}${artistLabel}`,
    description: `Release target date for "${release.title}".\n\nView in Mix Architect: ${baseUrl}/app/releases/${release.id}`,
    start: toDateArray(release.target_date),
    duration: { days: 1 },
    url: `${baseUrl}/app/releases/${release.id}`,
    categories: ["Mix Architect", "Release"],
    status: "CONFIRMED" as const,
    busyStatus: "FREE" as const,
    productId: "mix-architect/ics",
  };
}

export function generateSingleReleaseIcal(
  release: CalendarRelease,
  baseUrl: string,
): string | null {
  const event = generateReleaseEvent(release, baseUrl);
  if (!event) return null;

  const { error, value } = createEvent(event);
  if (error || !value) return null;
  return value;
}

export function generateUserFeedIcal(
  releases: CalendarRelease[],
  baseUrl: string,
): string {
  const events = releases
    .map((r) => generateReleaseEvent(r, baseUrl))
    .filter((e): e is EventAttributes => e !== null);

  if (events.length === 0) {
    // Return a valid empty calendar
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:mix-architect/ics",
      "CALSCALE:GREGORIAN",
      "X-WR-CALNAME:Mix Architect Releases",
      "END:VCALENDAR",
    ].join("\r\n");
  }

  // Build multi-event calendar manually since ics lib creates one at a time
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:mix-architect/ics",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Mix Architect Releases",
  ];

  for (const event of events) {
    const { value } = createEvent(event);
    if (value) {
      // Extract VEVENT block from each individual calendar
      const match = value.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
      if (match) lines.push(match[0]);
    }
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function generateFeedToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}
