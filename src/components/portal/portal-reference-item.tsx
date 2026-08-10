import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BriefReference } from "@/lib/db-types";

type Props = {
  reference: BriefReference;
};

export function PortalReferenceItem({ reference }: Props) {
  const t = useTranslations("portal");
  const { song_title, artist, note, url, artwork_url } = reference;

  return (
    <div className="flex items-center gap-3">
      {/* Album art thumbnail */}
      {artwork_url ? (
        <img
          src={artwork_url}
          alt={t("reference.artworkAlt", { title: song_title })}
          className="w-9 h-9 rounded-[3px] shrink-0 object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-[3px] shrink-0 bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-faint text-xs">
          &#9835;
        </div>
      )}

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text truncate">
          {song_title}
          {artist && (
            <span className="text-muted font-normal"> &mdash; {artist}</span>
          )}
        </div>
        {note && (
          <div className="text-xs text-muted italic truncate">
            &ldquo;{note}&rdquo;
          </div>
        )}
      </div>

      {/* External link */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative shrink-0 p-1.5 text-muted hover:text-signal transition-colors after:absolute after:content-[''] after:-inset-3"
          title={t("reference.openLink")}
          aria-label={t("reference.openLink")}
        >
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}
