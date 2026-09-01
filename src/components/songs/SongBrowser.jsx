import { useMemo, useState } from "react";
import { getLanguages, getSongs } from "@/lib/songs/songService";
import { SongCard } from "./SongCard";
import { controlButtonClass } from "@/components/instrument/ControlBar";

export function SongBrowser() {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("All");
  const languages = useMemo(() => getLanguages(), []);
  const songs = useMemo(() => getSongs({ search, language }), [search, language]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8">
      <header className="hairline flex flex-wrap items-end justify-between gap-4 pb-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Songs</h1>
          <p className="label-mono mt-1">Lyrics, chords, transpose &amp; auto-scroll</p>
        </div>
        <input
          type="search"
          placeholder="Search songs or artists..."
          aria-label="Search songs or artists"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="panel w-64 bg-background px-4 py-2 font-mono text-xs text-foreground"
        />
      </header>

      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <button
            key={lang}
            type="button"
            className={`${controlButtonClass} ${language === lang ? "bg-signal text-primary-foreground" : ""}`}
            aria-pressed={language === lang}
            onClick={() => setLanguage(lang)}
          >
            {lang}
          </button>
        ))}
      </div>

      {songs.length === 0 ? (
        <p className="panel p-6 font-mono text-xs text-muted-foreground">
          No songs match that search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
