/**
 * Parse audio file headers to extract bit depth and file format.
 *
 * Sample rate and channel count come from AudioBuffer after decoding;
 * bit depth must be read from the raw binary headers since Web Audio API
 * always normalises to 32-bit float internally.
 *
 * Supports: WAV, AIFF/AIFC, FLAC.
 * Lossy formats (MP3, AAC/M4A) return bitDepth = null.
 */

export type AudioHeaderMeta = {
  /** Bits per sample (16, 24, 32). null for lossy formats. */
  bitDepth: number | null;
  /** Uppercase format name: WAV, AIFF, FLAC, MP3, AAC, M4A */
  fileFormat: string;
};

/** Read an ASCII string from a DataView. */
function readString(view: DataView, offset: number, length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += String.fromCharCode(view.getUint8(offset + i));
  }
  return s;
}

/* ------------------------------------------------------------------ */
/*  WAV parser                                                         */
/* ------------------------------------------------------------------ */

function parseWav(view: DataView): number | null {
  // Walk RIFF chunks to find "fmt "
  // Minimum header: 12 bytes (RIFF + size + WAVE)
  if (view.byteLength < 12) return null;

  let offset = 12; // skip RIFF header
  while (offset + 8 <= view.byteLength) {
    const chunkId = readString(view, offset, 4);
    const chunkSize = view.getUint32(offset + 4, true); // little-endian

    if (chunkId === "fmt ") {
      // fmt chunk: audioFormat(2) + numChannels(2) + sampleRate(4) +
      // byteRate(4) + blockAlign(2) + bitsPerSample(2)
      if (offset + 8 + 16 <= view.byteLength) {
        return view.getUint16(offset + 8 + 14, true); // bitsPerSample
      }
      return null;
    }

    // Next chunk (pad to even boundary)
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  AIFF / AIFC parser                                                 */
/* ------------------------------------------------------------------ */

function parseAiff(view: DataView): number | null {
  // Walk FORM chunks to find "COMM"
  if (view.byteLength < 12) return null;

  let offset = 12; // skip FORM header
  while (offset + 8 <= view.byteLength) {
    const chunkId = readString(view, offset, 4);
    const chunkSize = view.getUint32(offset + 4, false); // big-endian

    if (chunkId === "COMM") {
      // COMM chunk: numChannels(2) + numSampleFrames(4) + sampleSize(2) + ...
      if (offset + 8 + 8 <= view.byteLength) {
        return view.getInt16(offset + 8 + 6, false); // sampleSize (big-endian)
      }
      return null;
    }

    // Next chunk (pad to even boundary)
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  FLAC parser                                                        */
/* ------------------------------------------------------------------ */

function parseFlac(view: DataView): number | null {
  // After "fLaC" (4 bytes), first metadata block header is 4 bytes,
  // then STREAMINFO data (34 bytes minimum).
  // STREAMINFO layout (from byte 0 of block data):
  //   bytes 0-1:  min block size
  //   bytes 2-3:  max block size
  //   bytes 4-6:  min frame size (24 bits)
  //   bytes 7-9:  max frame size (24 bits)
  //   bytes 10-12 + bits: sample rate (20 bits) | channels-1 (3 bits) | bps-1 (5 bits) | ...
  //
  // So bit depth is at bit offset 116 from the start of STREAMINFO data,
  // spanning 5 bits, stored as (value - 1).

  if (view.byteLength < 4 + 4 + 18) return null;

  // First metadata block header starts at byte 4
  // byte 0 of header: bit 7 = last block flag, bits 6-0 = block type (0 = STREAMINFO)
  const blockType = view.getUint8(4) & 0x7f;
  if (blockType !== 0) return null; // first block must be STREAMINFO

  // STREAMINFO data starts at byte 8
  const dataOffset = 8;
  if (view.byteLength < dataOffset + 18) return null;

  // Bytes 12-13 of STREAMINFO (absolute offset dataOffset + 12):
  // [20 bits sample rate][3 bits channels-1][5 bits bps-1][36 bits total samples]
  //
  // We need bits at positions:
  //   byte 12: ssss ssss  (sample rate bits 19-12)
  //   byte 13: ssss ssss  (sample rate bits 11-4)
  //   byte 14: ssss cccc  (sample rate bits 3-0, then channels-1 bits 2-0... wait)
  //
  // Actually: bytes 10-13 of STREAMINFO contain:
  //   20 bits sample rate | 3 bits (channels-1) | 5 bits (bps-1) | 4 bits of total samples
  //
  // byte 10 (abs dataOffset+10): SR[19:12]
  // byte 11 (abs dataOffset+11): SR[11:4]
  // byte 12 (abs dataOffset+12): SR[3:0] | CH[2:0] | BPS[4]
  // byte 13 (abs dataOffset+13): BPS[3:0] | TS[35:32]

  const byte12 = view.getUint8(dataOffset + 12);
  const byte13 = view.getUint8(dataOffset + 13);

  // channels-1 is 3 bits: byte12 bits [3:1]... let me be precise.
  // byte 12: [SR3 SR2 SR1 SR0 | CH2 CH1 CH0 | BPS4]
  // byte 13: [BPS3 BPS2 BPS1 BPS0 | TS35 TS34 TS33 TS32]

  const bpsHigh = byte12 & 0x01; // BPS bit 4
  const bpsLow = (byte13 >> 4) & 0x0f; // BPS bits 3-0
  const bps = (bpsHigh << 4) | bpsLow;

  return bps + 1; // stored as value - 1
}

/* ------------------------------------------------------------------ */
/*  Format detection from file extension                               */
/* ------------------------------------------------------------------ */

function formatFromFileName(fileName: string | null | undefined): string {
  if (!fileName) return "AUDIO";
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "wav":
      return "WAV";
    case "aif":
    case "aiff":
      return "AIFF";
    case "flac":
      return "FLAC";
    case "mp3":
      return "MP3";
    case "aac":
      return "AAC";
    case "m4a":
      return "M4A";
    default:
      return ext?.toUpperCase() ?? "AUDIO";
  }
}

/* ------------------------------------------------------------------ */
/*  Main entry point                                                   */
/* ------------------------------------------------------------------ */

/**
 * Parse audio file headers from a raw ArrayBuffer.
 * Never throws — returns best-effort results.
 */
export function parseAudioHeaderMetadata(
  buffer: ArrayBuffer,
  fileName?: string | null,
): AudioHeaderMeta {
  try {
    if (buffer.byteLength < 12) {
      return { bitDepth: null, fileFormat: formatFromFileName(fileName) };
    }

    const view = new DataView(buffer);
    const magic4 = readString(view, 0, 4);

    // WAV: "RIFF" ... "WAVE"
    if (magic4 === "RIFF" && readString(view, 8, 4) === "WAVE") {
      return { bitDepth: parseWav(view), fileFormat: "WAV" };
    }

    // AIFF / AIFC: "FORM" ... "AIFF" or "AIFC"
    if (magic4 === "FORM") {
      const formType = readString(view, 8, 4);
      if (formType === "AIFF" || formType === "AIFC") {
        return { bitDepth: parseAiff(view), fileFormat: "AIFF" };
      }
    }

    // FLAC: "fLaC"
    if (magic4 === "fLaC") {
      return { bitDepth: parseFlac(view), fileFormat: "FLAC" };
    }

    // MP3: ID3 tag or sync word
    if (
      magic4.startsWith("ID3") ||
      (view.getUint8(0) === 0xff && (view.getUint8(1) & 0xe0) === 0xe0)
    ) {
      return { bitDepth: null, fileFormat: "MP3" };
    }

    // AAC / M4A: ftyp box
    if (readString(view, 4, 4) === "ftyp") {
      const ext = fileName?.split(".").pop()?.toLowerCase();
      return { bitDepth: null, fileFormat: ext === "aac" ? "AAC" : "M4A" };
    }

    // Unknown — fall back to file extension
    return { bitDepth: null, fileFormat: formatFromFileName(fileName) };
  } catch {
    return { bitDepth: null, fileFormat: formatFromFileName(fileName) };
  }
}
