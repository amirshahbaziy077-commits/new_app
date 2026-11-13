import { ReactNode, useEffect, useRef } from 'react';
import { CategoryId } from '../data/vocabulary';

export type FantasyTheme =
  | 'home'
  | 'alphabet'
  | 'flashcards'
  | 'rewards'
  | 'parents'
  | 'guess'
  | 'match'
  | 'listen'
  | 'spell'
  | 'challenge'
  | 'profile';

interface FantasyPalette {
  gradientCss: string;
  orbColors: [string, string, string];
  bubbleTint: string;
  starCore: string;
  starGlow: string;
}

const FANTASY_PALETTES: Record<FantasyTheme, FantasyPalette> = {
  home: {
    gradientCss: 'linear-gradient(155deg, #E9D5FF 0%, #FCE7F3 48%, #DBEAFE 100%)',
    orbColors: ['rgba(192, 132, 252, 0.34)', 'rgba(244, 114, 182, 0.28)', 'rgba(125, 211, 252, 0.34)'],
    bubbleTint: 'rgba(196, 181, 253, 0.36)',
    starCore: 'rgba(254, 240, 138, 0.95)',
    starGlow: 'rgba(250, 204, 21, 0.42)',
  },
  alphabet: {
    gradientCss: 'linear-gradient(155deg, #E0E7FF 0%, #E0F2FE 52%, #F3E8FF 100%)',
    orbColors: ['rgba(129, 140, 248, 0.30)', 'rgba(56, 189, 248, 0.26)', 'rgba(216, 180, 254, 0.32)'],
    bubbleTint: 'rgba(147, 197, 253, 0.36)',
    starCore: 'rgba(254, 249, 195, 0.95)',
    starGlow: 'rgba(129, 140, 248, 0.38)',
  },
  flashcards: {
    gradientCss: 'linear-gradient(155deg, #F3E8FF 0%, #FCE7F3 50%, #E0F2FE 100%)',
    orbColors: ['rgba(216, 180, 254, 0.32)', 'rgba(249, 168, 212, 0.28)', 'rgba(147, 197, 253, 0.30)'],
    bubbleTint: 'rgba(221, 214, 254, 0.38)',
    starCore: 'rgba(254, 240, 138, 0.95)',
    starGlow: 'rgba(244, 114, 182, 0.34)',
  },
  rewards: {
    gradientCss: 'linear-gradient(155deg, #FEF3C7 0%, #FCE7F3 52%, #EDE9FE 100%)',
    orbColors: ['rgba(251, 191, 36, 0.30)', 'rgba(244, 114, 182, 0.24)', 'rgba(196, 181, 253, 0.30)'],
    bubbleTint: 'rgba(253, 230, 138, 0.38)',
    starCore: 'rgba(254, 240, 138, 0.98)',
    starGlow: 'rgba(245, 158, 11, 0.45)',
  },
  parents: {
    gradientCss: 'linear-gradient(155deg, #E0F2FE 0%, #EDE9FE 55%, #F1F5F9 100%)',
    orbColors: ['rgba(125, 211, 252, 0.28)', 'rgba(196, 181, 253, 0.26)', 'rgba(249, 168, 212, 0.20)'],
    bubbleTint: 'rgba(186, 230, 253, 0.34)',
    starCore: 'rgba(254, 249, 195, 0.92)',
    starGlow: 'rgba(96, 165, 250, 0.35)',
  },
  guess: {
    gradientCss: 'linear-gradient(155deg, #EDE9FE 0%, #FAE8FF 50%, #E0F2FE 100%)',
    orbColors: ['rgba(167, 139, 250, 0.34)', 'rgba(232, 121, 249, 0.26)', 'rgba(125, 211, 252, 0.30)'],
    bubbleTint: 'rgba(221, 214, 254, 0.38)',
    starCore: 'rgba(254, 240, 138, 0.95)',
    starGlow: 'rgba(192, 132, 252, 0.40)',
  },
  match: {
    gradientCss: 'linear-gradient(155deg, #CCFBF1 0%, #E0F2FE 52%, #F3E8FF 100%)',
    orbColors: ['rgba(94, 234, 212, 0.32)', 'rgba(125, 211, 252, 0.28)', 'rgba(216, 180, 254, 0.28)'],
    bubbleTint: 'rgba(153, 246, 228, 0.36)',
    starCore: 'rgba(254, 249, 195, 0.95)',
    starGlow: 'rgba(45, 212, 191, 0.38)',
  },
  listen: {
    gradientCss: 'linear-gradient(155deg, #DBEAFE 0%, #CFFAFE 48%, #EDE9FE 100%)',
    orbColors: ['rgba(96, 165, 250, 0.32)', 'rgba(103, 232, 249, 0.28)', 'rgba(196, 181, 253, 0.30)'],
    bubbleTint: 'rgba(186, 230, 253, 0.38)',
    starCore: 'rgba(254, 240, 138, 0.95)',
    starGlow: 'rgba(56, 189, 248, 0.40)',
  },
  spell: {
    gradientCss: 'linear-gradient(155deg, #FEF3C7 0%, #FCE7F3 50%, #EDE9FE 100%)',
    orbColors: ['rgba(253, 186, 116, 0.32)', 'rgba(249, 168, 212, 0.28)', 'rgba(196, 181, 253, 0.28)'],
    bubbleTint: 'rgba(254, 215, 170, 0.38)',
    starCore: 'rgba(254, 240, 138, 0.95)',
    starGlow: 'rgba(251, 146, 60, 0.38)',
  },
  challenge: {
    gradientCss: 'linear-gradient(155deg, #FFE4E6 0%, #FEF3C7 50%, #F3E8FF 100%)',
    orbColors: ['rgba(251, 113, 133, 0.30)', 'rgba(251, 191, 36, 0.28)', 'rgba(192, 132, 252, 0.30)'],
    bubbleTint: 'rgba(254, 205, 211, 0.38)',
    starCore: 'rgba(254, 240, 138, 0.98)',
    starGlow: 'rgba(244, 63, 94, 0.40)',
  },
  profile: {
    gradientCss: 'linear-gradient(155deg, #E0E7FF 0%, #FCE7F3 52%, #CCFBF1 100%)',
    orbColors: ['rgba(129, 140, 248, 0.32)', 'rgba(244, 114, 182, 0.26)', 'rgba(45, 212, 191, 0.28)'],
    bubbleTint: 'rgba(199, 210, 254, 0.38)',
    starCore: 'rgba(254, 240, 138, 0.96)',
    starGlow: 'rgba(99, 102, 241, 0.38)',
  },
};

