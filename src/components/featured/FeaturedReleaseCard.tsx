import Link from "next/link";
import { cn } from "@/lib/cn";
import type { FeaturedRelease } from "@/types/featured-release";
import { CoverArt } from "./CoverArt";
import { StreamingLinks } from "./StreamingLinks";

interface FeaturedReleaseCardProps {
  release: FeaturedRelease;
  variant: "spotlight" | "archive";
  showNowFeatured?: boolean;
  className?: string;
  /** Base path for links: "/featured" (landing, default) or "/app/featured" (in-app) */
  basePath?: string;
}

export function FeaturedReleaseCard({
  release,
  variant,
  showNowFeatured,
  className,
  basePath = "/featured",
}: FeaturedReleaseCardProps) {
  if (variant === "spotlight") {
    return <SpotlightCard release={release} className={className} basePath={basePath} />;
  }
  return (
    <ArchiveCard
      release={release}
      showNowFeatured={showNowFeatured}
      className={className}
      basePath={basePath}
    />
  );
}

function SpotlightCard({
  release,
  className,
  basePath = "/featured",
}: {
  release: FeaturedRelease;
  className?: string;
  basePath?: string;
}) {
  const isGuest = release.author_name && release.author_name !== "Mix Architect";

  return (
    <div
      className={cn(
        "relative bg-panel border border-border rounded-lg shadow-DEFAULT overflow-hidden",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row gap-6 p-6">
        <CoverArt
          path={release.cover_art_path}
          alt={`${release.title} by ${release.artist_name} cover art`}
          size="md"
        />

        <div className="flex flex-col gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold tracking-widest uppercase text-teal-500">
              Featured Release
            </span>
            {release.source === "platform" && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Made with Mix Architect
              </span>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-text">
              {release.title}{" "}
              <span className="text-muted font-normal">{release.artist_name}</span>
            </h3>
          </div>

          <p className="text-sm text-zinc-400 italic line-clamp-2">
            {release.headline}
          </p>

          {isGuest && (
            <p className="text-xs text-zinc-500">By {release.author_name}</p>
          )}

          <StreamingLinks release={release} size="sm" layout="row" />

          <Link
            href={`${basePath}/${release.slug}`}
            className="text-sm text-teal-500 hover:text-teal-400 transition-colors mt-auto self-start"
          >
            Read more &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

function ArchiveCard({
  release,
  showNowFeatured,
  className,
  basePath = "/featured",
}: {
  release: FeaturedRelease;
  showNowFeatured?: boolean;
  className?: string;
  basePath?: string;
}) {
  const isGuest = release.author_name && release.author_name !== "Mix Architect";

  return (
    <Link
      href={`${basePath}/${release.slug}`}
      className={cn(
        "group relative bg-panel border border-border rounded-lg overflow-hidden transition-colors hover:border-white/20",
        showNowFeatured && release.is_active && "border-teal-500/40",
        className,
      )}
    >
      <div className="aspect-square relative">
        <CoverArt
          path={release.cover_art_path}
          alt={`${release.title} by ${release.artist_name} cover art`}
          size="full"
          className="rounded-none ring-0"
        />
        {showNowFeatured && release.is_active && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500 text-white">
            Now Featured
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-text group-hover:text-teal-400 transition-colors truncate">
          {release.title}
        </h3>
        <p className="text-xs text-muted truncate">{release.artist_name}</p>
        <p className="text-xs text-zinc-500 italic line-clamp-2 mt-1">
          {release.headline}
        </p>
        {release.genre_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {release.genre_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/8 text-zinc-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {isGuest && (
          <p className="text-[10px] text-zinc-600 mt-1">
            By {release.author_name}
          </p>
        )}
      </div>
    </Link>
  );
}
