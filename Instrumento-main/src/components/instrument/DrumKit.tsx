export type Pad = { id: string; label: string; key: string; span?: boolean };

export const DRUM_PADS: Pad[] = [
  { id: "crash", label: "Crash", key: "h" },
  { id: "ride", label: "Ride", key: "j" },
  { id: "hihat", label: "Hi-Hat", key: "d" },
  { id: "openhat", label: "Open Hat", key: "f" },
  { id: "tom", label: "Tom", key: "g" },
  { id: "snare", label: "Snare", key: "s" },
  { id: "kick", label: "Kick", key: "a", span: true },
];

type Props = {
  hitPads: string[];
  onHit: (pad: string) => void;
};

export function DrumKit({ hitPads, onHit }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {DRUM_PADS.map((pad) => {
        const on = hitPads.includes(pad.id);
        return (
          <button
            key={pad.id}
            type="button"
            aria-label={`Play ${pad.label}`}
            onPointerDown={() => onHit(pad.id)}
            className={`panel flex h-28 flex-col items-start justify-between p-3 transition-[transform,background-color] duration-75 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
              pad.span ? "sm:col-span-3 sm:h-24" : ""
            }`}
            style={
              on
                ? { backgroundColor: "var(--signal)", color: "var(--primary-foreground)", transform: "scale(0.985)" }
                : undefined
            }
          >
            <span className="label-mono" style={on ? { color: "inherit" } : undefined}>
              {pad.key.toUpperCase()}
            </span>
            <span className="font-display text-xl">{pad.label}</span>
          </button>
        );
      })}
    </div>
  );
}
