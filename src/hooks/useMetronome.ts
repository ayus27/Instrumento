import { useCallback, useEffect, useRef, useState } from "react";
import { getEngine, loadTone } from "@/lib/audio/engine";

export function useMetronome(initialBpm = 100) {
  const [bpm, setBpmState] = useState(initialBpm);
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(-1);
  const idRef = useRef<number | null>(null);

  const setBpm = useCallback((value: number) => {
    setBpmState(value);
    const transport = getEngine().transport;
    if (transport) transport.bpm.value = value;
  }, []);

  const stop = useCallback(() => {
    const transport = getEngine().transport;
    if (transport && idRef.current !== null) transport.clear(idRef.current);
    idRef.current = null;
    transport?.stop();
    setRunning(false);
    setBeat(-1);
  }, []);

  const start = useCallback(async () => {
    const engine = getEngine();
    await engine.start();
    const Tone = await loadTone();
    const transport = engine.transport;
    if (!transport) return;
    transport.bpm.value = bpm;
    let count = 0;
    if (idRef.current !== null) transport.clear(idRef.current);
    idRef.current = transport.scheduleRepeat((time) => {
      const index = count % 4;
      count += 1;
      engine.clickAt(time, index === 0);
      Tone.getDraw().schedule(() => setBeat(index), time);
    }, "4n");
    transport.start();
    setRunning(true);
  }, [bpm]);

  const toggle = useCallback(() => {
    if (running) stop();
    else void start();
  }, [running, start, stop]);

  useEffect(() => () => stop(), [stop]);

  return { bpm, setBpm, running, beat, toggle, start, stop };
}
