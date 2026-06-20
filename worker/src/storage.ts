import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

/* ------------------------------------------------------------------ */
/*  Supabase client (service role — bypasses RLS)                      */
/* ------------------------------------------------------------------ */

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/* ------------------------------------------------------------------ */
/*  Download source audio from the track-audio bucket (service role)    */
/* ------------------------------------------------------------------ */

/** Strip public URL prefix if present, returning bare storage path */
function extractStoragePath(urlOrPath: string): string {
  return urlOrPath.replace(
    /^https?:\/\/[^/]+\/storage\/v1\/object\/public\/track-audio\//,
    "",
  );
}

/**
 * Hard ceiling on the size of an audio source the worker will buffer
 * into memory. Mirrors the cover-art bucket cap from migration 058
 * (600 MB) with headroom for re-encoded versions. Beyond this the
 * worker would OOM trying to `arrayBuffer()` the whole file.
 */
const MAX_AUDIO_BYTES = 700 * 1024 * 1024;

export async function downloadSourceAudio(
  audioUrlOrPath: string,
  destPath: string,
): Promise<void> {
  // Prevent path traversal in destPath
  const resolved = path.resolve(destPath);
  if (resolved.includes("..")) {
    throw new Error("Invalid destination path");
  }

  const storagePath = extractStoragePath(audioUrlOrPath);

  // Reject oversized files before buffering — `download()` returns a
  // Blob whose arrayBuffer() will OOM the container on multi-GB uploads.
  // The bucket itself caps at 600 MB (migration 058) so this is a
  // defensive belt-and-suspenders check against drift.
  const { data: meta, error: metaErr } = await supabase.storage
    .from("track-audio")
    .info(storagePath);

  if (metaErr) {
    throw new Error(`Metadata fetch failed for ${storagePath}: ${metaErr.message}`);
  }

  if (meta?.size && meta.size > MAX_AUDIO_BYTES) {
    throw new Error(
      `Source audio too large (${meta.size} bytes > ${MAX_AUDIO_BYTES} cap): ${storagePath}`,
    );
  }

  // Download via service role (works for both public and private buckets)
  const { data, error } = await supabase.storage
    .from("track-audio")
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Download failed for ${storagePath}: ${error?.message ?? "no data"}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  // Belt + suspenders if .info() returned without size for some reason.
  if (buffer.length > MAX_AUDIO_BYTES) {
    throw new Error(
      `Source audio too large after download (${buffer.length} bytes): ${storagePath}`,
    );
  }

  await fs.writeFile(resolved, buffer);
}

/* ------------------------------------------------------------------ */
/*  Upload converted file to the private track-conversions bucket      */
/* ------------------------------------------------------------------ */

