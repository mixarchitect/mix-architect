// Spotify auto-detection via client credentials flow (no user OAuth)

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const SEARCH_URL = "https://api.spotify.com/v1/search";

let cachedToken: { token: string; expiresAt: number } | null = null;

export type DetectionResult = {
  found: boolean;
  url?: string;
  name?: string;
  artist?: string;
};

/**
 * Get a Spotify access token using client credentials.
 * Token is cached in memory until it expires.
 */
async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // Return cached token if still valid (5-min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    console.error("[spotify] token error:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/** Search Spotify by ISRC. */
async function searchByISRC(
  token: string,
  isrc: string,
): Promise<DetectionResult> {
  const params = new URLSearchParams({
    q: `isrc:${isrc}`,
    type: "track",
    limit: "1",
  });

  const res = await fetch(`${SEARCH_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return { found: false };

  const data = (await res.json()) as {
    tracks?: {
      items?: Array<{
        name: string;
        artists: Array<{ name: string }>;
        external_urls: { spotify: string };
      }>;
    };
  };

  const track = data.tracks?.items?.[0];
  if (!track) return { found: false };

  return {
    found: true,
    url: track.external_urls.spotify,
    name: track.name,
    artist: track.artists[0]?.name,
  };
}

/** Search Spotify by album name and artist. */
async function searchByAlbumArtist(
  token: string,
  album: string,
  artist: string,
): Promise<DetectionResult> {
  const params = new URLSearchParams({
    q: `album:${album} artist:${artist}`,
    type: "album",
    limit: "3",
  });

  const res = await fetch(`${SEARCH_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return { found: false };

  const data = (await res.json()) as {
    albums?: {
      items?: Array<{
        name: string;
        artists: Array<{ name: string }>;
        external_urls: { spotify: string };
      }>;
    };
  };

  const items = data.albums?.items ?? [];
  // Fuzzy match: normalize both strings, find best match
  const normalizedAlbum = album.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const item of items) {
    const normalizedName = item.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedName === normalizedAlbum) {
      return {
        found: true,
        url: item.external_urls.spotify,
        name: item.name,
        artist: item.artists[0]?.name,
      };
    }
  }

  return { found: false };
}

/**
 * Detect if a release is live on Spotify.
 * Tries ISRC search first, then falls back to album+artist.
 */
export async function detectSpotifyRelease(params: {
  isrc?: string | null;
  releaseTitle: string;
  artist: string;
}): Promise<DetectionResult> {
  const token = await getSpotifyToken();
  if (!token) return { found: false };

  // Try ISRC first (most reliable)
  if (params.isrc) {
    const result = await searchByISRC(token, params.isrc);
    if (result.found) return result;
  }

  // Fall back to album + artist search
  return searchByAlbumArtist(token, params.releaseTitle, params.artist);
}

/** Check if Spotify credentials are configured. */
export function isSpotifyConfigured(): boolean {
  return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}
