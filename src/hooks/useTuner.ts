import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch, medianFrequency } from "@/lib/audio/pitch";
import { centsOff, midiToFrequency, nameToMidi } from "@/lib/audio/notes";

export type TunerReading = {
  frequency: number;
  targetNote: string;
  targetFrequency: number;
  cents: number;
  at: number;
};

export type TunerStatus = "idle" | "starting" | "listening" | "denied" | "error";

type Options = {
  /** When set, always compare against this string instead of auto-detecting. */
  lockedNote?: string | null;
};

const HISTORY = 6;
const SIGNAL_TIMEOUT_MS = 900;

export function useTuner(strings: string[], options: Options = {}) {
  const [status, setStatus] = useState<TunerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<TunerReading | null>(null);
  const cleanupRef = useRef<null | (() => void)>(null);
  const stringsRef = useRef(strings);
  stringsRef.current = strings;
  const lockedRef = useRef(options.lockedNote ?? null);
  lockedRef.current = options.lockedNote ?? null;

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setStatus("idle");
    setReading(null);
  }, []);

  const start = useCallback(async () => {
    if (cleanupRef.current) return;
    setStatus("starting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const ctx = new AudioContext();
      await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);

      // Trim rumble and hiss so autocorrelation locks onto the fundamental.
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 60;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 2000;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 8192;
      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      const history: number[] = [];
      let raf = 0;
      let lastHit = 0;

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        const freq = detectPitch(buffer, ctx.sampleRate, {
          minFrequency: 60,
          maxFrequency: 1200,
        });

        if (freq) {
          // Drop obvious octave jumps against the recent median.
          const previous = medianFrequency(history);
          let candidate = freq;
          if (previous) {
            const ratio = candidate / previous;
            if (ratio > 1.8 && ratio < 2.2) candidate = candidate / 2;
            else if (ratio < 0.55 && ratio > 0.45) candidate = candidate * 2;
          }
          history.push(candidate);
          if (history.length > HISTORY) history.shift();

          const smoothed = medianFrequency(history);
          if (smoothed) {
            let best = lockedRef.current ?? stringsRef.current[0] ?? "E2";
            if (!lockedRef.current) {
              let bestDelta = Infinity;
              for (const note of stringsRef.current) {
                const delta = Math.abs(centsOff(smoothed, midiToFrequency(nameToMidi(note))));
                if (delta < bestDelta) {
                  bestDelta = delta;
                  best = note;
                }
              }
            }
            const targetFrequency = midiToFrequency(nameToMidi(best));
            lastHit = performance.now();
            setReading({
              frequency: smoothed,
              targetNote: best,
              targetFrequency,
              cents: centsOff(smoothed, targetFrequency),
              at: lastHit,
            });
          }
        } else if (lastHit && performance.now() - lastHit > SIGNAL_TIMEOUT_MS) {
          history.length = 0;
          lastHit = 0;
          setReading(null);
        }

        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      setStatus("listening");

      cleanupRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
      };
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
        setError("Microphone permission was denied. Allow mic access, then try again.");
      } else {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Could not access the microphone.");
      }
    }
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return { status, error, reading, start, stop };
}
