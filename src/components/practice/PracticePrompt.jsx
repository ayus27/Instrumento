const VERDICT_COPY = {
  correct: "✓ Correct",
  wrong: "✗ Not that one",
  repeat: "Already held",
};

/** Prompt strip shown above an instrument during a lesson. */
export function PracticePrompt({ label, sub, feedback, progress, index, total }) {
  const verdict = feedback?.verdict;
  const color =
    verdict === "correct" ? "var(--signal)" : verdict === "wrong" ? "var(--destructive)" : undefined;

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="label-mono">Play</p>
        <p className="label-mono">
          Step {Math.min(index + 1, total)} / {total}
        </p>
      </div>
      <p
        key={label}
        className="font-display mt-1 text-4xl uppercase tracking-tight sm:text-5xl"
        style={{ color: "var(--signal)" }}
      >
        {label}
      </p>
      {sub && <p className="label-mono mt-1">{sub}</p>}
      <div className="mt-4 h-1 w-full" style={{ backgroundColor: "var(--panel-edge)" }}>
        <div
          className="h-full transition-[width] duration-200"
          style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: "var(--signal)" }}
        />
      </div>
      <p
        key={feedback?.n ?? "none"}
        aria-live="polite"
        className="mt-3 h-5 font-mono text-xs"
        style={{ color }}
      >
        {verdict ? `${VERDICT_COPY[verdict] ?? ""} ${feedback.target}` : ""}
      </p>
    </div>
  );
}
