import { midiToName, nameToMidi } from "@/lib/audio/notes";

type Props = {
  tuning: string[]; // low string first
  fretStart: number;
  fretCount: number;
  active: string[];
  stringKeys: string[];
  onPluck: (note: string) => void;
  onRelease?: (note: string) => void;
};

const MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];

export function Fretboard({
  tuning,
  fretStart,
  fretCount,
  active,
  stringKeys,
  onPluck,
  onRelease,
}: Props) {
  const frets = Array.from({ length: fretCount + 1 }, (_, i) => (i === 0 ? 0 : fretStart + i - 1));
  const strings = [...tuning].reverse();

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[640px]">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `2.75rem repeat(${frets.length}, minmax(0, 1fr))` }}
        >
          <div />
          {frets.map((fret, i) => (
            <div key={`h-${i}`} className="label-mono pb-1 text-center">
              {fret === 0 ? "OPEN" : fret}
            </div>
          ))}

          {strings.map((open, rowIndex) => {
            const stringIndex = strings.length - 1 - rowIndex;
            return (
              <div key={open + rowIndex} className="contents">
                <div className="flex items-center gap-2 pr-2">
                  <span className="label-mono text-signal">{stringKeys[stringIndex] ?? ""}</span>
                  <span className="font-mono text-xs text-muted-foreground">{open}</span>
                </div>
                {frets.map((fret, i) => {
                  const note = midiToName(nameToMidi(open) + fret);
                  const on = active.includes(note);
                  const marker = MARKERS.includes(fret) && rowIndex === Math.floor(strings.length / 2);
                  return (
                    <button
                      key={`${open}-${i}`}
                      type="button"
                      aria-label={`Play ${note} on string ${open}, fret ${fret}`}
                      className="group relative h-11 border-r border-panel-edge bg-panel transition-colors first:border-l hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal"
                      style={on ? { backgroundColor: "var(--signal-dim)" } : undefined}
                      onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        onPluck(note);
                      }}
                      onPointerUp={() => onRelease?.(note)}
                      onPointerLeave={() => onRelease?.(note)}
                    >
                      <span
                        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
                        style={{
                          background: "var(--panel-edge)",
                          height: `${1 + (strings.length - rowIndex) * 0.3}px`,
                        }}
                      />
                      {marker && (
                        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/40" />
                      )}
                      <span className="relative font-mono text-[10px] text-transparent group-hover:text-foreground/70">
                        {note}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
