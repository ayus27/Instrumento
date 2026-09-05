import { useCallback, useEffect, useRef, useState } from "react";
import { getEngine, type InstrumentId, type Voice } from "@/lib/audio/engine";
import { getRecorder } from "@/lib/audio/recorder";
import { getMidiEngine } from "@/lib/audio/midi-engine";

export type InstrumentStatus = "idle" | "loading" | "ready" | "error";

export function useInstrument(id: InstrumentId) {
  const [status, setStatus] = useState<InstrumentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string[]>([]);
  const voiceRef = useRef<Voice | null>(null);
  const heldRef = useRef(new Set<string>());
  const sustainedRef = useRef(new Set<string>());
  const sustainRef = useRef(false);

  const ensure = useCallback(async () => {
    if (voiceRef.current) return voiceRef.current;
    setStatus("loading");
    try {
      const voice = await getEngine().load(id);
      voiceRef.current = voice;
      setStatus("ready");
      setError(null);
      return voice;
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Audio couldn't be initialised.");
      return null;
    }
  }, [id]);

  useEffect(() => {
    voiceRef.current = null;
    heldRef.current.clear();
    sustainedRef.current.clear();
    setActive([]);
    setStatus("idle");
  }, [id]);

  const syncActive = useCallback(() => {
    setActive([...heldRef.current]);
  }, []);

  const noteOn = useCallback(
    (note: string, velocity = 0.85) => {
      if (heldRef.current.has(note)) return;
      heldRef.current.add(note);
      syncActive();
      const voice = voiceRef.current;
      if (!voice) {
        void ensure().then((v) => {
          if (v && heldRef.current.has(note)) v.attack(note, velocity);
        });
      } else {
        voice.attack(note, velocity);
      }
      getRecorder().capture({ instrument: id, action: "attack", target: note, velocity });
    },
    [ensure, id, syncActive],
  );

  const noteOff = useCallback(
    (note: string) => {
      if (!heldRef.current.delete(note)) return;
      syncActive();
      if (sustainRef.current) {
        sustainedRef.current.add(note);
      } else {
        voiceRef.current?.release(note);
      }
      getRecorder().capture({ instrument: id, action: "release", target: note, velocity: 0 });
    },
    [id, syncActive],
  );

  const hit = useCallback(
    (pad: string, velocity = 0.9) => {
      const voice = voiceRef.current;
      if (!voice) {
        void ensure().then((v) => v?.hit(pad, velocity));
      } else {
        voice.hit(pad, velocity);
      }
      getRecorder().capture({ instrument: id, action: "hit", target: pad, velocity });
    },
    [ensure, id],
  );

  const setSustain = useCallback((on: boolean) => {
    sustainRef.current = on;
    if (!on) {
      sustainedRef.current.forEach((note) => voiceRef.current?.release(note));
      sustainedRef.current.clear();
    }
  }, []);

  const panic = useCallback(() => {
    heldRef.current.clear();
    sustainedRef.current.clear();
    voiceRef.current?.releaseAll();
    syncActive();
  }, [syncActive]);

  useEffect(() => () => voiceRef.current?.releaseAll(), []);

  useEffect(() => {
    const midi = getMidiEngine();
    
    // MIDI note number to Note name approximation for Tone.js
    // Tone.Frequency(midiNote, "midi").toNote() handles this inside the engine
    // but our components use strings like "C4". We will pass the MIDI number 
    // and rely on Tone.js or our voice wrappers to handle it (Tone handles both).
    
    const cleanupOn = midi.onNoteOn((e) => {
      // Basic channel routing: if we are drums, listen to channel 10
      // In this simple app, we'll just listen to all for now.
      noteOn(e.note.toString(), e.velocity);
    });

    const cleanupOff = midi.onNoteOff((e) => {
      noteOff(e.note.toString());
    });

    const cleanupCC = midi.onCC((e) => {
      // CC 64 is sustain pedal
      if (e.controller === 64) {
        setSustain(e.value > 0.5);
      }
    });

    return () => {
      cleanupOn();
      cleanupOff();
      cleanupCC();
    };
  }, [noteOn, noteOff, setSustain]);

  return { status, error, active, ensure, noteOn, noteOff, hit, setSustain, panic };
}
