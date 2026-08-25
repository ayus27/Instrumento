import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { SAMPLE_SONGS, transposeChord } from "@/lib/songs/sampleSongs";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import { ChordDiagram } from "@/components/chord/ChordDiagram";
import { findChord } from "@/lib/chords/chordData";
import { useInstrument } from "@/hooks/useInstrument";

export const Route = createFileRoute("/songs")({
  head: () => ({
    meta: [
      { title: "Songs & Songbook — Instrumento" },
      {
        name: "description",
        content: "Browse songbook with auto-scrolling lyrics, interactive chords, live transposition and guitar play-along mode.",
      },
    ],
  }),
  component: SongsPage,
});

function SongsPage() {
  const [selectedSong, setSelectedSong] = useState(SAMPLE_SONGS[0]);
  const [search, setSearch] = useState("");
  const [transposeOffset, setTransposeOffset] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [guitarMode, setGuitarMode] = useState(false);
  const [selectedDiagramChord, setSelectedDiagramChord] = useState("C");

  const scrollRef = useRef(null);
  const pianoInst = useInstrument("piano-grand");

  const filteredSongs = SAMPLE_SONGS.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!autoScroll) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  const activeChordObj = findChord(selectedDiagramChord);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-8">
      <header className="hairline pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Songbook</h1>
          <p className="label-mono mt-1">Authorized Lyrics, Chords, Transpose & Auto-Scroll</p>
        </div>

        <input
          type="text"
          placeholder="Search songs or artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="panel px-4 py-2 font-mono text-xs text-foreground bg-background w-64"
        />
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="panel p-4 space-y-2 max-h-[500px] overflow-y-auto">
          <p className="label-mono mb-2">Available Songs</p>
          {filteredSongs.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSelectedSong(s);
                setTransposeOffset(0);
              }}
              className={`w-full text-left p-3 panel transition-colors ${
                selectedSong.id === s.id ? "bg-accent border-signal" : "hover:bg-accent"
              }`}
            >
              <h4 className="font-display text-lg uppercase tracking-tight text-foreground">{s.title}</h4>
              <p className="label-mono mt-0.5 text-muted-foreground">{s.artist}</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="panel p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="label-mono">TRANSPOSE</span>
              <button
                type="button"
                className={controlButtonClass}
                onClick={() => setTransposeOffset((t) => t - 1)}
              >
                −
              </button>
              <span className="font-mono text-xs text-signal font-bold w-8 text-center">
                {transposeOffset > 0 ? `+${transposeOffset}` : transposeOffset}
              </span>
              <button
                type="button"
                className={controlButtonClass}
                onClick={() => setTransposeOffset((t) => t + 1)}
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className={`${controlButtonClass} ${autoScroll ? "bg-signal text-primary-foreground" : ""}`}
                onClick={() => setAutoScroll((a) => !a)}
              >
                Auto-Scroll {autoScroll ? "ON" : "OFF"}
              </button>
              {autoScroll && (
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  className="w-24"
                  style={{ accentColor: "var(--signal)" }}
                />
              )}
            </div>

            <button
              type="button"
              className={`${controlButtonClass} ${guitarMode ? "bg-signal text-primary-foreground" : ""}`}
              onClick={() => setGuitarMode((g) => !g)}
            >
              🎸 Guitar Mode {guitarMode ? "ON" : "OFF"}
            </button>
          </div>

          <div
            ref={scrollRef}
            className="panel p-6 max-h-[500px] overflow-y-auto space-y-6 font-mono text-sm leading-relaxed"
          >
            <div>
              <h2 className="font-display text-3xl uppercase tracking-tight text-foreground">
                {selectedSong.title}
              </h2>
              <p className="label-mono mt-1 text-signal">
                {selectedSong.artist} · Key: {transposeChord(selectedSong.key, transposeOffset)} (Original: {selectedSong.key})
              </p>
            </div>

            {guitarMode && (
              <div className="p-4 panel bg-accent flex items-center justify-between">
                <div>
                  <p className="label-mono">GUITAR PLAY-ALONG ACTIVE</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click any chord above lyrics to preview diagram and hear audio!
                  </p>
                </div>
                <ChordDiagram chord={activeChordObj} instrumentType="guitar" />
              </div>
            )}

            {selectedSong.sections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-4 pt-2">
                <h4 className="label-mono font-bold text-signal">{sec.type}</h4>
                {sec.lines.map((line, lineIdx) => (
                  <div key={lineIdx} className="space-y-1">
                    <div className="flex gap-4 font-bold text-signal font-mono">
                      {line.chords.map((c, cIdx) => {
                        const transposed = transposeChord(c.chord, transposeOffset);
                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => {
                              setSelectedDiagramChord(transposed);
                              pianoInst.ensure();
                              const chordObj = findChord(transposed);
                              chordObj.pianoNotes.forEach((n) => pianoInst.noteOn(n));
                            }}
                            className="hover:underline focus:outline-none text-signal"
                          >
                            {transposed}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-foreground">{line.lyrics}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
