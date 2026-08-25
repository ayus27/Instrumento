export const x = "x";

export const CHORD_DATABASE = [
  {
    name: "C",
    fullName: "C Major",
    key: "C",
    pianoNotes: ["C4", "E4", "G4"],
    pianoKeys: ["C", "E", "G"],
    guitarFingering: {
      frets: [x, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
    },
    ukuleleFingering: {
      frets: [0, 0, 0, 3],
      fingers: [0, 0, 0, 3],
    },
  },
  {
    name: "Cm",
    fullName: "C Minor",
    key: "C",
    pianoNotes: ["C4", "D#4", "G4"],
    pianoKeys: ["C", "D#", "G"],
    guitarFingering: {
      frets: [x, 3, 5, 5, 4, 3],
      fingers: [0, 1, 3, 4, 2, 1],
    },
    ukuleleFingering: {
      frets: [0, 3, 3, 3],
      fingers: [0, 1, 2, 3],
    },
  },
  {
    name: "G",
    fullName: "G Major",
    key: "G",
    pianoNotes: ["G4", "B4", "D5"],
    pianoKeys: ["G", "B", "D"],
    guitarFingering: {
      frets: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, 0, 0, 0, 3],
    },
    ukuleleFingering: {
      frets: [0, 2, 3, 2],
      fingers: [0, 1, 3, 2],
    },
  },
  {
    name: "Am",
    fullName: "A Minor",
    key: "A",
    pianoNotes: ["A4", "C5", "E5"],
    pianoKeys: ["A", "C", "E"],
    guitarFingering: {
      frets: [x, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
    },
    ukuleleFingering: {
      frets: [2, 0, 0, 0],
      fingers: [2, 0, 0, 0],
    },
  },
  {
    name: "F",
    fullName: "F Major",
    key: "F",
    pianoNotes: ["F4", "A4", "C5"],
    pianoKeys: ["F", "A", "C"],
    guitarFingering: {
      frets: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
    },
    ukuleleFingering: {
      frets: [2, 0, 1, 0],
      fingers: [2, 0, 1, 0],
    },
  },
  {
    name: "D",
    fullName: "D Major",
    key: "D",
    pianoNotes: ["D4", "F#4", "A4"],
    pianoKeys: ["D", "F#", "A"],
    guitarFingering: {
      frets: [x, x, 0, 2, 3, 2],
      fingers: [0, 0, 0, 1, 3, 2],
    },
    ukuleleFingering: {
      frets: [2, 2, 2, 0],
      fingers: [1, 2, 3, 0],
    },
  },
  {
    name: "Dm",
    fullName: "D Minor",
    key: "D",
    pianoNotes: ["D4", "F4", "A4"],
    pianoKeys: ["D", "F", "A"],
    guitarFingering: {
      frets: [x, x, 0, 2, 3, 1],
      fingers: [0, 0, 0, 2, 3, 1],
    },
    ukuleleFingering: {
      frets: [2, 2, 1, 0],
      fingers: [2, 3, 1, 0],
    },
  },
  {
    name: "Em",
    fullName: "E Minor",
    key: "E",
    pianoNotes: ["E4", "G4", "B4"],
    pianoKeys: ["E", "G", "B"],
    guitarFingering: {
      frets: [0, 2, 2, 0, 0, 0],
      fingers: [0, 2, 3, 0, 0, 0],
    },
    ukuleleFingering: {
      frets: [0, 4, 3, 2],
      fingers: [0, 3, 2, 1],
    },
  },
  {
    name: "E",
    fullName: "E Major",
    key: "E",
    pianoNotes: ["E4", "G#4", "B4"],
    pianoKeys: ["E", "G#", "B"],
    guitarFingering: {
      frets: [0, 2, 2, 1, 0, 0],
      fingers: [0, 2, 3, 1, 0, 0],
    },
    ukuleleFingering: {
      frets: [4, 4, 4, 2],
      fingers: [2, 3, 4, 1],
    },
  },
  {
    name: "A",
    fullName: "A Major",
    key: "A",
    pianoNotes: ["A4", "C#5", "E5"],
    pianoKeys: ["A", "C#", "E"],
    guitarFingering: {
      frets: [x, 0, 2, 2, 2, 0],
      fingers: [0, 0, 1, 2, 3, 0],
    },
    ukuleleFingering: {
      frets: [2, 1, 0, 0],
      fingers: [2, 1, 0, 0],
    },
  },
];

export function findChord(name) {
  if (!name) return CHORD_DATABASE[0];
  const target = name.trim().toLowerCase();
  return CHORD_DATABASE.find((c) => c.name.toLowerCase() === target || c.fullName.toLowerCase() === target) || CHORD_DATABASE[0];
}