const CATEGORY_GRADIENT_OVERRIDES: Record<CategoryId, string> = {
  animals: 'linear-gradient(155deg, #FEF3C7 0%, #FCE7F3 48%, #EDE9FE 100%)',
  fruits: 'linear-gradient(155deg, #FFE4E6 0%, #FCE7F3 50%, #E0E7FF 100%)',
  colors: 'linear-gradient(155deg, #DBEAFE 0%, #EDE9FE 52%, #FCE7F3 100%)',
  numbers: 'linear-gradient(155deg, #D1FAE5 0%, #E0F2FE 50%, #F3E8FF 100%)',
  objects: 'linear-gradient(155deg, #F3E8FF 0%, #FCE7F3 50%, #DBEAFE 100%)',
};

interface CloudSeed {
  xFrac: number;
  yFrac: number;
  scale: number;
  speed: number;
  phase: number;
}

interface StarSeed {
  xFrac: number;
  yFrac: number;
  radius: number;
  speed: number;
  phase: number;
}

interface BubbleSeed {
  xFrac: number;
  yFrac: number;
  radius: number;
  driftX: number;
  driftY: number;
  speed: number;
  phase: number;
}

const CLOUD_SEEDS: CloudSeed[] = [
  { xFrac: 0.14, yFrac: 0.14, scale: 1.05, speed: 0.42, phase: 0.2 },
  { xFrac: 0.78, yFrac: 0.11, scale: 0.9, speed: 0.35, phase: 1.7 },
  { xFrac: 0.48, yFrac: 0.28, scale: 0.78, speed: 0.38, phase: 3.1 },
  { xFrac: 0.18, yFrac: 0.66, scale: 0.95, speed: 0.32, phase: 4.2 },
  { xFrac: 0.84, yFrac: 0.74, scale: 1.1, speed: 0.36, phase: 2.5 },
];

const STAR_SEEDS: StarSeed[] = [
  { xFrac: 0.08, yFrac: 0.22, radius: 13, speed: 1.5, phase: 0.4 },
  { xFrac: 0.29, yFrac: 0.09, radius: 11, speed: 1.9, phase: 1.3 },
  { xFrac: 0.61, yFrac: 0.15, radius: 14, speed: 1.6, phase: 2.2 },
  { xFrac: 0.91, yFrac: 0.26, radius: 12, speed: 1.8, phase: 3.4 },
  { xFrac: 0.12, yFrac: 0.48, radius: 10, speed: 2.1, phase: 0.9 },
  { xFrac: 0.88, yFrac: 0.52, radius: 13, speed: 1.4, phase: 2.8 },
  { xFrac: 0.36, yFrac: 0.84, radius: 12, speed: 1.7, phase: 1.6 },
  { xFrac: 0.71, yFrac: 0.88, radius: 11, speed: 2.0, phase: 4.1 },
];

