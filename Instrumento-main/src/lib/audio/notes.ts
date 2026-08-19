export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

function pitchClass(midi: number): string {
  return NOTE_NAMES[((midi % 12) + 12) % 12] ?? "C";
}

export function midiToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${pitchClass(midi)}${octave}`;
}

export function nameToMidi(name: string): number {
  const match = /^([A-G]#?)(-?\d)$/.exec(name.trim());
  if (!match) throw new Error(`Invalid note name: ${name}`);
  const idx = NOTE_NAMES.indexOf(match[1] as (typeof NOTE_NAMES)[number]);
  return idx + (Number(match[2]) + 1) * 12;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToMidiFloat(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

export function isSharp(midi: number): boolean {
  return pitchClass(midi).includes("#");
}

export function centsOff(freq: number, targetFreq: number): number {
  return 1200 * Math.log2(freq / targetFreq);
}
