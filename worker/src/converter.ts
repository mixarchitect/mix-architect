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
/*  Build FFmpeg arguments for a specific format                       */
/* ------------------------------------------------------------------ */

function getFFmpegArgs(
  input: string,
  output: string,
  format: string,
  info: SourceInfo,
): string[] {
  const { sampleRate, bitDepth, channels } = info;

  const common = ["-i", input, "-v", "error", "-y"];

  switch (format) {
    case "wav":
      return [
        ...common,
        "-c:a", pcmCodec(bitDepth, "le"),
        "-ar", String(sampleRate),
        "-ac", String(channels),
        output,
      ];

    case "aiff":
      return [
        ...common,
        "-c:a", pcmCodec(bitDepth, "be"),
        "-ar", String(sampleRate),
        "-ac", String(channels),
        output,
      ];

    case "flac":
      return [
        ...common,
        "-c:a", "flac",
        "-compression_level", "8",
        "-ar", String(sampleRate),
        output,
      ];

    case "mp3":
      return [
        ...common,
        "-c:a", "libmp3lame",
        "-b:a", "320k",
        "-ar", "44100",
        "-ac", String(Math.min(channels, 2)),
        output,
      ];

    case "aac":
      return [
        ...common,
        "-c:a", "aac",
        "-b:a", "256k",
        "-ar", "44100",
        "-ac", String(Math.min(channels, 2)),
        "-movflags", "+faststart",
        output,
      ];

    case "ogg":
      return [
        ...common,
        "-c:a", "libvorbis",
        "-q:a", "8",
        "-ar", "44100",
        "-ac", String(Math.min(channels, 2)),
        output,
      ];

    case "alac":
      return [
        ...common,
        "-c:a", "alac",
        "-ar", String(sampleRate),
        "-ac", String(channels),
        "-movflags", "+faststart",
        output,
      ];

    default:
      // Fallback to WAV
      return [
        ...common,
        "-c:a", pcmCodec(bitDepth, "le"),
        "-ar", String(sampleRate),
        "-ac", String(channels),
        output,
      ];
  }
}

/* ------------------------------------------------------------------ */
/*  Run FFmpeg conversion                                              */
/* ------------------------------------------------------------------ */

export async function convertAudio(
  inputPath: string,
  outputPath: string,
  targetFormat: string,
  sourceInfo: SourceInfo,
): Promise<void> {
  const args = getFFmpegArgs(inputPath, outputPath, targetFormat, sourceInfo);

  try {
    await execFileAsync("ffmpeg", args, {
      timeout: 5 * 60 * 1000, // 5-minute timeout
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`FFmpeg conversion to ${targetFormat} failed: ${message}`);
  }
}
