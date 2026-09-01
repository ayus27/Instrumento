import { controlButtonClass } from "@/components/instrument/ControlBar";
import { transposeKey } from "@/lib/songs/transposeChord";

export function TransposeControls({ semitones, onChange, originalKey }) {
  return (
    <div className="flex items-center gap-2">
      <span className="label-mono">Transpose</span>
      <button
        type="button"
        aria-label="Transpose down one semitone"
        className={controlButtonClass}
        onClick={() => onChange(semitones - 1)}
      >
        −
      </button>
      <span className="w-20 text-center font-mono text-xs font-bold text-signal">
        {transposeKey(originalKey, semitones)}
        {semitones !== 0 ? ` (${semitones > 0 ? "+" : ""}${semitones})` : ""}
      </span>
      <button
        type="button"
        aria-label="Transpose up one semitone"
        className={controlButtonClass}
        onClick={() => onChange(semitones + 1)}
      >
        +
      </button>
      {semitones !== 0 && (
        <button type="button" className={controlButtonClass} onClick={() => onChange(0)}>
          Reset
        </button>
      )}
    </div>
  );
}
