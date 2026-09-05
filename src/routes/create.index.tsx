import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Square,
  Circle,
  Mic,
  Upload,
  Piano as PianoIcon,
  Drum,
  Grid3x3,
  Trash2,
  Volume2,
} from "lucide-react";
import { PianoKeyboard } from "@/components/instrument/PianoKeyboard";
import { DrumKit, DRUM_PADS } from "@/components/instrument/DrumKit";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { getEngine, type InstrumentId, type Voice } from "@/lib/audio/engine";
import { getMicRecorder } from "@/lib/audio/mic-recorder";
import { midiToName } from "@/lib/audio/notes";
import { PIANO_KEY_OFFSETS } from "@/lib/audio/pianoKeys";

export const Route = createFileRoute("/create/")({
  head: () => ({
    meta: [
      { title: "Studio — Instrumento" },
      {
        name: "description",
        content:
          "Multi-track browser studio: record piano and drums, build grooves, capture your microphone and import audio files.",
      },
      { property: "og:title", content: "Studio — Instrumento" },
      {
        property: "og:description",
        content: "Record instruments, add grooves, import audio and mix it all in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

type Kind = "instrument" | "groove" | "audio";

type NoteEvent = { t: number; action: "attack" | "release" | "hit"; target: string; velocity: number };

type Track = {
  id: string;
  name: string;
  kind: Kind;
  instrumentId: InstrumentId;
  events: NoteEvent[];
  pattern: Record<string, number[]>;
  audioUrl?: string;
  volume: number;
  mute: boolean;
  solo: boolean;
};

const GROOVE_LANES = ["kick", "snare", "hihat", "openhat", "tom", "crash"];

const emptyPattern = () => {
  const p: Record<string, number[]> = {};
  GROOVE_LANES.forEach((l) => (p[l] = Array(16).fill(0)));
  return p;
};

const basicPattern = () => {
  const p = emptyPattern();
  p.kick = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
  p.snare = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
  p.hihat = Array(16).fill(1);
  return p;
};

const uid = () => Math.random().toString(36).slice(2, 9);

function newTrack(kind: Kind, name: string, instrumentId: InstrumentId = "piano-grand"): Track {
  return {
    id: uid(),
    name,
    kind,
    instrumentId,
    events: [],
    pattern: kind === "groove" ? basicPattern() : emptyPattern(),
    volume: 0.85,
    mute: false,
    solo: false,
  };
}

function StudioPage() {
  const [projectName, setProjectName] = useState("New Project");
  const [bpm, setBpm] = useState(110);
  const [tracks, setTracks] = useState<Track[]>([
    newTrack("instrument", "Piano", "piano-grand"),
    newTrack("groove", "Drum Machine", "drums"),
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micState, setMicState] = useState<string>("idle");
  const [step, setStep] = useState(-1);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [hitPads, setHitPads] = useState<string[]>([]);
  const [octave, setOctave] = useState(4);

  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const voicesRef = useRef(new Map<string, Voice>());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const audioElsRef = useRef(new Map<string, HTMLAudioElement>());
  const recRef = useRef<{ trackId: string; startedAt: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = tracks.find((t) => t.id === selectedId) ?? null;
  const startMidi = (octave + 1) * 12;

  const keyLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    Object.entries(PIANO_KEY_OFFSETS).forEach(([key, offset]) => {
      labels[midiToName(startMidi + offset)] = key.toUpperCase();
    });
    return labels;
  }, [startMidi]);

  const getVoice = useCallback(async (id: InstrumentId) => {
    const cached = voicesRef.current.get(id);
    if (cached) return cached;
    const voice = await getEngine().load(id);
    voicesRef.current.set(id, voice);
    return voice;
  }, []);

  const capture = useCallback((event: Omit<NoteEvent, "t">) => {
    const rec = recRef.current;
    if (!rec) return;
    const t = performance.now() - rec.startedAt;
    setTracks((prev) =>
      prev.map((tr) => (tr.id === rec.trackId ? { ...tr, events: [...tr.events, { ...event, t }] } : tr)),
    );
  }, []);

  /* ---------------- live playing ---------------- */

  const liveNoteOn = useCallback(
    async (note: string) => {
      if (!selected || selected.kind !== "instrument") return;
      setActiveNotes((n) => (n.includes(note) ? n : [...n, note]));
      const voice = await getVoice(selected.instrumentId);
      voice.attack(note, 0.85);
      capture({ action: "attack", target: note, velocity: 0.85 });
    },
    [capture, getVoice, selected],
  );

  const liveNoteOff = useCallback(
    async (note: string) => {
      if (!selected || selected.kind !== "instrument") return;
      setActiveNotes((n) => n.filter((x) => x !== note));
      const voice = await getVoice(selected.instrumentId);
      voice.release(note);
      capture({ action: "release", target: note, velocity: 0 });
    },
    [capture, getVoice, selected],
  );

  const liveHit = useCallback(
    async (pad: string) => {
      setHitPads((p) => [...p, pad]);
      setTimeout(() => setHitPads((p) => p.filter((x, i) => !(x === pad && i === p.indexOf(pad)))), 120);
      const voice = await getVoice("drums");
      voice.hit(pad, 0.9);
      capture({ action: "hit", target: pad, velocity: 0.9 });
    },
    [capture, getVoice],
  );

  useKeyboardInput({
    enabled: !!selected && selected.kind === "instrument",
    onDown: (key) => {
      if (!selected || selected.kind !== "instrument") return;
      if (selected.instrumentId === "drums") {
        const pad = DRUM_PADS.find((p) => p.key === key);
        if (pad) void liveHit(pad.id);
        return;
      }
      if (key === "arrowleft") return setOctave((o) => Math.max(1, o - 1));
      if (key === "arrowright") return setOctave((o) => Math.min(6, o + 1));
      const offset = PIANO_KEY_OFFSETS[key];
      if (offset === undefined) return;
      void liveNoteOn(midiToName(startMidi + offset));
    },
    onUp: (key) => {
      if (!selected || selected.kind !== "instrument" || selected.instrumentId === "drums") return;
      if (key === "__blur__") {
        setActiveNotes([]);
        voicesRef.current.get(selected.instrumentId)?.releaseAll();
        return;
      }
      const offset = PIANO_KEY_OFFSETS[key];
      if (offset === undefined) return;
      void liveNoteOff(midiToName(startMidi + offset));
    },
  });

  /* ---------------- transport ---------------- */

  const stopAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
    audioElsRef.current.forEach((el) => {
      el.pause();
      el.currentTime = 0;
    });
    voicesRef.current.forEach((v) => v.releaseAll());
    recRef.current = null;
    setIsPlaying(false);
    setIsRecording(false);
    setStep(-1);
  }, []);

  const startTransport = useCallback(
    async (recordTrackId?: string) => {
      await getEngine().start();
      stopAll();
      const list = tracksRef.current;
      const soloed = list.some((t) => t.solo);
      const audible = list.filter((t) => !t.mute && (!soloed || t.solo));
      const stepMs = ((60 / bpm) * 1000) / 4;

      for (const track of audible) {
        if (track.kind === "instrument" && track.events.length && track.id !== recordTrackId) {
          const voice = await getVoice(track.instrumentId);
          track.events.forEach((e) => {
            timersRef.current.push(
              setTimeout(() => {
                if (e.action === "attack") voice.attack(e.target, e.velocity * track.volume);
                else if (e.action === "release") voice.release(e.target);
                else voice.hit(e.target, e.velocity * track.volume);
              }, e.t),
            );
          });
        }
        if (track.kind === "groove") {
          const drums = await getVoice("drums");
          let s = 0;
          const id = setInterval(() => {
            setStep(s);
            GROOVE_LANES.forEach((lane) => {
              if (track.pattern[lane]?.[s]) drums.hit(lane, 0.9 * track.volume);
            });
            s = (s + 1) % 16;
          }, stepMs);
          intervalsRef.current.push(id);
        }
        if (track.kind === "audio" && track.audioUrl) {
          const el = audioElsRef.current.get(track.id);
          if (el) {
            el.volume = track.volume;
            el.currentTime = 0;
            void el.play();
          }
        }
      }

      if (recordTrackId) {
        recRef.current = { trackId: recordTrackId, startedAt: performance.now() };
        setTracks((prev) => prev.map((t) => (t.id === recordTrackId ? { ...t, events: [] } : t)));
        setIsRecording(true);
      }
      setIsPlaying(true);
    },
    [bpm, getVoice, stopAll],
  );

  useEffect(() => stopAll, [stopAll]);

  /* ---------------- track sources ---------------- */

  const importFiles = (files: FileList | null) => {
    if (!files) return;
    const added: Track[] = [];
    Array.from(files).forEach((file) => {
      const track = newTrack("audio", file.name.replace(/\.[^.]+$/, ""));
      track.audioUrl = URL.createObjectURL(file);
      added.push(track);
    });
    if (added.length) {
      setTracks((prev) => [...prev, ...added]);
      setSelectedId(added[0]!.id);
    }
  };

  const recordMic = async () => {
    const mic = getMicRecorder();
    if (micState === "recording") {
      const blob = await mic.stop();
      setMicState("ready");
      if (blob) {
        const track = newTrack("audio", `Mic take ${tracks.filter((t) => t.kind === "audio").length + 1}`);
        track.audioUrl = URL.createObjectURL(blob);
        setTracks((prev) => [...prev, track]);
        setSelectedId(track.id);
      }
      return;
    }
    if (mic.state !== "ready") {
      const ok = await mic.requestMic();
      if (!ok) {
        setMicState("error");
        return;
      }
    }
    if (mic.start()) setMicState("recording");
  };

  const update = (id: string, patch: Partial<Track>) =>
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const toggleStepCell = (lane: string, index: number) => {
    if (!selected || selected.kind !== "groove") return;
    const next = { ...selected.pattern, [lane]: [...(selected.pattern[lane] ?? Array(16).fill(0))] };
    next[lane]![index] = next[lane]![index] ? 0 : 1;
    update(selected.id, { pattern: next });
    void getVoice("drums").then((v) => v.hit(lane, 0.9));
  };

  const trackLength = (t: Track) =>
    t.kind === "groove" ? 16 : t.events.length ? Math.min(64, Math.ceil(Math.max(...t.events.map((e) => e.t)) / 250)) : t.kind === "audio" ? 24 : 0;

  /* ---------------- render ---------------- */

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4 hairline pb-4">
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent font-display text-2xl focus:outline-none focus:ring-1 focus:ring-signal rounded px-1"
        />

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 panel px-3 py-1.5">
            <span className="label-mono">BPM</span>
            <input
              type="number"
              min={40}
              max={220}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value) || 110)}
              className="w-14 bg-transparent text-center font-mono text-sm focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-1 panel p-1">
            <button
              type="button"
              aria-label={isPlaying ? "Stop" : "Play"}
              className="rounded p-2 hover:bg-accent"
              onClick={() => (isPlaying ? stopAll() : void startTransport())}
            >
              {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Record selected instrument track"
              disabled={!selected || selected.kind !== "instrument"}
              className={`rounded p-2 disabled:opacity-40 ${isRecording ? "bg-destructive/15 text-destructive" : "hover:bg-accent"}`}
              onClick={() => (isRecording ? stopAll() : selected && void startTransport(selected.id))}
            >
              <Circle className={`h-4 w-4 ${isRecording ? "fill-destructive" : ""}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => void recordMic()}
            className={`flex items-center gap-2 panel px-3 py-2 text-xs hover:bg-accent ${micState === "recording" ? "text-destructive" : ""}`}
          >
            <Mic className="h-3.5 w-3.5" />
            {micState === "recording" ? "Stop mic" : "Record mic"}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 panel px-3 py-2 text-xs hover:bg-accent"
          >
            <Upload className="h-3.5 w-3.5" /> Import audio
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => {
              importFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </header>

      {micState === "error" && (
        <p className="text-sm text-destructive">Microphone access was denied. Allow it in your browser to record.</p>
      )}

      {/* Add track row */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="flex items-center gap-2 panel px-3 py-2 text-xs hover:bg-accent"
          onClick={() => {
            const t = newTrack("instrument", "Piano", "piano-grand");
            setTracks((p) => [...p, t]);
            setSelectedId(t.id);
          }}
        >
          <PianoIcon className="h-3.5 w-3.5" /> Add piano track
        </button>
        <button
          type="button"
          className="flex items-center gap-2 panel px-3 py-2 text-xs hover:bg-accent"
          onClick={() => {
            const t = newTrack("instrument", "Live Drums", "drums");
            setTracks((p) => [...p, t]);
            setSelectedId(t.id);
          }}
        >
          <Drum className="h-3.5 w-3.5" /> Add drum track
        </button>
        <button
          type="button"
          className="flex items-center gap-2 panel px-3 py-2 text-xs hover:bg-accent"
          onClick={() => {
            const t = newTrack("groove", "Groove", "drums");
            setTracks((p) => [...p, t]);
            setSelectedId(t.id);
          }}
        >
          <Grid3x3 className="h-3.5 w-3.5" /> Add groove
        </button>
      </div>

      {/* Tracks */}
      <div className="panel divide-y divide-panel-edge">
        {tracks.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Add a track to start: record piano or drums, build a groove, import a file or capture your mic.
          </p>
        )}
        {tracks.map((track) => (
          <div
            key={track.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedId(track.id)}
            onKeyDown={(e) => e.key === "Enter" && setSelectedId(track.id)}
            className={`flex flex-col gap-3 p-3 sm:flex-row sm:items-center ${selectedId === track.id ? "bg-accent/40" : ""}`}
          >
            <div className="flex w-full items-center gap-2 sm:w-64">
              <input
                value={track.name}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => update(track.id, { name: e.target.value })}
                className="min-w-0 flex-1 bg-transparent font-mono text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  update(track.id, { mute: !track.mute });
                }}
                className={`px-2 py-1 text-[10px] font-bold ${track.mute ? "text-destructive" : "text-muted-foreground"}`}
              >
                M
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  update(track.id, { solo: !track.solo });
                }}
                className={`px-2 py-1 text-[10px] font-bold ${track.solo ? "text-signal" : "text-muted-foreground"}`}
              >
                S
              </button>
              <button
                type="button"
                aria-label={`Delete ${track.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTrack(track.id);
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <label className="flex items-center gap-2 sm:w-40" onClick={(e) => e.stopPropagation()}>
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={track.volume}
                onChange={(e) => update(track.id, { volume: Number(e.target.value) })}
                className="w-full"
                style={{ accentColor: "var(--signal)" }}
              />
            </label>

            <div className="flex-1 overflow-hidden">
              {track.kind === "audio" && track.audioUrl ? (
                <audio
                  ref={(el) => {
                    if (el) audioElsRef.current.set(track.id, el);
                    else audioElsRef.current.delete(track.id);
                  }}
                  src={track.audioUrl}
                  controls
                  className="h-8 w-full"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="h-8 w-full rounded-sm bg-panel-edge/40">
                  <div
                    className="h-full rounded-sm bg-signal/50"
                    style={{ width: `${Math.min(100, trackLength(track) * 4)}%` }}
                  />
                </div>
              )}
            </div>

            <span className="label-mono w-24 shrink-0 text-right text-muted-foreground">
              {track.kind === "groove"
                ? "groove"
                : track.kind === "audio"
                  ? "audio"
                  : `${track.events.filter((e) => e.action !== "release").length} notes`}
            </span>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="panel p-4">
        {!selected && <p className="text-sm text-muted-foreground">Select a track to play, record or edit it.</p>}

        {selected?.kind === "instrument" && selected.instrumentId !== "drums" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="label-mono">
                {selected.name} · play with your mouse or keyboard (A–; keys, ←/→ octave)
              </p>
              <span className="label-mono">Octave {octave}</span>
            </div>
            <PianoKeyboard
              startMidi={startMidi}
              keyCount={17}
              active={activeNotes}
              keyLabels={keyLabels}
              onNoteOn={(n) => void liveNoteOn(n)}
              onNoteOff={(n) => void liveNoteOff(n)}
            />
          </div>
        )}

        {selected?.kind === "instrument" && selected.instrumentId === "drums" && (
          <div className="space-y-3">
            <p className="label-mono">{selected.name} · hit the pads or use A S D F G H J</p>
            <DrumKit hitPads={hitPads} onHit={(pad) => void liveHit(pad)} />
          </div>
        )}

        {selected?.kind === "groove" && (
          <div className="space-y-3 overflow-x-auto">
            <p className="label-mono">{selected.name} · 16-step pattern (loops while playing)</p>
            <div className="min-w-[640px] space-y-2">
              {GROOVE_LANES.map((lane) => (
                <div key={lane} className="flex items-center gap-3">
                  <span className="label-mono w-20 shrink-0 capitalize">{lane}</span>
                  <div className="grid flex-1 gap-1.5" style={{ gridTemplateColumns: "repeat(16, minmax(0,1fr))" }}>
                    {(selected.pattern[lane] ?? Array(16).fill(0)).map((on, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${lane} step ${i + 1}`}
                        onClick={() => toggleStepCell(lane, i)}
                        className={`h-8 rounded-sm border ${on ? "bg-signal border-signal" : "bg-panel border-panel-edge hover:bg-accent"} ${step === i ? "ring-2 ring-foreground" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selected?.kind === "audio" && (
          <p className="text-sm text-muted-foreground">
            Audio clip “{selected.name}”. It plays in sync when you press play; use mute, solo and volume to mix it.
          </p>
        )}
      </div>
    </div>
  );
}
