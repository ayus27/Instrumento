import * as Tone from "tone";
import { getStudioEngine } from "./audioEngine";
import { PPQ, snapTicks } from "./timelineMath";

export class TransportEngine {
  private static instance: TransportEngine;
  private clickSynth: Tone.MembraneSynth | null = null;
  private metronomeEventId: number | null = null;

  private constructor() {
    Tone.Transport.PPQ = PPQ;
  }

  public static getInstance(): TransportEngine {
    if (!TransportEngine.instance) {
      TransportEngine.instance = new TransportEngine();
    }
    return TransportEngine.instance;
  }

  public async play() {
    await getStudioEngine().ensure();
    Tone.Transport.start();
  }

  public pause() {
    Tone.Transport.pause();
  }

  public stop() {
    Tone.Transport.stop();
  }

  public get state() {
    return Tone.Transport.state;
  }

  public get ticks() {
    return Tone.Transport.ticks;
  }

  public set ticks(t: number) {
    Tone.Transport.ticks = t;
  }

  public get bpm() {
    return Tone.Transport.bpm.value;
  }

  public set bpm(v: number) {
    Tone.Transport.bpm.value = v;
  }

  public setLoop(startTicks: number, endTicks: number, enabled: boolean) {
    Tone.Transport.loop = enabled;
    Tone.Transport.loopStart = startTicks + "i";
    Tone.Transport.loopEnd = endTicks + "i";
  }

  public toggleMetronome(enabled: boolean) {
    if (enabled) {
      if (!this.clickSynth) {
        this.clickSynth = new Tone.MembraneSynth().toDestination();
        // Route to master bus in real app
      }
      if (this.metronomeEventId === null) {
        this.metronomeEventId = Tone.Transport.scheduleRepeat((time) => {
          this.clickSynth?.triggerAttackRelease("C3", "32n", time);
        }, "4n");
      }
    } else {
      if (this.metronomeEventId !== null) {
        Tone.Transport.clear(this.metronomeEventId);
        this.metronomeEventId = null;
      }
    }
  }
}

export const getTransport = () => TransportEngine.getInstance();
