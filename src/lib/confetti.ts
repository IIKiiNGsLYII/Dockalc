import confetti from 'canvas-confetti';

export type ParticleStyle = 'confetti' | 'fireworks' | 'coins' | 'math-runes' | 'starlight';

/**
 * Universal celebratory particle trigger supporting festive styles
 */
export function fireCelebratoryParticles(style: ParticleStyle = 'confetti', themeId?: string) {
  try {
    switch (style) {
      case 'fireworks':
        fireFireworks();
        break;
      case 'coins':
        fireGoldCoins();
        break;
      case 'math-runes':
        // Math runes were removed in favor of festive colorful confetti
        fireStandardConfetti();
        break;
      case 'starlight':
        fireStarlight();
        break;
      case 'confetti':
      default:
        fireStandardConfetti();
        break;
    }
  } catch (err) {
    console.warn('Failed to fire particles:', err);
  }
}

/**
 * Four-leaf clover celebratory confetti cannon
 * Used for Lucky Number 13 achievement unlock and favorite number calculations
 */
export function fireCloverConfetti() {
  try {
    let cloverShape: unknown;
    try {
      cloverShape = confetti.shapeFromText({ text: '🍀', scalar: 2.2 });
    } catch {
      cloverShape = 'circle';
    }

    confetti({
      particleCount: 55,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#22c55e', '#4ade80', '#15803d', '#86efac', '#eab308'],
      shapes: (cloverShape ? [cloverShape] : undefined) as any,
      scalar: 1.8,
      startVelocity: 35,
      ticks: 180,
      zIndex: 99999,
      disableForReducedMotion: true,
    });

    setTimeout(() => {
      confetti({
        particleCount: 35,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.75 },
        shapes: (cloverShape ? [cloverShape] : undefined) as any,
        scalar: 1.8,
        colors: ['#16a34a', '#22c55e', '#eab308', '#86efac'],
        zIndex: 99999,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 35,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.75 },
        shapes: (cloverShape ? [cloverShape] : undefined) as any,
        scalar: 1.8,
        colors: ['#16a34a', '#22c55e', '#eab308', '#86efac'],
        zIndex: 99999,
        disableForReducedMotion: true,
      });
    }, 180);
  } catch (err) {
    console.warn('Failed to fire clover confetti:', err);
  }
}

/**
 * Scale the amount and intensity of celebratory particles based on the tier of badge unlocked.
 * Tiers: bronze, silver, gold, legendary, apex, epic
 */
export function fireTierCelebration(tier: 'bronze' | 'silver' | 'gold' | 'legendary' | 'apex' | 'epic' = 'bronze') {
  try {
    switch (tier) {
      case 'epic': {
        // Supreme full-screen multi-wave supernova
        confetti({
          particleCount: 160,
          spread: 160,
          origin: { y: 0.5 },
          colors: ['#ff0055', '#9333ea', '#eab308', '#06b6d4', '#ec4899', '#ffffff'],
          startVelocity: 55,
          ticks: 240,
          scalar: 1.3,
          zIndex: 99999,
        });
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 80,
            origin: { x: 0.05, y: 0.7 },
            colors: ['#f59e0b', '#ef4444', '#8b5cf6'],
            startVelocity: 60,
            zIndex: 99999,
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 80,
            origin: { x: 0.95, y: 0.7 },
            colors: ['#3b82f6', '#10b981', '#ec4899'],
            startVelocity: 60,
            zIndex: 99999,
          });
        }, 120);
        break;
      }
      case 'apex': {
        // Dual side cannons + central cosmic starlight
        confetti({
          particleCount: 110,
          spread: 120,
          origin: { y: 0.55 },
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#9333ea', '#ffffff'],
          startVelocity: 45,
          ticks: 200,
          zIndex: 99999,
        });
        setTimeout(() => {
          confetti({
            particleCount: 70,
            angle: 60,
            spread: 60,
            origin: { x: 0.1, y: 0.75 },
            colors: ['#fbbf24', '#f59e0b', '#ffffff'],
            zIndex: 99999,
          });
          confetti({
            particleCount: 70,
            angle: 120,
            spread: 60,
            origin: { x: 0.9, y: 0.75 },
            colors: ['#d97706', '#9333ea', '#ffffff'],
            zIndex: 99999,
          });
        }, 150);
        break;
      }
      case 'legendary': {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#f59e0b', '#38bdf8', '#ffffff'],
          startVelocity: 40,
          ticks: 180,
          zIndex: 99999,
        });
        break;
      }
      case 'gold': {
        confetti({
          particleCount: 75,
          spread: 85,
          origin: { y: 0.65 },
          colors: ['#f59e0b', '#fbbf24', '#fde047', '#eab308', '#ffffff'],
          startVelocity: 35,
          ticks: 160,
          zIndex: 99999,
        });
        break;
      }
      case 'silver': {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#94a3b8', '#cbd5e1', '#e2e8f0', '#38bdf8', '#ffffff'],
          startVelocity: 30,
          ticks: 140,
          zIndex: 99999,
        });
        break;
      }
      case 'bronze':
      default: {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#d97706', '#b45309', '#f59e0b', '#fed7aa'],
          startVelocity: 25,
          ticks: 120,
          zIndex: 99999,
        });
        break;
      }
    }
  } catch (err) {
    console.warn('Failed to fire tier celebration:', err);
  }
}

