import Link from "next/link";
import { getCoverArtUrl } from "@/types/featured-release";
import type { FeaturedRelease } from "@/types/featured-release";
import { FeaturedReleaseCard } from "@/components/featured/FeaturedReleaseCard";

interface FeaturedReleaseSectionProps {
  release: FeaturedRelease;
}

export function FeaturedReleaseSection({
  release,
}: FeaturedReleaseSectionProps) {
  const coverUrl = getCoverArtUrl(release.cover_art_path);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: release.title,
    byArtist: {
      "@type": "MusicGroup",
      name: release.artist_name,
    },
    description: release.headline,
    image: coverUrl,
    datePublished: release.release_date,
    genre: release.genre_tags,
  };

  return (
    <section id="featured" aria-labelledby="featured-heading" className="px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl">
        <h2 id="featured-heading" className="text-center text-3xl md:text-4xl font-bold text-white mb-2">
          Featured Release
        </h2>
        <p className="text-center mt-4 text-white/50 mb-8">
          Spotlighting great releases and the people behind the sound.
        </p>

        <FeaturedReleaseCard release={release} variant="spotlight" />

        <div className="mt-6 text-center">
          <Link
            href="/featured"
            className="text-sm text-teal-500 hover:text-teal-400 transition-colors"
          >
            View all featured releases &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
