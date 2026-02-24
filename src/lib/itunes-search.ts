export type ItunesResult = {
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  trackViewUrl: string;
};

export async function searchItunesApi(query: string): Promise<ItunesResult[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`,
    );
    const json = await res.json();
    return (json.results ?? []).map((r: Record<string, unknown>) => ({
      trackName: r.trackName as string,
      artistName: r.artistName as string,
      artworkUrl100: r.artworkUrl100 as string,
      trackViewUrl: r.trackViewUrl as string,
    }));
  } catch {
    return [];
  }
}

export function buildPlatformUrl(
  platform: "apple" | "spotify" | "tidal" | "youtube",
  trackName: string,
  artistName: string,
  appleUrl: string,
): string {
  const q = encodeURIComponent(`${trackName} ${artistName}`);
  switch (platform) {
    case "apple": return appleUrl;
    case "spotify": return `https://open.spotify.com/search/${q}`;
    case "tidal": return `https://tidal.com/search?q=${q}`;
    case "youtube": return `https://music.youtube.com/search?q=${q}`;
  }
}
