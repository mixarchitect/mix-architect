import { cn } from "@/lib/cn";
import type { FeaturedRelease } from "@/types/featured-release";
import { getStreamingLinks } from "@/types/featured-release";
import { PLATFORM_ICON_MAP } from "@/components/icons/streaming-platforms";

interface StreamingLinksProps {
  release: FeaturedRelease;
  size?: "sm" | "md" | "lg";
  layout?: "row" | "grid";
  className?: string;
}

export function StreamingLinks({
  release,
  size = "sm",
  layout = "row",
  className,
}: StreamingLinksProps) {
  const links = getStreamingLinks(release);

  if (links.length === 0) return null;

  return (
    <div
      className={cn(
        layout === "row" && "flex flex-wrap items-center gap-2",
        layout === "grid" && "grid grid-cols-2 gap-2",
        className,
      )}
    >
      {links.map((link) => {
        const Icon = PLATFORM_ICON_MAP[link.icon];

        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Listen on ${link.platform}`}
            className={cn(
              "inline-flex items-center gap-2 transition-colors text-zinc-500 hover:text-teal-400",
              size === "sm" && "text-sm",
              size === "md" &&
                "text-sm px-3 py-1.5 rounded-full border border-white/10 hover:border-teal-500/30",
              size === "lg" &&
                "text-sm px-4 py-2 rounded-full border border-white/10 hover:border-teal-500/30",
            )}
          >
            {Icon && (
              <Icon
                width={size === "sm" ? 16 : 20}
                height={size === "sm" ? 16 : 20}
              />
            )}
            {size !== "sm" && <span>{link.platform}</span>}
            {size === "lg" && (
              <span className="text-zinc-600 text-xs">Listen</span>
            )}
          </a>
        );
      })}
    </div>
  );
}
