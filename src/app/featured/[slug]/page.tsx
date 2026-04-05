import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getFeaturedReleaseBySlug,
  getRecentFeaturedReleases,
} from "@/lib/services/featured-releases";
import { getCoverArtUrl } from "@/types/featured-release";
import { CoverArt } from "@/components/featured/CoverArt";
import { StreamingLinks } from "@/components/featured/StreamingLinks";
import { FeaturedReleaseCard } from "@/components/featured/FeaturedReleaseCard";
import { BandcampEmbed } from "@/components/featured/BandcampEmbed";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getFeaturedReleaseBySlug(slug);
  if (!release) return {};

  const coverUrl = getCoverArtUrl(release.cover_art_path);
  const title =
    release.meta_title ||
    `${release.title} by ${release.artist_name} — Featured on Mix Architect`;
  const description =
    release.meta_description || release.body.slice(0, 155) + "...";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mixarchitect.com/featured/${release.slug}`,
      type: "article",
      images: [
        {
          url: coverUrl,
          width: 1200,
          height: 1200,
          alt: `${release.title} cover art`,
        },
      ],
      publishedTime: release.featured_date,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverUrl],
    },
  };
}

export default async function FeaturedReleasePage({ params }: Props) {
  const { slug } = await params;
  const release = await getFeaturedReleaseBySlug(slug);
  if (!release) notFound();

  const [moreReleases, locale, messages] = await Promise.all([
    getRecentFeaturedReleases(slug, 3),
    getLocale(),
    getMessages(),
  ]);
  const coverUrl = getCoverArtUrl(release.cover_art_path);

  const featuredDateFormatted = new Date(release.featured_date).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: release.title,
    description: release.headline,
    image: coverUrl,
    datePublished: release.featured_date,
    author:
      release.author_name === "Mix Architect"
        ? {
            "@type": "Organization",
            name: "Mix Architect",
            url: "https://mixarchitect.com",
          }
        : release.author_url
          ? {
              "@type": "Person",
              name: release.author_name,
              url: release.author_url,
            }
          : { "@type": "Person", name: release.author_name },
    publisher: {
      "@type": "Organization",
      name: "Mix Architect",
      url: "https://mixarchitect.com",
    },
    about: {
      "@type": "MusicAlbum",
      name: release.title,
      byArtist: {
        "@type": "MusicGroup",
        name: release.artist_name,
      },
      genre: release.genre_tags,
      datePublished: release.release_date,
    },
  };

  // Strip leading spaces from each line (prevents Markdown code-block interpretation)
  const cleanBody = release.body
    .split("\n")
    .map((line) => line.replace(/^[ \t]+/, ""))
    .join("\n");

  // Split body for pull quote insertion (~40% mark)
  const bodyLines = cleanBody.split("\n\n");
  const splitIndex = Math.max(1, Math.floor(bodyLines.length * 0.4));
  const bodyBefore = bodyLines.slice(0, splitIndex).join("\n\n");
  const bodyAfter = bodyLines.slice(splitIndex).join("\n\n");

  return (
    <NextIntlClientProvider locale={locale} messages={{ landing: (messages as Record<string, unknown>).landing }}>
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#0A0A0A] focus:outline-none">
      <LandingNav />
      {/* Safe: JSON.stringify escapes HTML; \u003c prevents script breakout */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="pt-28 pb-20 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Back link */}
          <Link
            href="/featured"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Featured Releases
          </Link>

          {/* Hero */}
          <div className="flex flex-col sm:flex-row gap-6 mb-10">
            <CoverArt
              path={release.cover_art_path}
              alt={`${release.title} by ${release.artist_name} cover art`}
              size="lg"
              className="sm:shrink-0"
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold tracking-widest uppercase text-teal-500">
                  Featured Release
                </span>
                <span className="text-xs text-zinc-600">
                  {featuredDateFormatted}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">{release.title}</h1>
              <p className="text-xl text-zinc-400">{release.artist_name}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-zinc-400 capitalize">
                  {release.release_type}
                </span>
                {release.genre_tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/featured?genre=${encodeURIComponent(tag)}`}
                    className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-zinc-500 hover:text-teal-400 hover:border-teal-500/30 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
                {release.source === "platform" && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    Made with Mix Architect
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Streaming links */}
          <div className="border border-white/10 rounded-lg p-4 mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
              Listen on
            </p>
            <StreamingLinks release={release} size="md" layout="grid" />
          </div>

          {/* Bandcamp embed */}
          {(release.bandcamp_embed || release.link_bandcamp) && (
            <BandcampEmbed embedCode={release.bandcamp_embed} url={release.link_bandcamp} />
          )}

          {/* Author byline */}
          {release.author_name && (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-300 font-medium">
                  {release.author_url ? (
                    <a
                      href={release.author_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal-400 transition-colors"
                    >
                      By {release.author_name}
                    </a>
                  ) : (
                    <>By {release.author_name}</>
                  )}
                </span>
              </div>
              {release.author_bio && (
                <p className="text-sm text-zinc-500 italic mt-1">
                  {release.author_bio}
                </p>
              )}
            </div>
          )}

          {/* Body (Markdown) */}
          <div className="prose prose-invert prose-zinc prose-base max-w-none font-sans prose-headings:text-white prose-headings:font-sans prose-a:text-teal-400 prose-blockquote:border-teal-500 prose-code:font-sans prose-pre:font-sans">
            <Markdown remarkPlugins={[remarkGfm]}>{bodyBefore}</Markdown>

            {release.pull_quote && (
              <blockquote className="not-prose border-l-2 border-teal-500 pl-6 py-4 my-8">
                <p className="text-lg text-zinc-300 italic leading-relaxed">
                  &ldquo;{release.pull_quote}&rdquo;
                </p>
              </blockquote>
            )}

            <Markdown remarkPlugins={[remarkGfm]}>{bodyAfter}</Markdown>
          </div>

          {/* Credits */}
          {release.credits && (
            <div className="mt-12 pt-6 border-t border-white/8">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">
                Credits
              </h3>
              <div className="text-sm text-zinc-500 space-y-1">
                {release.credits.split(/\n|\\n/).map((line, i) => (
                  <p key={i}>{line.trim()}</p>
                ))}
              </div>
            </div>
          )}

          {/* More Featured Releases */}
          {moreReleases.length > 0 && (
            <div className="mt-16 pt-8 border-t border-white/8">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-6">
                More Featured Releases
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moreReleases.map((r) => (
                  <FeaturedReleaseCard
                    key={r.id}
                    release={r}
                    variant="archive"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <LandingFooter />
    </main>
    </NextIntlClientProvider>
  );
}
