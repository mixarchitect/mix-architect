/**
 * ITU-R BS.1770-4 Integrated LUFS Measurement
 * Pure TypeScript — no external dependencies.
 *
 * Measures the perceived loudness of an audio signal using:
 * 1. K-weighting filter (two cascaded biquads)
 * 2. 400 ms overlapping blocks (75 % overlap)
 * 3. Absolute gating (−70 LUFS)
 * 4. Relative gating (ungated mean − 10 dB)
 */

/* ------------------------------------------------------------------ */
/*  Biquad filter types + implementation                               */
/* ------------------------------------------------------------------ */

type BiquadCoeffs = {
  b0: number; b1: number; b2: number;
  a1: number; a2: number;
};

/**
 * Apply a biquad filter in-place using Direct-Form II Transposed.
 * Operates on a Float32Array of mono samples.
 */
function applyBiquad(samples: Float32Array, c: BiquadCoeffs): void {
  let z1 = 0;
  let z2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = c.b0 * x + z1;
    z1 = c.b1 * x - c.a1 * y + z2;
    z2 = c.b2 * x - c.a2 * y;
    samples[i] = y;
  }
}

/* ------------------------------------------------------------------ */
/*  K-weighting filter coefficients                                    */
/* ------------------------------------------------------------------ */

/**
 * Return the two-stage K-weighting filter coefficients for a given
 * sample rate.  Stage 1 is a high-shelf pre-filter; stage 2 is a
 * revised low-frequency high-pass (~38 Hz).
 *
 * Coefficients for 48 kHz and 44.1 kHz are taken directly from the
 * ITU-R BS.1770-4 specification.  Other rates use a bilinear-
 * transform approximation from the analog prototype.
 */
function kWeightingCoeffs(sr: number): [BiquadCoeffs, BiquadCoeffs] {
  if (sr === 48000) {
    return [
      { b0: 1.53512485958697, b1: -2.69169618940638, b2: 1.19839281085285, a1: -1.69065929318241, a2: 0.73248077421585 },
      { b0: 1.0,              b1: -2.0,              b2: 1.0,              a1: -1.99004745483398, a2: 0.99007225036621 },
    ];
  }
  if (sr === 44100) {
    return [
      { b0: 1.53091059260624, b1: -2.65116903469206, b2: 1.16907559410890, a1: -1.66375011815546, a2: 0.71249664568240 },
      { b0: 1.0,              b1: -2.0,              b2: 1.0,              a1: -1.98916967290658, a2: 0.98919924682498 },
    ];
  }
  // Generic fallback via bilinear transform
  return bilinearKWeighting(sr);
}

/* ------------------------------------------------------------------ */
/*  Bilinear-transform fallback for arbitrary sample rates             */
/* ------------------------------------------------------------------ */

function bilinearKWeighting(sr: number): [BiquadCoeffs, BiquadCoeffs] {
  // Stage 1 — analog prototype: high-shelf boost
  // Design parameters from ITU-R BS.1770-4 Section 4
  const f0 = 1681.974450955533;
  const G = 3.999843853973347;    // dB gain
  const Q = 0.7071752369554196;

  const K = Math.tan((Math.PI * f0) / sr);
  const Vh = Math.pow(10, G / 20);
  const Vb = Math.pow(Vh, 0.4996667741545416);
  const K2 = K * K;
  const a0s1 = 1 + K / Q + K2;

  const stage1: BiquadCoeffs = {
    b0: (Vh + Vb * K / Q + K2) / a0s1,
    b1: 2 * (K2 - Vh) / a0s1,
    b2: (Vh - Vb * K / Q + K2) / a0s1,
    a1: 2 * (K2 - 1) / a0s1,
    a2: (1 - K / Q + K2) / a0s1,
  };

  // Stage 2 — analog prototype: high-pass at ~38.14 Hz
  const f1 = 38.13547087602444;
  const Q1 = 0.5003270373238773;
  const K1 = Math.tan((Math.PI * f1) / sr);
  const K1sq = K1 * K1;
  const a0s2 = 1 + K1 / Q1 + K1sq;

  const stage2: BiquadCoeffs = {
    b0: 1 / a0s2,
    b1: -2 / a0s2,
    b2: 1 / a0s2,
    a1: 2 * (K1sq - 1) / a0s2,
    a2: (1 - K1 / Q1 + K1sq) / a0s2,
  };

  return [stage1, stage2];
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Measure integrated LUFS from an AudioBuffer (any channel count / sample rate).
 * Returns the loudness in LUFS, or `−Infinity` for silence / extremely quiet audio.
 */
export function measureLUFS(buf: AudioBuffer): number {
  const sr = buf.sampleRate;
  const numCh = buf.numberOfChannels;
  const len = buf.length;

  const [s1, s2] = kWeightingCoeffs(sr);

  // K-weight each channel (copy so the original AudioBuffer is untouched)
  const kw: Float32Array[] = [];
  for (let ch = 0; ch < numCh; ch++) {
    const data = new Float32Array(buf.getChannelData(ch));
    applyBiquad(data, s1);
    applyBiquad(data, s2);
    kw.push(data);
  }

  // 400 ms blocks, 75 % overlap → 100 ms hop
  const blockSize = Math.round(sr * 0.4);
  const hopSize = Math.round(sr * 0.1);
  const numBlocks = Math.floor((len - blockSize) / hopSize) + 1;
  if (numBlocks <= 0) return -Infinity;

  // Channel weight per ITU-R BS.1770-4 (Ls/Rs = 1.41 in surround; L/R/C = 1.0)
  const chWeight = (ch: number): number => {
    if (numCh <= 3) return 1.0;
    return ch === 3 || ch === 4 ? 1.41 : 1.0;
  };

  // Mean-square power per block
  const blockPower = new Float64Array(numBlocks);
  for (let b = 0; b < numBlocks; b++) {
    const start = b * hopSize;
    let sum = 0;
    for (let ch = 0; ch < numCh; ch++) {
      const w = chWeight(ch);
      const d = kw[ch];
      let ms = 0;
      for (let i = start, end = start + blockSize; i < end; i++) {
        ms += d[i] * d[i];
      }
      sum += w * (ms / blockSize);
    }
    blockPower[b] = sum;
  }

  // ---- Absolute gating (−70 LUFS) ----
  const absThresh = Math.pow(10, (-70 + 0.691) / 10);
  let gSum = 0;
  let gCnt = 0;
  for (let b = 0; b < numBlocks; b++) {
    if (blockPower[b] > absThresh) {
      gSum += blockPower[b];
      gCnt++;
    }
  }
  if (gCnt === 0) return -Infinity;

  // ---- Relative gating (ungated mean − 10 dB) ----
  const relThresh = (gSum / gCnt) * Math.pow(10, -1); // −10 dB = ×0.1
  let fSum = 0;
  let fCnt = 0;
  for (let b = 0; b < numBlocks; b++) {
    if (blockPower[b] > absThresh && blockPower[b] >= relThresh) {
      fSum += blockPower[b];
      fCnt++;
    }
  }
  if (fCnt === 0) return -Infinity;

  return -0.691 + 10 * Math.log10(fSum / fCnt);
}
