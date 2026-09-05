/**
 * MicRecorderEngine — browser microphone recording via MediaRecorder + Web Audio.
 * Produces audio blobs and real-time waveform data for visualisation.
 */

export type MicRecorderState = "idle" | "requesting" | "ready" | "recording" | "error";

export type WaveformFrame = Float32Array;

export class MicRecorderEngine {
  state: MicRecorderState = "idle";
  error: string | null = null;

  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private listeners = new Set<() => void>();

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  /** Request microphone access. Call once before recording. */
  async requestMic(deviceId?: string): Promise<boolean> {
    this.state = "requesting";
    this.error = null;
    this.emit();

    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId
          ? { deviceId: { exact: deviceId } }
          : { echoCancellation: true, noiseSuppression: true },
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Set up analyser for waveform visualisation
      this.context = new AudioContext();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 2048;
      this.source = this.context.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);

      this.state = "ready";
      this.emit();
      return true;
    } catch (e) {
      this.state = "error";
      this.error = e instanceof Error ? e.message : "Microphone access denied.";
      this.emit();
      return false;
    }
  }

  /** Start recording. Mic must be ready. */
  start(): boolean {
    if (this.state !== "ready" || !this.stream) return false;

    this.chunks = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    this.recorder = new MediaRecorder(this.stream, { mimeType });
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.onstop = () => {
      this.state = "ready";
      this.emit();
    };
    this.recorder.start(100); // 100ms timeslices for near-real-time data
    this.state = "recording";
    this.emit();
    return true;
  }

  /** Stop recording and return the audio blob. */
  async stop(): Promise<Blob | null> {
    if (!this.recorder || this.state !== "recording") return null;

    return new Promise<Blob>((resolve) => {
      const onStop = () => {
        this.recorder!.removeEventListener("stop", onStop);
        const blob = new Blob(this.chunks, { type: this.recorder!.mimeType });
        this.chunks = [];
        resolve(blob);
      };
      this.recorder!.addEventListener("stop", onStop);
      this.recorder!.stop();
    });
  }

  /** Get current waveform data for visualisation (call in rAF loop). */
  getWaveform(): WaveformFrame | null {
    if (!this.analyser) return null;
    const data = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(data);
    return data;
  }

  /** Get available audio input devices. */
  static async listDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === "audioinput");
    } catch {
      return [];
    }
  }

  /** Release all resources. */
  dispose() {
    this.recorder?.stop();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.source?.disconnect();
    this.analyser?.disconnect();
    void this.context?.close();

    this.recorder = null;
    this.stream = null;
    this.source = null;
    this.analyser = null;
    this.context = null;
    this.chunks = [];
    this.state = "idle";
    this.error = null;
  }
}

let micEngine: MicRecorderEngine | null = null;

export function getMicRecorder(): MicRecorderEngine {
  if (!micEngine) micEngine = new MicRecorderEngine();
  return micEngine;
}
