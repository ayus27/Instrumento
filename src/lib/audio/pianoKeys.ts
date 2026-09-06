/** Shared computer-keyboard -> semitone offset map for on-screen pianos. */
export const PIANO_KEY_OFFSETS: Record<string, number> = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
  o: 13,
  l: 14,
  p: 15,
  ";": 16,
};

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const SEMITONE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function semitoneOf(root: string): number {
  return NOTE_TO_SEMITONE[root] ?? 0;
}

/** Build triad note names (e.g. "Am" -> ["A3","C4","E4"]) for a chord symbol. */
export function chordNotes(symbol: string, octave = 3): string[] {
  const match = /^([A-G][#b]?)(.*)$/.exec(symbol.trim());
  if (!match) return [];
  const root = semitoneOf(match[1]!);
  const quality = match[2] ?? "";
  const minor = /^m(?!aj)/.test(quality) || quality.startsWith("min");
  const dim = quality.startsWith("dim");
  const intervals = dim ? [0, 3, 6] : minor ? [0, 3, 7] : [0, 4, 7];
  if (/7/.test(quality)) intervals.push(minor || /^7|dom/.test(quality) ? 10 : 11);
  return intervals.map((i) => {
    const abs = root + i;
    const name = SEMITONE_NAMES[abs % 12]!;
    return `${name}${octave + Math.floor(abs / 12)}`;
  });
}

/** Transpose a chord symbol by a number of semitones, keeping its quality. */
export function shiftChord(symbol: string, semitones: number): string {
  const match = /^([A-G][#b]?)(.*)$/.exec(symbol.trim());
  if (!match) return symbol;
  const abs = (((semitoneOf(match[1]!) + semitones) % 12) + 12) % 12;
  return `${SEMITONE_NAMES[abs]}${match[2] ?? ""}`;
}
