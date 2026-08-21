import { createExercise, step } from "./engine";

const seq = (notes) => notes.map((n) => step(n));

export const PIANO_LESSONS = [
  createExercise({
    id: "piano-single-notes",
    title: "Find the notes",
    prompt: "One key at a time. The glowing key is your target.",
    steps: seq(["C4", "E4", "G4", "D4", "F4", "A4", "B4", "C5"]),
  }),
  createExercise({
    id: "piano-sequences",
    title: "Short sequences",
    prompt: "Play each note in order.",
    steps: seq(["C4", "E4", "G4", "E4", "C4", "G4", "C5", "G4", "E4", "C4"]),
  }),
  createExercise({
    id: "piano-scale-up",
    title: "C major, ascending",
    prompt: "Walk up the scale.",
    steps: seq(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]),
  }),
  createExercise({
    id: "piano-scale-down",
    title: "C major, descending",
    prompt: "Walk back down.",
    steps: seq(["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"]),
  }),
  createExercise({
    id: "piano-triads",
    title: "Basic triads",
    prompt: "Hold all three keys of the chord together.",
    steps: [
      step(["C4", "E4", "G4"], "C major"),
      step(["F4", "A4", "C5"], "F major"),
      step(["G4", "B4", "D5"], "G major"),
      step(["A4", "C5", "E5"], "A minor"),
      step(["D4", "F4", "A4"], "D minor"),
    ],
  }),
  createExercise({
    id: "piano-melody-ode",
    title: "Melody — Ode to Joy",
    prompt: "A public-domain melody, one note at a time.",
    steps: seq([
      "E4", "E4", "F4", "G4", "G4", "F4", "E4", "D4",
      "C4", "C4", "D4", "E4", "E4", "D4", "D4",
    ]),
  }),
  createExercise({
    id: "piano-melody-twinkle",
    title: "Melody — Twinkle, Twinkle",
    prompt: "Longer phrase. Keep the streak alive.",
    steps: seq([
      "C4", "C4", "G4", "G4", "A4", "A4", "G4",
      "F4", "F4", "E4", "E4", "D4", "D4", "C4",
    ]),
  }),
];

export function findPianoLesson(id) {
  return PIANO_LESSONS.find((l) => l.id === id) || PIANO_LESSONS[0];
}
