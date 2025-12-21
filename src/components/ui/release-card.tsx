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
        "block rounded-md border border-border bg-panel px-5 py-4",
        "transition duration-200 ease-out",
        "hover:-translate-y-[2px] hover:border-black/15 hover:shadow-[0_10px_26px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-base font-semibold text-text leading-tight truncate">
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
        <span className="font-mono">
          {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
        </span>
        <span className="label text-[10px] text-faint">OPEN</span>
      </div>
    </Link>
  );
}


