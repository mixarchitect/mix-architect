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

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getFeaturedReleaseBySlug(slug);
  if (!release) return {};

  return {
    title: release.meta_title || `${release.title} by ${release.artist_name} — Featured`,
  };
}

export default async function AppFeaturedReleasePage({ params }: Props) {
  const { slug } = await params;
  const release = await getFeaturedReleaseBySlug(slug);
  if (!release) notFound();

  const moreReleases = await getRecentFeaturedReleases(slug, 3);
  const coverUrl = getCoverArtUrl(release.cover_art_path);

  const featuredDateFormatted = new Date(release.featured_date).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

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
    <div className="flex-1 overflow-y-auto">
      <div className="py-10 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Back link */}
          <Link
            href="/app/featured"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-8"
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
                <span className="text-xs font-semibold tracking-widest uppercase text-signal">
                  Featured Release
                </span>
                <span className="text-xs text-muted">
                  {featuredDateFormatted}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-text">{release.title}</h1>
              <p className="text-xl text-muted">{release.artist_name}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted capitalize">
                  {release.release_type}
                </span>
                {release.genre_tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/app/featured?genre=${encodeURIComponent(tag)}`}
                    className="text-xs px-2 py-0.5 rounded-full border border-border text-muted hover:text-signal hover:border-signal/30 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
                {release.source === "platform" && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-signal/10 text-signal border border-signal/20">
                    Made with Mix Architect
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Streaming links */}
          <div className="border border-border rounded-lg p-4 mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">
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
                <span className="text-text font-medium">
                  {release.author_url ? (
                    <a
                      href={release.author_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-signal transition-colors"
                    >
                      By {release.author_name}
                    </a>
                  ) : (
                    <>By {release.author_name}</>
                  )}
                </span>
              </div>
              {release.author_bio && (
                <p className="text-sm text-muted italic mt-1">
                  {release.author_bio}
                </p>
              )}
            </div>
          )}

          {/* Body (Markdown) */}
          <div className="prose prose-zinc dark:prose-invert prose-base max-w-none font-sans prose-headings:text-text prose-headings:font-sans prose-a:text-signal prose-blockquote:border-signal prose-code:font-sans prose-pre:font-sans">
            <Markdown remarkPlugins={[remarkGfm]}>{bodyBefore}</Markdown>

            {release.pull_quote && (
              <blockquote className="not-prose border-l-2 border-signal pl-6 py-4 my-8">
                <p className="text-lg text-muted italic leading-relaxed">
                  &ldquo;{release.pull_quote}&rdquo;
                </p>
              </blockquote>
            )}

            <Markdown remarkPlugins={[remarkGfm]}>{bodyAfter}</Markdown>
          </div>

          {/* Credits */}
          {release.credits && (
            <div className="mt-12 pt-6 border-t border-border">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">
                Credits
              </h3>
              <div className="text-sm text-muted space-y-1">
                {release.credits.split(/\n|\\n/).map((line, i) => (
                  <p key={i}>{line.trim()}</p>
                ))}
              </div>
            </div>
          )}

          {/* More Featured Releases */}
          {moreReleases.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-6">
                More Featured Releases
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moreReleases.map((r) => (
                  <FeaturedReleaseCard
                    key={r.id}
                    release={r}
                    variant="archive"
                    basePath="/app/featured"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
