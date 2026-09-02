import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SongViewer } from "@/components/songs/SongViewer";
import { getSongById } from "@/lib/songs/songService";

export const Route = createFileRoute("/songs/$songId")({
  loader: ({ params }) => {
    const song = getSongById(params.songId);
    if (!song) throw notFound();
    return { song };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Song unavailable — Instrumento" }, { name: "robots", content: "noindex" }],
      };
    }
    const { song } = loaderData;
    const title = `${song.title} — Chords & Lyrics | Instrumento`;
    const description = `${song.title} by ${song.artist}. ${song.language} song with chords, lyrics, transpose and auto-scroll.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: SongNotFound,
  component: SongDetail,
});

function SongDetail() {
  const { song } = Route.useLoaderData();
  return <SongViewer song={song} />;
}

function SongNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center">
      <h1 className="font-display text-3xl uppercase tracking-tight">Song not found</h1>
      <Link to="/songs" className="label-mono mt-4 inline-block text-signal">
        ← Back to songs
      </Link>
    </div>
  );
}
