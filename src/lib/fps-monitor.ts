/* ------------------------------------------------------------------ */
/*  FPS monitor — requestAnimationFrame-based frame rate tracking     */
/* ------------------------------------------------------------------ */

export interface FPSReport {
  avgFps: number;
  minFps: number;
  maxFps: number;
  p5Fps: number; // 5th percentile (worst 5%)
  droppedFrames: number; // frames > 20ms
  jankFrames: number; // frames > 50ms
  totalFrames: number;
  durationSec: number;
}

export class FPSMonitor {
  private frameTimes: number[] = [];
  private rafId: number | null = null;
  private lastTime = 0;
  private startTime = 0;

  start(): void {
    this.frameTimes = [];
    this.lastTime = performance.now();
    this.startTime = this.lastTime;
    this.tick();
  }

  stop(): FPSReport {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const frameTimes = this.frameTimes;
    if (frameTimes.length === 0) {
      return {
        avgFps: 0,
        minFps: 0,
        maxFps: 0,
        p5Fps: 0,
        droppedFrames: 0,
        jankFrames: 0,
        totalFrames: 0,
        durationSec: 0,
      };
    }

    const sorted = [...frameTimes].sort((a, b) => a - b);
    const fps = frameTimes.map((ms) => (ms > 0 ? 1000 / ms : 0));
    const fpsSorted = [...fps].sort((a, b) => a - b);
    const p5Index = Math.floor(fpsSorted.length * 0.05);

    return {
      avgFps: Math.round(fps.reduce((a, b) => a + b, 0) / fps.length),
      minFps: Math.round(fpsSorted[0]),
      maxFps: Math.round(fpsSorted[fpsSorted.length - 1]),
      p5Fps: Math.round(fpsSorted[p5Index]),
      droppedFrames: sorted.filter((ms) => ms > 20).length,
      jankFrames: sorted.filter((ms) => ms > 50).length,
      totalFrames: frameTimes.length,
      durationSec:
        Math.round(
          (performance.now() - this.startTime) / 100,
        ) / 10,
    };
  }

  private tick = () => {
    const now = performance.now();
    this.frameTimes.push(now - this.lastTime);
    this.lastTime = now;
    this.rafId = requestAnimationFrame(this.tick);
  };
}
