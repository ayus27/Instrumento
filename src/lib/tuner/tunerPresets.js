/**
 * Starting points only — real drum tuning depends on shell, heads, size and taste.
 * Users can override the target frequency for any drum.
 */
export const DRUM_TUNER_PRESETS = [
  { id: "kick", label: "Kick", frequency: 60 },
  { id: "snare", label: "Snare", frequency: 180 },
  { id: "tom1", label: "Tom 1 (Rack)", frequency: 220 },
  { id: "tom2", label: "Tom 2 (Rack)", frequency: 180 },
  { id: "tom3", label: "Tom 3", frequency: 150 },
  { id: "floor", label: "Floor Tom", frequency: 110 },
];

export function getPreset(id) {
  return DRUM_TUNER_PRESETS.find((p) => p.id === id) ?? DRUM_TUNER_PRESETS[0];
}
