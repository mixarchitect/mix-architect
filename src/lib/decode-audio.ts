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
