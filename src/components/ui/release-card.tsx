import Link from "next/link";
import { TagBadge } from "@/components/ui/tag-badge";
import { StatusIndicator } from "@/components/ui/status-dot";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  name: string;
  artistName?: string | null;
  type: string;
  createdAt?: string | null;
  status?: "active" | "draft" | "live";
  className?: string;
};

export function ReleaseCard({
  id,
  name,
  artistName,
  type,
  createdAt,
  status = "active",
  className,
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
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-text leading-tight truncate group-hover:text-signal transition-colors duration-150">
            {name}
          </div>
          <div className="mt-1.5 text-sm text-muted truncate">
            {artistName || "—"}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <TagBadge>{type}</TagBadge>
          <StatusIndicator
            color={status === "live" ? "green" : status === "draft" ? "orange" : "blue"}
            label={status === "live" ? "Held by Production" : status === "draft" ? "Draft" : "Active"}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className="font-mono text-faint tracking-tight">
          {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
        </span>
        <span className="label text-[10px] text-muted group-hover:text-signal transition-colors">
          OPEN →
        </span>
      </div>
    </Link>
  );
}