// 1. Classic Confetti
function fireStandardConfetti() {
  confetti({
    particleCount: 75,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
    zIndex: 99999,
    disableForReducedMotion: true,
  });

  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 60,
      origin: { x: 0.05, y: 0.75 },
      colors: ['#3b82f6', '#f59e0b', '#ec4899'],
      zIndex: 99999,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 60,
      origin: { x: 0.95, y: 0.75 },
      colors: ['#10b981', '#8b5cf6', '#06b6d4'],
      zIndex: 99999,
      disableForReducedMotion: true,
    });
  }, 150);
}

// 2. Fireworks Extravaganza - Realistic sparkling firework starbursts with launch trails and crackling glitter
function fireFireworks() {
  const defaults = {
    spread: 360,
    ticks: 90,
    gravity: 0.65,
    decay: 0.92,
    startVelocity: 35,
    scalar: 0.65,
    zIndex: 99999,
    disableForReducedMotion: true,
  };

  let sparkleShapes: unknown[] | undefined;
  try {
    sparkleShapes = [
      confetti.shapeFromText({ text: '✦', scalar: 1.4 }),
      confetti.shapeFromText({ text: '•', scalar: 1.2 }),
      confetti.shapeFromText({ text: 'sparkle', scalar: 1.0 }),
    ];
  } catch {
    sparkleShapes = ['circle'];
  }

  // Strictly red, green, and yellow celebratory firework spark palette
  const fireworkPalette = [
    '#FF1E27', // Vivid Rocket Red
    '#00E676', // Emerald Starburst Green
    '#FFD600', // Sparkling Golden Yellow
    '#DC2626', // Deep Crimson
    '#16A34A', // Vibrant Green
    '#EAB308', // Radiant Yellow
    '#EF4444', // Ruby Flame
    '#22C55E', // Bright Lime-Green
    '#FACC15', // Amber Sunburst Yellow
  ];

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Stage 1: Ascending rocket tracer trails shooting up from left & right (Red, Green, Yellow)
  confetti({
    particleCount: 16,
    angle: 85,
    spread: 15,
    origin: { x: 0.25, y: 0.95 },
    startVelocity: 65,
    gravity: 1.2,
    scalar: 0.5,
    colors: ['#FF1E27', '#00E676', '#FFD600'],
    shapes: ['circle'],
    ticks: 45,
    zIndex: 99999,
  });

  confetti({
    particleCount: 16,
    angle: 95,
    spread: 15,
    origin: { x: 0.75, y: 0.95 },
    startVelocity: 65,
    gravity: 1.2,
    scalar: 0.5,
    colors: ['#FF1E27', '#00E676', '#FFD600'],
    shapes: ['circle'],
    ticks: 45,
    zIndex: 99999,
  });

  // Stage 2: Rocket Apex Starburst explosions with dense radial sparkles (Red, Green, Yellow)
  setTimeout(() => {
    // Left burst
    confetti({
      ...defaults,
      particleCount: 75,
      origin: { x: randomInRange(0.2, 0.35), y: randomInRange(0.25, 0.4) },
      colors: fireworkPalette,
      shapes: sparkleShapes as any,
    });
    // Right burst
    confetti({
      ...defaults,
      particleCount: 75,
      origin: { x: randomInRange(0.65, 0.8), y: randomInRange(0.25, 0.4) },
      colors: fireworkPalette,
      shapes: sparkleShapes as any,
    });
  }, 220);

  // Stage 3: Center grand finale burst with glittering willow sparks (Red, Green, Yellow)
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 110,
      startVelocity: 42,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#FF1E27', '#00E676', '#FFD600', '#DC2626', '#16A34A', '#EAB308'],
      shapes: sparkleShapes as any,
      gravity: 0.75,
      ticks: 120,
    });
  }, 500);

  // Stage 4: Crackling trailing micro-sparks falling gently (Red, Green, Yellow)
  setTimeout(() => {
    confetti({
      particleCount: 45,
      spread: 180,
      origin: { x: 0.5, y: 0.35 },
      colors: ['#FFD600', '#00E676', '#FF1E27', '#FACC15'],
      shapes: ['circle'],
      scalar: 0.4,
      gravity: 0.5,
      startVelocity: 15,
      ticks: 100,
      zIndex: 99999,
    });
  }, 750);
}

