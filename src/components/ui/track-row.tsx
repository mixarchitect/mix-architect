import Link from "next/link";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/cn";

type Props = {
  releaseId: string;
  trackId: string;
  trackNumber: number;
  title: string;
  status: string;
  intentPreview?: string | null;
  className?: string;
};

function statusColor(s: string): "green" | "orange" | "blue" {
  if (s === "complete") return "green";
  if (s === "in_progress") return "orange";
  return "blue";
}

export function TrackRow({
  releaseId, trackId, trackNumber, title, status, intentPreview, className,
}: Props) {
  return (
    <Link
      href={`/app/releases/${releaseId}/tracks/${trackId}`}
      className={cn(
        "group flex items-center gap-4 px-5 py-4 rounded-md border border-border bg-panel",
        "hover:border-border-strong hover:shadow-sm transition-all duration-150",
        className
      )}
    >
      <span className="w-8 text-right text-sm font-medium text-faint shrink-0">
        {String(trackNumber).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text text-sm group-hover:text-signal transition-colors truncate">
          {title}
        </div>
        <div className="mt-0.5 text-xs text-muted truncate">
          {intentPreview
            ? intentPreview.length > 60
              ? intentPreview.slice(0, 60) + "\u2026"
              : intentPreview
            : "No intent defined"}
        </div>
      </div>
      <StatusDot color={statusColor(status)} />
    </Link>
  );
}
