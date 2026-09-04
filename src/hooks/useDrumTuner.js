import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitch, medianFrequency } from "@/lib/audio/pitch";
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
      // Drum heads sit low; strip rumble and cymbal hiss before analysis.
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 40;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 700;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 8192;
      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      let raf = 0;
      const history = [];

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        const freq = detectPitch(buffer, ctx.sampleRate, {
          minFrequency: 40,
          maxFrequency: 500,
          threshold: 0.15,
        });
        const now = performance.now();
        if (freq) {
          history.push(freq);
          if (history.length > 5) history.shift();
          const smoothed = medianFrequency(history) ?? freq;
          lastHitRef.current = now;
          const midi = Math.round(frequencyToMidiFloat(smoothed));
          const target = targetRef.current || smoothed;
          setReading({
            frequency: smoothed,
            note: midiToName(midi),
            noteFrequency: midiToFrequency(midi),
            cents: centsOff(smoothed, target),
            at: now,
          });
        } else if (now - lastHitRef.current > 1500) {
          history.length = 0;
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
