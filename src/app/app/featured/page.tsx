import type { Metadata } from "next";
import { getFeaturedReleases, getAllGenres } from "@/lib/services/featured-releases";
import { FeaturedReleaseCard } from "@/components/featured/FeaturedReleaseCard";
import { GenreFilter } from "@/components/featured/GenreFilter";
import { EmptyState } from "@/components/ui/empty-state";
import { Music } from "lucide-react";
import { FeaturedArchiveLoadMore } from "./load-more";

export const metadata: Metadata = {
  title: "Featured Releases — Mix Architect",
};

type Props = { searchParams: Promise<{ genre?: string }> };

export default async function AppFeaturedPage({ searchParams }: Props) {
  const { genre } = await searchParams;
  const [{ releases, total }, genres] = await Promise.all([
    getFeaturedReleases(1, 12, genre),
    getAllGenres(),
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-10 px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold text-text">What we&apos;re spinning</h1>
          <p className="text-sm text-muted mt-1 max-w-lg">
            Spotlighting great releases and the people behind the sound, from
            indie to major, emerging to established.
          </p>

          <GenreFilter genres={genres} active={genre} basePath="/app/featured" />

          {releases.length === 0 ? (
            <div className="mt-16">
              <EmptyState
                icon={Music}
                title="No featured releases yet"
                description="Check back soon for curated writeups on great releases."
                size="lg"
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {releases.map((release) => (
                  <FeaturedReleaseCard
                    key={release.id}
                    release={release}
                    variant="archive"
                    showNowFeatured
                    basePath="/app/featured"
                  />
                ))}
              </div>

              {total > 12 && (
                <FeaturedArchiveLoadMore
                  initialCount={releases.length}
                  total={total}
                  genre={genre}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
