import { useEffect, useRef } from "react";
import { getMicRecorder } from "../../lib/audio/mic-recorder";

export function WaveformDisplay({ isRecording }: { isRecording: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isRecording) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let frameId: number;
    const recorder = getMicRecorder();
    
    // Auto-request mic if not ready (in a real app this should be explicit)
    if (recorder.state === "idle") {
      recorder.requestMic().then(success => {
        if (success) recorder.start();
      });
    } else if (recorder.state === "ready") {
      recorder.start();
    }

    const draw = () => {
      const data = recorder.getWaveform();
      
      // Setup canvas
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      
      ctx.clearRect(0, 0, width, height);
      
      if (data) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "var(--signal)";
        ctx.beginPath();
        
        const sliceWidth = width / data.length;
        let x = 0;
        
        for (let i = 0; i < data.length; i++) {
          const v = data[i]; // -1.0 to 1.0
          const y = (v + 1) / 2 * height;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        
        ctx.stroke();
      }
      
      frameId = requestAnimationFrame(draw);
    };
    
    frameId = requestAnimationFrame(draw);
    
    return () => {
      cancelAnimationFrame(frameId);
      if (recorder.state === "recording") {
        recorder.stop();
      }
    };
  }, [isRecording]);

  if (!isRecording) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-y-0 right-0 w-32 bg-studio-recording/10 pointer-events-none"
    />
  );
}
