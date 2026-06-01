"use client";

import { useRef, useEffect, useCallback, useState } from "react";

const SEGMENTS = [10, 25, 50, 0, 100, 15, 75, 200, 30, 5, 150, 0];
const COLORS_DARK = [
  "#1A4A38", "#C9A84C", "#1E3A2F", "#C9A84C",
  "#1A4A38", "#C9A84C", "#1E3A2F", "#C9A84C",
  "#1A4A38", "#C9A84C", "#1E3A2F", "#C9A84C",
];
const COLORS_LIGHT = [
  "#102820", "#E8C96C", "#1A3A2F", "#E8C96C",
  "#102820", "#E8C96C", "#1A3A2F", "#E8C96C",
  "#102820", "#E8C96C", "#1A3A2F", "#E8C96C",
];

interface WheelCanvasProps {
  onSpin: (paid: boolean) => Promise<{ winning_index: number; result_md: number }>;
  canSpinFree: boolean;
  paidCost: number;
  isLoading: boolean;
}

export default function WheelCanvas({ onSpin, canSpinFree, paidCost, isLoading }: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animRef = useRef<number>(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const isDark = typeof document !== "undefined"
    ? document.documentElement.classList.contains("dark")
    : false;
  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT;

  const draw = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(cx, cy) - 8;
    const seg = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, width, height);

    // Outer ring glow
    const outerGrad = ctx.createRadialGradient(cx, cy, r - 4, cx, cy, r + 4);
    outerGrad.addColorStop(0, "rgba(201,168,76,0.6)");
    outerGrad.addColorStop(1, "rgba(201,168,76,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = outerGrad;
    ctx.lineWidth = 8;
    ctx.stroke();

    SEGMENTS.forEach((val, i) => {
      const start = angle + i * seg;
      const end = start + seg;

      // Segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i];
      ctx.fill();
      ctx.strokeStyle = "rgba(201,168,76,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + seg / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = i % 2 === 0 ? "#E8C96C" : "#102820";
      ctx.font = `bold ${r * 0.13}px Inter, sans-serif`;
      ctx.fillText(val === 0 ? "0" : `+${val}`, r * 0.88, r * 0.045);
      ctx.fillStyle = (i % 2 === 0 ? "#C9A84C" : "#1A3A2F") + "80";
      ctx.font = `${r * 0.07}px Inter, sans-serif`;
      ctx.fillText("MD", r * 0.88, r * 0.045 + r * 0.11);
      ctx.restore();
    });

    // Center circle
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.22);
    grad.addColorStop(0, "#E8C96C");
    grad.addColorStop(1, "#C9A84C");
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.22, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(201,168,76,0.8)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = `bold ${r * 0.13}px Cormorant Garamond, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#102820";
    ctx.fillText("MD", cx, cy);

    // Pointer
    ctx.beginPath();
    ctx.moveTo(cx, cy - r + 15); // Arrow tip pointing down into the segments
    ctx.lineTo(cx - 12, cy - r - 8); // Top-left corner of the arrow base
    ctx.lineTo(cx + 12, cy - r - 8); // Top-right corner of the arrow base
    ctx.closePath();
    ctx.fillStyle = "#C9A84C";
    ctx.fill();
    ctx.shadowColor = "rgba(201,168,76,0.8)";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [COLORS]);

  useEffect(() => {
    draw(rotationRef.current);
  }, [draw]);

  const spinTo = (targetIdx: number) => {
    const seg = (2 * Math.PI) / SEGMENTS.length;
    const totalRotations = 6 * 2 * Math.PI;
    const targetAngle = -(targetIdx * seg + seg / 2 - Math.PI / 2);
    const target = totalRotations + targetAngle - (rotationRef.current % (2 * Math.PI));
    const startAngle = rotationRef.current;
    const duration = 4000;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      rotationRef.current = startAngle + target * ease;
      draw(rotationRef.current);
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const handleSpin = async (paid: boolean) => {
    if (spinning || isLoading) return;
    setSpinning(true);
    setResult(null);
    try {
      const res = await onSpin(paid);
      setResult(res.result_md);
      spinTo(res.winning_index);
    } catch {
      setSpinning(false);
    }
  };

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const size = 280;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="drop-shadow-2xl cursor-pointer"
          onClick={() => !spinning && !isLoading && handleSpin(!canSpinFree)}
        />
        {spinning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/20 rounded-full w-16 h-16 flex items-center justify-center backdrop-blur-sm">
              <div className="w-8 h-8 border-3 border-gold-300 border-t-gold-600 rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>

      {result !== null && !spinning && (
        <div className="animate-bounce-subtle bg-gold-gradient text-emerald-900 font-bold px-6 py-2 rounded-full text-lg shadow-gold">
          {result > 0 ? `+${result} MD 🎉` : "Нічого цього разу 😔"}
        </div>
      )}

      <div className="flex gap-3 w-full">
        <button
          onClick={() => handleSpin(false)}
          disabled={!canSpinFree || spinning || isLoading}
          className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all ${
            canSpinFree && !spinning
              ? "btn-gold"
              : "bg-gray-200/10 text-gray-400 cursor-not-allowed"
          }`}
        >
          {canSpinFree ? "🎡 Безкоштовний спін" : "⏳ Не доступно"}
        </button>
        <button
          onClick={() => handleSpin(true)}
          disabled={spinning || isLoading}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm btn-emerald border border-gold-500/30"
        >
          💰 Платний ({paidCost} MD)
        </button>
      </div>
    </div>
  );
}
