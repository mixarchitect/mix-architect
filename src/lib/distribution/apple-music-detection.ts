// Apple Music auto-detection via developer token (ES256 JWT)

import crypto from "crypto";

const SEARCH_URL = "https://api.music.apple.com/v1/catalog/us";

let cachedToken: { token: string; expiresAt: number } | null = null;

export type DetectionResult = {
  found: boolean;
  url?: string;
  name?: string;
  artist?: string;
};

/**
 * Generate an Apple Music developer JWT (ES256).
 * Cached for 12 hours (max lifetime is 6 months).
 */
function getAppleMusicToken(): string | null {
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;
  if (!keyId || !teamId || !privateKey) return null;

  // Return cached token if still valid (1-hour buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60 * 60 * 1000) {
    return cachedToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 12 * 60 * 60; // 12 hours

  // JWT header and payload
  const header = { alg: "ES256", kid: keyId };
  const payload = { iss: teamId, iat: now, exp };

  const toBase64Url = (str: string) =>
    Buffer.from(str).toString("base64url");

  const headerB64 = toBase64Url(JSON.stringify(header));
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Sign with ES256
  const sign = crypto.createSign("SHA256");
  sign.update(signingInput);
  const derSig = sign.sign(privateKey);

  // Convert DER signature to raw r||s (64 bytes) for JWT
  const rawSig = derToRaw(derSig);
  const sigB64 = rawSig.toString("base64url");

  const token = `${signingInput}.${sigB64}`;
  cachedToken = { token, expiresAt: exp * 1000 };
  return token;
}

/** Convert DER-encoded ECDSA signature to raw r||s format (64 bytes). */
function derToRaw(der: Buffer): Buffer {
  // DER: 0x30 [len] 0x02 [rLen] [r] 0x02 [sLen] [s]
  let offset = 2; // skip SEQUENCE tag + length
  if (der[1]! > 0x80) offset += der[1]! - 0x80; // handle extended length

  // Read r
  offset++; // 0x02 tag
  const rLen = der[offset]!;
  offset++;
  let r = der.subarray(offset, offset + rLen);
  offset += rLen;

  // Read s
  offset++; // 0x02 tag
  const sLen = der[offset]!;
  offset++;
  let s = der.subarray(offset, offset + sLen);

  // Strip leading zeros and pad to 32 bytes
  if (r.length > 32) r = r.subarray(r.length - 32);
  if (s.length > 32) s = s.subarray(s.length - 32);

  const raw = Buffer.alloc(64);
  r.copy(raw, 32 - r.length);
  s.copy(raw, 64 - s.length);
  return raw;
}

/** Search Apple Music by ISRC. */
async function searchByISRC(
  token: string,
  isrc: string,
): Promise<DetectionResult> {
  const res = await fetch(
    `${SEARCH_URL}/songs?filter[isrc]=${encodeURIComponent(isrc)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) return { found: false };

  const data = (await res.json()) as {
    data?: Array<{
      attributes?: {
        name: string;
        artistName: string;
        url: string;
      };
    }>;
  };

  const song = data.data?.[0];
  if (!song?.attributes) return { found: false };

  return {
    found: true,
    url: song.attributes.url,
    name: song.attributes.name,
    artist: song.attributes.artistName,
  };
}

/** Search Apple Music by album name and artist. */
async function searchByAlbumArtist(
  token: string,
  album: string,
  artist: string,
): Promise<DetectionResult> {
  const term = encodeURIComponent(`${album} ${artist}`);
  const res = await fetch(
    `${SEARCH_URL}/search?term=${term}&types=albums&limit=3`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) return { found: false };

  const data = (await res.json()) as {
    results?: {
      albums?: {
        data?: Array<{
          attributes?: {
            name: string;
            artistName: string;
            url: string;
          };
        }>;
      };
    };
  };

  const items = data.results?.albums?.data ?? [];
  const normalizedAlbum = album.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const item of items) {
    if (!item.attributes) continue;
    const normalizedName = item.attributes.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    if (normalizedName === normalizedAlbum) {
      return {
        found: true,
        url: item.attributes.url,
        name: item.attributes.name,
        artist: item.attributes.artistName,
      };
    }
  }

  return { found: false };
}

/**
 * Detect if a release is live on Apple Music.
 * Tries ISRC search first, then falls back to album+artist.
 */
export async function detectAppleMusicRelease(params: {
  isrc?: string | null;
  releaseTitle: string;
  artist: string;
}): Promise<DetectionResult> {
  const token = getAppleMusicToken();
  if (!token) return { found: false };

  // Try ISRC first
  if (params.isrc) {
    const result = await searchByISRC(token, params.isrc);
    if (result.found) return result;
  }

  // Fall back to album + artist search
  return searchByAlbumArtist(token, params.releaseTitle, params.artist);
}

/** Check if Apple Music credentials are configured. */
export function isAppleMusicConfigured(): boolean {
  return !!(
    process.env.APPLE_MUSIC_KEY_ID &&
    process.env.APPLE_MUSIC_TEAM_ID &&
    process.env.APPLE_MUSIC_PRIVATE_KEY
  );
}
