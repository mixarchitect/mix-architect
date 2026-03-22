import Link from "next/link";
import { getCoverArtUrl } from "@/types/featured-release";
import type { FeaturedRelease } from "@/types/featured-release";
import { FeaturedReleaseCard } from "@/components/featured/FeaturedReleaseCard";
import { getTranslations } from "next-intl/server";

interface FeaturedReleaseSectionProps {
  release: FeaturedRelease;
}

export async function FeaturedReleaseSection({
  release,
}: FeaturedReleaseSectionProps) {
  const t = await getTranslations("landing");
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
      {/* Safe: JSON.stringify escapes HTML; \\u003c prevents script breakout */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-4xl">
        <h2 id="featured-heading" className="text-center text-3xl md:text-4xl font-bold text-white mb-2">
          {t("featuredReleaseHeading")}
        </h2>
        <p className="text-center mt-4 text-zinc-400 mb-8">
          {t("featuredReleaseDesc")}
        </p>

        <FeaturedReleaseCard release={release} variant="spotlight" />

        <div className="mt-6 text-center">
          <Link
            href="/featured"
            className="text-sm text-teal-500 hover:text-teal-400 transition-colors"
          >
            {t("viewAllFeatured")}
          </Link>
        </div>
      </div>
    </section>
  );
}
