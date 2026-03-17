import Link from "next/link";
import { ChangelogCategoryBadge } from "./ChangelogCategoryBadge";
import type { ChangelogEntryPublic } from "@/types/changelog";

function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ChangelogEntryCard({ entry }: { entry: ChangelogEntryPublic }) {
  const hasDetailPage = entry.body.length > entry.summary.length;

  return (
    <article
      className={
        entry.is_highlighted
          ? "rounded-xl border border-teal-800/60 bg-teal-950/10 p-5 transition-colors hover:border-teal-700/60"
          : "rounded-xl border border-border p-5 transition-colors hover:border-border-strong"
      }
    >
      <div className="flex items-center gap-2 text-sm">
        {entry.is_highlighted && (
          <span className="text-teal-400 text-xs" aria-label="Highlighted">
            ★
          </span>
        )}
        <ChangelogCategoryBadge category={entry.category} />
        <span className="text-faint">&middot;</span>
        <time dateTime={entry.published_at} className="text-faint">
          {formatShortDate(entry.published_at)}
        </time>
        {entry.version_tag && (
          <>
            <span className="text-faint">&middot;</span>
            <span className="text-faint">{entry.version_tag}</span>
          </>
        )}
      </div>

      <h3 className="mt-2 text-xl font-semibold text-text">
        {hasDetailPage ? (
          <Link
            href={`/changelog/${entry.slug}`}
            className="hover:text-signal transition-colors"
          >
            {entry.title}
          </Link>
        ) : (
          entry.title
        )}
      </h3>

      <p className="mt-2 text-muted line-clamp-3">{entry.summary}</p>

      {hasDetailPage && (
        <Link
          href={`/changelog/${entry.slug}`}
          className="mt-3 inline-block text-sm text-signal hover:text-teal-300 transition-colors"
        >
          Read →
        </Link>
      )}
    </article>
  );
}