// 3. Golden Coins / Jackpot Shower
function fireGoldCoins() {
  let shapes: unknown[] | undefined;
  try {
    shapes = [
      confetti.shapeFromText({ text: '🪙', scalar: 2.2 }),
      confetti.shapeFromText({ text: '💰', scalar: 2.2 }),
      confetti.shapeFromText({ text: '$', scalar: 2.0 }),
    ];
  } catch {
    shapes = undefined;
  }

  confetti({
    particleCount: 45,
    spread: 80,
    origin: { y: 0.2 },
    shapes: shapes as any,
    colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#D97706'],
    gravity: 1.1,
    scalar: 1.6,
    ticks: 150,
    zIndex: 99999,
  });

  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { y: 0.25 },
      shapes: shapes as any,
      colors: ['#F59E0B', '#FBBF24', '#FCD34D'],
      gravity: 1.2,
      scalar: 1.8,
      ticks: 140,
      zIndex: 99999,
    });
  }, 200);
}

// 4. Floating Math Runes (π, ∑, ∫, ∞, √, Δ, θ, λ)
// Specific Theme Colors:
// - Dark themes: White colored runes
// - Emerald theme: Green colored runes
// - Light theme: Black colored runes
function fireMathRunes(themeId?: string) {
  // Detect active theme from argument, settings storage, or DOM attributes
  let detectedTheme = themeId;
  if (!detectedTheme && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('dockcalc_settings_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.theme) detectedTheme = parsed.theme;
      }
    } catch {
      // fallback to DOM
    }
  }

  const isEmerald = detectedTheme === 'cyber-emerald' ||
    (typeof document !== 'undefined' && (
      document.body.classList.contains('theme-cyber-emerald') ||
      document.querySelector('[data-theme="cyber-emerald"]') !== null
    ));

  const isLight = detectedTheme === 'nordic-light' || detectedTheme === 'retro-mac' ||
    (typeof document !== 'undefined' && (
      document.body.classList.contains('light-theme') ||
      document.querySelector('[data-theme="nordic-light"]') !== null ||
      document.querySelector('[data-theme="retro-mac"]') !== null
    ));

  // Determine palette strictly per user specification
  // Math runes style confetti needs to be white when it is on all but the light theme (nordic-light or retro-mac)
  let runesPalette: string[];
  if (isLight) {
    // Dark/black runes strictly on the light theme
    runesPalette = ['#000000', '#0F172A', '#1E293B', '#111827', '#09090B'];
  } else {
    // Pure bright white runes on all dark and colored themes (including cyber-emerald, dark, solar-amber, warm-terracotta, custom)
    runesPalette = ['#FFFFFF', '#FFFFFF', '#F8FAFC', '#F1F5F9', '#FFFFFF'];
  }

  let shapes: unknown[] | undefined;
  try {
    shapes = [
      confetti.shapeFromText({ text: 'π', scalar: 2.4 }),
      confetti.shapeFromText({ text: '∑', scalar: 2.4 }),
      confetti.shapeFromText({ text: '∫', scalar: 2.4 }),
      confetti.shapeFromText({ text: '∞', scalar: 2.4 }),
      confetti.shapeFromText({ text: '√', scalar: 2.4 }),
      confetti.shapeFromText({ text: 'Δ', scalar: 2.2 }),
      confetti.shapeFromText({ text: 'λ', scalar: 2.2 }),
    ];
  } catch {
    shapes = undefined;
  }

  // Main upward burst of glowing math runes
  confetti({
    particleCount: 55,
    spread: 100,
    origin: { y: 0.65 },
    shapes: shapes as any,
    colors: runesPalette,
    scalar: 2.2,
    gravity: 0.55,
    ticks: 240,
    startVelocity: 35,
    zIndex: 99999,
    disableForReducedMotion: true,
  });

  // Secondary side spray of luminous runes
  setTimeout(() => {
    confetti({
      particleCount: 35,
      spread: 70,
      angle: 70,
      origin: { x: 0.15, y: 0.7 },
      shapes: shapes as any,
      colors: runesPalette,
      scalar: 2.0,
      gravity: 0.5,
      ticks: 200,
      zIndex: 99999,
    });
    confetti({
      particleCount: 35,
      spread: 70,
      angle: 110,
      origin: { x: 0.85, y: 0.7 },
      shapes: shapes as any,
      colors: runesPalette,
      scalar: 2.0,
      gravity: 0.5,
      ticks: 200,
      zIndex: 99999,
    });
  }, 180);
}

