export const PPQ = 192; // Tone.js default pulses per quarter note

/**
 * Convert ticks to seconds based on BPM.
 */
export function ticksToSeconds(ticks: number, bpm: number): number {
  const beats = ticks / PPQ;
  const secondsPerBeat = 60 / bpm;
  return beats * secondsPerBeat;
}

/**
 * Convert seconds to ticks based on BPM.
 */
export function secondsToTicks(seconds: number, bpm: number): number {
  const beatsPerSecond = bpm / 60;
  const beats = seconds * beatsPerSecond;
  return Math.round(beats * PPQ);
}

/**
 * Convert ticks to a Bar:Beat:Sixteenth format for display (1-indexed).
 */
export function ticksToTransportTime(ticks: number, timeSignature = [4, 4]): string {
  const [beatsPerBar] = timeSignature;
  
  const totalBeats = ticks / PPQ;
  const bars = Math.floor(totalBeats / beatsPerBar);
  const remainingBeats = totalBeats % beatsPerBar;
  
  const beats = Math.floor(remainingBeats);
  const sixteenths = Math.floor((remainingBeats - beats) * 4);
  
  // Return in 1-indexed format like Tone.js: "1:1:0"
  return `${bars + 1}:${beats + 1}:${sixteenths}`;
}

/**
 * Snap a tick value to the nearest grid resolution.
 * @param ticks Current position in ticks
 * @param resolution Note value denominator (e.g., 4 = quarter, 16 = sixteenth)
 */
export function snapTicks(ticks: number, resolution: number): number {
  // 4 resolution = 1 quarter note = PPQ (192)
  // 8 resolution = 1 eighth note = PPQ / 2 (96)
  // 16 resolution = 1 sixteenth note = PPQ / 4 (48)
  const ticksPerResolution = (4 / resolution) * PPQ;
  return Math.round(ticks / ticksPerResolution) * ticksPerResolution;
}

/**
 * Convert ticks to pixels based on a zoom level (pixels per quarter note).
 */
export function ticksToPixels(ticks: number, pixelsPerBeat: number): number {
  return (ticks / PPQ) * pixelsPerBeat;
}

/**
 * Convert pixels to ticks based on a zoom level.
 */
export function pixelsToTicks(pixels: number, pixelsPerBeat: number): number {
  return Math.round((pixels / pixelsPerBeat) * PPQ);
}
