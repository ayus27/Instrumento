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
      const reverb = new Tone.Reverb({ decay: 2.4, wet: 0.18 }).connect(destination);
      const poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.004, decay: 1.6, sustain: 0.18, release: 1.1 },
      }).connect(reverb);
      poly.maxPolyphony = 24;
      return polyVoice(poly, [reverb]);
    }
    case "piano-soft": {
      const reverb = new Tone.Reverb({ decay: 3.6, wet: 0.32 }).connect(destination);
      const poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.06, decay: 2.2, sustain: 0.25, release: 1.8 },
      }).connect(reverb);
      poly.maxPolyphony = 24;
      return polyVoice(poly, [reverb]);
    }
    case "piano-electric": {
      const chorus = new Tone.Chorus({ frequency: 1.2, depth: 0.5, wet: 0.3 })
        .connect(destination)
        .start();
      const poly = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.01,
        modulationIndex: 9,
        envelope: { attack: 0.004, decay: 1.2, sustain: 0.14, release: 0.9 },
        modulationEnvelope: { attack: 0.01, decay: 0.4, sustain: 0.05, release: 0.4 },
      }).connect(chorus);
      poly.maxPolyphony = 24;
      return polyVoice(poly, [chorus]);
    }
    case "guitar-acoustic": {
      const body = new Tone.Filter({ type: "lowpass", frequency: 4800 }).connect(destination);
      const reverb = new Tone.Reverb({ decay: 1.6, wet: 0.14 }).connect(body);
      return pluckVoice(
        Tone,
        destination,
        { attackNoise: 1.1, dampening: 3600, resonance: 0.96 },
        [reverb, body],
      );
    }
    case "guitar-electric": {
      const dist = new Tone.Distortion(0.42).connect(destination);
      const filter = new Tone.Filter({ type: "lowpass", frequency: 2600 }).connect(dist);
      return pluckVoice(
        Tone,
        destination,
        { attackNoise: 0.6, dampening: 2400, resonance: 0.985 },
        [filter, dist],
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
