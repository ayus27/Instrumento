import { useEffect, useState, useSyncExternalStore } from "react";
import { getMidiEngine, MidiDevice, MidiEngineState } from "../../lib/audio/midi-engine";
import { Cable, Unplug, AlertCircle } from "lucide-react";

function useMidiState() {
  const engine = getMidiEngine();
  const [_, forceRender] = useState(0);

  useEffect(() => {
    return engine.subscribe(() => forceRender((prev) => prev + 1));
  }, []);

  return {
    state: engine.state,
    error: engine.error,
    devices: engine.devices,
    activeInputId: engine.activeInputId,
  };
}

export function MidiDevicePanel() {
  const { state, error, devices, activeInputId } = useMidiState();
  const engine = getMidiEngine();

  useEffect(() => {
    if (state === "idle") {
      engine.requestAccess();
    }
  }, [state, engine]);

  if (state === "unsupported") {
    return (
      <div className="flex items-center gap-3 p-3 rounded bg-muted/30 border border-border/50 text-sm">
        <AlertCircle className="w-5 h-5 text-muted-foreground" />
        <p className="text-muted-foreground">Web MIDI API is not supported in this browser.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center gap-3 p-3 rounded bg-destructive/10 border border-destructive/20 text-sm">
        <AlertCircle className="w-5 h-5 text-destructive" />
        <p className="text-destructive">{error || "Could not connect to MIDI system."}</p>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border/50 text-sm">
        <div className="flex items-center gap-3">
          <Unplug className="w-5 h-5 text-muted-foreground" />
          <p className="text-muted-foreground">No MIDI devices detected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-sm border border-panel-edge bg-panel space-y-4">
      <div className="flex items-center gap-2">
        <Cable className="w-4 h-4 text-signal" />
        <h3 className="text-technical text-foreground">MIDI Devices</h3>
      </div>
      
      <div className="space-y-2">
        {devices.map((device) => (
          <div 
            key={device.id}
            className={`flex items-center justify-between p-3 rounded-sm border cursor-pointer transition-colors ${
              activeInputId === device.id 
                ? "border-signal bg-signal/10" 
                : "border-border/50 bg-background hover:border-signal/50"
            }`}
            onClick={() => engine.setActiveInput(device.id)}
          >
            <div>
              <p className="font-medium text-sm">{device.name}</p>
              {device.manufacturer && (
                <p className="text-xs text-muted-foreground mt-0.5">{device.manufacturer}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {activeInputId === device.id && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${device.state === "connected" ? "bg-signal" : "bg-muted-foreground"}`}></span>
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                {device.state}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