export async function uploadConvertedFile(
  filePath: string,
  storagePath: string,
  contentType: string,
): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);

  const { error } = await supabase.storage
    .from("track-conversions")
    .upload(storagePath, fileBuffer, {
      upsert: true,
      contentType,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Generate a 7-day signed URL
  const { data: signedData, error: signError } = await supabase.storage
    .from("track-conversions")
    .createSignedUrl(storagePath, 7 * 24 * 60 * 60);

  if (signError || !signedData?.signedUrl) {
    throw new Error(`Signed URL failed: ${signError?.message ?? "unknown"}`);
  }

  return signedData.signedUrl;
}

/* ------------------------------------------------------------------ */
/*  Get the file size of a local file                                  */
/* ------------------------------------------------------------------ */

export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/* ------------------------------------------------------------------ */
/*  Fetch track title for naming the output file                       */
/* ------------------------------------------------------------------ */

export async function getTrackTitle(trackId: string): Promise<string> {
  const { data } = await supabase
    .from("tracks")
    .select("title")
    .eq("id", trackId)
    .single();
  return data?.title ?? "Untitled";
}

/* ------------------------------------------------------------------ */
/*  Get the source audio URL from track_audio_versions                 */
/* ------------------------------------------------------------------ */

export async function getAudioVersionUrl(
  audioVersionId: string,
): Promise<string> {
  const { data } = await supabase
    .from("track_audio_versions")
    .select("audio_url")
    .eq("id", audioVersionId)
    .single();

  if (!data?.audio_url) {
    throw new Error(`Audio version ${audioVersionId} not found or has no URL`);
  }

  return data.audio_url;
}

/* ------------------------------------------------------------------ */
/*  Fetch all metadata for embedding in converted audio files          */
/* ------------------------------------------------------------------ */

export type TrackMetadata = {
  title: string;
  artist: string;
  album: string;
  track: string;
  genre: string;
  isrc: string;
  barcode: string;
  date: string;
  copyright: string;
  lyrics: string;
  replaygain_track_gain: string;
  encoded_by: string;
  comment: string;
};

/**
 * Fetch track, release, distribution, and audio version metadata
 * for embedding in converted files. Returns only non-empty tags.
 * Never throws — returns minimal branding tags on any failure.
 */
export async function getTrackMetadata(
  trackId: string,
  audioVersionId: string,
): Promise<{ metadata: Record<string, string>; artworkUrl: string | null }> {
  const BRANDING_FALLBACK = {
    metadata: {
      encoded_by: "Mix Architect",
      comment: "Converted by Mix Architect - mixarchitect.com",
    },
    artworkUrl: null,
  };

  try {
    // Fetch track + release data in parallel with distribution + LUFS
    const [trackRes, distRes, versionRes, countRes] = await Promise.all([
      supabase
        .from("tracks")
        .select(`
          title,
          track_number,
          release:releases!inner(
            id,
            title,
            artist,
            genre_tags,
            target_date,
            upc,
            cover_art_url,
            copyright_holder,
            copyright_year
          )
        `)
        .eq("id", trackId)
        .single(),
      supabase
        .from("track_distribution")
        .select("isrc, lyrics")
        .eq("track_id", trackId)
        .maybeSingle(),
      supabase
        .from("track_audio_versions")
        .select("measured_lufs")
        .eq("id", audioVersionId)
        .single(),
      // Get total track count for "N/TOTAL" format
      supabase
        .from("tracks")
        .select("id", { count: "exact", head: true })
        .eq("release_id", trackId), // placeholder — overwritten below
    ]);

    if (!trackRes.data) return BRANDING_FALLBACK;

    const track = trackRes.data;
    const release = track.release as unknown as {
      id: string;
      title: string | null;
      artist: string | null;
      genre_tags: string[] | null;
      target_date: string | null;
      upc: string | null;
      cover_art_url: string | null;
      copyright_holder: string | null;
      copyright_year: string | null;
    };

    // Re-fetch total tracks with correct release_id
    const { count: totalTracks } = await supabase
      .from("tracks")
      .select("id", { count: "exact", head: true })
      .eq("release_id", release.id);

    const dist = distRes?.data;
    const lufs = versionRes?.data?.measured_lufs;

    // Extract year from target_date
    const releaseYear = release.target_date
      ? new Date(release.target_date).getFullYear().toString()
      : (release.copyright_year || "");

    // Build copyright string
    const copyrightName = release.copyright_holder || release.artist || "";
    const copyright =
      releaseYear && copyrightName
        ? `\u00A9 ${releaseYear} ${copyrightName}`
        : "";

    // Calculate ReplayGain from LUFS (ReplayGain 2.0 reference = -18 LUFS)
    let replayGain = "";
    if (lufs != null && typeof lufs === "number" && isFinite(lufs)) {
      const gain = -18 - lufs;
      const sign = gain >= 0 ? "+" : "";
      replayGain = `${sign}${gain.toFixed(2)} dB`;
    }

    // Track number formatting
    let trackNum = "";
    if (track.track_number) {
      trackNum = totalTracks
        ? `${track.track_number}/${totalTracks}`
        : `${track.track_number}`;
    }

    const allTags: Record<string, string> = {
      title: track.title || "",
      artist: release.artist || "",
      album: release.title || "",
      track: trackNum,
      genre: release.genre_tags?.[0] || "",
      isrc: dist?.isrc || "",
      barcode: release.upc || "",
      date: releaseYear,
      copyright,
      lyrics: dist?.lyrics || "",
      replaygain_track_gain: replayGain,
      encoded_by: "Mix Architect",
      comment: "Converted by Mix Architect - mixarchitect.com",
    };

    // Strip empty values
    const metadata = Object.fromEntries(
      Object.entries(allTags).filter(([, v]) => v !== ""),
    );

    return { metadata, artworkUrl: release.cover_art_url || null };
  } catch (err) {
    console.error("Metadata fetch failed (non-fatal):", err);
    return BRANDING_FALLBACK;
  }
}

/* ------------------------------------------------------------------ */
/*  Download artwork to a local temp file                              */
/* ------------------------------------------------------------------ */

/**
 * Hostname of this project's Supabase instance, parsed once at module
 * load. We only ever fetch cover art from this host — anything else
 * gets rejected.
 *
 * cover_art_url is user-controlled (the release editors accept any
 * URL the user types). Without this gate, the worker would happily
 * fetch http://169.254.169.254/... (cloud metadata, which can return
 * IAM credentials on AWS), http://localhost:54321/auth/v1/admin/users
 * (internal Supabase admin endpoints), or any other reachable URL.
 * The response is then fed to FFmpeg, where a decoder bug becomes
 * RCE-class — so SSRF here is unusually dangerous.
 */
const ALLOWED_ARTWORK_HOST = (() => {
  try {
    return new URL(supabaseUrl).host;
  } catch {
    return null;
  }
})();

function isAllowedArtworkUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  // Only allow this project's Supabase storage host. Different
  // Supabase projects can't reach each other's internal admin
  // endpoints anyway, but pinning to exactly our host removes the
  // entire SSRF surface.
  return ALLOWED_ARTWORK_HOST !== null && parsed.host === ALLOWED_ARTWORK_HOST;
}

