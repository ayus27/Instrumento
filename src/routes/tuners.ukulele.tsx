import { createFileRoute } from "@tanstack/react-router";
import { TunerPanel } from "@/components/tuner/TunerPanel";

export const Route = createFileRoute("/tuners/ukulele")({
  head: () => ({
    meta: [
      { title: "Ukulele Tuner — Instrumento" },
      {
        name: "description",
        content:
          "Tune a ukulele in standard GCEA tuning using your microphone, with live frequency detection and a flat / in-tune / sharp meter.",
      },
      { property: "og:title", content: "Ukulele Tuner — Instrumento" },
      {
        property: "og:description",
        content: "Microphone-based ukulele tuner with cent-accurate pitch feedback.",
      },
    ],
  }),
  component: () => <TunerPanel title="Ukulele Tuner" strings={["G4", "C4", "E4", "A4"]} />,
});
