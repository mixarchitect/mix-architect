"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { ChangelogCategoryBadge } from "@/components/changelog/ChangelogCategoryBadge";
import { displayVersion, type ChangelogRecentEntry } from "@/hooks/use-changelog-status";

type Group = {
  versionTag: string | null;
  publishedAt: string;
  entries: ChangelogRecentEntry[];
};

function groupByVersion(entries: ChangelogRecentEntry[]): Group[] {
  const groups: Group[] = [];
  for (const entry of entries) {
    const tag = entry.version_tag ?? null;
    const current = groups[groups.length - 1];
    if (current && current.versionTag === tag) {
      current.entries.push(entry);
    } else {
      groups.push({ versionTag: tag, publishedAt: entry.published_at, entries: [entry] });
    }
  }
  return groups;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function WhatsNewDialog({
  entries,
  onClose,
}: {
  entries: ChangelogRecentEntry[];
  onClose: () => void;
}) {
  const t = useTranslations("help");
  const groups = groupByVersion(entries);

  return (
    <Dialog open onClose={onClose} variant="modal" labelledBy="whats-new-title">
      <div className="w-full sm:w-[480px]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 id="whats-new-title" className="text-base font-semibold text-text">
            {t("whatsNew")}
            {groups[0]?.versionTag && (
              <span className="ml-2 font-mono text-xs font-normal text-faint">
                {displayVersion(groups[0].versionTag)}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeWhatsNew")}
            className="w-9 h-9 -mr-2 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-panel2 transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 pb-4">
          {entries.length === 0 ? (
            <p className="py-6 text-sm text-muted text-center">{t("noChangelog")}</p>
          ) : (
            <div className="space-y-6">
              {groups.map((group, i) => (
                <section key={`${group.versionTag ?? "untagged"}-${i}`}>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-mono text-xs font-semibold text-text">
                      {group.versionTag ? displayVersion(group.versionTag) : t("earlierUpdates")}
                    </span>
                    <span className="text-xs text-faint">{formatDate(group.publishedAt)}</span>
                  </div>
                  <ul className="space-y-4">
                    {group.entries.map((entry) => (
                      <li key={entry.slug}>
                        <ChangelogCategoryBadge category={entry.category} compact className="mb-1" />
                        <p className="text-sm font-medium text-text">{entry.title}</p>
                        {entry.summary && (
                          <p className="text-sm text-muted line-clamp-2">{entry.summary}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border">
          <Link
            href="/app/help?tab=changelog"
            onClick={onClose}
            className="text-sm text-signal hover:underline"
          >
            {t("viewAllChangelog")}
          </Link>
        </div>
      </div>
    </Dialog>
  );
}
