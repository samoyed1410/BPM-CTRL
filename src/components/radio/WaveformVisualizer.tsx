import { useEffect, useRef } from "react";

interface Props {
  analyser: AnalyserNode | null;
  isLive?: boolean;
  isPlaying?: boolean;
}

/**
 * Real-time waveform visualizer using Web Audio AnalyserNode.
 * Falls back to an idle pulsing wave when no analyser data is available
 * (e.g. cross-origin streams without CORS headers).
 */
const WaveformVisualizer = ({ analyser, isLive, isPlaying }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const data = analyser ? new Uint8Array(analyser.fftSize) : null;
    let t = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, isLive ? "rgba(239,68,68,0.9)" : "rgba(255,90,31,0.9)");
      gradient.addColorStop(0.5, isLive ? "rgba(255,106,0,1)" : "rgba(255,179,71,1)");
      gradient.addColorStop(1, isLive ? "rgba(239,68,68,0.9)" : "rgba(255,90,31,0.9)");

      ctx.lineWidth = 2;
      ctx.strokeStyle = gradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = isLive ? "rgba(239,68,68,0.6)" : "rgba(255,106,0,0.6)";
      ctx.beginPath();

      if (analyser && data && isPlaying) {
        analyser.getByteTimeDomainData(data);
        const slice = w / data.length;
        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(i * slice, y);
          else ctx.lineTo(i * slice, y);
        }
      } else {
        // Idle: soft sine wave
        t += 0.04;
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * 0.02 + t) * (h * 0.15) * (isPlaying ? 1 : 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [analyser, isLive, isPlaying]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default WaveformVisualizer;
