import { useEffect, useState } from "react";
import { getEngine } from "../../lib/audio/engine";

export function Playhead({ pixelsPerBeat, isPlaying }: { pixelsPerBeat: number; isPlaying: boolean }) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    let frameId: number;
    const engine = getEngine();

    const update = () => {
      const ticks = engine.getPosition();
      // Tone.js transport ticks are default 192 per quarter note
      const beats = ticks / 192;
      setPosition(beats * pixelsPerBeat);
      
      if (isPlaying) {
        frameId = requestAnimationFrame(update);
      }
    };

    if (isPlaying) {
      frameId = requestAnimationFrame(update);
    } else {
      update();
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isPlaying, pixelsPerBeat]);

  return (
    <div 
      className="absolute top-0 bottom-0 z-30 pointer-events-none"
      style={{ 
        left: position,
        width: 2,
        backgroundColor: "var(--studio-playhead)",
        boxShadow: "0 0 10px var(--studio-playhead)"
      }}
    >
       <div className="absolute -top-3 -left-1.5 w-3 h-3 bg-studio-playhead rotate-45" />
    </div>
  );
}
