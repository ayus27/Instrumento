import { useCallback, useMemo, useRef, useState } from "react";
import {
  createSession,
  currentStep,
  finishSession,
  judgeInput,
  pendingTargets,
  scoreSession,
} from "@/lib/practice/engine";

/**
 * Drives any step-based practice exercise. The instrument page feeds inputs in
 * (note names, drum pad ids) and reads back targets + feedback for the UI.
 */
export function usePracticeSession(exercise) {
  const [session, setSession] = useState(() => createSession(exercise));
  const [feedback, setFeedback] = useState(null); // { verdict, target, n }
  const counter = useRef(0);

  const restart = useCallback(
    (nextExercise = exercise) => {
      setSession(createSession(nextExercise));
      setFeedback(null);
    },
    [exercise],
  );

  const input = useCallback((target) => {
    setSession((prev) => {
      const { session: next, verdict } = judgeInput(prev, target);
      counter.current += 1;
      setFeedback({ verdict, target, n: counter.current });
      return next;
    });
  }, []);

  const giveUp = useCallback(() => {
    setSession((prev) => finishSession(prev));
  }, []);

  const targets = useMemo(() => pendingTargets(session), [session]);
  const step = currentStep(session);
  const score = session.done ? scoreSession(session) : null;

  return {
    session,
    step,
    targets,
    feedback,
    score,
    progress: session.exercise.steps.length
      ? session.index / session.exercise.steps.length
      : 0,
    input,
    restart,
    giveUp,
  };
}