// 5. Starlight & Sparkles (Moving stars, dynamic brightness twinkle, and shooting stars)
function fireStarlight() {
  let starShapes: unknown[] | undefined;
  try {
    starShapes = [
      confetti.shapeFromText({ text: '✦', scalar: 2.0 }),
      confetti.shapeFromText({ text: '★', scalar: 2.2 }),
      confetti.shapeFromText({ text: '✧', scalar: 1.8 }),
      confetti.shapeFromText({ text: '✨', scalar: 2.0 }),
      confetti.shapeFromText({ text: '⭐', scalar: 2.0 }),
    ];
  } catch {
    starShapes = undefined;
  }

  // Wave 1: Gentle upward drift with high-luminance gold and diamond white stars
  confetti({
    particleCount: 65,
    spread: 120,
    origin: { y: 0.55 },
    shapes: starShapes as any,
    colors: ['#FFD700', '#FFF8DC', '#E0F2FE', '#BAE6FD', '#FDE047', '#FFFFFF'],
    scalar: 1.8,
    gravity: 0.45,
    startVelocity: 30,
    ticks: 220,
    zIndex: 99999,
  });

  // Wave 2: Shooting stars drifting laterally across screen
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 45,
      spread: 45,
      origin: { x: 0.05, y: 0.4 },
      shapes: starShapes as any,
      colors: ['#67E8F9', '#FDE047', '#FFFFFF', '#F472B6'],
      scalar: 2.0,
      startVelocity: 45,
      gravity: 0.35,
      ticks: 240,
      zIndex: 99999,
    });
    confetti({
      particleCount: 40,
      angle: 135,
      spread: 45,
      origin: { x: 0.95, y: 0.4 },
      shapes: starShapes as any,
      colors: ['#A78BFA', '#FDE047', '#FFFFFF', '#38BDF8'],
      scalar: 2.0,
      startVelocity: 45,
      gravity: 0.35,
      ticks: 240,
      zIndex: 99999,
    });
  }, 200);

  // Interactive dynamic canvas overlay for realistic moving stars, variable brightness twinkle, and shooting meteor
  launchDynamicCosmicStars();
}

