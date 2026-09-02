import { createFileRoute } from "@tanstack/react-router";
import { SongBrowser } from "@/components/songs/SongBrowser";

export const Route = createFileRoute("/songs/")({
  head: () => ({
    meta: [
      { title: "Songs — English, Nepali & Hindi Chords | Instrumento" },
      {
        name: "description",
        content:
          "Browse English, Nepali and Hindi songs with lyrics, guitar chords, live transposition and auto-scroll.",
      },
      { property: "og:title", content: "Songs — Instrumento" },
      {
        property: "og:description",
        content: "Multilingual songbook with chords, transpose and auto-scroll.",
      },
    ],
  }),
  component: SongBrowser,
});
