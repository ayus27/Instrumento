import { Link } from "@tanstack/react-router";

export function SongCard({ song }) {
  return (
    <Link
      to="/songs/$songId"
      params={{ songId: song.id }}
      className="panel block p-4 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
    >
      {song.coverImage && (
        <img
          src={song.coverImage}
          alt={`${song.title} cover art`}
          loading="lazy"
          className="mb-3 h-32 w-full object-cover"
        />
      )}
      <h3 className="font-display text-lg uppercase tracking-tight text-foreground">{song.title}</h3>
      <p className="label-mono mt-1 text-muted-foreground">{song.artist}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="label-mono border px-2 py-0.5"
          style={{ borderColor: "var(--panel-edge)", color: "var(--signal)" }}
        >
          {song.language}
        </span>
        {song.genre && <span className="label-mono text-muted-foreground">{song.genre}</span>}
      </div>
    </Link>
  );
}
