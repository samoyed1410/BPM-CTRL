import { useEffect, useRef } from "react";

const FrequencyWaves = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;

      // Draw multiple frequency wave layers
      const waves = [
        { amplitude: 40, frequency: 0.008, speed: 1, opacity: 0.15, color: "255, 90, 31" },
        { amplitude: 60, frequency: 0.005, speed: 0.7, opacity: 0.1, color: "255, 106, 0" },
        { amplitude: 30, frequency: 0.012, speed: 1.3, opacity: 0.08, color: "255, 179, 71" },
        { amplitude: 50, frequency: 0.006, speed: 0.5, opacity: 0.06, color: "183, 65, 14" },
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${wave.color}, ${wave.opacity})`;
        ctx.lineWidth = 1.5;

        for (let x = 0; x < canvas.width; x++) {
          const y =
            canvas.height / 2 +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.sin(x * wave.frequency * 2.5 + time * wave.speed * 1.5) * (wave.amplitude * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Floating particles
      for (let i = 0; i < 50; i++) {
        const px = ((i * 137.508 + time * 20) % canvas.width);
        const py = canvas.height * 0.2 + Math.sin(time + i * 0.5) * canvas.height * 0.3;
        const size = 1 + Math.sin(time * 2 + i) * 0.8;
        const opacity = 0.2 + Math.sin(time + i * 0.3) * 0.15;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 106, 0, ${opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  );
};

export default FrequencyWaves;
