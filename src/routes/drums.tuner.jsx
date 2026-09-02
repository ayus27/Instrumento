import { createFileRoute } from "@tanstack/react-router";
import { DrumTuner } from "@/components/tuner/DrumTuner";

export const Route = createFileRoute("/drums/tuner")({
  head: () => ({
    meta: [
      { title: "Drum Tuner — Instrumento" },
      {
        name: "description",
        content:
          "Tune kick, snare and toms with a live microphone drum tuner showing note, frequency and cents deviation from your target pitch.",
      },
      { property: "og:title", content: "Drum Tuner — Instrumento" },
      {
        property: "og:description",
        content: "Live microphone pitch detection for tuning drum heads.",
      },
    ],
  }),
  component: DrumTuner,
});
