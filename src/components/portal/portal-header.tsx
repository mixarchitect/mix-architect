import type { PortalRelease } from "@/lib/portal-types";

type PortalHeaderProps = {
  release: PortalRelease;
  trackCount: number;
};

export function PortalHeader({ release, trackCount }: PortalHeaderProps) {
  const typeLabel =
    release.release_type === "ep"
      ? "EP"
      : release.release_type.charAt(0).toUpperCase() +
        release.release_type.slice(1);

  return (
    <header className="text-center mb-10">
      {release.cover_art_url && (
        <img
          src={release.cover_art_url}
          alt={`${release.title} cover art`}
          className="w-[180px] h-[180px] rounded-xl object-cover mx-auto mb-6 shadow-md"
        />
      )}
      <h1 className="text-3xl font-bold text-text">{release.title}</h1>
      {release.artist && (
        <p className="text-lg text-muted mt-1">{release.artist}</p>
      )}
      <div className="flex items-center justify-center gap-3 mt-3 text-xs text-faint">
        <span>{typeLabel}</span>
        <span>&middot;</span>
        <span>{release.format}</span>
        <span>&middot;</span>
        <span>
          {trackCount} track{trackCount !== 1 ? "s" : ""}
        </span>
      </div>
    </header>
  );
}
