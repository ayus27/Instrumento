import { createFileRoute } from "@tanstack/react-router";
import { FrettedPage } from "@/components/instrument/FrettedPage";

export const Route = createFileRoute("/ukulele")({
  head: () => ({
    meta: [
      { title: "Ukulele — Instrumento" },
      {
        name: "description",
        content:
          "Play a four-string browser ukulele in standard GCEA tuning with fret navigation, strumming, keyboard shortcuts, metronome and recording.",
      },
      { property: "og:title", content: "Ukulele — Instrumento" },
      {
        property: "og:description",
        content: "Four-string GCEA browser ukulele with frets, strumming and recording.",
      },
    ],
  }),
  component: UkulelePage,
});

function UkulelePage() {
  return (
    <FrettedPage
      title="Ukulele"
      subtitle="GCEA tuning · Four strings · Strum + pluck"
      tuning={["G4", "C4", "E4", "A4"]}
      modes={[{ id: "ukulele", label: "Soprano" }]}
      maxFret={12}
    />
  );
}
