import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch } from "@/lib/audio/pitch";
import { centsOff, midiToFrequency, nameToMidi } from "@/lib/audio/notes";

export type TunerReading = {
  frequency: number;
  targetNote: string;
  targetFrequency: number;
  cents: number;
};

export type TunerStatus = "idle" | "starting" | "listening" | "denied" | "error";

export function useTuner(strings: string[]) {
  const [status, setStatus] = useState<TunerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<TunerReading | null>(null);
  const cleanupRef = useRef<null | (() => void)>(null);
  const stringsRef = useRef(strings);
  stringsRef.current = strings;

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
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      let raf = 0;

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        const freq = detectPitch(buffer, ctx.sampleRate);
        if (freq) {
          let best = stringsRef.current[0] ?? "E2";
          let bestDelta = Infinity;
          for (const note of stringsRef.current) {
            const delta = Math.abs(centsOff(freq, midiToFrequency(nameToMidi(note))));
            if (delta < bestDelta) {
              bestDelta = delta;
              best = note;
            }
          }
          const targetFrequency = midiToFrequency(nameToMidi(best));
          setReading({
            frequency: freq,
            targetNote: best,
            targetFrequency,
            cents: centsOff(freq, targetFrequency),
          });
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
