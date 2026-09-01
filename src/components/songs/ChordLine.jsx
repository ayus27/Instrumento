import { transposeChord } from "@/lib/songs/transposeChord";

/**
 * Renders a chord row positioned above its lyric line.
 * The original song data is never mutated — transposition happens at render time.
 */
export function ChordLine({ line, semitones = 0, onChordClick }) {
  const chords = Array.isArray(line.chords) ? line.chords : [];
  const sorted = [...chords].sort((a, b) => a.position - b.position);

  let cursor = 0;
  const rendered = sorted.map((c, i) => {
    const pad = Math.max(0, (c.position ?? 0) - cursor);
    const name = transposeChord(c.chord, semitones);
    cursor = (c.position ?? 0) + name.length + 1;
    return (
      <span key={i}>
        {"\u00a0".repeat(pad)}
        <button
          type="button"
          onClick={onChordClick ? () => onChordClick(name) : undefined}
          className="font-bold text-signal hover:underline focus:outline-none"
        >
          {name}
        </button>
      </span>
    );
  });

  return (
    <div className="space-y-0.5">
      <div className="overflow-x-auto whitespace-pre font-mono text-sm text-signal">
        {rendered.length ? rendered : "\u00a0"}
      </div>
      <div className="overflow-x-auto whitespace-pre font-mono text-sm text-foreground">
        {line.lyrics}
      </div>
    </div>
  );
}