const BUBBLE_SEEDS: BubbleSeed[] = [
  { xFrac: 0.22, yFrac: 0.34, radius: 22, driftX: 16, driftY: 22, speed: 0.55, phase: 0.5 },
  { xFrac: 0.72, yFrac: 0.38, radius: 28, driftX: 18, driftY: 24, speed: 0.48, phase: 1.9 },
  { xFrac: 0.44, yFrac: 0.58, radius: 19, driftX: 14, driftY: 20, speed: 0.62, phase: 3.0 },
  { xFrac: 0.09, yFrac: 0.80, radius: 25, driftX: 15, driftY: 24, speed: 0.5, phase: 2.1 },
  { xFrac: 0.58, yFrac: 0.76, radius: 21, driftX: 18, driftY: 18, speed: 0.58, phase: 4.0 },
  { xFrac: 0.92, yFrac: 0.64, radius: 24, driftX: 14, driftY: 22, speed: 0.46, phase: 1.1 },
  { xFrac: 0.33, yFrac: 0.18, radius: 16, driftX: 12, driftY: 16, speed: 0.66, phase: 3.6 },
  { xFrac: 0.82, yFrac: 0.19, radius: 18, driftX: 14, driftY: 18, speed: 0.6, phase: 0.8 },
];

function drawSoftCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';

  const puffs = [
    { x: -34, y: 8, r: 24 },
    { x: -8, y: -6, r: 32 },
    { x: 24, y: 2, r: 26 },
    { x: 42, y: 12, r: 19 },
    { x: 4, y: 14, r: 24 },
  ];

  ctx.beginPath();
  for (const puff of puffs) {
    ctx.moveTo(puff.x + puff.r, puff.y);
    ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

function drawGlowingStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  twinkle: number,
  coreColor: string,
  glowColor: string
) {
  const pulse = 0.72 + 0.38 * twinkle;
  const r = radius * pulse;

  const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
  halo.addColorStop(0, glowColor);
  halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = coreColor;
  ctx.beginPath();
  const inner = r * 0.34;
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4;
    const dist = i % 2 === 0 ? r : inner;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  tint: string
) {
  const grad = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    radius * 0.1,
    x,
    y,
    radius
  );
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
  grad.addColorStop(0.65, tint);
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.18)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(x - radius * 0.34, y - radius * 0.34, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

interface FantasyBackgroundProps {
  theme: FantasyTheme;
  categoryId?: CategoryId;
  className?: string;
  children: ReactNode;
}

export function FantasyBackground({
  theme,
  categoryId,
  className = '',
  children,
}: FantasyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const palette = FANTASY_PALETTES[theme];
  const gradientCss =
    theme === 'flashcards' && categoryId
      ? CATEGORY_GRADIENT_OVERRIDES[categoryId]
      : palette.gradientCss;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let width = 0;
    let height = 0;

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const startTime = performance.now();

    const renderFrame = (now: number) => {
      const t = prefersReducedMotion ? 0 : (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Soft radial pastel nebula glows
      const orbs = [
        {
          x: width * 0.16 + Math.sin(t * 0.32) * 28,
          y: height * 0.2 + Math.cos(t * 0.28) * 20,
          r: Math.max(width, height) * 0.32,
          color: palette.orbColors[0],
        },
        {
          x: width * 0.82 + Math.cos(t * 0.26) * 26,
          y: height * 0.28 + Math.sin(t * 0.34) * 22,
          r: Math.max(width, height) * 0.30,
          color: palette.orbColors[1],
        },
        {
          x: width * 0.52 + Math.sin(t * 0.24 + 1.5) * 32,
          y: height * 0.82 + Math.cos(t * 0.3) * 18,
          r: Math.max(width, height) * 0.34,
          color: palette.orbColors[2],
        },
      ];

      for (const orb of orbs) {
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, orb.color);
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating soft clouds
      for (const cloud of CLOUD_SEEDS) {
        const cx = cloud.xFrac * width + Math.sin(t * cloud.speed + cloud.phase) * 22;
        const cy = cloud.yFrac * height + Math.cos(t * cloud.speed * 0.85 + cloud.phase) * 9;
        drawSoftCloud(ctx, cx, cy, cloud.scale);
      }

      // Gentle floating bubbles
      for (const bubble of BUBBLE_SEEDS) {
        const bx = bubble.xFrac * width + Math.sin(t * bubble.speed + bubble.phase) * bubble.driftX;
        const by = bubble.yFrac * height + Math.cos(t * bubble.speed * 0.9 + bubble.phase) * bubble.driftY;
        drawBubble(ctx, bx, by, bubble.radius, palette.bubbleTint);
      }

      // Glowing twinkling stars
      for (const star of STAR_SEEDS) {
        const sx = star.xFrac * width + Math.sin(t * 0.4 + star.phase) * 6;
        const sy = star.yFrac * height + Math.cos(t * 0.45 + star.phase) * 8;
        const twinkle = 0.5 + 0.5 * Math.sin(t * star.speed + star.phase);
        drawGlowingStar(
          ctx,
          sx,
          sy,
          star.radius,
          twinkle,
          palette.starCore,
          palette.starGlow
        );
      }

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.cancelAnimationFrame(rafId);
    };
  }, [palette]);

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${className}`}
      style={{ background: gradientCss }}
    >
      {/* Animated Fantasy Canvas Backdrop */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />

      {/* Semi-transparent Readability Veil */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-white/40"
        aria-hidden="true"
      />

      {/* Screen Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
