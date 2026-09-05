import type * as ToneNS from "tone";

export type Tone = typeof ToneNS;

export type Voice = {
  attack(note: string, velocity: number): void;
  release(note: string): void;
  releaseAll(): void;
  hit(name: string, velocity: number): void;
  dispose(): void;
};

export type InstrumentId =
  | "piano-grand"
  | "piano-soft"
  | "piano-electric"
  | "guitar-acoustic"
  | "guitar-electric"
  | "ukulele"
  | "drums";

const noop = () => {};

function polyVoice(poly: ToneNS.PolySynth, extra: ToneNS.ToneAudioNode[]): Voice {
  return {
    attack: (note, velocity) => poly.triggerAttack(note, undefined, velocity),
    release: (note) => poly.triggerRelease(note),
    releaseAll: () => poly.releaseAll(),
    hit: noop,
    dispose: () => {
      poly.dispose();
      extra.forEach((n) => n.dispose());
    },
  };
}

/** Karplus-Strong plucked string pool — PluckSynth is not PolySynth-compatible. */
function pluckVoice(
  Tone: Tone,
  destination: ToneNS.ToneAudioNode,
  opts: { attackNoise: number; dampening: number; resonance: number },
  chain: ToneNS.ToneAudioNode[],
): Voice {
  const size = 10;
  const head = chain[0] ?? destination;
  const pool: ToneNS.PluckSynth[] = [];
  for (let i = 0; i < size; i++) {
    pool.push(new Tone.PluckSynth(opts).connect(head));
  }
  let cursor = 0;
  return {
    attack: (note, velocity) => {
      const synth = pool[cursor % size];
      cursor += 1;
      if (!synth) return;
      synth.volume.value = Math.log10(Math.max(velocity, 0.05)) * 20;
      synth.triggerAttack(note);
    },
    release: noop,
    releaseAll: noop,
    hit: noop,
    dispose: () => {
      pool.forEach((s) => s.dispose());
      chain.forEach((n) => n.dispose());
    },
  };
}

