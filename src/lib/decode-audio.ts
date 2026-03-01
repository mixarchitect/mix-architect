/**
 * Fetch an audio file and decode it to an AudioBuffer.
 * Uses a one-shot AudioContext — independent of WaveSurfer or the
 * shared playback element, so it works whether peaks are cached or not.
 */
export async function decodeAudioFromUrl(
  url: string,
  signal?: AbortSignal,
): Promise<AudioBuffer> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);

  const arrayBuffer = await res.arrayBuffer();

  const ctx = new AudioContext();
  try {
    return await ctx.decodeAudioData(arrayBuffer);
  } finally {
    void ctx.close();
  }
}

export type DecodedAudio = {
  audioBuffer: AudioBuffer;
  rawBuffer: ArrayBuffer;
};

/**
 * Like decodeAudioFromUrl but also returns the raw ArrayBuffer so
 * callers can parse binary file headers (e.g. for bit depth extraction).
 *
 * The raw buffer is cloned before decodeAudioData because some browsers
 * detach (neuter) the original ArrayBuffer during decoding.
 */
export async function decodeAudioWithRawBuffer(
  url: string,
  signal?: AbortSignal,
): Promise<DecodedAudio> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);

  const rawBuffer = await res.arrayBuffer();

  const ctx = new AudioContext();
  try {
    // Clone before decode — decodeAudioData may detach the original
    const audioBuffer = await ctx.decodeAudioData(rawBuffer.slice(0));
    return { audioBuffer, rawBuffer };
  } finally {
    void ctx.close();
  }
}
