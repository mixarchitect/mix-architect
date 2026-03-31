interface BandcampEmbedProps {
  url?: string | null;
  embedCode?: string | null;
}

/** Extract and validate the src from a pasted Bandcamp <iframe> embed code. */
function extractBandcampSrc(embedCode: string): string | null {
  const match = embedCode.match(/src="(https:\/\/bandcamp\.com\/EmbeddedPlayer\/[^"]+)"/);
  return match ? match[1] : null;
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

export async function BandcampEmbed({ url, embedCode }: BandcampEmbedProps) {
  let embedSrc: string | null = null;

  if (embedCode) {
    embedSrc = extractBandcampSrc(embedCode);
  } else if (url) {
    const albumId = await fetchBandcampAlbumId(url);
    if (albumId) {
      embedSrc = `https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=333333/linkcol=0f91ff/artwork=none/transparent=true/`;
    }
  }

  if (!embedSrc) return null;

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-white/10">
      <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 px-4 pt-3 pb-2">
        Listen on Bandcamp
      </p>
      <div>
        <iframe
          style={{ border: 0, width: 350, height: 472 }}
          src={embedSrc}
          seamless
          loading="lazy"
          title="Bandcamp player"
        />
      </div>
    </div>
  );
}
