import { DRUM_LANES } from "@/lib/practice/drumLessons";

/**
 * 8-step drum pattern readout. `results` maps "lane:index" to "hit" | "missed".
 */
export function PatternGrid({ lesson, activeStep = -1, results = {} }) {
  return (
    <div className="panel overflow-x-auto p-4">
      <div className="min-w-[420px] space-y-2">
        {DRUM_LANES.map((lane) => (
          <div key={lane.id} className="flex items-center gap-3">
            <span className="label-mono w-16 shrink-0">{lane.label}</span>
            <div className="grid flex-1 grid-cols-8 gap-1.5">
              {lesson.lanes[lane.id].map((on, i) => {
                const state = results[`${lane.id}:${i}`];
                const isActive = i === activeStep;
                const bg = !on
                  ? "transparent"
                  : state === "hit"
                    ? "var(--signal)"
                    : state === "missed"
                      ? "var(--destructive)"
                      : "var(--signal-dim)";
                return (
                  <div
                    key={i}
                    aria-hidden
                    className="h-8 border transition-colors duration-75"
                    style={{
                      borderColor: isActive ? "var(--signal)" : "var(--panel-edge)",
                      backgroundColor: bg,
                      opacity: on ? 1 : 0.5,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <span className="label-mono w-16 shrink-0" />
          <div className="grid flex-1 grid-cols-8 gap-1.5">
            {Array.from({ length: lesson.stepCount }, (_, i) => (
              <span key={i} className="label-mono text-center">
                {i % 2 === 0 ? i / 2 + 1 : "&"}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