export function createInstrument(
  Tone: Tone,
  id: InstrumentId,
  destination: ToneNS.ToneAudioNode,
): Voice {
  switch (id) {
    case "piano-grand": {
      const eq = new Tone.EQ3({ low: 2, mid: -1, high: 2 }).connect(destination);
      const reverb = new Tone.Reverb({ decay: 2.8, wet: 0.2 }).connect(eq);
      const poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.005, decay: 1.8, sustain: 0.22, release: 1.4 },
      }).connect(reverb);
      poly.maxPolyphony = 32;
      return polyVoice(poly, [reverb, eq]);
    }
    case "piano-soft": {
      const eq = new Tone.EQ3({ low: 3, mid: 0, high: -3 }).connect(destination);
      const reverb = new Tone.Reverb({ decay: 3.6, wet: 0.35 }).connect(eq);
      const poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.08, decay: 2.5, sustain: 0.3, release: 2.0 },
      }).connect(reverb);
      poly.maxPolyphony = 32;
      return polyVoice(poly, [reverb, eq]);
    }
    case "piano-electric": {
      const eq = new Tone.EQ3({ low: 2, mid: 1, high: 4 }).connect(destination);
      const chorus = new Tone.Chorus({ frequency: 1.5, depth: 0.6, wet: 0.4 })
        .connect(eq)
        .start();
      const poly = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.01,
        modulationIndex: 12,
        envelope: { attack: 0.005, decay: 1.4, sustain: 0.18, release: 1.2 },
        modulationEnvelope: { attack: 0.02, decay: 0.5, sustain: 0.08, release: 0.6 },
      }).connect(chorus);
      poly.maxPolyphony = 32;
      return polyVoice(poly, [chorus, eq]);
    }
    case "guitar-acoustic": {
      const eq = new Tone.EQ3({ low: 2, mid: 0, high: 2 }).connect(destination);
      const body = new Tone.Filter({ type: "lowpass", frequency: 3200, Q: 1.5 }).connect(eq);
      const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.18 }).connect(body);
      
      // Increased pool size and tuned for better string resonance
      return pluckVoice(
        Tone,
        destination,
        { attackNoise: 1.2, dampening: 4200, resonance: 0.98 },
        [reverb, body, eq],
      );
    }
    case "guitar-electric": {
      const eq = new Tone.EQ3({ low: 4, mid: -2, high: 1 }).connect(destination);
      // Amp sim style
      const dist = new Tone.Distortion(0.55).connect(eq);
      const filter = new Tone.Filter({ type: "lowpass", frequency: 2800 }).connect(dist);
      const chorus = new Tone.Chorus({ frequency: 1.5, depth: 0.3, wet: 0.2 }).connect(filter);
      
      return pluckVoice(
        Tone,
        destination,
        { attackNoise: 0.8, dampening: 2800, resonance: 0.99 },
        [chorus, filter, dist, eq],
      );
    }
    case "ukulele": {
      const filter = new Tone.Filter({ type: "highpass", frequency: 180 }).connect(destination);
      return pluckVoice(
        Tone,
        destination,
        { attackNoise: 1.4, dampening: 5200, resonance: 0.93 },
        [filter],
      );
    }
    case "drums": {
      const bus = new Tone.Gain(1).connect(destination);
      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.045,
        octaves: 6,
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.2 },
      }).connect(bus);
      const tom = new Tone.MembraneSynth({
        pitchDecay: 0.1,
        octaves: 3,
        envelope: { attack: 0.001, decay: 0.5, sustain: 0.01, release: 0.6 },
      }).connect(bus);
      const snareNoise = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.19, sustain: 0 },
      }).connect(bus);
      const snareTone = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
      }).connect(bus);
      // Cymbals: filtered noise bursts — reliable across browsers.
      const makeCymbal = (
        highpass: number,
        decay: number,
        gain: number,
      ): { synth: ToneNS.NoiseSynth; filter: ToneNS.Filter; out: ToneNS.Gain } => {
        const out = new Tone.Gain(gain).connect(bus);
        const filter = new Tone.Filter({ type: "highpass", frequency: highpass }).connect(out);
        const synth = new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: { attack: 0.001, decay, sustain: 0 },
        }).connect(filter);
        return { synth, filter, out };
      };

      const hat = makeCymbal(9000, 0.05, 0.5);
      const openHat = makeCymbal(8000, 0.35, 0.45);
      const crash = makeCymbal(5000, 1.6, 0.4);
      const ride = makeCymbal(6500, 0.9, 0.35);

      const hit = (name: string, velocity: number) => {
        const v = Math.max(0.05, Math.min(velocity, 1));
        const now = Tone.now();
        switch (name) {
          case "kick":
            kick.triggerAttackRelease("C1", "8n", undefined, v);
            break;
          case "snare":
            snareNoise.triggerAttackRelease("8n", now, v);
            snareTone.triggerAttackRelease("G2", "16n", undefined, v * 0.5);
            break;
          case "hihat":
            hat.synth.triggerAttackRelease("32n", now, v);
            break;
          case "openhat":
            openHat.synth.triggerAttackRelease("8n", now, v);
            break;
          case "tom":
            tom.triggerAttackRelease("G2", "8n", undefined, v);
            break;
          case "crash":
            crash.synth.triggerAttackRelease("2n", now, v);
            break;
          case "ride":
            ride.synth.triggerAttackRelease("4n", now, v);
            break;
          default:
            break;
        }
      };

      return {
        attack: noop,
        release: noop,
        releaseAll: noop,
        hit,
        dispose: () => {
          [kick, tom, snareNoise, snareTone, bus].forEach((n) => n.dispose());
          [hat, openHat, crash, ride].forEach(({ synth, filter, out }) => {
            synth.dispose();
            filter.dispose();
            out.dispose();
          });
        },
      };

    }
    default:
      throw new Error(`Unknown instrument: ${String(id)}`);
  }
}
