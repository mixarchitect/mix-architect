interface BandcampEmbedProps {
  url?: string | null;
  embedCode?: string | null;
}

/** Extract src and height from a pasted Bandcamp <iframe> embed code. */
function extractBandcampEmbed(embedCode: string): { src: string; height: number } | null {
  const srcMatch = embedCode.match(/src="(https:\/\/bandcamp\.com\/EmbeddedPlayer\/[^"]+)"/);
  if (!srcMatch) return null;
  const heightMatch = embedCode.match(/height:\s*(\d+)px/);
  return { src: srcMatch[1], height: heightMatch ? parseInt(heightMatch[1], 10) : 472 };
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
  let height = 472;

  if (embedCode) {
    const parsed = extractBandcampEmbed(embedCode);
    if (parsed) {
      embedSrc = parsed.src;
      height = parsed.height;
    }
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
          style={{ border: 0, width: "100%", maxWidth: 700, height }}
          src={embedSrc}
          seamless
          loading="lazy"
          title="Bandcamp player"
        />
      </div>
    </div>
  );
}
