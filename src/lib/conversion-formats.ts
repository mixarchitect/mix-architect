/**
 * Audio format conversion constants and helpers.
 * Shared between UI components and API routes.
 */

/** Formats that can be converted via FFmpeg */
export const CONVERTIBLE_FORMATS = [
  "WAV",
  "AIFF",
  "FLAC",
  "MP3",
  "AAC",
  "OGG",
  "ALAC",
] as const;

export type ConvertibleFormat = (typeof CONVERTIBLE_FORMATS)[number];

/** Formats that cannot be auto-converted — show tooltip with explanation */
export const NON_CONVERTIBLE_FORMATS: Record<string, string> = {
  DDP: "DDP images require dedicated mastering software. Export WAV and use your preferred DDP tool.",
  "ADM BWF (Atmos)":
    "Atmos ADM BWF files must be authored in a Dolby Atmos production environment.",
  MQA: "MQA encoding requires a licensed MQA encoder. Contact your distributor.",
};

/** All predefined delivery formats in display order */
export const DELIVERY_FORMATS = [
  "WAV",
  "AIFF",
  "FLAC",
  "MP3",
  "AAC",
  "OGG",
  "DDP",
  "ADM BWF (Atmos)",
  "MQA",
  "ALAC",
];

/** Check if a format can be converted via FFmpeg */
export function isConvertible(format: string): boolean {
  return CONVERTIBLE_FORMATS.includes(
    format.toUpperCase() as ConvertibleFormat,
  );
}

/** Map format name to file extension */
export function getFormatExtension(format: string): string {
  const map: Record<string, string> = {
    wav: "wav",
    aiff: "aiff",
    flac: "flac",
    mp3: "mp3",
    aac: "m4a",
    ogg: "ogg",
    alac: "m4a",
  };
  return map[format.toLowerCase()] ?? format.toLowerCase();
}

/** Map format name to MIME type */
export function getFormatMimeType(format: string): string {
  const map: Record<string, string> = {
    wav: "audio/wav",
    aiff: "audio/aiff",
    flac: "audio/flac",
    mp3: "audio/mpeg",
    aac: "audio/mp4",
    ogg: "audio/ogg",
    alac: "audio/mp4",
  };
  return map[format.toLowerCase()] ?? "application/octet-stream";
}
