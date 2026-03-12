import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SourceInfo = {
  codecName: string;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  duration: number;
  formatName: string | null;
};

/* ------------------------------------------------------------------ */
/*  Probe source audio properties via ffprobe                          */
/* ------------------------------------------------------------------ */

export async function probeSource(filePath: string): Promise<SourceInfo> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "quiet",
    "-print_format", "json",
    "-show_streams",
    "-show_format",
    filePath,
  ]);

  const data = JSON.parse(stdout);
  const audio = data.streams?.find(
    (s: { codec_type: string }) => s.codec_type === "audio",
  );

  if (!audio) throw new Error("No audio stream found in source file");

  return {
    codecName: audio.codec_name ?? "unknown",
    sampleRate: parseInt(audio.sample_rate ?? "44100", 10),
    bitDepth: parseInt(
      audio.bits_per_raw_sample ?? audio.bits_per_sample ?? "24",
      10,
    ),
    channels: audio.channels ?? 2,
    duration: parseFloat(data.format?.duration ?? "0"),
    formatName: data.format?.format_name ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  Lossy codec detection                                              */
/* ------------------------------------------------------------------ */

const LOSSY_CODECS = new Set(["mp3", "aac", "vorbis", "opus"]);

export function isLossyCodec(codecName: string): boolean {
  return LOSSY_CODECS.has(codecName.toLowerCase());
}

/* ------------------------------------------------------------------ */
/*  Normalize ffprobe format_name to clean user-facing format          */
/* ------------------------------------------------------------------ */

export function normalizeFormat(
  formatName: string | null,
  codecName: string | null,
): string | null {
  if (!formatName) return null;
  const f = formatName.toLowerCase();
  if (f.includes("wav") || f.includes("w64")) return "WAV";
  if (f.includes("flac")) return "FLAC";
  if (f.includes("mp3") || f === "mp2/3") return "MP3";
  if (f.includes("aiff") || f.includes("aif")) return "AIFF";
  if (f.includes("ogg")) return "OGG";
  if (f.includes("m4a") || f.includes("mp4") || f.includes("mov")) {
    return codecName?.toLowerCase() === "alac" ? "ALAC" : "M4A";
  }
  if (f.includes("aac")) return "AAC";
  return f.toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Check if the source is already in the target format                */
/* ------------------------------------------------------------------ */

export function isSourceFormat(
  targetFormat: string,
  info: SourceInfo,
): boolean {
  const codec = info.codecName;
  if (targetFormat === "wav" && codec.startsWith("pcm_s") && codec.endsWith("le"))
    return true;
  if (targetFormat === "aiff" && codec.startsWith("pcm_s") && codec.endsWith("be"))
    return true;
  if (targetFormat === "flac" && codec === "flac") return true;
  if (targetFormat === "mp3" && codec === "mp3") return true;
  if (targetFormat === "alac" && codec === "alac") return true;
  return false;
}

/* ------------------------------------------------------------------ */
/*  Get file extension for a target format                             */
/* ------------------------------------------------------------------ */

export function getExtension(format: string): string {
  const map: Record<string, string> = {
    wav: "wav",
    aiff: "aiff",
    flac: "flac",
    mp3: "mp3",
    aac: "m4a",
    ogg: "ogg",
    alac: "m4a",
  };
  return map[format] ?? format;
}

/* ------------------------------------------------------------------ */
/*  PCM codec name helper                                              */
/* ------------------------------------------------------------------ */

function pcmCodec(bitDepth: number, endian: "le" | "be"): string {
  const depth = [16, 24, 32].includes(bitDepth) ? bitDepth : 24;
  return `pcm_s${depth}${endian}`;
}

/* ------------------------------------------------------------------ */
/*  Metadata tag mapping                                               */
/* ------------------------------------------------------------------ */

const TAGGABLE_FORMATS = new Set(["mp3", "flac", "aac", "ogg", "alac"]);

// Formats that support embedded cover art reliably
const ARTWORK_FORMATS = new Set(["mp3", "flac", "aac", "alac"]);

const TAG_MAP: Record<string, string> = {
  title: "title",
  artist: "artist",
  album: "album",
  track: "track",
  genre: "genre",
  isrc: "TSRC",
  barcode: "barcode",
  date: "date",
  copyright: "copyright",
  lyrics: "lyrics",
  encoded_by: "encoded_by",
  comment: "comment",
  replaygain_track_gain: "replaygain_track_gain",
};

function buildMetadataFlags(
  metadata: Record<string, string>,
  targetFormat: string,
): string[] {
  const flags: string[] = [];

  for (const [key, ffmpegTag] of Object.entries(TAG_MAP)) {
    if (!metadata[key]) continue;

    // Skip lyrics for MP3 — FFmpeg writes TXXX instead of proper USLT.
    // We handle MP3 lyrics via node-id3 after conversion.
    if (key === "lyrics" && targetFormat === "mp3") continue;

    // Some tag names vary by container
    let tag = ffmpegTag;
    if (key === "isrc" && (targetFormat === "flac" || targetFormat === "ogg")) {
      tag = "ISRC";
    }
    if (key === "lyrics") {
      tag = "LYRICS";
    }

    flags.push("-metadata", `${tag}=${metadata[key]}`);
  }

  // album_artist (some players use both)
  if (metadata.artist) {
    flags.push("-metadata", `album_artist=${metadata.artist}`);
  }

  return flags;
}

/* ------------------------------------------------------------------ */
/*  Build FFmpeg arguments for a specific format                       */
/* ------------------------------------------------------------------ */

function getCodecArgs(
  format: string,
  info: SourceInfo,
): string[] {
  const { sampleRate, bitDepth, channels } = info;

  switch (format) {
    case "wav":
      return [
        "-c:a", pcmCodec(bitDepth, "le"),
        "-ar", String(sampleRate),
        "-ac", String(channels),
      ];

    case "aiff":
      return [
        "-c:a", pcmCodec(bitDepth, "be"),
        "-ar", String(sampleRate),
        "-ac", String(channels),
      ];

    case "flac":
      return [
        "-c:a", "flac",
        "-compression_level", "8",
        "-ar", String(sampleRate),
      ];

    case "mp3":
      return [
        "-c:a", "libmp3lame",
        "-b:a", "320k",
        "-ar", "44100",
        "-ac", String(Math.min(channels, 2)),
      ];

    case "aac":
      return [
        "-c:a", "aac",
        "-b:a", "256k",
        "-ar", "44100",
        "-ac", String(Math.min(channels, 2)),
        "-movflags", "+faststart",
      ];

    case "ogg":
      return [
        "-c:a", "libvorbis",
        "-q:a", "8",
        "-ar", "44100",
        "-ac", String(Math.min(channels, 2)),
      ];

    case "alac":
      return [
        "-c:a", "alac",
        "-ar", String(sampleRate),
        "-ac", String(channels),
        "-movflags", "+faststart",
      ];

    default:
      return [
        "-c:a", pcmCodec(bitDepth, "le"),
        "-ar", String(sampleRate),
        "-ac", String(channels),
      ];
  }
}

/* ------------------------------------------------------------------ */
/*  Run FFmpeg conversion with optional metadata + artwork embedding   */
/* ------------------------------------------------------------------ */

export async function convertAudio(
  inputPath: string,
  outputPath: string,
  targetFormat: string,
  sourceInfo: SourceInfo,
  metadata?: Record<string, string> | null,
  artworkPath?: string | null,
): Promise<void> {
  const args: string[] = ["-i", inputPath];

  const shouldTag = TAGGABLE_FORMATS.has(targetFormat);
  const shouldEmbed = shouldTag && ARTWORK_FORMATS.has(targetFormat) && artworkPath;

  // Add artwork as second input if available
  if (shouldEmbed) {
    args.push("-i", artworkPath);
  }

  // Common flags
  args.push("-v", "error", "-y");

  // Codec args
  args.push(...getCodecArgs(targetFormat, sourceInfo));

  // Stream mapping when artwork is present
  if (shouldEmbed) {
    args.push(
      "-map", "0:a",
      "-map", "1:v",
      "-c:v", "copy",
      "-disposition:v:0", "attached_pic",
    );

    // MP3 needs ID3v2 version 3 for proper artwork support
    if (targetFormat === "mp3") {
      args.push("-id3v2_version", "3");
    }

    // Image stream metadata
    args.push(
      "-metadata:s:v", "title=Album cover",
      "-metadata:s:v", "comment=Cover (front)",
    );
  }

  // Text metadata flags
  if (shouldTag && metadata && Object.keys(metadata).length > 0) {
    args.push(...buildMetadataFlags(metadata, targetFormat));
  }

  // Output
  args.push(outputPath);

  try {
    await execFileAsync("ffmpeg", args, {
      timeout: 5 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`FFmpeg conversion to ${targetFormat} failed: ${message}`);
  }

  // Write lyrics via node-id3 for MP3 (FFmpeg can't write proper USLT frames)
  if (targetFormat === "mp3" && metadata?.lyrics) {
    try {
      const { default: NodeID3 } = await import("node-id3");
      const tags = {
        unsynchronisedLyrics: {
          language: "eng",
          text: metadata.lyrics,
        },
      };
      const ok = NodeID3.update(tags, outputPath);
      if (!ok) console.warn("node-id3: lyrics write returned false");
    } catch (err) {
      console.warn("node-id3 lyrics write failed (non-fatal):", err);
    }
  }
}
