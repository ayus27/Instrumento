/** Autocorrelation pitch detection. Returns frequency in Hz, or null when the signal is too weak. */
export function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i++) {
    const v = buffer[i] ?? 0;
    rms += v * v;
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.008) return null;

  const threshold = 0.2;
  let start = 0;
  let end = size - 1;
  while (start < size / 2 && Math.abs(buffer[start] ?? 0) < threshold) start++;
  while (end > size / 2 && Math.abs(buffer[end] ?? 0) < threshold) end--;
  const trimmed = buffer.slice(start, end);
  const n = trimmed.length;
  if (n < 512) return null;

  const c = new Float32Array(n).fill(0);
  for (let lag = 0; lag < n; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += (trimmed[i] ?? 0) * (trimmed[i + lag] ?? 0);
    }
    c[lag] = sum;
  }

  let d = 0;
  while (d < n - 1 && (c[d] ?? 0) > (c[d + 1] ?? 0)) d++;

  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < n; i++) {
    const v = c[i] ?? 0;
    if (v > maxVal) {
      maxVal = v;
      maxPos = i;
    }
  }
  if (maxPos <= 0) return null;

  // Parabolic interpolation around the peak for sub-sample accuracy.
  const x1 = c[maxPos - 1] ?? 0;
  const x2 = c[maxPos] ?? 0;
  const x3 = c[maxPos + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  const peak = a ? maxPos - b / (2 * a) : maxPos;

  const freq = sampleRate / peak;
  if (!Number.isFinite(freq) || freq < 55 || freq > 1400) return null;
  return freq;
}
