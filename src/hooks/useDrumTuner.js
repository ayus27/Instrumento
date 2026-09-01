import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch } from "@/lib/audio/pitch";
import { centsOff, frequencyToMidiFloat, midiToFrequency, midiToName } from "@/lib/audio/notes";

/**
 * Microphone drum tuner: analyses live audio, reports the detected fundamental,
 * nearest note and deviation in cents from a user-set target frequency.
 * Status: idle | starting | listening | denied | unsupported | error
 */
export function useDrumTuner(targetFrequency) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);
  const cleanupRef = useRef(null);
  const targetRef = useRef(targetFrequency);
  targetRef.current = targetFrequency;
  const lastHitRef = useRef(0);

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setStatus("idle");
    setReading(null);
  }, []);

  const start = useCallback(async () => {
    if (cleanupRef.current) return;
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof window === "undefined" ||
      !(window.AudioContext || window.webkitAudioContext)
    ) {
      setStatus("unsupported");
      setError("This browser can't capture or analyse microphone audio.");
      return;
    }
    setStatus("starting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 8192;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      let raf = 0;

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        const freq = detectPitch(buffer, ctx.sampleRate);
        const now = performance.now();
        if (freq) {
          lastHitRef.current = now;
          const midi = Math.round(frequencyToMidiFloat(freq));
          const target = targetRef.current || freq;
          setReading({
            frequency: freq,
            note: midiToName(midi),
            noteFrequency: midiToFrequency(midi),
            cents: centsOff(freq, target),
            at: now,
          });
        } else if (now - lastHitRef.current > 1500) {
          setReading(null);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      setStatus("listening");

      cleanupRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        try {
          source.disconnect();
        } catch {
          /* ignore */
        }
        void ctx.close();
      };
    } catch (e) {
      const name = e && e.name ? e.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
        setError("Microphone access was blocked. Enable mic permission for this site, then retry.");
      } else if (name === "NotFoundError") {
        setStatus("error");
        setError("No microphone was found on this device.");
      } else {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Could not access the microphone.");
      }
    }
  }, []);

  // Always release the mic when the page unmounts.
  useEffect(
    () => () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    },
    [],
  );

  return { status, error, reading, start, stop };
}
