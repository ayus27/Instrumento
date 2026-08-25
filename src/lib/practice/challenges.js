import { createExercise, step } from "./engine";

const seq = (notes) => notes.map((n) => step(n));

export const PRACTICE_CHALLENGES = [
  {
    id: "note-rush",
    title: "Note Rush",
    description: "Play displayed notes before time expires!",
    instrument: "piano",
    timeLimit: 30,
    exercise: createExercise({
      id: "note-rush-ex",
      title: "Note Rush",
      prompt: "Play the displayed note quickly!",
      steps: seq(["C4", "G4", "E4", "A4", "F4", "D4", "B4", "C5", "E5", "G4", "D4", "F4", "A4", "C4", "E4"]),
    }),
  },
  {
    id: "melody-memory",
    title: "Melody Memory",
    description: "Memorize and reproduce the short piano sequence.",
    instrument: "piano",
    timeLimit: 45,
    exercise: createExercise({
      id: "melody-memory-ex",
      title: "Melody Memory",
      prompt: "Reproduce sequence: C4 -> E4 -> G4 -> C5",
      steps: seq(["C4", "E4", "G4", "C5", "G4", "E4", "C4", "D4", "F4", "A4", "C5"]),
    }),
  },
  {
    id: "rhythm-rush",
    title: "Rhythm Rush",
    description: "Play drum pattern with precise timing.",
    instrument: "drums",
    timeLimit: 30,
    exercise: createExercise({
      id: "rhythm-rush-ex",
      title: "Rhythm Rush",
      prompt: "Hit Kick & Snare in steady rhythm!",
      steps: [
        step("kick"), step("hihat"), step("snare"), step("hihat"),
        step("kick"), step("hihat"), step("snare"), step("hihat"),
        step("kick"), step("kick"), step("snare"), step("hihat"),
      ],
    }),
  },
  {
    id: "chord-detective",
    title: "Chord Detective",
    description: "Play the correct triad notes as prompted.",
    instrument: "piano",
    timeLimit: 40,
    exercise: createExercise({
      id: "chord-detective-ex",
      title: "Chord Detective",
      prompt: "Play C Major, then F Major, then G Major!",
      steps: [
        step(["C4", "E4", "G4"], "C Major (C-E-G)"),
        step(["F4", "A4", "C5"], "F Major (F-A-C)"),
        step(["G4", "B4", "D5"], "G Major (G-B-D)"),
        step(["A4", "C5", "E5"], "A Minor (A-C-E)"),
      ],
    }),
  },
  {
    id: "speed-challenge",
    title: "Speed Challenge",
    description: "Play ascending scale at increasing speed.",
    instrument: "piano",
    timeLimit: 25,
    exercise: createExercise({
      id: "speed-challenge-ex",
      title: "Speed Challenge",
      prompt: "Ascending C Major scale rapidly!",
      steps: seq(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]),
    }),
  },
];

export function findChallenge(id) {
  return PRACTICE_CHALLENGES.find((c) => c.id === id) || PRACTICE_CHALLENGES[0];
}
