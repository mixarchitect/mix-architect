import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryBySlug, getAdjacentEntries } from "@/lib/services/changelog";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { ChangelogCategoryBadge } from "@/components/changelog/ChangelogCategoryBadge";
import { ChangelogBody } from "./changelog-body";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return { title: "Not Found" };

  return {
    title: `${entry.title} — Mix Architect Changelog`,
    description: entry.summary,
    openGraph: {
      title: entry.title,
      description: entry.summary,
      url: `https://mixarchitect.com/changelog/${entry.slug}`,
      type: "article",
      publishedTime: entry.published_at,
    },
  };
}

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // YouTube
    if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com"
    ) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }

    // Loom
    if (
      parsed.hostname === "www.loom.com" ||
      parsed.hostname === "loom.com"
    ) {
      const match = parsed.pathname.match(/\/share\/([a-zA-Z0-9]+)/);
      if (match) return `https://www.loom.com/embed/${match[1]}`;
    }

    return url;
  } catch {
    return null;
  }
}

export default async function ChangelogEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  const adjacent = await getAdjacentEntries(entry.published_at);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.summary,
    datePublished: entry.published_at,
    author: {
      "@type": "Organization",
      name: "Mix Architect",
      url: "https://mixarchitect.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Mix Architect",
      url: "https://mixarchitect.com",
    },
  };

  const embedUrl = entry.video_url
    ? getVideoEmbedUrl(entry.video_url)
    : null;

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-bg focus:outline-none">
      <LandingNav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/changelog"
          className="text-sm text-muted hover:text-signal transition-colors"
        >
          &larr; Back to What&apos;s New
        </Link>

        {/* Category + date + version */}
        <div className="mt-6 flex items-center gap-2 text-sm">
          <ChangelogCategoryBadge category={entry.category} />
          <span className="text-faint">&middot;</span>
          <time dateTime={entry.published_at} className="text-faint">
            {formatFullDate(entry.published_at)}
          </time>
          {entry.version_tag && (
            <>
              <span className="text-faint">&middot;</span>
              <span className="text-faint">{entry.version_tag}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-3 text-3xl font-bold text-text">{entry.title}</h1>

        {/* Cover image */}
        {entry.cover_image_path && (
          <div className="mt-8">
            <img
              src={entry.cover_image_path}
              alt={`Screenshot: ${entry.title}`}
              className="w-full rounded-xl border border-border"
            />
          </div>
        )}

        {/* Markdown body */}
        <div className="mt-8">
          <ChangelogBody body={entry.body} />
        </div>

        {/* Video embed */}
        {embedUrl && (
          <div className="mt-8 aspect-video overflow-hidden rounded-xl border border-border">
            <iframe
              src={embedUrl}
              title={`Demo video: ${entry.title}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Previous / Next navigation */}
        {(adjacent.previous || adjacent.next) && (
          <>
            <hr className="my-10 border-0 h-px bg-border" />
            <div className="flex justify-between gap-4">
              <div className="min-w-0">
                {adjacent.previous && (
                  <Link
                    href={`/changelog/${adjacent.previous.slug}`}
                    className="text-sm text-muted hover:text-signal transition-colors"
                  >
                    &larr;{" "}
                    <span className="line-clamp-1">
                      {adjacent.previous.title}
                    </span>
                  </Link>
                )}
              </div>
              <div className="min-w-0 text-right">
                {adjacent.next && (
                  <Link
                    href={`/changelog/${adjacent.next.slug}`}
                    className="text-sm text-muted hover:text-signal transition-colors"
                  >
                    <span className="line-clamp-1">{adjacent.next.title}</span>{" "}
                    &rarr;
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <LandingFooter />
    </main>
  );
}
