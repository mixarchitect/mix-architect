/* ------------------------------------------------------------------ */
/*  Audio decode benchmarking — measures the full decode pipeline      */
/* ------------------------------------------------------------------ */

import { perf } from "./perf";

export interface DecodeBenchResult {
  fetchMs: number;
  decodeMs: number;
  totalMs: number;
  fileSizeMB: number;
  durationSec: number;
  sampleRate: number;
  channels: number;
  /** ms to decode per minute of audio */
  decodeRatioMs: number;
  peakGenMs: number;
  /** Raw AudioBuffer memory footprint in MB */
  bufferSizeMB: number;
}

/** Calculate the raw memory footprint of an AudioBuffer (Float32 samples). */
export function audioBufferSizeMB(buffer: AudioBuffer): number {
  return (buffer.length * buffer.numberOfChannels * 4) / (1024 * 1024);
}

/**
 * Benchmark the full audio decode pipeline:
 * fetch → decode → peak generation.
 */
export async function benchmarkDecode(
  audioUrl: string,
): Promise<DecodeBenchResult> {
  const totalStart = performance.now();

  // 1. Fetch
  perf.start("bench:fetch");
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const fetchMark = perf.end("bench:fetch");
  const fetchMs = fetchMark?.duration ?? 0;
  const fileSizeMB =
    Math.round((arrayBuffer.byteLength / (1024 * 1024)) * 100) / 100;

  // 2. Decode
  perf.start("bench:decode");
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  const decodeMark = perf.end("bench:decode");
  const decodeMs = decodeMark?.duration ?? 0;

  const durationSec = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;

  // 3. Peak generation (matches WaveSurfer's approach — extract min/max per bucket)
  perf.start("bench:peaks");
  const peaksPerChannel = 800; // typical WaveSurfer peaks resolution
  const channelData = audioBuffer.getChannelData(0);
  const bucketSize = Math.floor(channelData.length / peaksPerChannel);
  const peaks = new Float32Array(peaksPerChannel);
  for (let i = 0; i < peaksPerChannel; i++) {
    let max = 0;
    const start = i * bucketSize;
    const end = Math.min(start + bucketSize, channelData.length);
    for (let j = start; j < end; j++) {
      const abs = Math.abs(channelData[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }
  const peakMark = perf.end("bench:peaks");
  const peakGenMs = peakMark?.duration ?? 0;

  await audioCtx.close();

  const totalMs = performance.now() - totalStart;
  const durationMin = durationSec / 60;
  const decodeRatioMs =
    durationMin > 0 ? Math.round(decodeMs / durationMin) : 0;

  return {
    fetchMs: Math.round(fetchMs * 100) / 100,
    decodeMs: Math.round(decodeMs * 100) / 100,
    totalMs: Math.round(totalMs * 100) / 100,
    fileSizeMB,
    durationSec: Math.round(durationSec * 100) / 100,
    sampleRate,
    channels,
    decodeRatioMs,
    peakGenMs: Math.round(peakGenMs * 100) / 100,
    bufferSizeMB:
      Math.round(audioBufferSizeMB(audioBuffer) * 100) / 100,
  };
}
