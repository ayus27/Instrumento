import { createFileRoute } from "@tanstack/react-router";
import { TunerPanel } from "@/components/tuner/TunerPanel";

export const Route = createFileRoute("/tuners/guitar")({
  head: () => ({
    meta: [
      { title: "Guitar Tuner — Instrumento" },
      {
        name: "description",
        content:
          "Tune a guitar in standard EADGBE tuning using your microphone, with live frequency detection and a flat / in-tune / sharp meter.",
      },
      { property: "og:title", content: "Guitar Tuner — Instrumento" },
      {
        property: "og:description",
        content: "Microphone-based chromatic guitar tuner with cent-accurate pitch feedback.",
      },
    ],
  }),
  component: () => <TunerPanel title="Guitar Tuner" strings={["E2", "A2", "D3", "G3", "B3", "E4"]} />,
});
