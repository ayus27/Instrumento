import { isSharp, midiToName } from "@/lib/audio/notes";

type Props = {
  startMidi: number;
  keyCount: number;
  active: string[];
  keyLabels: Record<string, string>;
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
  /** Practice mode only: keys the learner is being asked to play. */
  targets?: string[];
};

export function PianoKeyboard({
  startMidi,
  keyCount,
  active,
  keyLabels = {},
  onNoteOn,
  onNoteOff,
  targets = [],
}: Props) {
  const midis = Array.from({ length: keyCount }, (_, i) => startMidi + i);
  const whites = midis.filter((m) => !isSharp(m));
  const whiteWidth = 100 / whites.length;


  return (
    <div className="relative h-56 w-full select-none sm:h-72" role="group" aria-label="Piano keys">
      {whites.map((midi, index) => {
        const note = midiToName(midi);
        const on = active.includes(note);
        const target = targets.includes(note);
        return (
          <button
            key={note}
            type="button"
            aria-label={`Play ${note}`}
            aria-pressed={on}
            data-target={target || undefined}
            className="absolute top-0 flex h-full flex-col justify-end rounded-b-[14px] border-[1.5px] border-ink pb-3 transition-[transform,filter] duration-75 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-signal"
            style={{
              left: `${index * whiteWidth}%`,
              width: `${whiteWidth}%`,
              background: on
                ? "var(--lime)"
                : "var(--key-white)",
              transform: on ? "scale(0.97)" : undefined,
              boxShadow: target ? "inset 0 0 0 3px var(--orange)" : undefined,
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              onNoteOn(note);
            }}
            onPointerUp={() => onNoteOff(note)}
            onPointerCancel={() => onNoteOff(note)}
            onPointerLeave={() => onNoteOff(note)}
          >
            <span className="label-mono text-center text-[color:var(--on-lime)]/60">{keyLabels[note] ?? ""}</span>
            <span className="mt-1 text-center font-mono text-[10px] text-[color:var(--on-lime)]/45">{note}</span>
          </button>
        );
      })}


      {midis
        .filter((m) => isSharp(m))
        .map((midi) => {
          const note = midiToName(midi);
          const on = active.includes(note);
          const target = targets.includes(note);
          const whiteBefore = whites.filter((w) => w < midi).length;
          return (
            <button
              key={note}
              type="button"
              aria-label={`Play ${note}`}
              aria-pressed={on}
              data-target={target || undefined}
              className="absolute top-0 z-10 flex h-[62%] flex-col justify-end pb-2 transition-transform duration-75 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-signal"
              style={{
                left: `calc(${whiteBefore * whiteWidth}% - ${whiteWidth * 0.25}%)`,
                width: `${whiteWidth * 0.5}%`,
                background: on
                  ? "var(--lime)"
                  : "var(--key-black)",
                border: "1.5px solid var(--ink)",
                borderRadius: "0 0 10px 10px",
                transform: on ? "scale(0.97)" : undefined,
                boxShadow: target
                  ? "inset 0 0 0 3px var(--orange)"
                  : undefined,
              }}

              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                onNoteOn(note);
              }}
              onPointerUp={() => onNoteOff(note)}
              onPointerCancel={() => onNoteOff(note)}
              onPointerLeave={() => onNoteOff(note)}
            >
              <span className="label-mono text-center text-foreground/60">
                {keyLabels[note] ?? ""}
              </span>
            </button>
          );
        })}
    </div>
  );
}
