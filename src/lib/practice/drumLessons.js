// Drum patterns are 8-step grids (eighth notes over one bar of 4/4).
// Each lane maps to an existing DRUM_PADS id, so practice uses the real kit.

export const DRUM_LANES = [
  { id: "kick", label: "Kick" },
  { id: "snare", label: "Snare" },
  { id: "hihat", label: "Hi-Hat" },
];

function pattern({ id, title, prompt, bpm, lanes }) {
  return { id, title, prompt, bpm, lanes, stepCount: 8 };
}

export const DRUM_LESSONS = [
  pattern({
    id: "drums-kick-pulse",
    title: "Kick pulse",
    prompt: "Four on the floor. Kick on every downbeat.",
    bpm: 70,
    lanes: { kick: [1, 0, 1, 0, 1, 0, 1, 0], snare: [0, 0, 0, 0, 0, 0, 0, 0], hihat: [0, 0, 0, 0, 0, 0, 0, 0] },
  }),
  pattern({
    id: "drums-backbeat",
    title: "Backbeat",
    prompt: "Kick on 1 and 3, snare on 2 and 4.",
    bpm: 75,
    lanes: { kick: [1, 0, 0, 0, 1, 0, 0, 0], snare: [0, 0, 1, 0, 0, 0, 1, 0], hihat: [0, 0, 0, 0, 0, 0, 0, 0] },
  }),
  pattern({
    id: "drums-eighth-hats",
    title: "Eighth-note hats",
    prompt: "Steady hi-hat under the backbeat.",
    bpm: 80,
    lanes: { kick: [1, 0, 0, 0, 1, 0, 0, 0], snare: [0, 0, 1, 0, 0, 0, 1, 0], hihat: [1, 1, 1, 1, 1, 1, 1, 1] },
  }),
  pattern({
    id: "drums-syncopated",
    title: "Syncopated groove",
    prompt: "Off-beat kick. Watch the '&' of 2.",
    bpm: 90,
    lanes: { kick: [1, 0, 0, 1, 0, 0, 1, 0], snare: [0, 0, 1, 0, 0, 0, 1, 0], hihat: [1, 1, 1, 1, 1, 1, 1, 1] },
  }),
  pattern({
    id: "drums-fast-groove",
    title: "Up-tempo groove",
    prompt: "Same idea, quicker. Stay relaxed.",
    bpm: 110,
    lanes: { kick: [1, 0, 1, 1, 0, 0, 1, 0], snare: [0, 0, 1, 0, 0, 1, 1, 0], hihat: [1, 1, 1, 1, 1, 1, 1, 1] },
  }),
];

export function findDrumLesson(id) {
  return DRUM_LESSONS.find((l) => l.id === id) || DRUM_LESSONS[0];
}

/** [{ index, pads: string[] }] for every grid position that expects a hit. */
export function patternHits(lesson) {
  const hits = [];
  for (let i = 0; i < lesson.stepCount; i += 1) {
    const pads = DRUM_LANES.filter((lane) => lesson.lanes[lane.id]?.[i]).map((l) => l.id);
    if (pads.length) hits.push({ index: i, pads });
  }
  return hits;
}
