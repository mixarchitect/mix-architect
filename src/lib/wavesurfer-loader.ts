/**
 * Lazy loader for the wavesurfer.js bundle.
 *
 * Both the main audio-player and the portal audio-player previously
 * statically imported wavesurfer.js, dragging ~50 KB minified into
 * every track-detail / portal initial bundle whether or not a user
 * scrolled to a track with audio. Switching to dynamic import keeps
 * wavesurfer out of the initial bundle and only loads it when the
 * player actually mounts.
 *
 * Usage:
 *   const WaveSurfer = await loadWaveSurfer();
 *   const ws = WaveSurfer.create({ ... });
 *
 * The dynamic import is cached at module scope, so the second player
 * (mini-player → main player navigation, etc.) hits the cached chunk
 * instantly.
 */
type WaveSurferModule = typeof import("wavesurfer.js");

let cached: Promise<WaveSurferModule> | null = null;

export function loadWaveSurfer(): Promise<WaveSurferModule["default"]> {
  if (!cached) {
    cached = import("wavesurfer.js");
  }
  return cached.then((m) => m.default);
}