export async function downloadArtwork(
  artworkUrl: string,
  tempDir: string,
): Promise<string | null> {
  if (!isAllowedArtworkUrl(artworkUrl)) {
    console.warn(
      `[storage] rejected artwork URL (host not allowlisted): ${artworkUrl}`,
    );
    return null;
  }

  try {
    const response = await fetch(artworkUrl);
    if (!response.ok) return null;

    // Reject oversize responses before buffering. 10 MB matches the
    // cover-art bucket cap from migration 058.
    const declaredLen = Number(response.headers.get("content-length") ?? 0);
    const MAX_ARTWORK_BYTES = 10 * 1024 * 1024;
    if (declaredLen > MAX_ARTWORK_BYTES) {
      console.warn(`[storage] artwork too large: ${declaredLen} bytes`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    let ext = "jpg";
    if (contentType.includes("png")) ext = "png";
    else if (contentType.includes("webp")) ext = "webp";

    const artworkPath = path.join(tempDir, `cover.${ext}`);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Belt + suspenders if content-length wasn't sent.
    if (buffer.length > MAX_ARTWORK_BYTES) {
      console.warn(`[storage] artwork too large (post-buffer): ${buffer.length} bytes`);
      return null;
    }

    await fs.writeFile(artworkPath, buffer);

    // If WebP, convert to JPEG for maximum player compatibility.
    // `-map_metadata -1` strips EXIF (which may include GPS).
    if (ext === "webp") {
      const { execFile: execFileCb } = await import("node:child_process");
      const { promisify } = await import("node:util");
      const execFileAsync = promisify(execFileCb);

      const jpegPath = path.join(tempDir, "cover.jpg");
      await execFileAsync(
        "ffmpeg",
        ["-i", artworkPath, "-map_metadata", "-1", "-q:v", "2", jpegPath],
        { timeout: 30_000 },
      );
      await fs.unlink(artworkPath).catch(() => {});
      return jpegPath;
    }

    return artworkPath;
  } catch (err) {
    console.error("Artwork download failed (non-fatal):", err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Sanitize a filename for storage paths                              */
/* ------------------------------------------------------------------ */

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-_.()]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

/* ------------------------------------------------------------------ */
/*  MIME type from format                                               */
/* ------------------------------------------------------------------ */

export function getContentType(format: string): string {
  const map: Record<string, string> = {
    wav: "audio/wav",
    aiff: "audio/aiff",
    flac: "audio/flac",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
  };
  // Sanitize: strip path separators and extract only alphanumeric extension
  const clean = format.replace(/[/\\]/g, "");
  const ext = (path.extname(clean).replace(".", "") || clean).replace(/[^a-zA-Z0-9]/g, "");
  return map[ext] ?? "application/octet-stream";
}
