import { useCallback, useEffect, useRef, useState } from "react";
import { controlButtonClass } from "@/components/instrument/ControlBar";

/**
 * rAF-driven auto-scroll for a scroll container ref.
 * Speed is kept in a ref so changing it never restarts the loop, and manual
 * user scrolling is respected (we scroll relative to the live scrollTop).
 */
export function AutoScrollControls({ containerRef }) {
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(3);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const accRef = useRef(0);

  const loop = useCallback(
    (time) => {
      const el = containerRef.current;
      if (!el) return;
      const dt = lastRef.current ? time - lastRef.current : 16;
      lastRef.current = time;
      // pixels per second scales with the speed setting
      accRef.current += (speedRef.current * 14 * dt) / 1000;
      const whole = Math.floor(accRef.current);
      if (whole > 0) {
        accRef.current -= whole;
        el.scrollTop += whole;
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [containerRef],
  );

  const start = useCallback(() => {
    if (rafRef.current) return;
    lastRef.current = 0;
    accRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
    setRunning(true);
  }, [loop]);

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    setRunning(false);
  }, []);

  const stop = useCallback(() => {
    pause();
    const el = containerRef.current;
    if (el) el.scrollTop = 0;
  }, [containerRef, pause]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label-mono">Auto-scroll</span>
      <button
        type="button"
        className={`${controlButtonClass} ${running ? "bg-signal text-primary-foreground" : ""}`}
        onClick={() => (running ? pause() : start())}
      >
        {running ? "⏸ Pause" : "▶ Start"}
      </button>
      <button type="button" className={controlButtonClass} onClick={stop}>
        ■ Stop
      </button>
      <button
        type="button"
        aria-label="Decrease scroll speed"
        className={controlButtonClass}
        onClick={() => setSpeed((s) => Math.max(1, s - 1))}
      >
        Speed −
      </button>
      <span className="w-8 text-center font-mono text-xs text-signal">{speed}</span>
      <button
        type="button"
        aria-label="Increase scroll speed"
        className={controlButtonClass}
        onClick={() => setSpeed((s) => Math.min(10, s + 1))}
      >
        Speed +
      </button>
    </div>
  );
}
