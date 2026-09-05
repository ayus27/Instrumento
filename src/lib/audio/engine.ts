import type * as ToneNS from "tone";
import { createInstrument, type InstrumentId, type Tone, type Voice } from "./instruments";

let tonePromise: Promise<Tone> | null = null;

export function loadTone(): Promise<Tone> {
  if (!tonePromise) tonePromise = import("tone");
  return tonePromise;
}

/**
 * One AudioContext / master chain per session.
 * Instrument input -> voice -> master gain -> speakers + recording destination.
 */
class AudioEngine {
  private tone: Tone | null = null;
  private master: ToneNS.Gain | null = null;
  private recorder: ToneNS.Recorder | null = null;
  private metroSynth: ToneNS.MembraneSynth | null = null;
  private voices = new Map<InstrumentId, Voice>();
  private volume = 0.8;

  get running(): boolean {
    return this.tone?.getContext().state === "running";
  }

  async start(): Promise<Tone> {
    const Tone = await loadTone();
    this.tone = Tone;
    await Tone.start();
    if (Tone.getContext().state !== "running") {
      await Tone.getContext().resume();
    }
    if (!this.master) {
      this.master = new Tone.Gain(this.volume).toDestination();
      this.recorder = new Tone.Recorder();
      this.master.connect(this.recorder);
      this.metroSynth = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.12, sustain: 0 },
      }).connect(this.master);
    }
    return Tone;
  }

  async load(id: InstrumentId): Promise<Voice> {
    const Tone = await this.start();
    const existing = this.voices.get(id);
    if (existing) return existing;
    const voice = createInstrument(Tone, id, this.master!);
    this.voices.set(id, voice);
    return voice;
  }

  get(id: InstrumentId): Voice | undefined {
    return this.voices.get(id);
  }

  setVolume(value: number) {
    this.volume = value;
    if (this.master) this.master.gain.rampTo(value, 0.03);
  }

  getVolume() {
    return this.volume;
  }

  clickAt(time: number, accent: boolean) {
    this.metroSynth?.triggerAttackRelease(accent ? "C6" : "G5", "64n", time, accent ? 1 : 0.6);
  }

  get transport() {
    return this.tone?.getTransport() ?? null;
  }

  setLooping(start: number, end: number) {
    if (!this.transport) return;
    this.transport.loopStart = start;
    this.transport.loopEnd = end;
    this.transport.loop = true;
  }

  clearLoop() {
    if (!this.transport) return;
    this.transport.loop = false;
  }

  getPosition(): number {
    return this.transport?.ticks ?? 0;
  }

  seekTo(position: number) {
    if (!this.transport) return;
    this.transport.ticks = position;
  }

  now(): number {
    return this.tone?.now() ?? 0;
  }

  async startAudioRecording() {
    await this.start();
    await this.recorder?.start();
  }

  async stopAudioRecording(): Promise<string | null> {
    if (!this.recorder || this.recorder.state !== "started") return null;
    const blob = await this.recorder.stop();
    return URL.createObjectURL(blob);
  }
}

let engine: AudioEngine | null = null;

export function getEngine(): AudioEngine {
  if (!engine) engine = new AudioEngine();
  return engine;
}

export type { InstrumentId, Voice };
