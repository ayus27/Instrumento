// Instrument-agnostic practice engine.
//
// A PracticeExercise is a list of steps. Each step expects one or more targets
// (piano note names, drum pad ids). The session judges incoming inputs, records
// PracticeEvents and produces a PracticeScore at the end.

export function createExercise({ id, title, prompt, steps, bpm = null, instrumentHint = "" }) {
  return { id, title, prompt, bpm, instrumentHint, steps };
}

/** A step: { targets: string[], label?: string } — all targets required, order-free. */
export function step(targets, label) {
  const list = Array.isArray(targets) ? targets : [targets];
  return { targets: list, label: label || list.join(" + ") };
}

export function createSession(exercise, { startedAt = Date.now() } = {}) {
  return {
    exercise,
    startedAt,
    finishedAt: null,
    index: 0,
    satisfied: [], // targets already hit inside the current step
    events: [],
    correct: 0,
    incorrect: 0,
    missed: 0,
    streak: 0,
    bestStreak: 0,
    done: exercise.steps.length === 0,
  };
}

export function currentStep(session) {
  return session.exercise.steps[session.index] || null;
}

/** Targets of the current step still waiting to be played. */
export function pendingTargets(session) {
  const stepData = currentStep(session);
  if (!stepData) return [];
  return stepData.targets.filter((t) => !session.satisfied.includes(t));
}

function record(session, verdict, target, at) {
  session.events.push({ t: at - session.startedAt, verdict, target });
}

/**
 * Judge one input. Returns a new session object plus the verdict so the UI can
 * flash feedback. Verdicts: "correct" | "wrong" | "repeat" | "ignored".
 */
export function judgeInput(session, target, at = Date.now()) {
  if (session.done) return { session, verdict: "ignored" };
  const next = { ...session, satisfied: [...session.satisfied], events: [...session.events] };
  const stepData = currentStep(next);
  if (!stepData) return { session, verdict: "ignored" };

  if (!stepData.targets.includes(target)) {
    next.incorrect += 1;
    next.streak = 0;
    record(next, "wrong", target, at);
    return { session: next, verdict: "wrong" };
  }

  if (next.satisfied.includes(target)) {
    record(next, "repeat", target, at);
    return { session: next, verdict: "repeat" };
  }

  next.satisfied.push(target);
  next.correct += 1;
  next.streak += 1;
  next.bestStreak = Math.max(next.bestStreak, next.streak);
  record(next, "correct", target, at);

  const stepComplete = stepData.targets.every((t) => next.satisfied.includes(t));
  if (stepComplete) {
    next.index += 1;
    next.satisfied = [];
    if (next.index >= next.exercise.steps.length) {
      next.done = true;
      next.finishedAt = at;
    }
  }
  return { session: next, verdict: "correct", stepComplete };
}

/** Count everything still unplayed as missed and finish (used when skipping/abandoning). */
export function finishSession(session, at = Date.now()) {
  if (session.done) return session;
  const remaining = session.exercise.steps
    .slice(session.index)
    .reduce((sum, s) => sum + s.targets.length, 0);
  return {
    ...session,
    missed: session.missed + remaining - session.satisfied.length,
    done: true,
    finishedAt: at,
  };
}

export function scoreSession(session) {
  const attempts = session.correct + session.incorrect + session.missed;
  const accuracy = attempts === 0 ? 0 : Math.round((session.correct / attempts) * 100);
  const duration = ((session.finishedAt || Date.now()) - session.startedAt) / 1000;
  return {
    accuracy,
    correct: session.correct,
    incorrect: session.incorrect,
    missed: session.missed,
    bestStreak: session.bestStreak,
    duration,
    bpm: session.exercise.bpm,
  };
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