/**
 * Dedicated lightweight full-screen HTML5 canvas animation:
 * - Moving/drifting stars with trail
 * - Pulsing brightness/twinkle (sine-wave luminance)
 * - Shooting star / meteor streak
 */
function launchDynamicCosmicStars() {
  if (typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99998';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Generate 45 drifting stars with variable twinkle rates & brightness
  interface Star {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    baseAlpha: number;
    twinkleSpeed: number;
    twinklePhase: number;
    color: string;
    rays: 4 | 8;
  }

  const starColors = ['#FFF', '#FFD700', '#38BDF8', '#F472B6', '#FDE047', '#C084FC'];
  const stars: Star[] = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.7) * 1.5,
    size: Math.random() * 3.5 + 1.5,
    baseAlpha: Math.random() * 0.4 + 0.4,
    twinkleSpeed: Math.random() * 0.08 + 0.03,
    twinklePhase: Math.random() * Math.PI * 2,
    color: starColors[Math.floor(Math.random() * starColors.length)],
    rays: Math.random() > 0.5 ? 4 : 8,
  }));

  // Shooting star (meteor)
  interface Meteor {
    x: number;
    y: number;
    vx: number;
    vy: number;
    length: number;
    alpha: number;
    active: boolean;
  }

  const meteors: Meteor[] = [
    {
      x: Math.random() * (width * 0.5) + width * 0.1,
      y: Math.random() * (height * 0.3),
      vx: 6 + Math.random() * 4,
      vy: 4 + Math.random() * 3,
      length: 120,
      alpha: 1,
      active: true,
    },
    {
      x: Math.random() * (width * 0.4) + width * 0.4,
      y: Math.random() * (height * 0.2),
      vx: -7 - Math.random() * 3,
      vy: 5 + Math.random() * 2,
      length: 100,
      alpha: 1,
      active: true,
    },
  ];

  let frameCount = 0;
  const maxFrames = 130; // ~2.2 seconds at 60fps

  function draw4PointStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    if (!ctx) return;
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    frameCount++;

    const progress = frameCount / maxFrames;
    const masterFade = progress > 0.75 ? (1 - progress) / 0.25 : 1;

    // Render & update drifting stars with fluctuating brightness
    for (const star of stars) {
      star.x += star.vx;
      star.y += star.vy;
      star.twinklePhase += star.twinkleSpeed;

      // Dynamic brightness oscillating between 0.2 and 1.0
      const brightness = Math.sin(star.twinklePhase) * 0.4 + 0.6;
      const alpha = Math.max(0, Math.min(1, star.baseAlpha * brightness * masterFade));

      ctx.save();
      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = star.color;
      ctx.shadowBlur = star.size * 2;

      // Draw star shape
      draw4PointStar(star.x, star.y, star.rays, star.size * 2, star.size * 0.6);
      ctx.restore();
    }

    // Render & update shooting stars
    for (const meteor of meteors) {
      if (!meteor.active) continue;
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.alpha -= 0.015;

      if (meteor.alpha <= 0) {
        meteor.active = false;
        continue;
      }

      ctx.save();
      const grad = ctx.createLinearGradient(
        meteor.x,
        meteor.y,
        meteor.x - meteor.vx * 15,
        meteor.y - meteor.vy * 15
      );
      grad.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha * masterFade})`);
      grad.addColorStop(0.3, `rgba(253, 224, 71, ${meteor.alpha * 0.8 * masterFade})`);
      grad.addColorStop(1, `rgba(56, 189, 248, 0)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(meteor.x - meteor.vx * 15, meteor.y - meteor.vy * 15);
      ctx.stroke();

      // Glowing head
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (frameCount < maxFrames) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(render);
}

// Backward-compatible alias
export const fireCelebratoryConfetti = fireCelebratoryParticles;
