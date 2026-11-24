import React, { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  burstKey: number;
  intensity?: 'big' | 'medium' | 'small';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'star';
  life: number;
  maxLife: number;
}

const COLORS = [
  '#FF5A5F',
  '#FFC800',
  '#58CC02',
  '#29B6F6',
  '#9B5DE5',
  '#FF7EB3',
  '#38D9D6',
];

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({
  burstKey,
  intensity = 'big',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (burstKey === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = intensity === 'big' ? 85 : intensity === 'medium' ? 48 : 24;
    const originX = width * 0.5;
    const originY = height * 0.34;

    const shapes: Array<'rect' | 'circle' | 'star'> = ['rect', 'circle', 'star'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 4 + Math.random() * (intensity === 'big' ? 11 : 8);
      particlesRef.current.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4.5,
        size: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.24,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 0,
        maxLife: 75 + Math.random() * 45,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const list = particlesRef.current;

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.24; // bouncy gravity
        p.vx *= 0.985;
        p.rotation += p.vRot;

        const alpha = Math.max(0, 1 - Math.max(0, p.life - p.maxLife * 0.6) / (p.maxLife * 0.4));
        if (p.life >= p.maxLife || p.y > height + 40) {
          list.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(ctx, 0, 0, 5, p.size * 0.65, p.size * 0.3);
        }
        ctx.restore();
      }

      if (list.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
        rafRef.current = null;
      }
    };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current && particlesRef.current.length === 0) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [burstKey, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
};
