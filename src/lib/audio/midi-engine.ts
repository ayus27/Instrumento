/**
 * MidiEngine — Web MIDI API integration.
 * Detects MIDI devices, manages connections, and emits events for note on/off, velocity, and CC.
 */

export type MidiDevice = {
  id: string;
  name: string;
  manufacturer?: string;
  state: "connected" | "disconnected";
};

export type MidiEvent = {
  channel: number;
  note: number;
  velocity: number;
};

export type MidiCCEvent = {
  channel: number;
  controller: number;
  value: number;
};

export type MidiEngineState = "unsupported" | "idle" | "requesting" | "ready" | "error";

export class MidiEngine {
  state: MidiEngineState = "idle";
  error: string | null = null;
  inputs: Map<string, WebMidi.MIDIInput> = new Map();
  devices: MidiDevice[] = [];
  activeInputId: string | null = null;

  private midiAccess: WebMidi.MIDIAccess | null = null;
  private listeners = new Set<() => void>();
  private noteOnListeners = new Set<(e: MidiEvent) => void>();
  private noteOffListeners = new Set<(e: MidiEvent) => void>();
  private ccListeners = new Set<(e: MidiCCEvent) => void>();

  // Use subscribe for state changes (React hook integration)
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private emitStateChange() {
    this.listeners.forEach((fn) => fn());
  }

  // Use these for instrument bindings
  onNoteOn(fn: (e: MidiEvent) => void) {
    this.noteOnListeners.add(fn);
    return () => this.noteOnListeners.delete(fn);
  }

  onNoteOff(fn: (e: MidiEvent) => void) {
    this.noteOffListeners.add(fn);
    return () => this.noteOffListeners.delete(fn);
  }

  onCC(fn: (e: MidiCCEvent) => void) {
    this.ccListeners.add(fn);
    return () => this.ccListeners.delete(fn);
  }

  async requestAccess(): Promise<boolean> {
    if (!navigator.requestMIDIAccess) {
      this.state = "unsupported";
      this.emitStateChange();
      return false;
    }

    this.state = "requesting";
    this.error = null;
    this.emitStateChange();

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.midiAccess.onstatechange = this.handleStateChange;
      this.updateDevices();
      this.state = "ready";
      this.emitStateChange();
      return true;
    } catch (e) {
      this.state = "error";
      this.error = e instanceof Error ? e.message : "MIDI access denied.";
      this.emitStateChange();
      return false;
    }
  }

  private handleStateChange = () => {
    this.updateDevices();
    this.emitStateChange();
  };

  private updateDevices() {
    if (!this.midiAccess) return;

    this.inputs.clear();
    const newDevices: MidiDevice[] = [];
    let hasActiveInput = false;

    this.midiAccess.inputs.forEach((input) => {
      this.inputs.set(input.id, input);
      newDevices.push({
        id: input.id,
        name: input.name || "Unknown Device",
        manufacturer: input.manufacturer,
        state: input.state,
      });

      if (input.id === this.activeInputId) {
        hasActiveInput = true;
      }
    });

    this.devices = newDevices;

    // Auto-select first available input if none is selected
    if (!hasActiveInput && this.inputs.size > 0) {
      const firstInput = Array.from(this.inputs.values())[0];
      if (firstInput) {
        this.setActiveInput(firstInput.id);
      }
    } else if (this.inputs.size === 0) {
      this.activeInputId = null;
    }
  }

  setActiveInput(id: string | null) {
    // Detach old listener
    if (this.activeInputId) {
      const oldInput = this.inputs.get(this.activeInputId);
      if (oldInput) {
        oldInput.onmidimessage = null;
      }
    }

    this.activeInputId = id;

    // Attach new listener
    if (id) {
      const newInput = this.inputs.get(id);
      if (newInput) {
        newInput.onmidimessage = this.handleMidiMessage;
      }
    }

    this.emitStateChange();
  }

  private handleMidiMessage = (msg: WebMidi.MIDIMessageEvent) => {
    const data = msg.data;
    if (!data || data.length < 2) return;

    const command = data[0] >> 4;
    const channel = data[0] & 0xf;
    const note = data[1];
    const velocity = data.length > 2 ? data[2] : 0;

    switch (command) {
      case 9: // note on
        if (velocity > 0) {
          const normVel = velocity / 127;
          this.noteOnListeners.forEach((fn) => fn({ channel, note, velocity: normVel }));
        } else {
          // Note on with velocity 0 is effectively note off
          this.noteOffListeners.forEach((fn) => fn({ channel, note, velocity: 0 }));
        }
        break;
      case 8: // note off
        this.noteOffListeners.forEach((fn) => fn({ channel, note, velocity: 0 }));
        break;
      case 11: // control change
        this.ccListeners.forEach((fn) => fn({ channel, controller: note, value: velocity }));
        break;
    }
  };

  dispose() {
    if (this.midiAccess) {
      this.midiAccess.onstatechange = null;
    }
    this.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
    this.inputs.clear();
    this.devices = [];
    this.activeInputId = null;
    this.midiAccess = null;
    this.state = "idle";
    this.error = null;
    this.noteOnListeners.clear();
    this.noteOffListeners.clear();
    this.ccListeners.clear();
  }
}

let midiEngine: MidiEngine | null = null;

export function getMidiEngine(): MidiEngine {
  if (!midiEngine) midiEngine = new MidiEngine();
  return midiEngine;
}
