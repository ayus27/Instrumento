import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getRecorder,
  playEvents,
  saveRecording,
  type PerfEvent,
  type RecorderState,
} from "@/lib/audio/recorder";

export function useRecorder(
  instrument: string,
  handlers: {
    attack: (target: string, velocity: number) => void;
    release: (target: string) => void;
    hit: (target: string, velocity: number) => void;
  },
  bpm: number,
) {
  const recorder = getRecorder();
  useSyncExternalStore(recorder.subscribe, recorder.getSnapshot, () => 0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stopPlaybackRef = useRef<null | (() => void)>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const state: RecorderState = recorder.state;

  useEffect(() => {
    if (state !== "recording") return;
    const id = setInterval(() => setElapsed(recorder.elapsed()), 100);
    return () => clearInterval(id);
  }, [recorder, state]);

  const start = useCallback(() => {
    setElapsed(0);
    void recorder.start(instrument);
  }, [instrument, recorder]);

  const stop = useCallback(() => {
    void recorder.stop();
    setElapsed(recorder.elapsed());
  }, [recorder]);

  const discard = useCallback(() => {
    stopPlaybackRef.current?.();
    setPlaying(false);
    recorder.reset();
  }, [recorder]);

  const play = useCallback(() => {
    if (!recorder.events.length) return;
    stopPlaybackRef.current?.();
    setPlaying(true);
    stopPlaybackRef.current = playEvents(
      recorder.events,
      {
        attack: (t, v) => handlersRef.current.attack(t, v),
        release: (t) => handlersRef.current.release(t),
        hit: (t, v) => handlersRef.current.hit(t, v),
      },
      () => setPlaying(false),
    );
  }, [recorder]);

  const pause = useCallback(() => {
    stopPlaybackRef.current?.();
    stopPlaybackRef.current = null;
    setPlaying(false);
  }, []);

  const save = useCallback(
    (name: string) => {
      const events: PerfEvent[] = recorder.events;
      if (!events.length) return null;
      const entry = {
        id: `${Date.now()}`,
        name,
        instrument,
        bpm,
        duration: recorder.duration,
        events,
        createdAt: new Date().toISOString(),
      };
      saveRecording(entry);
      return entry;
    },
    [bpm, instrument, recorder],
  );

  useEffect(() => () => stopPlaybackRef.current?.(), []);

  return {
    state,
    elapsed: state === "recording" ? elapsed : recorder.duration,
    eventCount: recorder.events.length,
    audioUrl: recorder.audioUrl,
    playing,
    start,
    stop,
    discard,
    play,
    pause,
    save,
  };
}
