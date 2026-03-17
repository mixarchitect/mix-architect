import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryBySlug, getAdjacentEntries } from "@/lib/services/changelog";
import { ChangelogCategoryBadge } from "@/components/changelog/ChangelogCategoryBadge";
import { ChangelogBody } from "@/app/changelog/[slug]/changelog-body";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return { title: "Not Found" };

  return {
    title: `${entry.title} — Mix Architect Changelog`,
    description: entry.summary,
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
    if (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname === "www.loom.com" || parsed.hostname === "loom.com") {
      const match = parsed.pathname.match(/\/share\/([a-zA-Z0-9]+)/);
      if (match) return `https://www.loom.com/embed/${match[1]}`;
    }
    return url;
  } catch {
    return null;
  }
}

export default async function AppChangelogEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  const adjacent = await getAdjacentEntries(entry.published_at);
  const embedUrl = entry.video_url ? getVideoEmbedUrl(entry.video_url) : null;

  return (
    <div className="py-10 px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/app/changelog"
          className="text-sm text-muted hover:text-signal transition-colors"
        >
          &larr; Back to What&apos;s New
        </Link>

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

        <h1 className="mt-3 text-3xl font-bold text-text">{entry.title}</h1>

        {entry.cover_image_path && (
          <div className="mt-8">
            <img
              src={entry.cover_image_path}
              alt={`Screenshot: ${entry.title}`}
              className="w-full rounded-xl border border-border"
            />
          </div>
        )}

        <div className="mt-8">
          <ChangelogBody body={entry.body} />
        </div>

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

        {(adjacent.previous || adjacent.next) && (
          <>
            <hr className="my-10 border-0 h-px bg-border" />
            <div className="flex justify-between gap-4">
              <div className="min-w-0">
                {adjacent.previous && (
                  <Link
                    href={`/app/changelog/${adjacent.previous.slug}`}
                    className="text-sm text-muted hover:text-signal transition-colors"
                  >
                    &larr; <span className="line-clamp-1">{adjacent.previous.title}</span>
                  </Link>
                )}
              </div>
              <div className="min-w-0 text-right">
                {adjacent.next && (
                  <Link
                    href={`/app/changelog/${adjacent.next.slug}`}
                    className="text-sm text-muted hover:text-signal transition-colors"
                  >
                    <span className="line-clamp-1">{adjacent.next.title}</span> &rarr;
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
