import Link from "next/link";
import { getAllEntries } from "@/lib/services/changelog-admin";
import { ChangelogCategoryBadge } from "@/components/changelog/ChangelogCategoryBadge";
import { ChangelogAdminActions } from "./changelog-admin-actions";

export const dynamic = "force-dynamic";

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function AdminChangelogPage() {
  const entries = await getAllEntries();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Changelog</h1>
          <p className="text-sm text-muted mt-1">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Link
          href="/admin/changelog/new"
          className="rounded-lg bg-signal px-4 py-2 text-sm font-medium text-signal-on transition-colors hover:opacity-90"
        >
          + New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-muted">No changelog entries yet.</p>
          <Link
            href="/admin/changelog/new"
            className="mt-4 inline-block text-sm text-signal hover:underline"
          >
            Create your first entry
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-border bg-panel p-4"
            >
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={
                    entry.is_published
                      ? "text-teal-400 text-xs font-semibold uppercase tracking-wide"
                      : "text-faint text-xs font-semibold uppercase tracking-wide"
                  }
                >
                  {entry.is_published ? "Published" : "Draft"}
                </span>
                <span className="text-faint">&middot;</span>
                <ChangelogCategoryBadge category={entry.category} />
                <span className="text-faint">&middot;</span>
                <span className="text-faint">
                  {formatShortDate(entry.published_at)}
                </span>
                {entry.version_tag && (
                  <>
                    <span className="text-faint">&middot;</span>
                    <span className="text-faint">{entry.version_tag}</span>
                  </>
                )}
              </div>

              <h3 className="mt-2 font-semibold text-text">{entry.title}</h3>

              {entry.is_highlighted && (
                <span className="mt-1 inline-block text-xs text-teal-400">
                  ★ Highlighted
                </span>
              )}

              <ChangelogAdminActions entry={entry} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
