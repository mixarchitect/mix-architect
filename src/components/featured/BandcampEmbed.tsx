interface BandcampEmbedProps {
  url: string;
}

async function fetchBandcampEmbed(url: string): Promise<string | null> {
  try {
    const oembedUrl = `https://bandcamp.com/api/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.html ?? null;
  } catch {
    return null;
  }
}

function extractAndRestyle(html: string): string {
  // Extract the src from the iframe
  const srcMatch = html.match(/src="([^"]+)"/);
  if (!srcMatch) return html;

  let src = srcMatch[1];
  // Force dark background and white link color
  src = src.replace(/bgcol=[^/]+/, "bgcol=0a0a0a");
  src = src.replace(/linkcol=[^/]+/, "linkcol=2dd4bf");

  return `<iframe style="border:0;width:100%;height:120px;" src="${src}" seamless loading="lazy"></iframe>`;
}

export async function BandcampEmbed({ url }: BandcampEmbedProps) {
  const html = await fetchBandcampEmbed(url);
  if (!html) return null;

  const styledHtml = extractAndRestyle(html);

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-white/10">
      <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 px-4 pt-3 pb-2">
        Listen on Bandcamp
      </p>
      <div dangerouslySetInnerHTML={{ __html: styledHtml }} />
    </div>
  );
}
