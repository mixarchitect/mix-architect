"use client";

import { useState, useTransition } from "react";
import { ChangelogEntryCard } from "@/components/changelog/ChangelogEntryCard";
import { loadMoreChangelogEntries } from "./actions";
import type { ChangelogEntryPublic } from "@/types/changelog";

const PAGE_SIZE = 15;

const categories: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "feature", label: "Features" },
  { key: "improvement", label: "Improvements" },
  { key: "fix", label: "Fixes" },
  { key: "announcement", label: "Announcements" },
];

function groupByMonth(
  entries: ChangelogEntryPublic[],
): { label: string; entries: ChangelogEntryPublic[] }[] {
  const groups: Map<string, { label: string; entries: ChangelogEntryPublic[] }> =
    new Map();

  for (const entry of entries) {
    const date = new Date(entry.published_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!groups.has(key)) {
      const label = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      groups.set(key, { label, entries: [] });
    }
    groups.get(key)!.entries.push(entry);
  }

  return Array.from(groups.values());
}

export function ChangelogFeed({
  initialEntries,
  initialTotalCount,
  basePath = "/app/changelog",
}: {
  initialEntries: ChangelogEntryPublic[];
  initialTotalCount: number;
  basePath?: string;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const filteredEntries =
    activeCategory === "all"
      ? entries
      : entries.filter((e) => e.category === activeCategory);

  const groups = groupByMonth(filteredEntries);
  const hasMore = entries.length < totalCount;

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
  }

  function handleLoadMore() {
    const nextPage = page + 1;
    startTransition(async () => {
      const { entries: more, totalCount: newTotal } =
        await loadMoreChangelogEntries(nextPage, PAGE_SIZE);
      setEntries((prev) => [...prev, ...more]);
      setTotalCount(newTotal);
      setPage(nextPage);
    });
  }

  return (
    <>
      {/* Category filter tabs */}
      <div
        className="mt-8 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter by category"
      >
        {categories.map((cat) => (
          <button
            key={cat.key}
            role="tab"
            aria-selected={activeCategory === cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={
              activeCategory === cat.key
                ? "rounded-full border border-teal-600/40 bg-teal-600/20 px-3.5 py-1.5 text-sm text-teal-400 transition-colors"
                : "rounded-full border border-border bg-panel2 px-3.5 py-1.5 text-sm text-muted transition-colors hover:text-text"
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Entries grouped by month */}
      <div className="mt-10 space-y-10">
        {groups.length === 0 && (
          <div className="rounded-xl border border-border p-8 text-center text-muted">
            Nothing here yet — but we&apos;re working on it. Check back soon!
          </div>
        )}

        {groups.map((group) => (
          <section key={group.label}>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-medium uppercase tracking-wide text-faint">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-4">
              {group.entries.map((entry) => (
                <ChangelogEntryCard key={entry.id} entry={entry} basePath={basePath} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-lg border border-border bg-panel2 px-6 py-2.5 text-sm text-muted transition-colors hover:text-text hover:border-border-strong disabled:opacity-50"
          >
            {isPending ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
