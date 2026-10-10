import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Search,
  ArrowRight,
  Copy,
  Check,
  PlusCircle,
  Hash,
  Activity,
  Layers,
  Percent,
} from 'lucide-react';
import { toast } from 'sonner';
import { THEMES } from '@/lib/themes';
import type { CalculatorTheme } from '@/types/calculator';

export interface VisualFormulaItem {
  id: string;
  name: string;
  category: 'geometry' | 'algebra' | 'finance' | 'physics';
  formulaLaTeX: string;
  description: string;
  inputs: {
    key: string;
    label: string;
    defaultValue: number;
    unit?: string;
  }[];
  calculate: (values: Record<string, number>) => {
    result: number;
    expression: string;
    formattedResult: string;
  };
}

export const FORMULA_LIBRARY: VisualFormulaItem[] = [
  // GEOMETRY
  {
    id: 'circle-area',
    name: 'Area of a Circle',
    category: 'geometry',
    formulaLaTeX: 'A = π · r²',
    description: 'Calculate the total interior surface area of a circle given its radius.',
    inputs: [{ key: 'r', label: 'Radius (r)', defaultValue: 5, unit: 'm' }],
    calculate: (v) => {
      const r = v.r ?? 5;
      const res = Math.PI * r * r;
      return {
        result: res,
        expression: `3.14159265 * (${r} ^ 2)`,
        formattedResult: res.toFixed(4),
      };
    },
  },
  {
    id: 'pythagoras',
    name: 'Pythagorean Theorem',
    category: 'geometry',
    formulaLaTeX: 'c = √(a² + b²)',
    description: 'Find hypotenuse (c) of a right triangle from legs (a) and (b).',
    inputs: [
      { key: 'a', label: 'Leg (a)', defaultValue: 3 },
      { key: 'b', label: 'Leg (b)', defaultValue: 4 },
    ],
    calculate: (v) => {
      const a = v.a ?? 3;
      const b = v.b ?? 4;
      const res = Math.sqrt(a * a + b * b);
      return {
        result: res,
        expression: `sqrt((${a} ^ 2) + (${b} ^ 2))`,
        formattedResult: res.toFixed(4),
      };
    },
  },
  {
    id: 'sphere-volume',
    name: 'Volume of a Sphere',
    category: 'geometry',
    formulaLaTeX: 'V = ⁴⁄₃ · π · r³',
    description: 'Compute 3D capacity volume enclosed by a spherical boundary.',
    inputs: [{ key: 'r', label: 'Radius (r)', defaultValue: 3 }],
    calculate: (v) => {
      const r = v.r ?? 3;
      const res = (4 / 3) * Math.PI * Math.pow(r, 3);
      return {
        result: res,
        expression: `(4 / 3) * 3.14159265 * (${r} ^ 3)`,
        formattedResult: res.toFixed(4),
      };
    },
  },
  {
    id: 'cylinder-volume',
    name: 'Volume of a Cylinder',
    category: 'geometry',
    formulaLaTeX: 'V = π · r² · h',
    description: 'Calculate 3D space volume of a right circular cylinder.',
    inputs: [
      { key: 'r', label: 'Radius (r)', defaultValue: 4 },
      { key: 'h', label: 'Height (h)', defaultValue: 10 },
    ],
    calculate: (v) => {
      const r = v.r ?? 4;
      const h = v.h ?? 10;
      const res = Math.PI * r * r * h;
      return {
        result: res,
        expression: `3.14159265 * (${r} ^ 2) * ${h}`,
        formattedResult: res.toFixed(4),
      };
    },
  },

  // ALGEBRA
  {
    id: 'quadratic-roots',
    name: 'Quadratic Formula (Root 1)',
    category: 'algebra',
    formulaLaTeX: 'x = (-b + √(b² - 4ac)) / (2a)',
    description: 'Solve polynomial ax² + bx + c = 0 for the positive discriminant root.',
    inputs: [
      { key: 'a', label: 'Coefficient (a)', defaultValue: 1 },
      { key: 'b', label: 'Coefficient (b)', defaultValue: -5 },
      { key: 'c', label: 'Constant (c)', defaultValue: 6 },
    ],
    calculate: (v) => {
      const a = v.a ?? 1;
      const b = v.b ?? -5;
      const c = v.c ?? 6;
      const disc = b * b - 4 * a * c;
      const res = disc >= 0 ? (-b + Math.sqrt(disc)) / (2 * a) : NaN;
      return {
        result: res,
        expression: `(-(${b}) + sqrt((${b}^2) - (4*${a}*${c}))) / (2*${a})`,
        formattedResult: isNaN(res) ? 'No real root (negative disc)' : res.toFixed(4),
      };
    },
  },
  {
    id: 'slope',
    name: 'Slope Between Two Points',
    category: 'algebra',
    formulaLaTeX: 'm = (y₂ - y₁) / (x₂ - x₁)',
    description: 'Determine the gradient steepness of a line connecting coordinates.',
    inputs: [
      { key: 'x1', label: 'Point 1 (x₁)', defaultValue: 1 },
      { key: 'y1', label: 'Point 1 (y₁)', defaultValue: 2 },
      { key: 'x2', label: 'Point 2 (x₂)', defaultValue: 5 },
      { key: 'y2', label: 'Point 2 (y₂)', defaultValue: 10 },
    ],
    calculate: (v) => {
      const dx = (v.x2 ?? 5) - (v.x1 ?? 1);
      const dy = (v.y2 ?? 10) - (v.y1 ?? 2);
      const res = dx !== 0 ? dy / dx : Infinity;
      return {
        result: res,
        expression: `(${dy}) / (${dx})`,
        formattedResult: isFinite(res) ? res.toFixed(4) : 'Undefined (vertical line)',
      };
    },
  },
  {
    id: 'distance',
    name: 'Euclidean Distance',
    category: 'algebra',
    formulaLaTeX: 'd = √((x₂ - x₁)² + (y₂ - y₁)²)',
    description: 'Compute straight-line 2D Cartesian distance between two points.',
    inputs: [
      { key: 'x1', label: 'x₁', defaultValue: 0 },
      { key: 'y1', label: 'y₁', defaultValue: 0 },
      { key: 'x2', label: 'x₂', defaultValue: 6 },
      { key: 'y2', label: 'y₂', defaultValue: 8 },
    ],
    calculate: (v) => {
      const dx = (v.x2 ?? 6) - (v.x1 ?? 0);
      const dy = (v.y2 ?? 8) - (v.y1 ?? 0);
      const res = Math.sqrt(dx * dx + dy * dy);
      return {
        result: res,
        expression: `sqrt(((${dx})^2) + ((${dy})^2))`,
        formattedResult: res.toFixed(4),
      };
    },
  },
  {
    id: 'pct-change',
    name: 'Percentage Change',
    category: 'algebra',
    formulaLaTeX: 'Δ% = ((New - Old) / Old) · 100',
    description: 'Quantify relative percentage growth or decrease between values.',
    inputs: [
      { key: 'oldVal', label: 'Initial (Old)', defaultValue: 50 },
      { key: 'newVal', label: 'Final (New)', defaultValue: 75 },
    ],
    calculate: (v) => {
      const oldV = v.oldVal ?? 50;
      const newV = v.newVal ?? 75;
      const res = oldV !== 0 ? ((newV - oldV) / Math.abs(oldV)) * 100 : 0;
      return {
        result: res,
        expression: `((${newV} - ${oldV}) / ${oldV}) * 100`,
        formattedResult: `${res >= 0 ? '+' : ''}${res.toFixed(2)}%`,
      };
    },
  },

  // FINANCE
  {
    id: 'compound-interest',
    name: 'Compound Interest (Future Value)',
    category: 'finance',
    formulaLaTeX: 'A = P · (1 + r/n)^(nt)',
    description: 'Calculate accrued wealth with interest compounding over time.',
    inputs: [
      { key: 'P', label: 'Principal (P)', defaultValue: 1000, unit: '$' },
      { key: 'r', label: 'Annual Rate (r%)', defaultValue: 7, unit: '%' },
      { key: 'n', label: 'Compounding / yr (n)', defaultValue: 12 },
      { key: 't', label: 'Years (t)', defaultValue: 5 },
    ],
    calculate: (v) => {
      const P = v.P ?? 1000;
      const r = (v.r ?? 7) / 100;
      const n = v.n ?? 12;
      const t = v.t ?? 5;
      const res = P * Math.pow(1 + r / n, n * t);
      return {
        result: res,
        expression: `${P} * ((1 + (${r} / ${n})) ^ (${n * t}))`,
        formattedResult: `$${res.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      };
    },
  },
  {
    id: 'loan-emi',
    name: 'Monthly Loan Payment (EMI)',
    category: 'finance',
    formulaLaTeX: 'M = P · [r(1+r)ⁿ] / [(1+r)ⁿ - 1]',
    description: 'Standard amortized monthly payment for personal loans and mortgages.',
    inputs: [
      { key: 'P', label: 'Loan Amount (P)', defaultValue: 250000, unit: '$' },
      { key: 'r', label: 'Annual Rate (r%)', defaultValue: 6.5, unit: '%' },
      { key: 'n', label: 'Term (Years)', defaultValue: 30 },
    ],
    calculate: (v) => {
      const P = v.P ?? 250000;
      const annualR = (v.r ?? 6.5) / 100;
      const monthlyR = annualR / 12;
      const months = (v.n ?? 30) * 12;
      let res = 0;
      if (monthlyR > 0) {
        res = (P * monthlyR * Math.pow(1 + monthlyR, months)) / (Math.pow(1 + monthlyR, months) - 1);
      } else {
        res = P / months;
      }
      return {
        result: res,
        expression: `${P} * (${monthlyR.toFixed(6)} * ((1 + ${monthlyR.toFixed(6)}) ^ ${months})) / (((1 + ${monthlyR.toFixed(6)}) ^ ${months}) - 1)`,
        formattedResult: `$${res.toFixed(2)} / month`,
      };
    },
  },
  {
    id: 'cagr',
    name: 'Compound Annual Growth Rate (CAGR)',
    category: 'finance',
    formulaLaTeX: 'CAGR = (EV / BV)^(1/n) - 1',
    description: 'Geometric progression ratio for multi-year financial returns.',
    inputs: [
      { key: 'BV', label: 'Start Value (BV)', defaultValue: 10000, unit: '$' },
      { key: 'EV', label: 'End Value (EV)', defaultValue: 25000, unit: '$' },
      { key: 'n', label: 'Years (n)', defaultValue: 5 },
    ],
    calculate: (v) => {
      const BV = v.BV ?? 10000;
      const EV = v.EV ?? 25000;
      const n = v.n ?? 5;
      const res = BV > 0 && n > 0 ? (Math.pow(EV / BV, 1 / n) - 1) * 100 : 0;
      return {
        result: res,
        expression: `((( ${EV} / ${BV} ) ^ (1 / ${n})) - 1) * 100`,
        formattedResult: `${res.toFixed(2)}% / year`,
      };
    },
  },

  // PHYSICS
  {
    id: 'kinetic-energy',
    name: 'Kinetic Energy',
    category: 'physics',
    formulaLaTeX: 'KE = ½ · m · v²',
    description: 'Mechanical energy stored in an object moving with velocity v.',
    inputs: [
      { key: 'm', label: 'Mass (m)', defaultValue: 10, unit: 'kg' },
      { key: 'v', label: 'Velocity (v)', defaultValue: 15, unit: 'm/s' },
    ],
    calculate: (v) => {
      const m = v.m ?? 10;
      const vel = v.v ?? 15;
      const res = 0.5 * m * vel * vel;
      return {
        result: res,
        expression: `0.5 * ${m} * (${vel} ^ 2)`,
        formattedResult: `${res.toLocaleString()} Joules`,
      };
    },
  },
  {
    id: 'ohms-law',
    name: "Ohm's Law (Voltage)",
    category: 'physics',
    formulaLaTeX: 'V = I · R',
    description: 'Electric potential difference proportional to current and resistance.',
    inputs: [
      { key: 'I', label: 'Current (I)', defaultValue: 2.5, unit: 'A' },
      { key: 'R', label: 'Resistance (R)', defaultValue: 8, unit: 'Ω' },
    ],
    calculate: (v) => {
      const I = v.I ?? 2.5;
      const R = v.R ?? 8;
      const res = I * R;
      return {
        result: res,
        expression: `${I} * ${R}`,
        formattedResult: `${res.toFixed(2)} Volts`,
      };
    },
  },
  {
    id: 'force-fma',
    name: "Newton's Second Law (Force)",
    category: 'physics',
    formulaLaTeX: 'F = m · a',
    description: 'Total net force required to accelerate a mass.',
    inputs: [
      { key: 'm', label: 'Mass (m)', defaultValue: 1200, unit: 'kg' },
      { key: 'a', label: 'Acceleration (a)', defaultValue: 3.5, unit: 'm/s²' },
    ],
    calculate: (v) => {
      const m = v.m ?? 1200;
      const a = v.a ?? 3.5;
      const res = m * a;
      return {
        result: res,
        expression: `${m} * ${a}`,
        formattedResult: `${res.toLocaleString()} Newtons`,
      };
    },
  },
];

interface VisualFormulaCheatSheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertExpression?: (expr: string) => void;
  onInsertResult?: (result: string) => void;
  theme?: CalculatorTheme;
  customThemeStyle?: React.CSSProperties;
}

export const VisualFormulaCheatSheetDialog: React.FC<VisualFormulaCheatSheetDialogProps> = ({
  open,
  onOpenChange,
  onInsertExpression,
  onInsertResult,
  theme,
  customThemeStyle,
}) => {
  const activeTheme = theme || THEMES[0];
  const themeId = activeTheme.id;
  const isCustom = themeId === 'custom';
  const isNordic = themeId === 'nordic-light';
  const isSolar = themeId === 'solar-amber';
  const isCyber = themeId === 'cyber-emerald';
  const isRetroMac = themeId === 'retro-mac';
  const isTerracotta = themeId === 'warm-terracotta';

  const themeClasses = {
    dialog: isCustom
      ? 'bg-[var(--theme-bg,#121316)] text-[var(--theme-display-text,#f4f4f5)] border-[var(--theme-border,#2d3139)] shadow-2xl'
      : isNordic
      ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1] shadow-2xl'
      : isSolar
      ? 'bg-[#16120C] text-[#FEF3C7] border-[#423321] shadow-2xl'
      : isCyber
      ? 'bg-[#0A1412] text-[#E6FFFA] border-[#1A3832] shadow-2xl'
      : isRetroMac
      ? 'bg-[#D8D8D8] text-[#111111] border-[#999999] shadow-2xl'
      : isTerracotta
      ? 'bg-[#1A1412] text-[#FED7AA] border-[#453631] shadow-2xl'
      : 'bg-[#18181B] text-[#F4F4F5] border-[#333338] shadow-2xl',

    header: isCustom
      ? 'border-[var(--theme-border,#2d3139)]'
      : isNordic
      ? 'border-[#CBD5E1]'
      : isSolar
      ? 'border-[#423321]'
      : isCyber
      ? 'border-[#1A3832]'
      : isRetroMac
      ? 'border-[#999999]'
      : isTerracotta
      ? 'border-[#453631]'
      : 'border-border/40',

    search: isCustom
      ? 'bg-[var(--theme-card,#1c1e22)] text-[var(--theme-display-text,#f4f4f5)] border-[var(--theme-border,#2d3139)] placeholder:text-[var(--theme-display-dim,#a1a1aa)]'
      : isNordic
      ? 'bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1] placeholder:text-[#64748B]'
      : isSolar
      ? 'bg-[#241C12] text-[#FEF3C7] border-[#423321] placeholder:text-[#925C13]'
      : isCyber
      ? 'bg-[#112320] text-[#E6FFFA] border-[#1A3832] placeholder:text-[#10B981]/50'
      : isRetroMac
      ? 'bg-[#ECECEC] text-[#111111] border-[#999999] placeholder:text-[#666666]'
      : isTerracotta
      ? 'bg-[#251D1A] text-[#FED7AA] border-[#453631] placeholder:text-[#A88277]'
      : 'bg-[#222226] text-[#F4F4F5] border-[#333338] placeholder:text-muted-foreground',

    card: isCustom
      ? 'bg-[var(--theme-card,#1c1e22)] border-[var(--theme-border,#2d3139)] text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] shadow-xs'
      : isSolar
      ? 'bg-[#1D170E] border-[#423321] text-[#FEF3C7] shadow-xs'
      : isCyber
      ? 'bg-[#112320] border-[#1A3832] text-[#E6FFFA] shadow-xs'
      : isRetroMac
      ? 'bg-[#E5E5E5] border-[#999999] text-[#111111] shadow-xs'
      : isTerracotta
      ? 'bg-[#251D1A] border-[#453631] text-[#FED7AA] shadow-xs'
      : 'bg-[#222226] border-[#333338] text-[#F4F4F5] shadow-xs',

    formulaBox: isCustom
      ? 'bg-[var(--theme-display-bg,#0e1012)] border-[var(--theme-border,#2d3139)] text-[var(--theme-accent,#3b82f6)]'
      : isNordic
      ? 'bg-[#FFFFFF] border-[#CBD5E1] text-[#1D4ED8]'
      : isSolar
      ? 'bg-[#100C07] border-[#423321] text-[#F59E0B]'
      : isCyber
      ? 'bg-[#08100E] border-[#1A3832] text-[#10B981]'
      : isRetroMac
      ? 'bg-[#FFFFFF] border-[#999999] text-[#111111]'
      : isTerracotta
      ? 'bg-[#1A1412] border-[#453631] text-[#F97316]'
      : 'bg-[#19191C] border-[#2E2E34] text-[#3B82F6]',

    input: isCustom
      ? 'bg-[var(--theme-display-bg,#0e1012)] border-[var(--theme-border,#2d3139)] text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
      : isSolar
      ? 'bg-[#100C07] border-[#423321] text-[#FEF3C7]'
      : isCyber
      ? 'bg-[#08100E] border-[#1A3832] text-[#E6FFFA]'
      : isRetroMac
      ? 'bg-[#FFFFFF] border-[#999999] text-[#111111]'
      : isTerracotta
      ? 'bg-[#1A1412] border-[#453631] text-[#FED7AA]'
      : 'bg-[#19191C] border-[#2E2E34] text-[#F4F4F5]',

    badge: isCustom
      ? 'bg-[var(--theme-accent,#3b82f6)]/15 text-[var(--theme-accent,#3b82f6)] border-[var(--theme-accent,#3b82f6)]/30'
      : isNordic
      ? 'bg-[#1D4ED8]/10 text-[#1D4ED8] border-[#1D4ED8]/25'
      : isSolar
      ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
      : isCyber
      ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
      : isRetroMac
      ? 'bg-[#222222]/10 text-[#111111] border-[#222222]/30'
      : isTerracotta
      ? 'bg-[#EA580C]/15 text-[#EA580C] border-[#EA580C]/30'
      : 'bg-primary/10 text-primary border-primary/20',

    accentText: isCustom
      ? 'text-[var(--theme-accent,#3b82f6)]'
      : isNordic
      ? 'text-[#1D4ED8]'
      : isSolar
      ? 'text-[#F59E0B]'
      : isCyber
      ? 'text-[#10B981]'
      : isRetroMac
      ? 'text-[#111111]'
      : isTerracotta
      ? 'text-[#EA580C]'
      : 'text-primary',

    categoryActive: isCustom
      ? 'bg-[var(--theme-accent,#3b82f6)] text-[var(--theme-accent-text,#ffffff)] font-bold shadow-xs'
      : isNordic
      ? 'bg-[#1D4ED8] text-white font-bold shadow-xs'
      : isSolar
      ? 'bg-[#F59E0B] text-[#16120C] font-bold shadow-xs'
      : isCyber
      ? 'bg-[#10B981] text-[#0A1412] font-bold shadow-xs'
      : isRetroMac
      ? 'bg-[#222222] text-white font-bold shadow-xs'
      : isTerracotta
      ? 'bg-[#EA580C] text-white font-bold shadow-xs'
      : 'bg-primary text-primary-foreground font-bold shadow-xs',

    categoryInactive: isCustom
      ? 'bg-[var(--theme-key-fn,#1a1d22)] text-[var(--theme-display-dim,#a1a1aa)] hover:text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-[#CBD5E1]'
      : isSolar
      ? 'bg-[#2C2216] text-[#D97706] hover:text-[#FEF3C7] hover:bg-[#3D3020]'
      : isCyber
      ? 'bg-[#142B27] text-[#10B981] hover:text-[#E6FFFA] hover:bg-[#1C3B35]'
      : isRetroMac
      ? 'bg-[#CCCCCC] text-[#333333] hover:text-[#111111] hover:bg-[#BBBBBB]'
      : isTerracotta
      ? 'bg-[#30211D] text-[#FED7AA]/80 hover:text-[#FED7AA] hover:bg-[#453631]'
      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted',

    buttonPrimary: isCustom
      ? 'bg-[var(--theme-accent,#3b82f6)] hover:bg-[var(--theme-accent-hover,#60a5fa)] text-[var(--theme-accent-text,#ffffff)]'
      : isNordic
      ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white'
      : isSolar
      ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#16120C]'
      : isCyber
      ? 'bg-[#10B981] hover:bg-[#059669] text-[#0A1412]'
      : isRetroMac
      ? 'bg-[#222222] hover:bg-[#444444] text-white'
      : isTerracotta
      ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white'
      : 'bg-primary hover:bg-primary/90 text-primary-foreground',

    buttonSecondary: isCustom
      ? 'bg-[var(--theme-key-fn,#1a1d22)] text-[var(--theme-display-text,#f4f4f5)] border-[var(--theme-border,#2d3139)] hover:bg-[var(--theme-card,#1c1e22)]'
      : isNordic
      ? 'bg-[#E2E8F0] text-[#0F172A] border-[#CBD5E1] hover:bg-[#CBD5E1]'
      : isSolar
      ? 'bg-[#2C2216] text-[#FEF3C7] border-[#423321] hover:bg-[#3D3020]'
      : isCyber
      ? 'bg-[#142B27] text-[#E6FFFA] border-[#1A3832] hover:bg-[#1C3B35]'
      : isRetroMac
      ? 'bg-[#ECECEC] text-[#111111] border-[#999999] hover:bg-[#DCDCDC]'
      : isTerracotta
      ? 'bg-[#30211D] text-[#FED7AA] border-[#453631] hover:bg-[#453631]'
      : 'bg-muted/60 text-foreground border-border/60 hover:bg-muted',

    mutedText: isCustom
      ? 'text-[var(--theme-display-dim,#a1a1aa)]'
      : isNordic
      ? 'text-[#64748B]'
      : isSolar
      ? 'text-[#925C13]'
      : isCyber
      ? 'text-[#10B981]/70'
      : isRetroMac
      ? 'text-[#555555]'
      : isTerracotta
      ? 'text-[#A88277]'
      : 'text-muted-foreground',

    headingText: isCustom
      ? 'text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'text-[#0F172A]'
      : isSolar
      ? 'text-[#FEF3C7]'
      : isCyber
      ? 'text-[#E6FFFA]'
      : isRetroMac
      ? 'text-[#111111]'
      : isTerracotta
      ? 'text-[#FED7AA]'
      : 'text-foreground',
  };
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'geometry' | 'algebra' | 'finance' | 'physics'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValues, setInputValues] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    FORMULA_LIBRARY.forEach((item) => {
      initial[item.id] = {};
      item.inputs.forEach((inp) => {
        initial[item.id][inp.key] = inp.defaultValue;
      });
    });
    return initial;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleInputChange = (formulaId: string, inputKey: string, val: string) => {
    const num = parseFloat(val);
    setInputValues((prev) => ({
      ...prev,
      [formulaId]: {
        ...(prev[formulaId] || {}),
        [inputKey]: isNaN(num) ? 0 : num,
      },
    }));
  };

  const filteredFormulas = FORMULA_LIBRARY.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formulaLaTeX.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyResult = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied formula result to clipboard');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleInsertExpr = (expr: string, name: string) => {
    if (onInsertExpression) {
      onInsertExpression(expr);
      toast.success(`Inserted formula expression for "${name}" into calculator`);
      onOpenChange(false);
    }
  };

  const handleInsertRes = (val: number, name: string) => {
    if (onInsertResult) {
      onInsertResult(String(val));
      toast.success(`Inserted result (${val}) for "${name}" into calculator`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-[calc(100%-2rem)] md:max-w-3xl max-h-[88vh] overflow-y-auto p-4 sm:p-6 w-full ${themeClasses.dialog}`}
        style={customThemeStyle}
      >
        <DialogHeader className={`pb-3 border-b ${themeClasses.header}`}>
          <div className="flex items-center gap-2">
            <BookOpen className={`w-5 h-5 ${themeClasses.accentText}`} />
            <DialogTitle className={`text-lg md:text-xl font-bold ${themeClasses.headingText}`}>
              Visual Formula Cheat Sheet
            </DialogTitle>
          </div>
          <DialogDescription className={`text-xs ${themeClasses.mutedText}`}>
            Explore standard math, geometry, finance, and physics formulas with live parameter calculations.
          </DialogDescription>
        </DialogHeader>

        {/* Controls: Search and Category Pills */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${themeClasses.mutedText}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas (e.g. circle, quadratic, interest, energy)..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-current ${themeClasses.search}`}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Formulas' },
              { id: 'geometry', label: 'Geometry' },
              { id: 'algebra', label: 'Algebra' },
              { id: 'finance', label: 'Finance' },
              { id: 'physics', label: 'Physics' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? themeClasses.categoryActive
                    : themeClasses.categoryInactive
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formula Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {filteredFormulas.map((f) => {
            const vals = inputValues[f.id] || {};
            const calc = f.calculate(vals);

            return (
              <div
                key={f.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 shadow-xs transition-all ${themeClasses.card}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-xs font-bold ${themeClasses.headingText}`}>{f.name}</h4>
                      <p className={`text-[11px] leading-snug line-clamp-2 ${themeClasses.mutedText}`}>
                        {f.description}
                      </p>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md font-mono border shrink-0 ${themeClasses.badge}`}>
                      {f.category}
                    </span>
                  </div>

                  {/* Formula LaTeX / Mathematical Display */}
                  <div className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center justify-between ${themeClasses.formulaBox}`}>
                    <span>{f.formulaLaTeX}</span>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {f.inputs.map((inp) => (
                    <div key={inp.key} className="space-y-0.5">
                      <label className={`text-[10px] font-medium flex items-center justify-between ${themeClasses.mutedText}`}>
                        <span>{inp.label}</span>
                        {inp.unit && <span className="text-[9px] opacity-70">({inp.unit})</span>}
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={vals[inp.key] !== undefined ? vals[inp.key] : inp.defaultValue}
                        onChange={(e) => handleInputChange(f.id, inp.key, e.target.value)}
                        className={`w-full px-2 py-1 text-xs rounded border font-mono focus:outline-none focus:ring-1 focus:ring-current ${themeClasses.input}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Live Computed Result */}
                <div className={`pt-1 border-t space-y-2 ${themeClasses.header}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`text-[11px] font-medium ${themeClasses.mutedText}`}>Result:</span>
                    <span className={`font-mono font-bold text-xs ${themeClasses.accentText}`}>
                      {calc.formattedResult}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleCopyResult(f.id, String(calc.result))}
                      className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${themeClasses.buttonSecondary}`}
                      title="Copy result"
                    >
                      {copiedId === f.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {onInsertExpression && (
                      <button
                        type="button"
                        onClick={() => handleInsertExpr(calc.expression, f.name)}
                        className={`flex-1 py-1 px-2 rounded-md border text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer ${themeClasses.buttonSecondary}`}
                      >
                        <Layers className={`w-3 h-3 ${themeClasses.accentText}`} />
                        <span>Insert Formula</span>
                      </button>
                    )}
                    {onInsertResult && (
                      <button
                        type="button"
                        onClick={() => handleInsertRes(calc.result, f.name)}
                        className={`flex-1 py-1 px-2 rounded-md text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs ${themeClasses.buttonPrimary}`}
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Insert Result</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
