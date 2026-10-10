import type { CalculatorTheme, CustomThemeConfig } from '@/types/calculator';

export const THEMES: CalculatorTheme[] = [
  {
    id: 'dockalc-dark',
    name: 'Modern Dark',
    description: 'Tactile matte charcoal and neutral deep grey (non-OLED) with electric cobalt accents',
    category: 'dark',
    classes: {
      bg: 'bg-[#18181B]',
      card: 'bg-[#1F2026] border-[#373943]',
      displayBg: 'bg-[#19191C] border-[#2E2E34]',
      displayText: 'text-[#F4F4F5]',
      displayDim: 'text-[#A1A1AA]',
      keyNum: 'bg-[#2D2E35] hover:bg-[#383942] text-[#F8FAFC] border-[#434551] font-semibold shadow-xs',
      keyOp: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-[#3B82F6]/50 font-bold shadow-xs',
      keyFn: 'bg-[#32333A] hover:bg-[#3E404A] text-[#FFFFFF] border-[#4B4E5A] font-semibold shadow-xs',
      keyEqual: 'bg-[#3B82F6] hover:bg-[#2563EB] text-white border-[#60A5FA]/50 font-bold shadow-xs',
      keyActive: 'ring-2 ring-[#3B82F6]',
      border: 'border-[#373943]',
      accent: 'text-[#3B82F6]'
    }
  },
  {
    id: 'nordic-light',
    name: 'Studio Light',
    description: 'Pure minimalist crisp daylight palette with high-contrast dark typography',
    category: 'light',
    classes: {
      bg: 'bg-[#F1F5F9]',
      card: 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1] shadow-md',
      displayBg: 'bg-[#F8FAFC] border-[#CBD5E1]',
      displayText: 'text-[#0F172A]',
      displayDim: 'text-[#475569]',
      keyNum: 'bg-[#F1F5F9] hover:bg-[#CBD5E1] text-[#0F172A] border-[#CBD5E1] font-bold shadow-xs',
      keyOp: 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border-[#1E40AF] font-bold shadow-xs',
      keyFn: 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border-[#CBD5E1] font-bold shadow-xs',
      keyEqual: 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border-[#1E40AF] font-bold shadow-xs',
      keyActive: 'ring-2 ring-[#1D4ED8]',
      border: 'border-[#CBD5E1]',
      accent: 'text-[#1D4ED8]'
    }
  },
  {
    id: 'solar-amber',
    name: 'Vintage Amber',
    description: 'Warm espresso bronze casing with vacuum fluorescent amber glow',
    category: 'retro',
    classes: {
      bg: 'bg-[#16120C]',
      card: 'bg-[#241C12] border-[#423321]',
      displayBg: 'bg-[#100C07] border-[#523F27]',
      displayText: 'text-[#F59E0B]',
      displayDim: 'text-[#925C13]',
      keyNum: 'bg-[#2C2216] hover:bg-[#3D3020] text-[#FEF3C7] border-[#4A3924]',
      keyOp: 'bg-[#D97706] hover:bg-[#B45309] text-[#16120C] font-semibold border-[#FBBF24]',
      keyFn: 'bg-[#1D170E] hover:bg-[#2C2216] text-[#D97706] border-[#423321]',
      keyEqual: 'bg-[#F59E0B] hover:bg-[#D97706] text-[#16120C] font-bold border-[#FCD34D]',
      keyActive: 'ring-2 ring-[#F59E0B]',
      border: 'border-[#423321]',
      accent: 'text-[#F59E0B]'
    }
  },
  {
    id: 'cyber-emerald',
    name: 'Cyber Emerald',
    description: 'Pitch OLED black with high-visibility phosphor emerald green illumination',
    category: 'cyber',
    classes: {
      bg: 'bg-[#040804]',
      card: 'bg-[#0A140B] border-[#163319]',
      displayBg: 'bg-[#020502] border-[#16401B]',
      displayText: 'text-[#22C55E]',
      displayDim: 'text-[#15803D]',
      keyNum: 'bg-[#0F2111] hover:bg-[#153319] text-[#86EFAC] border-[#1C4722]',
      keyOp: 'bg-[#16A34A] hover:bg-[#22C55E] text-[#040804] font-bold border-[#4ADE80]',
      keyFn: 'bg-[#0B1A0D] hover:bg-[#0F2412] text-[#4ADE80] border-[#16381C]',
      keyEqual: 'bg-[#22C55E] hover:bg-[#4ADE80] text-[#040804] font-bold border-[#86EFAC]',
      keyActive: 'ring-2 ring-[#22C55E]',
      border: 'border-[#16381C]',
      accent: 'text-[#22C55E]'
    }
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    description: 'Warm dark volcanic stone accented with modern terracotta and peach tones',
    category: 'warm',
    classes: {
      bg: 'bg-[#1A1412]',
      card: 'bg-[#251D1A] border-[#453631]',
      displayBg: 'bg-[#130E0D] border-[#54413B]',
      displayText: 'text-[#FED7AA]',
      displayDim: 'text-[#A88277]',
      keyNum: 'bg-[#2E2420] hover:bg-[#3E312C] text-[#FFF7ED] border-[#4D3C36]',
      keyOp: 'bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold border-[#FB923C]',
      keyFn: 'bg-[#1E1714] hover:bg-[#2E2420] text-[#FB923C] border-[#453631]',
      keyEqual: 'bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold border-[#FB923C]',
      keyActive: 'ring-2 ring-[#F97316]',
      border: 'border-[#453631]',
      accent: 'text-[#F97316]'
    }
  }
];

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) =>
    lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

export function getCustomThemeStyles(config?: CustomThemeConfig): React.CSSProperties {
  const cfg = config || {
    hue: 217,
    saturation: 90,
    lightness: 60,
    opacity: 0.95,
    mode: 'dark',
    hexColor: '#3B82F6',
  };

  const h = cfg.hue ?? 217;
  const s = cfg.saturation ?? 90;
  const l = cfg.lightness ?? 60;
  const op = cfg.opacity ?? 0.95;
  const isDark = cfg.mode !== 'light';

  const bgLightness = isDark ? 8 : 95;
  const cardLightness = isDark ? 14 : 99;
  const borderLightness = isDark ? 24 : 85;
  const keyLightness = isDark ? 19 : 92;
  const fnLightness = isDark ? 14 : 96;

  return {
    '--theme-bg': `hsla(${h}, 12%, ${bgLightness}%, ${op})`,
    '--theme-card': `hsla(${h}, 12%, ${cardLightness}%, ${op})`,
    '--theme-border': `hsla(${h}, 18%, ${borderLightness}%, ${Math.min(1, op + 0.05)})`,
    '--theme-display-bg': `hsla(${h}, 16%, ${isDark ? 9 : 96}%, 0.95)`,
    '--theme-display-border': `hsla(${h}, 22%, ${isDark ? 20 : 82}%, 0.8)`,
    '--theme-display-text': isDark ? `hsl(${h}, 20%, 97%)` : `hsl(${h}, 25%, 12%)`,
    '--theme-display-dim': isDark ? `hsl(${h}, 30%, 65%)` : `hsl(${h}, 30%, 45%)`,
    '--theme-key-num': `hsla(${h}, 14%, ${keyLightness}%, ${op})`,
    '--theme-key-num-hover': `hsla(${h}, 18%, ${keyLightness + (isDark ? 6 : -6)}%, ${op})`,
    '--theme-key-num-text': isDark ? '#F4F4F5' : '#0F172A',
    '--theme-key-fn': `hsla(${h}, 16%, ${fnLightness}%, ${op})`,
    '--theme-key-fn-hover': `hsla(${h}, 20%, ${fnLightness + (isDark ? 6 : -6)}%, ${op})`,
    '--theme-accent': `hsla(${h}, ${s}%, ${l}%, ${op})`,
    '--theme-accent-hover': `hsla(${h}, ${s}%, ${Math.min(95, l + 7)}%, ${op})`,
    '--theme-accent-text': l > 65 ? '#0F172A' : '#FFFFFF',
  } as React.CSSProperties;
}

export function buildCustomTheme(config?: CustomThemeConfig): CalculatorTheme {
  const cfg = config || {
    hue: 217,
    saturation: 90,
    lightness: 60,
    opacity: 0.95,
    mode: 'dark',
    hexColor: '#3B82F6',
  };

  return {
    id: 'custom',
    name: 'Custom Theme',
    description: `User-defined colorway (Hue ${cfg.hue}°, Opacity ${Math.round((cfg.opacity || 0.95) * 100)}%)`,
    category: 'custom',
    classes: {
      bg: 'bg-[var(--theme-bg,#121316)]',
      card: 'bg-[var(--theme-card,#1c1e22)] border-[var(--theme-border,#2d3139)] shadow-2xl',
      displayBg: 'bg-[var(--theme-display-bg,#0e1012)] border-[var(--theme-display-border,#242830)] shadow-inner',
      displayText: 'text-[var(--theme-display-text,#f4f4f5)]',
      displayDim: 'text-[var(--theme-display-dim,#a1a1aa)]',
      keyNum: 'bg-[var(--theme-key-num,#23262d)] hover:bg-[var(--theme-key-num-hover,#2e323b)] text-[var(--theme-key-num-text,#f4f4f5)] border-[var(--theme-border,#363b46)]',
      keyOp: 'bg-[var(--theme-accent,#3b82f6)] hover:bg-[var(--theme-accent-hover,#60a5fa)] text-[var(--theme-accent-text,#ffffff)] border-white/20',
      keyFn: 'bg-[var(--theme-key-fn,#1a1d22)] hover:bg-[var(--theme-key-fn-hover,#252931)] text-[var(--theme-accent,#60a5fa)] border-[var(--theme-border,#303642)]',
      keyEqual: 'bg-[var(--theme-accent,#3b82f6)] hover:bg-[var(--theme-accent-hover,#60a5fa)] text-[var(--theme-accent-text,#ffffff)] font-bold border-white/30',
      keyActive: 'ring-2 ring-[var(--theme-accent,#3b82f6)]',
      border: 'border-[var(--theme-border,#2d3139)]',
      accent: 'text-[var(--theme-accent,#3b82f6)]',
    },
  };
}


