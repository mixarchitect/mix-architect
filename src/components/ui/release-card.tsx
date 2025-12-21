import Link from "next/link";
import { TagBadge } from "@/components/ui/tag-badge";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  name: string;
  artistName?: string | null;
  type: string;
  createdAt?: string | null;
  className?: string;
};

export function ReleaseCard({
  id,
  name,
  artistName,
  type,
  createdAt,
  className,
}: Props) {
  return (
    <Link
      href={`/app/releases/${id}`}
      className={cn(
        "group block rounded-md border border-border bg-panel",
        "px-5 py-4",
        "transition-all duration-150 ease-out",
        "hover:-translate-y-[2px] hover:border-border-strong hover:shadow-paper",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-text leading-tight truncate group-hover:text-signal transition-colors duration-150">
            {name}
          </div>
          <div className="mt-1 text-sm text-muted truncate">
            {artistName || "—"}
          </div>
        </div>
        <div className="shrink-0">
          <TagBadge>{type}</TagBadge>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-faint">
        <span className="font-mono tracking-tight">
          {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
        </span>
        <span className="label text-[10px] text-faint group-hover:text-muted transition-colors">
          OPEN →
        </span>
      </div>
    </Link>
  );
}
