import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getFeaturedReleases, getAllGenres } from "@/lib/services/featured-releases";
import { FeaturedReleaseCard } from "@/components/featured/FeaturedReleaseCard";
import { EmptyState } from "@/components/ui/empty-state";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { Music } from "lucide-react";
import { GenreFilter } from "@/components/featured/GenreFilter";
import { FeaturedArchiveLoadMore } from "./load-more";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Featured Releases — Mix Architect",
  description:
    "Spotlighting great releases and the people behind the sound. Curated writeups covering production, mixing, and mastering across indie and major releases.",
  openGraph: {
    title: "Featured Releases — Mix Architect",
    description:
      "Spotlighting great releases and the people behind the sound.",
    url: "https://mixarchitect.com/featured",
    type: "website",
  },
};

type Props = { searchParams: Promise<{ genre?: string }> };

export default async function FeaturedArchivePage({ searchParams }: Props) {
  const { genre } = await searchParams;
  const [{ releases, total }, genres, locale, messages] = await Promise.all([
    getFeaturedReleases(1, 12, genre),
    getAllGenres(),
    getLocale(),
    getMessages(),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={{ landing: (messages as Record<string, unknown>).landing }}>
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#0A0A0A] focus:outline-none">
      <LandingNav locale={locale} />

      <div className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-white text-center">
            Featured Releases
          </h1>
          <p className="text-sm text-zinc-400 text-center mt-2 max-w-lg mx-auto">
            Spotlighting great releases and the people behind the sound, from
            indie to major, emerging to established.
          </p>

          <div className="flex justify-center">
            <GenreFilter genres={genres} active={genre} basePath="/featured" />
          </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {releases.map((release) => (
                  <FeaturedReleaseCard
                    key={release.id}
                    release={release}
                    variant="archive"
                    showNowFeatured
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

      <LandingFooter />
    </main>
    </NextIntlClientProvider>
  );
}
