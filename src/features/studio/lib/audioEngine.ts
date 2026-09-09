import * as Tone from "tone";
import { createInstrument, type Voice } from "@/lib/audio/instruments";
import type { InstrumentId } from "@/lib/audio/engine";

export class StudioAudioEngine {
  private static instance: StudioAudioEngine;
  private readonly masterBus: Tone.Gain;
  private readonly limiter: Tone.Limiter;
  
  // Track routing: trackId -> GainNode
  private readonly trackBuses = new Map<string, Tone.Gain>();
  private readonly trackPanners = new Map<string, Tone.PanVol>();
  
  // Track instruments: trackId -> Voice
  private readonly trackInstruments = new Map<string, Voice>();

  private constructor() {
    this.masterBus = new Tone.Gain(0.8);
    this.limiter = new Tone.Limiter(-0.1);
    this.masterBus.connect(this.limiter);
    this.limiter.toDestination();
  }

  public static getInstance(): StudioAudioEngine {
    if (!StudioAudioEngine.instance) {
      StudioAudioEngine.instance = new StudioAudioEngine();
    }
    return StudioAudioEngine.instance;
  }

  public async ensure(): Promise<void> {
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
  }

  // --- Track Management ---

  public createTrack(trackId: string, instrumentId?: InstrumentId) {
    if (this.trackBuses.has(trackId)) return;

    const panVol = new Tone.PanVol(0, 0);
    const gain = new Tone.Gain(1);
    
    // Routing: Track Gain -> Track PanVol -> Master Bus
    gain.connect(panVol);
    panVol.connect(this.masterBus);

    this.trackBuses.set(trackId, gain);
    this.trackPanners.set(trackId, panVol);

    if (instrumentId) {
      this.setTrackInstrument(trackId, instrumentId);
    }
  }

  public removeTrack(trackId: string) {
    const inst = this.trackInstruments.get(trackId);
    if (inst) {
      inst.dispose();
      this.trackInstruments.delete(trackId);
    }

    const gain = this.trackBuses.get(trackId);
    if (gain) {
      gain.disconnect();
      gain.dispose();
      this.trackBuses.delete(trackId);
    }
    
    const panner = this.trackPanners.get(trackId);
    if (panner) {
      panner.disconnect();
      panner.dispose();
      this.trackPanners.delete(trackId);
    }
  }

  public async setTrackInstrument(trackId: string, instrumentId: InstrumentId) {
    const existing = this.trackInstruments.get(trackId);
    if (existing) {
      existing.dispose();
    }

    const dest = this.trackBuses.get(trackId);
    if (!dest) return;

    const voice = createInstrument(instrumentId, dest);
    this.trackInstruments.set(trackId, voice);
    await voice.load();
  }

  public getTrackInstrument(trackId: string): Voice | undefined {
    return this.trackInstruments.get(trackId);
  }

  // --- Mixing ---

  public setTrackVolume(trackId: string, db: number) {
    const panner = this.trackPanners.get(trackId);
    if (panner) {
      panner.volume.value = db; // Tone.PanVol volume is in decibels
    }
  }

  public setTrackPan(trackId: string, pan: number) {
    const panner = this.trackPanners.get(trackId);
    if (panner) {
      panner.pan.value = pan; // -1 to 1
    }
  }

  public setTrackMute(trackId: string, mute: boolean) {
    const panner = this.trackPanners.get(trackId);
    if (panner) {
      panner.mute = mute;
    }
  }

  public setMasterVolume(value: number) {
    // Convert 0-1 linear to decibels, roughly
    // Or just use linear gain if we keep the 0-1 range.
    // The original engine used linear gain:
    this.masterBus.gain.value = value;
  }

  public async clickAt(time: number) {
    // We can reuse a simple synth for the metronome click
    const clickSynth = new Tone.MembraneSynth().connect(this.masterBus);
    clickSynth.triggerAttackRelease("C3", "32n", time);
    // Note: in a real implementation we'd want to reuse a single synth
    // but we can optimize this later.
  }
}

export const getStudioEngine = () => StudioAudioEngine.getInstance();
