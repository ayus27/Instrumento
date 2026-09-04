/**
 * YIN pitch detection (cumulative mean normalized difference function).
 * Far more reliable than plain autocorrelation for strings and drum heads:
 * fewer octave errors and stable readings on decaying notes.
 *
 * Returns frequency in Hz, or null when the signal is too weak / unvoiced.
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  options: { minFrequency?: number; maxFrequency?: number; threshold?: number } = {},
): number | null {
  const minFrequency = options.minFrequency ?? 45;
  const maxFrequency = options.maxFrequency ?? 1400;
  const threshold = options.threshold ?? 0.12;

  const size = buffer.length;
  if (size < 1024) return null;

  // Signal strength gate.
  let rms = 0;
  for (let i = 0; i < size; i++) {
    const v = buffer[i] ?? 0;
    rms += v * v;
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.006) return null;

  const maxLag = Math.min(Math.floor(sampleRate / minFrequency), Math.floor(size / 2));
  const minLag = Math.max(2, Math.floor(sampleRate / maxFrequency));
  if (maxLag <= minLag) return null;

  // Difference function.
  const diff = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < size - maxLag; i++) {
      const d = (buffer[i] ?? 0) - (buffer[i + lag] ?? 0);
      sum += d * d;
    }
    diff[lag] = sum;
  }

  // Cumulative mean normalized difference.
  const cmnd = new Float32Array(maxLag + 1).fill(1);
  let running = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    running += diff[lag] ?? 0;
    cmnd[lag] = running === 0 ? 1 : ((diff[lag] ?? 0) * (lag - minLag + 1)) / running;
  }

  // Absolute threshold: first local minimum below the threshold.
  let bestLag = -1;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if ((cmnd[lag] ?? 1) < threshold) {
      while (lag + 1 < maxLag && (cmnd[lag + 1] ?? 1) < (cmnd[lag] ?? 1)) lag++;
      bestLag = lag;
      break;
    }
  }

  // Fallback: global minimum, accepted only when reasonably periodic.
  if (bestLag < 0) {
    let min = Infinity;
    for (let lag = minLag + 1; lag < maxLag; lag++) {
      const v = cmnd[lag] ?? 1;
      if (v < min) {
        min = v;
        bestLag = lag;
      }
    }
    if (bestLag < 0 || min > 0.5) return null;
  }

  // Parabolic interpolation for sub-sample precision.
  const x1 = cmnd[bestLag - 1] ?? 0;
  const x2 = cmnd[bestLag] ?? 0;
  const x3 = cmnd[bestLag + 1] ?? 0;
  const denom = 2 * (2 * x2 - x1 - x3);
  const refined = denom !== 0 ? bestLag + (x3 - x1) / denom : bestLag;

  const freq = sampleRate / refined;
  if (!Number.isFinite(freq) || freq < minFrequency || freq > maxFrequency) return null;
  return freq;
}

/** Median of a small sample window — smooths out stray frames. */
export function medianFrequency(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? null);
}
