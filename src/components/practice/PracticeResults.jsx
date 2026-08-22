import { controlButtonClass } from "@/components/instrument/ControlBar";
import { formatDuration } from "@/lib/practice/engine";

function Stat({ label, value }) {
  return (
    <div>
      <p className="label-mono">{label}</p>
      <p className="font-display mt-1 text-2xl tracking-tight">{value}</p>
    </div>
  );
}

export function PracticeResults({ score, onRetry, onNext, nextLabel }) {
  return (
    <div className="panel p-5">
      <p className="label-mono">Practice complete</p>
      <p className="font-display mt-1 text-5xl tracking-tight" style={{ color: "var(--signal)" }}>
        {score.accuracy}%
      </p>
      <p className="label-mono">Accuracy</p>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Correct" value={score.correct} />
        <Stat label="Missed" value={score.missed} />
        <Stat label="Wrong" value={score.incorrect} />
        <Stat label="Best streak" value={score.bestStreak} />
      </div>

      <p className="label-mono mt-4">
        Time {formatDuration(score.duration)}
        {score.bpm ? ` · ${score.bpm} BPM` : ""}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className={controlButtonClass} onClick={onRetry}>
          Try again
        </button>
        {onNext && (
          <button
            type="button"
            className={controlButtonClass}
            onClick={onNext}
            style={{ backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }}
          >
            {nextLabel || "Next exercise"}
          </button>
        )}
      </div>
    </div>
  );
}
