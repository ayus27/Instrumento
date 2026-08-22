import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import { DrumKit, DRUM_PADS } from "@/components/instrument/DrumKit";
import { InstrumentShell } from "@/components/instrument/InstrumentShell";
import { PatternGrid } from "@/components/practice/PatternGrid";
import { PracticeResults } from "@/components/practice/PracticeResults";
import { useInstrument } from "@/hooks/useInstrument";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { getEngine } from "@/lib/audio/engine";
import { DRUM_LESSONS, patternHits } from "@/lib/practice/drumLessons";

export const Route = createFileRoute("/practice/drums/learn")({
  head: () => ({
    meta: [
      { title: "Drum Teach Me — Instrumento" },
      {
        name: "description",
        content:
          "Guided drum lessons: read the eight-step grid, take the count-in and play the groove, scored on timing, missed hits and extras.",
      },
      { property: "og:title", content: "Drum Teach Me — Instrumento" },
      {
        property: "og:description",
        content: "Guided drum grooves with a count-in and timing-accurate scoring.",
      },
    ],
  }),
  component: DrumLearnPage,
});

const LOOPS = 2;
const COUNT_IN_BEATS = 4;

function DrumLearnPage() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | countin | running | done
  const [activeStep, setActiveStep] = useState(-1);
  const [results, setResults] = useState({});
  const [score, setScore] = useState(null);
  const [hitPads, setHitPads] = useState([]);

  const lesson = DRUM_LESSONS[lessonIndex];
  const instrument = useInstrument("drums");

  const runRef = useRef(null); // { barStart, stepDur, expected, hits, extras, wrong, startedAt }
  const rafRef = useRef(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const reset = useCallback(
    (index = lessonIndex) => {
      stop();
      runRef.current = null;
      setPhase("idle");
      setActiveStep(-1);
      setResults({});
      setScore(null);
      setLessonIndex(index);
    },
    [lessonIndex, stop],
  );

  const finish = useCallback(() => {
    const run = runRef.current;
    if (!run) return;
    stop();
    setPhase("done");
    setActiveStep(-1);

    const nextResults = {};
    let correct = 0;
    let missed = 0;
    let bestStreak = 0;
    let streak = 0;
    run.expected.forEach((slot) => {
      slot.pads.forEach((pad) => {
        const key = `${pad}:${slot.index}`;
        const done = run.hits.has(`${slot.loop}:${key}`);
        if (done) {
          correct += 1;
          streak += 1;
          bestStreak = Math.max(bestStreak, streak);
        } else {
          missed += 1;
          streak = 0;
          nextResults[key] = "missed";
        }
        if (done && !nextResults[key]) nextResults[key] = "hit";
      });
    });
    setResults(nextResults);
    const incorrect = run.wrong + run.extras;
    const attempts = correct + incorrect + missed;
    setScore({
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
      correct,
      incorrect,
      missed,
      bestStreak,
      duration: (Date.now() - run.startedAt) / 1000,
      bpm: lesson.bpm,
    });
  }, [lesson.bpm, stop]);

  const start = useCallback(async () => {
    await instrument.ensure();
    const engine = getEngine();
    const beat = 60 / lesson.bpm;
    const stepDur = beat / 2;
    const now = engine.now() + 0.25;
    const barStart = now + COUNT_IN_BEATS * beat;

    for (let i = 0; i < COUNT_IN_BEATS; i += 1) {
      engine.clickAt(now + i * beat, i === 0);
    }
    for (let loop = 0; loop < LOOPS; loop += 1) {
      for (let b = 0; b < 4; b += 1) {
        engine.clickAt(barStart + loop * 4 * beat + b * beat, b === 0);
      }
    }

    const expected = [];
    for (let loop = 0; loop < LOOPS; loop += 1) {
      patternHits(lesson).forEach((slot) => expected.push({ ...slot, loop }));
    }

    runRef.current = {
      barStart,
      stepDur,
      expected,
      hits: new Set(),
      extras: 0,
      wrong: 0,
      startedAt: Date.now(),
    };
    setResults({});
    setScore(null);
    setPhase("countin");

    const totalSteps = lesson.stepCount * LOOPS;
    const tick = () => {
      const t = engine.now();
      const rel = t - barStart;
      if (rel < 0) {
        setActiveStep(-1);
        setPhase("countin");
      } else if (rel < totalSteps * stepDur) {
        setPhase("running");
        setActiveStep(Math.floor(rel / stepDur) % lesson.stepCount);
      } else if (rel > totalSteps * stepDur + stepDur * 0.6) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [finish, instrument, lesson]);

  const flash = useCallback((pad) => {
    setHitPads((prev) => [...prev, pad]);
    setTimeout(() => setHitPads((prev) => prev.filter((p, i) => !(p === pad && i === prev.indexOf(pad)))), 110);
  }, []);

  const hit = useCallback(
    (pad) => {
      instrument.hit(pad);
      flash(pad);
      const run = runRef.current;
      if (!run || phase === "done") return;
      const rel = getEngine().now() - run.barStart;
      const totalSteps = lesson.stepCount * LOOPS;
      if (rel < -run.stepDur * 0.5 || rel > totalSteps * run.stepDur) return;

      const nearest = Math.round(rel / run.stepDur);
      const offset = Math.abs(rel - nearest * run.stepDur);
      const loop = Math.floor(nearest / lesson.stepCount);
      const index = ((nearest % lesson.stepCount) + lesson.stepCount) % lesson.stepCount;
      const slot = run.expected.find((s) => s.loop === loop && s.index === index);

      if (!slot || offset > run.stepDur * 0.5 || !slot.pads.includes(pad)) {
        if (slot && slot.pads.includes(pad)) run.extras += 1;
        else run.wrong += 1;
        return;
      }
      const key = `${loop}:${pad}:${index}`;
      if (run.hits.has(key)) {
        run.extras += 1;
        return;
      }
      run.hits.add(key);
      setResults((prev) => ({ ...prev, [`${pad}:${index}`]: "hit" }));
    },
    [flash, instrument, lesson.stepCount, phase],
  );

  useKeyboardInput({
    onDown: (key) => {
      const pad = DRUM_PADS.find((p) => p.key === key);
      if (pad) hit(pad.id);
    },
    onUp: () => {},
  });

  const phaseLabel =
    phase === "countin"
      ? "Count in…"
      : phase === "running"
        ? "Play the groove"
        : phase === "done"
          ? "Complete"
          : "Ready";

  return (
    <InstrumentShell
      title="Drums · Teach me"
      subtitle={`${lesson.title} · ${lesson.bpm} BPM`}
      status={instrument.status}
      error={instrument.error}
      onEnable={() => void instrument.ensure()}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={controlButtonClass}
            onClick={() => void start()}
            disabled={phase === "countin" || phase === "running"}
            style={{ backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </button>
          <button type="button" className={controlButtonClass} onClick={() => reset()}>
            Reset
          </button>
          <span className="label-mono">{phaseLabel}</span>
          <div className="ml-auto flex flex-wrap items-center gap-1">
            {DRUM_LESSONS.map((l, i) => (
              <button
                key={l.id}
                type="button"
                className={controlButtonClass}
                onClick={() => reset(i)}
                style={
                  i === lessonIndex
                    ? { backgroundColor: "var(--signal)", color: "var(--primary-foreground)" }
                    : undefined
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      }
      legend={
        <div className="panel p-4">
          <p className="label-mono">Lesson {lessonIndex + 1} — {lesson.title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{lesson.prompt}</p>
          <p className="label-mono mt-3">
            A kick · S snare · D hi-hat. Four clicks count you in, then two bars are scored.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {score ? (
          <PracticeResults
            score={score}
            onRetry={() => void start()}
            onNext={
              lessonIndex < DRUM_LESSONS.length - 1 ? () => reset(lessonIndex + 1) : undefined
            }
            nextLabel="Next lesson"
          />
        ) : null}
        <PatternGrid lesson={lesson} activeStep={activeStep} results={results} />
        <DrumKit hitPads={hitPads} onHit={hit} />
      </div>
    </InstrumentShell>
  );
}
