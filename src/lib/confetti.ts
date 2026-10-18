/**
 * Zero-dependency, lightweight canvas confetti particle engine for Sheet2Vow milestone celebrations.
 * High-performance, automatic canvas teardown, mobile haptic feedback integration.
 */

export interface ConfettiOptions {
  particleCount?: number;
  origin?: { x: number; y: number }; // 0.0 to 1.0 (defaults to center 0.5, 0.4)
  colors?: string[];
  spread?: number;
  haptic?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle';
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

const DEFAULT_WEDDING_COLORS = [
  '#D4AF37', // Champagne Gold
  '#10B981', // Reconciled Emerald
  '#F43F5E', // Soft Celebration Rose
  '#0284C7', // Royal Sky
  '#8B5CF6', // Lavender Romance
  '#0F172A', // Deep Editorial Ink
  '#FBBF24', // Warm Amber
];

export function triggerConfetti(options: ConfettiOptions = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const particleCount = options.particleCount || 70;
  const originX = (options.origin?.x ?? 0.5) * window.innerWidth;
  const originY = (options.origin?.y ?? 0.4) * window.innerHeight;
  const colors = options.colors || DEFAULT_WEDDING_COLORS;
  const spread = options.spread || 75;

  // Haptic feedback for tactile delight on mobile devices
  if (options.haptic !== false && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([20, 40, 25]);
    } catch (_) {
      // Ignore vibration errors if blocked by browser policy
    }
  }

  // Create overlay canvas
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  // Handle high-DPI displays
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const particles: Particle[] = [];
  const baseAngle = -Math.PI / 2; // Upward burst
  const spreadRad = (spread * Math.PI) / 180;

  for (let i = 0; i < particleCount; i++) {
    const angle = baseAngle + (Math.random() - 0.5) * spreadRad;
    const speed = 7 + Math.random() * 11;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
      vy: Math.sin(angle) * speed - (2 + Math.random() * 4), // Initial upward pop
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.35 ? 'rect' : 'circle',
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.1 + Math.random() * 0.1,
    });
  }

  const gravity = 0.38;
  const drag = 0.985;
  const startTime = performance.now();
  const maxDuration = 2800; // 2.8 seconds animation duration

  let animationFrameId: number;

  function render(currentTime: number) {
    const elapsed = currentTime - startTime;
    if (elapsed > maxDuration || particles.length === 0) {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
      return;
    }

    ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;

      // Smooth fade out after 1.5s
      if (elapsed > 1500) {
        p.opacity = Math.max(0, 1 - (elapsed - 1500) / (maxDuration - 1500));
      }

      if (p.opacity <= 0 || p.y > window.innerHeight + 50) {
        particles.splice(i, 1);
        continue;
      }

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;

      const scaleX = Math.cos(p.wobble);

      if (p.shape === 'rect') {
        ctx!.fillRect(-p.size / 2 * scaleX, -p.size / 2, p.size * scaleX, p.size);
      } else {
        ctx!.beginPath();
        ctx!.ellipse(0, 0, (p.size / 2) * Math.abs(scaleX), p.size / 2, 0, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);
}
