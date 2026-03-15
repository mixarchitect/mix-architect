"use client";

import { useState, useTransition } from "react";
import type { FeaturedRelease } from "@/types/featured-release";
import { FeaturedReleaseCard } from "@/components/featured/FeaturedReleaseCard";
import { loadMoreFeaturedReleases } from "./actions";

interface Props {
  initialCount: number;
  total: number;
}

export function FeaturedArchiveLoadMore({ initialCount, total }: Props) {
  const [extra, setExtra] = useState<FeaturedRelease[]>([]);
  const [isPending, startTransition] = useTransition();
  const loaded = initialCount + extra.length;
  const hasMore = loaded < total;

  function handleLoadMore() {
    const nextPage = Math.floor(loaded / 12) + 1;
    startTransition(async () => {
      const more = await loadMoreFeaturedReleases(nextPage);
      setExtra((prev) => [...prev, ...more]);
    });
  }

  return (
    <>
      {extra.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {extra.map((release) => (
            <FeaturedReleaseCard
              key={release.id}
              release={release}
              variant="archive"
              showNowFeatured
              basePath="/app/featured"
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="px-6 py-2.5 text-sm font-medium text-text border border-border rounded-full hover:border-signal/40 transition-colors disabled:opacity-50"
          >
            {isPending ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
