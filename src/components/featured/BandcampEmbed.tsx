interface BandcampEmbedProps {
  url: string;
}

async function fetchBandcampAlbumId(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/album=(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function BandcampEmbed({ url }: BandcampEmbedProps) {
  const albumId = await fetchBandcampAlbumId(url);
  if (!albumId) return null;

  const embedSrc = `https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=0a0a0a/linkcol=2dd4bf/artwork=none/transparent=true/`;

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-white/10">
      <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 px-4 pt-3 pb-2">
        Listen on Bandcamp
      </p>
      <iframe
        style={{ border: 0, width: "100%", height: 472 }}
        src={embedSrc}
        seamless
        loading="lazy"
        title="Bandcamp player"
      />
    </div>
  );
}
