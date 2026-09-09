import { useState, useEffect } from "react";
import { getTransport } from "../lib/transportEngine";

export function useTransport() {
  const transport = getTransport();
  
  const [isPlaying, setIsPlaying] = useState(transport.state === "started");
  const [ticks, setTicks] = useState(transport.ticks);
  const [bpm, setBpm] = useState(transport.bpm);

  useEffect(() => {
    let frame: number;
    const update = () => {
      setIsPlaying(transport.state === "started");
      setTicks(transport.ticks);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [transport]);

  return {
    isPlaying,
    ticks,
    bpm,
    play: () => transport.play(),
    pause: () => transport.pause(),
    stop: () => transport.stop(),
    setBpm: (b: number) => { transport.bpm = b; setBpm(b); },
  };
}
