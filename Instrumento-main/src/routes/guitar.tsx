import { createFileRoute } from "@tanstack/react-router";
import { FrettedPage } from "@/components/instrument/FrettedPage";

export const Route = createFileRoute("/guitar")({
  head: () => ({
    meta: [
      { title: "Guitar — Instrumento" },
      {
        name: "description",
        content:
          "Play a six-string browser guitar: acoustic and electric modes, fret slider, strumming, keyboard shortcuts, metronome and recording.",
      },
      { property: "og:title", content: "Guitar — Instrumento" },
      {
        property: "og:description",
        content: "Six-string browser guitar with acoustic/electric modes, frets and recording.",
      },
    ],
  }),
  component: GuitarPage,
});

function GuitarPage() {
  return (
    <FrettedPage
      title="Guitar"
      subtitle="Standard tuning · Acoustic + electric · Fret slider"
      tuning={["E2", "A2", "D3", "G3", "B3", "E4"]}
      modes={[
        { id: "guitar-acoustic", label: "Acoustic" },
        { id: "guitar-electric", label: "Electric" },
      ]}
      maxFret={15}
    />
  );
}
