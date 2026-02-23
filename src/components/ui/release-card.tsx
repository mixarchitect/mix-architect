import Link from "next/link";
import { StatusDot } from "@/components/ui/status-dot";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  title: string;
  artist?: string | null;
  releaseType: string;
  format: string;
  status: string;
  trackCount: number;
  completedTracks: number;
  updatedAt?: string | null;
  className?: string;
};

function statusColor(status: string): "green" | "orange" | "blue" {
  if (status === "ready") return "green";
  if (status === "in_progress") return "orange";
  return "blue";
}

function formatLabel(f: string | undefined | null): string {
  if (!f) return "Stereo";
  if (f === "atmos") return "Dolby Atmos";
  if (f === "both") return "Stereo + Atmos";
  return "Stereo";
}

function typeLabel(t: string | undefined | null): string {
  if (!t) return "—";
  if (t === "ep") return "EP";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ReleaseCard({
  id, title, artist, releaseType, format, status,
  trackCount, completedTracks, updatedAt, className,
}: Props) {
  return (
    <Link
      href={`/app/releases/${id}`}
      className={cn(
        "group block card px-5 py-4",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-text truncate group-hover:text-signal transition-colors duration-150">
            {title}
          </div>
          <div className="mt-1 text-sm text-muted truncate">{artist || "\u2014"}</div>
        </div>
        <StatusDot color={statusColor(status)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill>{typeLabel(releaseType)}</Pill>
        <Pill>{formatLabel(format)}</Pill>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
        <span className="font-mono">
          {completedTracks} of {trackCount} track{trackCount !== 1 ? "s" : ""} briefed
        </span>
        {updatedAt && <span>{relativeTime(updatedAt)}</span>}
      </div>
    </Link>
  );
}
