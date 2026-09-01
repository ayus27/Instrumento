export const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const FLAT_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const ROOT_RE = /^([A-G])(#{1,2}|b{1,2})?(.*)$/;

function rootToIndex(letter, accidental) {
  const base = SHARP_NOTES.indexOf(letter);
  if (base === -1) return -1;
  let offset = 0;
  for (const ch of accidental || "") {
    if (ch === "#") offset += 1;
    if (ch === "b") offset -= 1;
  }
  return (((base + offset) % 12) + 12) % 12;
}

function shiftRoot(root, semitones, preferFlats) {
  const match = ROOT_RE.exec(root);
  if (!match) return null;
  const [, letter, accidental = "", rest] = match;
  const idx = rootToIndex(letter, accidental);
  if (idx === -1) return null;
  const next = (((idx + semitones) % 12) + 12) % 12;
  const table = preferFlats ? FLAT_NOTES : SHARP_NOTES;
  return { root: table[next], suffix: rest };
}

/**
 * Transpose a chord symbol by a number of semitones.
 * Preserves quality (m, 7, maj7, sus4, add9, dim, aug…) and slash bass notes.
 * Returns the input unchanged when it isn't a recognisable chord.
 */
export function transposeChord(chord, semitones = 0, options = {}) {
  if (typeof chord !== "string" || !chord.trim()) return chord;
  const preferFlats = Boolean(options.preferFlats);
  const value = chord.trim();
  const shift = ((semitones % 12) + 12) % 12;
  if (shift === 0) return value;

  const parts = value.split("/");
  const mapped = parts.map((part, index) => {
    const shifted = shiftRoot(part, shift, preferFlats);
    if (!shifted) return null;
    // Only the first part keeps its quality suffix; bass notes are plain roots plus anything odd.
    return index === 0 ? shifted.root + shifted.suffix : shifted.root + shifted.suffix;
  });

  if (mapped.some((m) => m === null)) return value;
  return mapped.join("/");
}

/** Transpose a key name such as "G", "Am" or "Bbmaj". */
export function transposeKey(key, semitones, options) {
  return transposeChord(key, semitones, options);
}
