import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sliders,
  Check,
  ChevronRight,
  Palette,
  Eye,
  Sparkles,
  Copy,
  Keyboard,
  Pin,
  Type,
  Cog,
  Square,
  Pipette,
  Sun,
  Moon,
  SlidersHorizontal,
  Zap,
  Smartphone,
  Vibrate,
  Tablet,
  Columns,
  Maximize2,
  PartyPopper,
  Dices,
  Trophy,
  Flame,
  RotateCcw,
  Music,
  Coins,
  Monitor,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { UserStatisticsTab } from './UserStatisticsTab';
import { soundFX, type SoundProfile } from '@/lib/audio';
import { fireCelebratoryParticles, fireCloverConfetti, type ParticleStyle } from '@/lib/confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { THEMES, hexToHsl, hslToHex } from '@/lib/themes';
import {
  DEFAULT_KEY_HOTKEYS,
  type CalculatorSettings,
  type NotationMode,
  type CalcMode,
  type CalculatorFontStyle,
  type KeypadFontWeight,
  type ProgrammableKeyId,
  type CornerRadiusPreset,
  type CustomThemeConfig,
  type CalculatorTheme,
} from '@/types/calculator';
import { toast } from 'sonner';
import dockalcLogo from '@/assets/Dockalc_Icon.png';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CalculatorSettings;
  onUpdateSettings: (partial: Partial<CalculatorSettings>) => void;
  mode?: CalcMode;
  onSetMode?: (mode: CalcMode) => void;
  onOpenCustomModal?: () => void;
  onOpenProgrammableModal?: (keyId: ProgrammableKeyId) => void;
  onOpenShortcuts?: () => void;
  onOpenGadgets?: () => void;
  onOpenMilestones?: () => void;
  currentWindowSize?: { width: number; height: number } | null;
  onResetWindowSize?: () => void;
  isPhone?: boolean;
  theme?: CalculatorTheme;
  customThemeStyle?: React.CSSProperties;
}

export type SettingsCategory = 'functions' | 'theme' | 'style' | 'programmable' | 'audio' | 'stats';

interface CategoryTabItem {
  id: SettingsCategory;
  label: string;
  badge: string;
  icon: React.ElementType;
  description: string;
}

const SETTINGS_CATEGORIES: CategoryTabItem[] = [
  {
    id: 'functions',
    label: 'Functions',
    badge: 'Core',
    icon: Sliders,
    description: 'Mode switching, math precision, notation style, RPN & window behavior',
  },
  {
    id: 'theme',
    label: 'Themes',
    badge: 'Colors',
    icon: Palette,
    description: 'Color themes, dark/light contrast & interactive custom color studio',
  },
  {
    id: 'style',
    label: 'Style',
    badge: 'Visuals',
    icon: Type,
    description: 'Corner radius curvature, typography fonts, keypad weight & app scale',
  },
  {
    id: 'programmable',
    label: 'Keys',
    badge: 'Hotkeys',
    icon: Zap,
    description: 'Programmable buttons (1/x, x², √, M), hotkey triggers & shortcuts',
  },
  {
    id: 'audio',
    label: 'Audio',
    badge: 'Sound',
    icon: Volume2,
    description: 'Mechanical keypress synthesizer audio feedback & volume controls',
  },
  {
    id: 'stats',
    label: 'Statistics',
    badge: 'Analytics',
    icon: BarChart3,
    description: 'Comprehensive system usage statistics, mode analytics, arithmetic history & milestone progress',
  },
];

const GoldCoinJackpotIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 inline-block drop-shadow-xs" fill="none">
    <circle cx="12" cy="12" r="10" fill="url(#goldCoinJackpotGrad)" stroke="#B45309" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="7.5" stroke="#FEF08A" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    <text x="12" y="15.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#78350F" fontFamily="system-ui, -apple-system, sans-serif">$</text>
    <defs>
      <linearGradient id="goldCoinJackpotGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="35%" stopColor="#EAB308" />
        <stop offset="75%" stopColor="#CA8A04" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
    </defs>
  </svg>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  mode,
  onSetMode,
  onOpenCustomModal,
  onOpenProgrammableModal,
  onOpenShortcuts,
  onOpenGadgets,
  onOpenMilestones,
  currentWindowSize,
  onResetWindowSize,
  isPhone,
  theme,
  customThemeStyle,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('functions');

  // 3-Stage Milestone Badge Reset State:
  // Step 1: Initial "Reset Badges" action button
  // Step 2: "Are you sure?" confirmation with Cancel
  // Step 3: 5-Second Continuous Press-and-Hold with visual progress & Cancel
  const [badgeResetStage, setBadgeResetStage] = useState<1 | 2 | 3>(1);
  const [badgeHoldProgress, setBadgeHoldProgress] = useState(0);
  const badgeResetTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const badgeHoldTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const badgeHoldStartTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (badgeResetTimeoutRef.current) clearTimeout(badgeResetTimeoutRef.current);
      if (badgeHoldTimerRef.current) clearInterval(badgeHoldTimerRef.current);
    };
  }, []);

  // Step 1 -> Step 2
  const handleBadgeResetInit = () => {
    if (badgeResetTimeoutRef.current) clearTimeout(badgeResetTimeoutRef.current);
    setBadgeResetStage(2);
    setBadgeHoldProgress(0);
    // Auto-revert back to Step 1 after 12 seconds if idle
    badgeResetTimeoutRef.current = setTimeout(() => {
      setBadgeResetStage(1);
      setBadgeHoldProgress(0);
    }, 12000);
  };

  // Step 2 -> Step 3
  const handleBadgeResetConfirmSure = () => {
    if (badgeResetTimeoutRef.current) clearTimeout(badgeResetTimeoutRef.current);
    setBadgeResetStage(3);
    setBadgeHoldProgress(0);
    // Auto-revert back to Step 1 after 15 seconds if idle
    badgeResetTimeoutRef.current = setTimeout(() => {
      setBadgeResetStage(1);
      setBadgeHoldProgress(0);
    }, 15000);
  };

  // Cancel action from Step 2 or Step 3 back to Step 1
  const handleBadgeResetCancel = () => {
    if (badgeResetTimeoutRef.current) clearTimeout(badgeResetTimeoutRef.current);
    if (badgeHoldTimerRef.current) {
      clearInterval(badgeHoldTimerRef.current);
      badgeHoldTimerRef.current = null;
    }
    badgeHoldStartTimeRef.current = null;
    setBadgeResetStage(1);
    setBadgeHoldProgress(0);
  };

  // Step 3: Start 5-second continuous press-and-hold
  const startBadgeHolding = () => {
    if (badgeResetStage !== 3) return;
    if (badgeHoldTimerRef.current) clearInterval(badgeHoldTimerRef.current);
    if (badgeResetTimeoutRef.current) clearTimeout(badgeResetTimeoutRef.current);

    const startTime = Date.now();
    badgeHoldStartTimeRef.current = startTime;
    const duration = 5000; // 5 continuous seconds

    badgeHoldTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setBadgeHoldProgress(progress);

      if (progress >= 100) {
        if (badgeHoldTimerRef.current) {
          clearInterval(badgeHoldTimerRef.current);
          badgeHoldTimerRef.current = null;
        }
        badgeHoldStartTimeRef.current = null;
        onUpdateSettings({
          unlockedAchievements: [],
          achievementUnlockedAt: {},
        });
        try {
          localStorage.removeItem('dockcalc_unlocked_achievements');
          localStorage.removeItem('dockcalc_achievement_timestamps');
          localStorage.removeItem('dockcalc_calc_13_count');
        } catch {
          // ignore
        }
        setBadgeResetStage(1);
        setBadgeHoldProgress(0);
        toast.success('All milestone badges have been reset to locked state.');
      }
    }, 40);
  };

  // Step 3: Cancel/Release before 5 seconds
  const cancelBadgeHolding = () => {
    if (badgeResetStage === 3) {
      if (badgeHoldTimerRef.current) {
        clearInterval(badgeHoldTimerRef.current);
        badgeHoldTimerRef.current = null;
      }

      // If held for more than 400ms before releasing, give helpful hint
      if (badgeHoldStartTimeRef.current) {
        const heldDuration = Date.now() - badgeHoldStartTimeRef.current;
        if (heldDuration > 400 && badgeHoldProgress < 100) {
          toast.info('Hold for the full 5 seconds to reset milestones.');
        }
      }
      badgeHoldStartTimeRef.current = null;
      setBadgeHoldProgress(0);

      // Reset auto-revert timeout
      if (badgeResetTimeoutRef.current) clearTimeout(badgeResetTimeoutRef.current);
      badgeResetTimeoutRef.current = setTimeout(() => {
        setBadgeResetStage(1);
        setBadgeHoldProgress(0);
      }, 12000);
    }
  };

  // Dynamic Theme Styling: Adapt SettingsModal container, header, tabs, cards, and controls to active theme
  const isCustom = theme?.id === 'custom';
  const isNordic = theme?.id === 'nordic-light';
  const isSolar = theme?.id === 'solar-amber';
  const isCyber = theme?.id === 'cyber-emerald';
  const isRetroMac = theme?.id === 'retro-mac';
  const isTerracotta = theme?.id === 'warm-terracotta';

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
      ? 'bg-[var(--theme-card,#1c1e22)]/95 border-[var(--theme-border,#2d3139)]'
      : isNordic
      ? 'bg-[#F8FAFC]/95 border-[#CBD5E1]'
      : isSolar
      ? 'bg-[#1D170E]/95 border-[#423321]'
      : isCyber
      ? 'bg-[#112320]/95 border-[#1A3832]'
      : isRetroMac
      ? 'bg-[#E5E5E5]/95 border-[#999999]'
      : isTerracotta
      ? 'bg-[#251D1A]/95 border-[#453631]'
      : 'bg-[#222226]/95 border-[#333338]',

    tabBar: isCustom
      ? 'bg-[var(--theme-display-bg,#0e1012)] border-[var(--theme-border,#2d3139)]'
      : isNordic
      ? 'bg-[#F1F5F9] border-[#CBD5E1]'
      : isSolar
      ? 'bg-[#241C12] border-[#423321]'
      : isCyber
      ? 'bg-[#0E1C19] border-[#1A3832]'
      : isRetroMac
      ? 'bg-[#C8C8C8] border-[#999999]'
      : isTerracotta
      ? 'bg-[#1A1412] border-[#453631]'
      : 'bg-[#19191C] border-[#2E2E34]',

    tabActive: isCustom
      ? 'bg-[var(--theme-card,#1c1e22)] text-[var(--theme-display-text,#f4f4f5)] border-[var(--theme-border,#2d3139)] shadow-xs font-bold'
      : isNordic
      ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1] shadow-xs font-bold'
      : isSolar
      ? 'bg-[#2C2216] text-[#FEF3C7] border-[#523F27] shadow-xs font-bold'
      : isCyber
      ? 'bg-[#142B27] text-[#E6FFFA] border-[#204941] shadow-xs font-bold'
      : isRetroMac
      ? 'bg-[#F0F0F0] text-[#111111] border-[#888888] shadow-xs font-bold'
      : isTerracotta
      ? 'bg-[#352520] text-[#FED7AA] border-[#EA580C] shadow-xs font-bold'
      : 'bg-[#27272A] text-[#F4F4F5] border-[#3F3F46] shadow-xs font-bold',

    tabInactive: isCustom
      ? 'text-[var(--theme-display-dim,#a1a1aa)] hover:text-[var(--theme-display-text,#f4f4f5)] hover:bg-[var(--theme-key-fn,#1a1d22)]'
      : isNordic
      ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
      : isSolar
      ? 'text-[#D97706]/75 hover:text-[#FEF3C7] hover:bg-[#2C2216]'
      : isCyber
      ? 'text-[#10B981]/70 hover:text-[#E6FFFA] hover:bg-[#142B27]'
      : isRetroMac
      ? 'text-[#555555] hover:text-[#111111] hover:bg-[#DDDDDD]'
      : isTerracotta
      ? 'text-[#A88277] hover:text-[#FED7AA] hover:bg-[#251D1A]'
      : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A]',

    card: isCustom
      ? 'bg-[var(--theme-card,#1c1e22)] border-[var(--theme-border,#2d3139)] text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
      : isSolar
      ? 'bg-[#1D170E] border-[#423321] text-[#FEF3C7]'
      : isCyber
      ? 'bg-[#112320] border-[#1A3832] text-[#E6FFFA]'
      : isRetroMac
      ? 'bg-[#E5E5E5] border-[#999999] text-[#111111]'
      : isTerracotta
      ? 'bg-[#251D1A] border-[#453631] text-[#FED7AA]'
      : 'bg-[#222226] border-[#333338] text-[#F4F4F5]',

    subCard: isCustom
      ? 'bg-[var(--theme-display-bg,#0e1012)] border-[var(--theme-border,#2d3139)]'
      : isNordic
      ? 'bg-[#FFFFFF] border-[#CBD5E1]'
      : isSolar
      ? 'bg-[#100C07] border-[#423321]'
      : isCyber
      ? 'bg-[#08100E] border-[#1A3832]'
      : isRetroMac
      ? 'bg-[#DCDCDC] border-[#999999]'
      : isTerracotta
      ? 'bg-[#1A1412] border-[#453631]'
      : 'bg-[#19191C] border-[#2E2E34]',

    input: isCustom
      ? 'bg-[var(--theme-display-bg,#0e1012)] border-[var(--theme-display-border,#242830)] text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
      : isSolar
      ? 'bg-[#100C07] border-[#523F27] text-[#FEF3C7]'
      : isCyber
      ? 'bg-[#08100E] border-[#204941] text-[#E6FFFA]'
      : isRetroMac
      ? 'bg-[#FFFFFF] border-[#999999] text-[#111111]'
      : isTerracotta
      ? 'bg-[#1A1412] border-[#453631] text-[#FED7AA]'
      : 'bg-[#19191C] border-[#2E2E34] text-[#F4F4F5]',

    heading: isCustom
      ? 'text-[var(--theme-display-text,#f4f4f5)] font-bold'
      : isNordic
      ? 'text-[#0F172A] font-bold'
      : isSolar
      ? 'text-[#FEF3C7] font-bold'
      : isCyber
      ? 'text-[#E6FFFA] font-bold'
      : isRetroMac
      ? 'text-[#111111] font-bold'
      : isTerracotta
      ? 'text-[#FED7AA] font-bold'
      : 'text-[#F4F4F5] font-bold',

    accent: isCustom
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
      : 'text-[#3B82F6]',

    muted: isCustom
      ? 'text-[var(--theme-display-dim,#a1a1aa)]'
      : isNordic
      ? 'text-[#334155] font-medium'
      : isSolar
      ? 'text-[#D97706]/80'
      : isCyber
      ? 'text-[#10B981]/70'
      : isRetroMac
      ? 'text-[#444444]'
      : isTerracotta
      ? 'text-[#A88277]'
      : 'text-muted-foreground',

    border: isCustom
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
      : 'border-[#333338]',
  };

  const activeCategoryInfo =
    SETTINGS_CATEGORIES.find((c) => c.id === activeCategory) || SETTINGS_CATEGORIES[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={customThemeStyle}
        className={`w-[calc(100%-1.5rem)] sm:max-w-2xl max-h-[90dvh] flex flex-col rounded-2xl p-0 overflow-hidden border ${!isNordic && !isRetroMac ? 'dark' : ''} ${themeClasses.dialog}`}
      >
        {/* Sticky Header with Title and Category Nav Tabs */}
        <div className={`shrink-0 backdrop-blur-sm border-b px-3.5 sm:px-5 pt-3.5 sm:pt-4 pb-3 sm:pb-3.5 ${themeClasses.header}`}>
          <DialogHeader className="pb-2.5 sm:pb-3 text-left space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2.5 pr-8">
              <div className="flex items-center min-w-0">
                <DialogTitle className={`flex items-center gap-2 text-base font-bold leading-normal ${themeClasses.heading}`}>
                  <img
                    src={dockalcLogo}
                    alt="Dockalc Logo"
                    className="w-5 h-5 rounded-md object-contain shrink-0"
                  />
                  <span className="truncate text-sm sm:text-base">Dockcalc Settings</span>
                </DialogTitle>
              </div>

              {/* Buy Me a Coffee Support Button */}
              <a
                href="https://buymeacoffee.com/dockalc"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                title="Support Dockalc on Buy Me a Coffee"
                aria-label="Buy me a coffee"
              >
                <img
                  src="./yellow-button.png"
                  alt="Buy me a coffee"
                  className="h-7 sm:h-8 w-auto max-w-[130px] sm:max-w-[150px] object-contain drop-shadow-xs rounded-md"
                />
              </a>
            </div>
            <DialogDescription className={`text-xs mt-1 block leading-normal pr-4 ${themeClasses.muted}`}>
              {activeCategoryInfo.description}
            </DialogDescription>
          </DialogHeader>

          {/* Category Tabs Bar - Full words visible with zero truncation or ellipsis */}
          <div className={`flex items-center justify-between gap-1 sm:gap-1.5 p-1 rounded-xl border w-full max-w-full overflow-x-auto scrollbar-none ${themeClasses.tabBar}`}>
            {SETTINGS_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive ? themeClasses.tabActive : themeClasses.tabInactive
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? themeClasses.accent : themeClasses.muted}`} />
                  <span className="whitespace-nowrap select-none">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 space-y-4 text-xs">
          {/* ========================================================= */}
          {/* CATEGORY 1: CALCULATOR FUNCTIONS & BEHAVIOR               */}
          {/* ========================================================= */}
          {activeCategory === 'functions' && (
            <div className="space-y-4">
              {/* Calculator Mode Switcher */}
              {mode && onSetMode && (
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                    <Sliders className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                    <span>Calculator Mode</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'standard', name: 'Standard', desc: 'Basic math & memory' },
                      { id: 'scientific', name: 'Scientific', desc: 'Trig, powers & logs' },
                      { id: 'programmer', name: 'Programmer', desc: 'HEX/DEC/BIN bitwise' },
                      { id: 'convert', name: 'Convert', desc: 'Units & currency' },
                      { id: 'finance', name: 'Finance', desc: 'Loans, interest & tax' },
                    ].map((m) => {
                      const isActive = mode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            onSetMode(m.id as CalcMode);
                            toast.success(`Switched to ${m.name} Mode`);
                          }}
                          className={`flex flex-col p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                            isActive
                              ? `border-primary ring-2 ring-primary/30 font-semibold ${themeClasses.card}`
                              : `border-border/60 hover:border-primary/50 ${themeClasses.subCard}`
                          }`}
                        >
                          <span className={`text-xs font-bold ${isActive ? themeClasses.accent : themeClasses.heading}`}>{m.name}</span>
                          <span className={`text-[10px] ${themeClasses.muted} mt-0.5`}>{m.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Math & Precision Options */}
              <div className={`p-3.5 rounded-xl border space-y-3 ${themeClasses.card}`}>
                <div className={`text-xs font-bold ${themeClasses.heading}`}>Math Precision & Evaluation</div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xs font-semibold ${themeClasses.heading}`}>Decimal Precision</div>
                    <div className={`text-[11px] ${themeClasses.muted}`}>
                      Digits displayed for floating-point calculations
                    </div>
                  </div>
                  <select
                    value={settings.decimalPlaces}
                    onChange={(e) => onUpdateSettings({ decimalPlaces: parseInt(e.target.value, 10) })}
                    className={`px-2.5 py-1 rounded-md border text-xs cursor-pointer font-medium ${themeClasses.input}`}
                  >
                    <option value={-1}>Auto</option>
                    <option value={4}>4 Decimals</option>
                    <option value={8}>8 Decimals (Default)</option>
                    <option value={12}>12 Decimals</option>
                    <option value={16}>16 Decimals (High)</option>
                  </select>
                </div>

                <div className={`flex items-center justify-between pt-2 border-t ${themeClasses.border}`}>
                  <div>
                    <div className={`text-xs font-semibold ${themeClasses.heading}`}>Notation Style</div>
                    <div className={`text-[11px] ${themeClasses.muted}`}>Format for extreme numerical values</div>
                  </div>
                  <select
                    value={settings.notation}
                    onChange={(e) => onUpdateSettings({ notation: e.target.value as NotationMode })}
                    className={`px-2.5 py-1 rounded-md border text-xs cursor-pointer font-medium ${themeClasses.input}`}
                  >
                    <option value="normal">Standard</option>
                    <option value="scientific">Scientific (e+N)</option>
                    <option value="engineering">Engineering</option>
                  </select>
                </div>

                <div className={`flex items-center justify-between pt-2 border-t ${themeClasses.border}`}>
                  <div>
                    <div className={`text-xs font-semibold ${themeClasses.heading}`}>RPN Mode (Reverse Polish)</div>
                    <div className={`text-[11px] ${themeClasses.muted}`}>Stack-based postfix evaluation</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.rpnMode}
                    onChange={(e) => onUpdateSettings({ rpnMode: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className={`flex items-center justify-between pt-2 border-t ${themeClasses.border}`}>
                  <div>
                    <div className={`text-xs font-semibold ${themeClasses.heading}`}>Memory Register Row</div>
                    <div className={`text-[11px] ${themeClasses.muted}`}>Display MC, MR, M+, M-, MS buttons</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showMemoryBar}
                    onChange={(e) => onUpdateSettings({ showMemoryBar: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className={`flex items-center justify-between pt-2 border-t ${themeClasses.border}`}>
                  <div>
                    <div className={`text-xs font-semibold ${themeClasses.heading}`}>Accountant Paper Tape (Desktop)</div>
                    <div className={`text-[11px] ${themeClasses.muted}`}>
                      Enable audit roll paper tape view with line annotations and export
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showPaperTape !== false}
                    onChange={(e) => onUpdateSettings({ showPaperTape: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                <div className={`flex items-center justify-between pt-2 border-t ${themeClasses.border}`}>
                  <div>
                    <div className={`text-xs font-semibold ${themeClasses.heading}`}>Equation Bar</div>
                    <div className={`text-[11px] ${themeClasses.muted}`}>Show running equation bar on calculator display</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showEquationBar !== false}
                    onChange={(e) => onUpdateSettings({ showEquationBar: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                {settings.showEquationBar !== false && (
                  <div className={`flex items-center justify-between pt-2 border-t ${themeClasses.border} pl-3`}>
                    <div>
                      <div className={`text-xs font-semibold ${themeClasses.heading}`}>Equation Bar Placement</div>
                      <div className={`text-[11px] ${themeClasses.muted}`}>Position at top or bottom of display</div>
                    </div>
                    <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${themeClasses.subCard}`}>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ equationBarPosition: 'top' })}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          settings.equationBarPosition === 'top'
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : `${themeClasses.muted} hover:text-foreground`
                        }`}
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ equationBarPosition: 'bottom' })}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          (settings.equationBarPosition || 'bottom') === 'bottom'
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : `${themeClasses.muted} hover:text-foreground`
                        }`}
                      >
                        Bottom
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Window Layering & Desktop Controls (Desktop / Tablet only) */}
              {!isPhone && (
                <>
                  <div className={`p-3.5 rounded-xl border space-y-3 ${themeClasses.card}`}>
                    <div className={`text-xs font-bold flex items-center gap-1.5 ${themeClasses.heading}`}>
                      <Pin className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                      <span>Window Layering & Visibility</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-xs font-semibold ${themeClasses.heading}`}>Always on Top</div>
                        <div className={`text-[11px] ${themeClasses.muted}`}>
                          Keep calculator floating above background applications
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ alwaysOnTop: !settings.alwaysOnTop })}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          settings.alwaysOnTop
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : `${themeClasses.input} hover:text-foreground`
                        }`}
                      >
                        {settings.alwaysOnTop ? 'Pinned' : 'Normal'}
                      </button>
                    </div>

                    <div className={`flex items-center justify-between pt-2 border-t ${themeClasses.border}`}>
                      <div>
                        <div className={`text-xs font-semibold ${themeClasses.heading}`}>Compact Mode</div>
                        <div className={`text-[11px] ${themeClasses.muted}`}>
                          Minimalist layout for side-by-side desktop multitasking
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.compactOverlay === true}
                        onChange={(e) => onUpdateSettings({ compactOverlay: e.target.checked })}
                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                      />
                    </div>

                    <div className={`flex items-center justify-between pt-2 border-t ${themeClasses.border}`}>
                      <div>
                        <div className={`text-xs font-semibold ${themeClasses.heading}`}>
                          Window Opacity ({Math.round((settings.windowOpacity ?? 1) * 100)}%)
                        </div>
                        <div className={`text-[11px] ${themeClasses.muted}`}>
                          Peek at text, spreadsheets, or code behind calculator
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1"
                        step="0.05"
                        value={settings.windowOpacity ?? 1}
                        onChange={(e) => onUpdateSettings({ windowOpacity: parseFloat(e.target.value) })}
                        className="w-28 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Dedicated Custom Window Sizing & Boundaries */}
                  <div className={`p-3.5 rounded-xl border space-y-3 ${themeClasses.card}`}>
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${themeClasses.heading}`}>
                        <Maximize2 className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                        <span>Default Window Dimensions & Limits</span>
                      </div>
                      {(settings.defaultWindowWidth || settings.defaultWindowHeight) && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSettings({ defaultWindowWidth: undefined, defaultWindowHeight: undefined });
                            toast.info('Default dimensions reset to automatic scaling');
                          }}
                          className="text-[10px] text-destructive hover:underline cursor-pointer"
                        >
                          Reset Custom
                        </button>
                      )}
                    </div>

                    <p className={`text-[11px] ${themeClasses.muted} leading-relaxed`}>
                      Fine-tune your preferred window width and height. Strict safety minimum limits (360px+ width, 600px+ height) are continuously enforced so keys and numbers never overlap or clash.
                    </p>

                    {/* Width & Height Number Inputs */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="flex flex-col gap-1">
                        <label className={`text-[11px] font-semibold ${themeClasses.heading}`}>
                          Width (px, min 360)
                        </label>
                        <input
                          type="number"
                          min={360}
                          max={1400}
                          step={10}
                          placeholder="Default (375-760)"
                          value={settings.defaultWindowWidth || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onUpdateSettings({ defaultWindowWidth: isNaN(val) ? undefined : Math.max(val, 360) });
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono ${themeClasses.input}`}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className={`text-[11px] font-semibold ${themeClasses.heading}`}>
                          Height (px, min 600)
                        </label>
                        <input
                          type="number"
                          min={600}
                          max={1200}
                          step={10}
                          placeholder="Default (600-720)"
                          value={settings.defaultWindowHeight || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onUpdateSettings({ defaultWindowHeight: isNaN(val) ? undefined : Math.max(val, 600) });
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono ${themeClasses.input}`}
                        />
                      </div>
                    </div>

                    {/* Current Window Capture Button */}
                    {currentWindowSize && (
                      <div className={`pt-1 flex items-center justify-between border rounded-lg p-2 ${themeClasses.subCard} ${themeClasses.border}`}>
                        <div className="text-[11px]">
                          <span className={`font-semibold ${themeClasses.accent}`}>Current Live Window:</span>{' '}
                          <span className={`font-mono ${themeClasses.heading}`}>{currentWindowSize.width} × {currentWindowSize.height} px</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSettings({
                              defaultWindowWidth: Math.max(currentWindowSize.width, 360),
                              defaultWindowHeight: Math.max(currentWindowSize.height, 600),
                            });
                            toast.success(`Saved ${currentWindowSize.width} × ${currentWindowSize.height} as default!`);
                          }}
                          className="px-2 py-1 rounded-md bg-primary text-primary-foreground font-semibold text-[11px] shadow-xs cursor-pointer hover:bg-primary/90"
                        >
                          Save As Default
                        </button>
                      </div>
                    )}

                    {/* Quick Presets */}
                    <div className={`pt-2 border-t ${themeClasses.border} space-y-1.5`}>
                      <div className={`text-[11px] font-semibold ${themeClasses.heading}`}>Dimension Presets</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { label: 'Compact', w: 360, h: 600 },
                          { label: 'Balanced', w: 380, h: 620 },
                          { label: 'Spacious', w: 420, h: 660 },
                          { label: 'Side-by-Side', w: 760, h: 640 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              onUpdateSettings({ defaultWindowWidth: preset.w, defaultWindowHeight: preset.h });
                              if (onResetWindowSize) onResetWindowSize();
                              toast.success(`Applied ${preset.label} preset: ${preset.w} × ${preset.h}px`);
                            }}
                            className={`px-2 py-1.5 rounded-lg border text-left flex flex-col cursor-pointer transition-all ${
                              settings.defaultWindowWidth === preset.w && settings.defaultWindowHeight === preset.h
                                ? `border-current ring-2 ring-current/30 font-bold shadow-xs ${themeClasses.card} ${themeClasses.accent}`
                                : `border-border/60 hover:border-current/40 ${themeClasses.subCard} text-foreground`
                            }`}
                          >
                            <span className={`text-xs font-semibold ${settings.defaultWindowWidth === preset.w && settings.defaultWindowHeight === preset.h ? themeClasses.accent : themeClasses.heading}`}>{preset.label}</span>
                            <span className={`text-[10px] ${themeClasses.muted} font-mono`}>{preset.w}×{preset.h}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* CATEGORY 2: THEMES & COLORS                               */}
          {/* ========================================================= */}
          {activeCategory === 'theme' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                    <Palette className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                    <span>Color Palette Presets</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {THEMES.map((t) => {
                    const isActive = settings.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ theme: t.id });
                          toast.success(`Theme changed to ${t.name}`);
                        }}
                        className={`flex items-start justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                          isActive
                            ? `border-current ring-2 ring-current/30 font-semibold shadow-xs ${themeClasses.card} ${themeClasses.accent}`
                            : `border-border/60 hover:border-current/40 ${themeClasses.subCard}`
                        }`}
                      >
                        <div className="flex flex-col min-w-0 flex-1 pr-1.5">
                          <span className={`text-xs font-bold leading-snug ${isActive ? themeClasses.accent : themeClasses.heading}`}>{t.name}</span>
                          <span className={`text-[10px] sm:text-[10.5px] ${themeClasses.muted} leading-relaxed break-words whitespace-normal text-pretty mt-0.5`}>
                            {t.description}
                          </span>
                        </div>
                        {isActive && <Check className={`w-4 h-4 ${themeClasses.accent} shrink-0 ml-1.5 mt-0.5`} />}
                      </button>
                    );
                  })}

                  {/* 6th Slot: Custom Theme Card */}
                  {(() => {
                    const isCustomTheme = settings.theme === 'custom';
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ theme: 'custom' });
                          toast.success('Custom Theme activated');
                        }}
                        className={`flex items-start justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                          isCustomTheme
                            ? `border-current ring-2 ring-current/30 font-semibold shadow-xs ${themeClasses.card} ${themeClasses.accent}`
                            : `border-border/60 hover:border-current/40 ${themeClasses.subCard}`
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0 flex-1 pr-1.5">
                          <div
                            className="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-xs mt-0.5"
                            style={{
                              background:
                                'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                            }}
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-xs font-bold leading-snug ${isCustomTheme ? themeClasses.accent : themeClasses.heading}`}>Custom Theme</span>
                            <span className={`text-[10px] sm:text-[10.5px] ${themeClasses.muted} leading-relaxed break-words whitespace-normal text-pretty mt-0.5`}>
                              Interactive color studio, custom lightness & dynamic hue builder
                            </span>
                          </div>
                        </div>
                        {isCustomTheme && <Check className={`w-4 h-4 ${themeClasses.accent} shrink-0 ml-1.5 mt-0.5`} />}
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Custom Theme Studio */}
              {settings.theme === 'custom' && (() => {
                const customCfg = settings.customTheme || {
                  hue: 217,
                  saturation: 90,
                  lightness: 60,
                  opacity: 0.95,
                  mode: 'dark',
                  hexColor: '#3B82F6',
                };
                const currentHex =
                  customCfg.hexColor || hslToHex(customCfg.hue, customCfg.saturation, customCfg.lightness);

                const updateCustom = (partial: Partial<CustomThemeConfig>) => {
                  const next: CustomThemeConfig = {
                    ...customCfg,
                    ...partial,
                  };
                  if (partial.hexColor && !partial.hue) {
                    const hsl = hexToHsl(partial.hexColor);
                    next.hue = hsl.h;
                    next.saturation = hsl.s;
                    next.lightness = hsl.l;
                  } else if (partial.hue !== undefined && !partial.hexColor) {
                    next.hexColor = hslToHex(next.hue, next.saturation, next.lightness);
                  }
                  onUpdateSettings({ customTheme: next });
                };

                return (
                  <div className="p-3.5 rounded-xl border border-primary/30 bg-card/80 space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                          style={{
                            background:
                              'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                          }}
                        />
                        <span className="text-xs font-semibold text-foreground">Custom Palette Studio</span>
                      </div>
                      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/50 text-[11px]">
                        <button
                          type="button"
                          onClick={() => updateCustom({ mode: 'dark' })}
                          className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-medium transition-all cursor-pointer ${
                            customCfg.mode !== 'light'
                              ? 'bg-card text-foreground font-semibold shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Moon className="w-3 h-3" />
                          <span>Dark</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCustom({ mode: 'light' })}
                          className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-medium transition-all cursor-pointer ${
                            customCfg.mode === 'light'
                              ? 'bg-card text-foreground font-semibold shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Sun className="w-3 h-3" />
                          <span>Light</span>
                        </button>
                      </div>
                    </div>

                    {/* Color Wheel & Swatches */}
                    <div className="flex items-center gap-3">
                      <label
                        className="relative w-11 h-11 rounded-full cursor-pointer shrink-0 border-2 border-white/30 shadow-md flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95 transition-all"
                        title="Click to open Color Wheel / Native Color Picker"
                        style={{
                          background:
                            'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                        }}
                      >
                        <input
                          type="color"
                          value={currentHex}
                          onChange={(e) => updateCustom({ hexColor: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div
                          className="w-5 h-5 rounded-full border border-black/40 shadow-inner"
                          style={{ backgroundColor: currentHex }}
                        />
                      </label>

                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Accent Hex</span>
                          <span className="font-mono text-xs font-bold text-foreground">{currentHex}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            '#3B82F6',
                            '#10B981',
                            '#8B5CF6',
                            '#F59E0B',
                            '#EC4899',
                            '#EF4444',
                            '#06B6D4',
                            '#F97316',
                          ].map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => updateCustom({ hexColor: hex })}
                              className={`w-5 h-5 rounded-full border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                                currentHex.toUpperCase() === hex.toUpperCase()
                                  ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                                  : ''
                              }`}
                              style={{ backgroundColor: hex }}
                              title={`Preset ${hex}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Hue Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                          <span>Hue Slider</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-foreground">{customCfg.hue}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={customCfg.hue}
                        onChange={(e) => updateCustom({ hue: parseInt(e.target.value, 10) })}
                        className="w-full h-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none"
                        style={{
                          background:
                            'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                        }}
                      />
                    </div>

                    {/* Opacity Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Pipette className="w-3.5 h-3.5 text-primary" />
                          <span>Opacity / Alpha Slider</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-foreground">
                          {Math.round((customCfg.opacity ?? 0.95) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={Math.round((customCfg.opacity ?? 0.95) * 100)}
                        onChange={(e) => updateCustom({ opacity: parseInt(e.target.value, 10) / 100 })}
                        className="w-full h-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none bg-gradient-to-r from-muted to-primary"
                      />
                    </div>

                    {/* Live Preview Swatch */}
                    <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Live Button Preview:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: currentHex, opacity: customCfg.opacity }}
                        >
                          = Key
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold border shadow-xs"
                          style={{
                            borderColor: currentHex,
                            color: currentHex,
                            backgroundColor: customCfg.mode === 'light' ? '#FFFFFF' : '#23262D',
                          }}
                        >
                          7 Key
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ========================================================= */}
              {/* SUB-CATEGORY: FUN EFFECTS & ADDONS                         */}
              {/* ========================================================= */}
              <div className={`p-3.5 rounded-xl border space-y-3.5 ${themeClasses.card}`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                    <PartyPopper className="w-4 h-4 text-amber-500" />
                    <span>Fun Effects & Add-ons</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isNordic
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    Playful Mode
                  </span>
                </div>

                <p className={`text-[11px] ${themeClasses.muted}`}>
                  Celebratory animations, confetti rewards, and sensory effects when calculating.
                </p>

                {/* Particle Cannons Celebration Master Toggle */}
                <div className={`p-3.5 rounded-xl border ${themeClasses.subCard} space-y-3`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className={`text-xs font-bold ${themeClasses.heading}`}>Celebratory Particle Cannons</span>
                      </div>
                      <p className={`text-[11px] ${themeClasses.muted}`}>
                        Shoot a celebratory burst of particles across the screen when calculating (= / Enter).
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fireCelebratoryParticles(settings.particleStyle || 'confetti', theme?.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                          isNordic
                            ? 'bg-primary/15 hover:bg-primary/25 text-primary border-primary/40'
                            : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'
                        }`}
                        title="Preview current particle effect"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Test Particles</span>
                      </button>
                      <input
                        type="checkbox"
                        checked={settings.confettiEnabled ?? false}
                        onChange={(e) => onUpdateSettings({ confettiEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Particle Style & Frequency Options */}
                  {settings.confettiEnabled && (
                    <div className={`pt-2 border-t ${themeClasses.border} space-y-3`}>
                      {/* Style Selector - 4 Options in a Single Row */}
                      <div className="space-y-1.5">
                        <div className={`text-[11px] font-bold ${themeClasses.heading}`}>Particle Cannon Style:</div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                          {[
                            { id: 'confetti', name: 'Confetti', icon: <span className="text-base">🎉</span>, desc: 'Ribbons' },
                            { id: 'fireworks', name: 'Fireworks', icon: <span className="text-base">🎆</span>, desc: 'Rockets' },
                            { id: 'coins', name: 'Gold Coins', icon: <GoldCoinJackpotIcon />, desc: 'Jackpot' },
                            { id: 'starlight', name: 'Starlight', icon: <span className="text-base">✨</span>, desc: 'Sparkles' },
                          ].map((st) => {
                            const isChosen = ((settings.particleStyle === 'math-runes' ? 'confetti' : (settings.particleStyle || 'confetti')) === st.id);
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  onUpdateSettings({ particleStyle: st.id as ParticleStyle });
                                  fireCelebratoryParticles(st.id as ParticleStyle, theme?.id);
                                }}
                                className={`p-1.5 sm:p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  isChosen
                                    ? isNordic
                                      ? 'border-primary bg-primary/15 text-[#0F172A] ring-2 ring-primary/40 shadow-xs'
                                      : 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/40'
                                    : isNordic
                                    ? 'border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#1E293B]'
                                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">{st.icon}</div>
                                  {isChosen && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />}
                                </div>
                                <div className={`text-[10px] sm:text-[11px] font-bold mt-1 leading-tight truncate ${isChosen ? (isNordic ? 'text-[#0F172A]' : 'text-foreground') : (isNordic ? 'text-[#0F172A]' : 'text-foreground/90')}`}>{st.name}</div>
                                <div className={`text-[9px] sm:text-[9.5px] truncate ${themeClasses.muted}`}>{st.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`text-[11px] font-bold pt-1 ${themeClasses.heading}`}>
                        Trigger Frequency:
                      </div>

                      <div className="space-y-2">
                        {/* Option 1: Every X times enter is pressed (Default: 5) */}
                        <label
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            !settings.confettiMode || settings.confettiMode === 'everyX' || settings.confettiMode === 'every10' || settings.confettiMode === 'every'
                              ? isNordic
                                ? 'border-primary bg-primary/10 font-bold text-[#0F172A] shadow-xs'
                                : 'border-primary/50 bg-primary/5 font-semibold text-foreground shadow-xs'
                              : isNordic
                              ? 'border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#1E293B]'
                              : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          <input
                            type="radio"
                            name="confettiMode"
                            checked={!settings.confettiMode || settings.confettiMode === 'everyX' || settings.confettiMode === 'every10' || settings.confettiMode === 'every'}
                            onChange={() => onUpdateSettings({ confettiMode: 'everyX' })}
                            className="mt-0.5 text-primary accent-primary cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={isNordic ? 'text-[#0F172A] font-bold' : 'text-foreground font-semibold'}>1. Every</span>
                              <input
                                type="number"
                                min="2"
                                max="999"
                                value={settings.confettiEveryX ?? 5}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const val = Math.max(2, parseInt(e.target.value) || 2);
                                  onUpdateSettings({ confettiEveryX: val, confettiMode: 'everyX' });
                                }}
                                className={`w-16 px-1.5 py-0.5 text-xs font-bold rounded-md border text-center ${
                                  isNordic ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1]' : 'border-border bg-background text-foreground'
                                }`}
                              />
                              <span className={isNordic ? 'text-[#0F172A] font-bold' : 'text-foreground font-semibold'}>times Enter / = is pressed</span>
                            </div>
                            <div className={`text-[10px] ${themeClasses.muted} font-normal mt-0.5`}>
                              Celebrates calculation milestones every {settings.confettiEveryX ?? 5} equal executions
                            </div>
                          </div>
                        </label>

                        {/* Option 2: Random interval */}
                        <label
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            settings.confettiMode === 'random'
                              ? isNordic
                                ? 'border-primary bg-primary/10 font-bold text-[#0F172A] shadow-xs'
                                : 'border-primary/50 bg-primary/5 font-semibold text-foreground shadow-xs'
                              : isNordic
                              ? 'border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#1E293B]'
                              : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          <input
                            type="radio"
                            name="confettiMode"
                            checked={settings.confettiMode === 'random'}
                            onChange={() => onUpdateSettings({ confettiMode: 'random' })}
                            className="mt-0.5 text-primary accent-primary cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className={isNordic ? 'text-[#0F172A] font-bold' : 'text-foreground font-semibold'}>2. At a random interval (between custom Min & Max)</div>
                            <div className={`text-[10px] ${themeClasses.muted} font-normal mb-2`}>
                              Unpredictable surprise celebrations within your designated press bounds
                            </div>

                            {settings.confettiMode === 'random' && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex flex-wrap items-center gap-3 pt-1"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[11px] ${themeClasses.muted}`}>Min presses:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max={settings.confettiRandomMax ?? 50}
                                    value={settings.confettiRandomMin ?? 5}
                                    onChange={(e) => {
                                      const val = Math.max(1, parseInt(e.target.value) || 1);
                                      onUpdateSettings({
                                        confettiRandomMin: val,
                                        confettiRandomMax: Math.max(val, settings.confettiRandomMax ?? 50),
                                      });
                                    }}
                                    className={`w-16 px-2 py-1 text-xs rounded-md border ${
                                      isNordic ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1]' : 'border-border bg-background text-foreground'
                                    }`}
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[11px] ${themeClasses.muted}`}>Max presses:</span>
                                  <input
                                    type="number"
                                    min={settings.confettiRandomMin ?? 5}
                                    max="500"
                                    value={settings.confettiRandomMax ?? 50}
                                    onChange={(e) => {
                                      const val = Math.max(
                                        settings.confettiRandomMin ?? 5,
                                        parseInt(e.target.value) || (settings.confettiRandomMin ?? 5)
                                      );
                                      onUpdateSettings({ confettiRandomMax: val });
                                    }}
                                    className={`w-16 px-2 py-1 text-xs rounded-md border ${
                                      isNordic ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1]' : 'border-border bg-background text-foreground'
                                    }`}
                                  />
                                </div>
                                <span className={`text-[10px] ${themeClasses.muted} italic`}>
                                  (Randomly fires between {settings.confettiRandomMin ?? 5} and {settings.confettiRandomMax ?? 50} presses)
                                </span>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nostalgic Easter Eggs & Number Magic (Category 3) */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span className={themeClasses.heading}>Nostalgic Easter Eggs & Number Magic</span>
                    <span className={`text-[10px] font-bold ${
                      isNordic ? 'text-[#0F172A]' : 'text-muted-foreground'
                    }`}>Mathematical wonders</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {/* 180° Upside Down Pocket Mode */}
                    <div className={`p-2.5 rounded-xl border ${themeClasses.subCard} flex items-center justify-between gap-2`}>
                      <div className="space-y-0.5">
                        <div className={`font-bold ${themeClasses.heading} flex items-center gap-1`}>
                          <RotateCcw className="w-3 h-3 text-amber-500" />
                          <span>Upside-Down Mode</span>
                        </div>
                        <div className={`text-[10px] ${themeClasses.muted} leading-tight`}>
                          180° orientation flip (school pocket calculator style)
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.upsideDownMode ?? false}
                        onChange={(e) => onUpdateSettings({ upsideDownMode: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                      />
                    </div>

                    {/* Hitchhiker 42 Banner */}
                    <div className={`p-2.5 rounded-xl border ${themeClasses.subCard} flex items-center justify-between gap-2`}>
                      <div className="space-y-0.5">
                        <div className={`font-bold ${themeClasses.heading} flex items-center gap-1`}>
                          <span>🌌</span>
                          <span>Hitchhiker’s 42</span>
                        </div>
                        <div className={`text-[10px] ${themeClasses.muted} leading-tight`}>
                          Cosmic easter egg toast when result evaluates to 42
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.hitchhiker42Enabled ?? true}
                        onChange={(e) => onUpdateSettings({ hitchhiker42Enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                      />
                    </div>

                    {/* Prime & Fibonacci Badges */}
                    <div className={`p-2.5 rounded-xl border ${themeClasses.subCard} flex items-center justify-between gap-2`}>
                      <div className="space-y-0.5">
                        <div className={`font-bold ${themeClasses.heading} flex items-center gap-1`}>
                          <span>💎</span>
                          <span>Prime & Fibonacci</span>
                        </div>
                        <div className={`text-[10px] ${themeClasses.muted} leading-tight`}>
                          Automatic detection badges on evaluation display
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.numberMagicBadges ?? true}
                        onChange={(e) => onUpdateSettings({ numberMagicBadges: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                      />
                    </div>
                  </div>

                  {/* Favorite Number Four-Leaf Clover Confetti Setting */}
                  <div className={`p-3 rounded-xl border ${themeClasses.subCard} space-y-2.5`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className={`font-bold ${themeClasses.heading} flex items-center gap-1.5 text-xs`}>
                          <span className="text-sm">🍀</span>
                          <span>Favorite Number Clover Confetti</span>
                        </div>
                        <p className={`text-[11px] ${themeClasses.muted} leading-tight`}>
                          Throws celebratory four-leaf clovers whenever calculation evaluates to your designated favorite number!
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.favoriteNumberCloverEnabled ?? false}
                        onChange={(e) => onUpdateSettings({ favoriteNumberCloverEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                      />
                    </div>

                    {settings.favoriteNumberCloverEnabled && (
                      <div className={`pt-2 border-t ${themeClasses.border} flex flex-wrap items-center justify-between gap-2`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-semibold ${isNordic ? 'text-[#0F172A]' : 'text-foreground'}`}>
                            Your Favorite Number:
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. 13, 7, 42"
                            value={settings.favoriteNumber ?? '13'}
                            onChange={(e) => onUpdateSettings({ favoriteNumber: e.target.value })}
                            className={`w-24 px-2 py-1 text-xs font-mono font-bold rounded-lg border text-center ${
                              isNordic ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1]' : 'border-border bg-background text-foreground'
                            }`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => fireCloverConfetti()}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer flex items-center gap-1"
                          title="Preview four-leaf clovers confetti"
                        >
                          <span>🍀 Test Clovers</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mini Utility Gadgets & Milestones (Category 5) with 3-Step Reset (Reset -> Are You Sure? -> Hold 5s) */}
                <div className={`p-4 rounded-xl border ${
                  isNordic
                    ? 'border-primary/40 bg-primary/10 text-[#0F172A]'
                    : 'border-primary/30 bg-primary/5'
                } space-y-3`}>
                  {/* Top: Full-Width Header & Description (Never horizontally compressed) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isNordic ? 'text-[#0F172A]' : 'text-foreground'}`}>
                        <Dices className="w-4 h-4 text-primary" />
                        <span>Mini Utility Gadgets & Milestone Badges</span>
                      </div>
                      {badgeResetStage > 1 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                          {badgeResetStage === 2 ? 'Step 2 of 3: Confirmation' : 'Step 3 of 3: Hold to Reset'}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isNordic ? 'text-[#334155]' : 'text-muted-foreground'}`}>
                      Roll D6 / D20 dice, flip coins, play Target 24 math puzzles, Mental Math Sprint, and review milestone badges.
                    </p>
                  </div>

                  {/* Bottom: Dedicated Action Controls Row with Status Feedback */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-primary/15">
                    <div className="text-[11px] min-w-0 flex-1">
                      {badgeResetStage === 1 && (
                        <span className="text-muted-foreground/80">
                          Reset all earned milestone badges back to locked state.
                        </span>
                      )}
                      {badgeResetStage === 2 && (
                        <span className="text-amber-500 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Are you sure you want to reset all milestone badges?
                        </span>
                      )}
                      {badgeResetStage === 3 && (
                        <span className="text-red-500 dark:text-red-400 font-semibold flex items-center gap-1.5">
                          <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${badgeHoldProgress > 0 ? 'animate-spin' : ''}`} />
                          Press and hold the button for 5 continuous seconds to complete reset.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                      {/* Cancel Button in Step 2 or Step 3 */}
                      {badgeResetStage > 1 && (
                        <button
                          type="button"
                          onClick={handleBadgeResetCancel}
                          className="py-1.5 px-3 rounded-lg text-xs font-medium border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Step 1: Initial "Reset Badges" Button */}
                      {badgeResetStage === 1 && (
                        <button
                          type="button"
                          onClick={handleBadgeResetInit}
                          className="py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                          title="Reset all milestone badges back to locked state"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Badges</span>
                        </button>
                      )}

                      {/* Step 2: "Are you sure?" Confirmation Button */}
                      {badgeResetStage === 2 && (
                        <button
                          type="button"
                          onClick={handleBadgeResetConfirmSure}
                          className="py-1.5 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-amber-500 text-amber-950 hover:bg-amber-400 transition-all shadow-xs animate-pulse"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Are you sure?</span>
                        </button>
                      )}

                      {/* Step 3: 5-Second Hold-to-Reset Button */}
                      {badgeResetStage === 3 && (
                        <div className="relative">
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              if (e.button === 0) {
                                try {
                                  e.currentTarget.setPointerCapture(e.pointerId);
                                } catch {
                                  // ignore
                                }
                                startBadgeHolding();
                              }
                            }}
                            onPointerUp={(e) => {
                              try {
                                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                                  e.currentTarget.releasePointerCapture(e.pointerId);
                                }
                              } catch {
                                // ignore
                              }
                              cancelBadgeHolding();
                            }}
                            onPointerCancel={() => {
                              cancelBadgeHolding();
                            }}
                            className="relative overflow-hidden w-[230px] sm:w-[240px] h-9 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white select-none shadow-sm active:scale-95 transition-transform"
                          >
                            {/* 5-second Hold Progress Fill Bar */}
                            <div
                              className="absolute inset-0 bg-red-950/75 transition-all duration-75 pointer-events-none"
                              style={{ width: `${badgeHoldProgress}%` }}
                            />
                            <RotateCcw className={`w-3.5 h-3.5 relative z-10 shrink-0 ${badgeHoldProgress > 0 ? 'animate-spin' : ''}`} />
                            <span className="relative z-10 font-bold whitespace-nowrap truncate">
                              {badgeHoldProgress > 0
                                ? `Holding... ${Math.round(badgeHoldProgress)}% (${(5 - (badgeHoldProgress * 5) / 100).toFixed(1)}s)`
                                : 'Press & Hold 5s to Reset'}
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Open Gadgets Button */}
                      {onOpenGadgets && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenChange(false);
                            onOpenGadgets();
                          }}
                          className="py-1.5 px-3 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Open Gadgets</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CATEGORY 3: TYPOGRAPHY & STYLE                            */}
          {/* ========================================================= */}
          {activeCategory === 'style' && (
            <div className="space-y-4">
              {/* Corner Radius Curvature */}
              <div className={`p-3 rounded-xl border space-y-2 ${themeClasses.card}`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                    <Square className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                    <span>Corner Radius Curvature</span>
                  </div>
                  <span className={`text-xs font-mono font-bold capitalize px-2 py-0.5 rounded-md border ${themeClasses.accent} ${themeClasses.subCard}`}>
                    {settings.cornerRadius || 'extra'}
                  </span>
                </div>

                {/* Compact Preset Buttons */}
                <div className={`grid grid-cols-5 gap-1 p-1 rounded-lg border ${themeClasses.subCard}`}>
                  {[
                    { id: 'sharp', label: 'Sharp', radiusClass: 'rounded-none', sub: '0px', val: 0 },
                    { id: 'subtle', label: 'Subtle', radiusClass: 'rounded-xs', sub: '8px', val: 8 },
                    { id: 'standard', label: 'Standard', radiusClass: 'rounded-md', sub: '16px', val: 16 },
                    { id: 'extra', label: 'Extra', radiusClass: 'rounded-lg', sub: '20px', val: 20 },
                    { id: 'pill', label: 'Pill', radiusClass: 'rounded-full', sub: 'Full', val: 32 },
                  ].map((r) => {
                    const currentPx = settings.cornerRadiusPx ?? (settings.cornerRadius === 'sharp' ? 0 : settings.cornerRadius === 'subtle' ? 8 : settings.cornerRadius === 'standard' ? 16 : settings.cornerRadius === 'extra' ? 20 : 32);
                    const isActive = (settings.cornerRadius || 'extra') === r.id || currentPx === r.val;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ cornerRadius: r.id as CornerRadiusPreset, cornerRadiusPx: r.val });
                          toast.success(`Corner radius set to ${r.label} (${r.val}px)`);
                        }}
                        className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-md transition-all cursor-pointer text-center ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                        title={`${r.label} Corner Radius (${r.sub})`}
                      >
                        <div
                          className={`w-3.5 h-3.5 border-1.5 mb-0.5 transition-all ${r.radiusClass} ${
                            isActive ? 'border-primary-foreground bg-primary-foreground/30' : 'border-current'
                          }`}
                        />
                        <span className="text-[10px] font-medium leading-none">{r.label}</span>
                        <span className="text-[8px] opacity-75">{r.sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Continuous Corner Radius Slider Bar (Smooth 0 to 16px and beyond) */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={themeClasses.muted}>Curvature Slider</span>
                    <span className={`font-mono font-bold ${themeClasses.accent}`}>
                      {(() => {
                        const px = settings.cornerRadiusPx ?? (settings.cornerRadius === 'sharp' ? 0 : settings.cornerRadius === 'subtle' ? 8 : settings.cornerRadius === 'standard' ? 16 : settings.cornerRadius === 'extra' ? 20 : 32);
                        return px >= 32 ? 'Full Pill (32px)' : `${px}px`;
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${themeClasses.muted} font-mono`}>0px</span>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      value={settings.cornerRadiusPx ?? (settings.cornerRadius === 'sharp' ? 0 : settings.cornerRadius === 'subtle' ? 8 : settings.cornerRadius === 'standard' ? 16 : settings.cornerRadius === 'extra' ? 20 : 32)}
                      onChange={(e) => {
                        const px = parseInt(e.target.value, 10);
                        let nextPreset: CornerRadiusPreset = 'extra';
                        if (px === 0) nextPreset = 'sharp';
                        else if (px <= 8) nextPreset = 'subtle';
                        else if (px <= 16) nextPreset = 'standard';
                        else if (px <= 24) nextPreset = 'extra';
                        else nextPreset = 'pill';
                        onUpdateSettings({ cornerRadiusPx: px, cornerRadius: nextPreset });
                      }}
                      className="flex-1 accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                    <span className={`text-[10px] ${themeClasses.muted} font-mono`}>24px</span>
                  </div>
                </div>
              </div>

              {/* Typography Font Family */}
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                  <Type className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                  <span>Typography & Keypad Font</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'montserrat',
                      name: 'Modern Sans',
                      preview: '123,456,789.0',
                      fontClass: 'font-montserrat',
                    },
                    {
                      id: 'mono',
                      name: 'Tech Monospace',
                      preview: '123,456,789.0',
                      fontClass: 'font-tech-mono',
                    },
                    {
                      id: 'sans',
                      name: 'Clean UI',
                      preview: '123,456,789.0',
                      fontClass: 'font-clean-sans',
                    },
                    {
                      id: 'digital',
                      name: 'Digital LCD',
                      preview: '123,456,789.0',
                      fontClass: 'font-digital',
                    },
                  ].map((f) => {
                    const isActive = (settings.fontStyle || 'montserrat') === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ fontStyle: f.id as CalculatorFontStyle });
                          toast.success(`Font set to ${f.name}`);
                        }}
                        className={`flex flex-col p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                          isActive
                            ? `border-current ring-2 ring-current/30 font-semibold shadow-xs ${themeClasses.card} ${themeClasses.accent}`
                            : `border-border/60 hover:border-current/40 ${themeClasses.subCard}`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-xs ${isActive ? themeClasses.accent : themeClasses.heading}`}>{f.name}</span>
                          {isActive && <Check className={`w-3.5 h-3.5 ${themeClasses.accent}`} />}
                        </div>
                        <span className={`mt-2 text-xs font-semibold tracking-wider ${themeClasses.heading} ${f.fontClass}`}>
                          {f.preview}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number Font Weight (Applies to all numbers across app) */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${themeClasses.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-xs font-bold ${themeClasses.heading}`}>Number Font Weight</span>
                    <p className={`text-[11px] ${themeClasses.muted} mt-0.5`}>
                      Sets font weight for all numbers (keypad keys, display screen, history, and finance cards)
                    </p>
                  </div>
                  <span className={`text-xs font-mono font-bold capitalize px-2 py-0.5 rounded-md border shrink-0 ${themeClasses.accent} ${themeClasses.subCard}`}>
                    {(settings.numberFontWeight || settings.keypadFontWeight || 'medium')} (
                    {(settings.numberFontWeight || settings.keypadFontWeight) === 'regular' ? '400' : (settings.numberFontWeight || settings.keypadFontWeight) === 'bold' ? '700' : '500'})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] ${themeClasses.muted} font-normal`}>Regular</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="1"
                    value={
                      (settings.numberFontWeight || settings.keypadFontWeight) === 'regular' ? 0 : (settings.numberFontWeight || settings.keypadFontWeight) === 'bold' ? 2 : 1
                    }
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const weight: KeypadFontWeight = val === 0 ? 'regular' : val === 2 ? 'bold' : 'medium';
                      onUpdateSettings({ numberFontWeight: weight, keypadFontWeight: weight });
                    }}
                    className="flex-1 accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className={`text-[11px] ${themeClasses.muted} font-bold`}>Bold</span>
                </div>
                <div className={`flex justify-between text-[10px] ${themeClasses.muted} px-1`}>
                  <span>Regular (400)</span>
                  <span>Medium (500)</span>
                  <span>Bold (700)</span>
                </div>
              </div>

              {/* Calculation Window Font Scale (50% to 150%) */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${themeClasses.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-xs font-bold ${themeClasses.heading}`}>Calculation Window Font Scale</span>
                    <p className={`text-[11px] ${themeClasses.muted} mt-0.5`}>
                      Scale display numbers and equation independently from global app UI
                    </p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${themeClasses.accent} ${themeClasses.subCard}`}>
                    {Math.round((settings.displayFontScale ?? 1.0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] ${themeClasses.muted} font-mono`}>50%</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={settings.displayFontScale ?? 1.0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateSettings({ displayFontScale: val });
                    }}
                    className="flex-1 accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className={`text-[11px] ${themeClasses.muted} font-mono`}>150%</span>
                </div>
                <div className={`flex justify-between text-[10px] ${themeClasses.muted} px-1`}>
                  <span>Mini (50%)</span>
                  <span>Default (100%)</span>
                  <span>Large (150%)</span>
                </div>
              </div>

              {/* App Font Scaling Slider */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${themeClasses.card}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${themeClasses.heading}`}>App Font Scaling</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${themeClasses.accent} ${themeClasses.subCard}`}>
                    {Math.round((settings.fontScale ?? 1) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] ${themeClasses.muted} font-mono`}>75%</span>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={settings.fontScale ?? 1}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateSettings({ fontScale: val });
                    }}
                    className="flex-1 accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className={`text-[11px] ${themeClasses.muted} font-mono`}>125%</span>
                </div>
                <div className={`flex justify-between text-[10px] ${themeClasses.muted} px-1`}>
                  <span>Compact (75%)</span>
                  <span>Default (100%)</span>
                  <span>Enlarged (125%)</span>
                </div>
              </div>

              {/* Device Layout Mode Preference */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${themeClasses.card}`}>
                <div className={`text-xs font-bold flex items-center justify-between ${themeClasses.heading}`}>
                  <div className="flex items-center gap-1.5">
                    <Tablet className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                    <span>Device Layout Mode</span>
                  </div>
                  <span className={`text-xs font-mono font-bold capitalize px-2 py-0.5 rounded-md border ${themeClasses.accent} ${themeClasses.subCard}`}>
                    {settings.deviceLayout || 'auto'}
                  </span>
                </div>
                <p className={`text-[11px] ${themeClasses.muted} leading-relaxed`}>
                  Choose between responsive auto-detection, phone full-screen, tablet side-by-side, or desktop windowed layout.
                </p>

                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: 'phone', label: 'Phone' },
                    { id: 'tablet', label: 'Tablet' },
                    { id: 'desktop', label: isPhone ? 'Window (Desktop)' : 'Window' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={opt.id === 'desktop' && isPhone}
                      onClick={() => {
                        if (opt.id === 'desktop' && isPhone) {
                          toast.info('Windowed layout is supported on desktop screens only');
                          return;
                        }
                        onUpdateSettings({ deviceLayout: opt.id as 'auto' | 'phone' | 'tablet' | 'desktop' });
                      }}
                      className={`py-1.5 px-2 rounded-lg font-medium border transition-colors cursor-pointer text-center ${
                        opt.id === 'desktop' && isPhone
                          ? 'opacity-40 cursor-not-allowed border-border/40 text-muted-foreground'
                          : (settings.deviceLayout || 'auto') === opt.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : `${themeClasses.subCard} ${themeClasses.muted} hover:text-foreground`
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Screen Ratio (Calculator vs History) for Tablets & Side-by-Side */}
              <div className={`p-3.5 rounded-xl border space-y-3 ${themeClasses.card}`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                    <Tablet className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                    <span>Screen Ratio (Calculator vs History)</span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${themeClasses.accent} ${themeClasses.subCard}`}>
                    {settings.tabletRatio || 65}% : {100 - (settings.tabletRatio || 65)}%
                  </span>
                </div>
                <p className={`text-[11px] ${themeClasses.muted} leading-relaxed`}>
                  Controls the width proportion between the calculator and side history panel on tablets and landscape screens.
                </p>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] ${themeClasses.muted} font-mono`}>50%</span>
                  <input
                    type="range"
                    min="45"
                    max="80"
                    step="1"
                    value={settings.tabletRatio || 65}
                    onChange={(e) => onUpdateSettings({ tabletRatio: parseInt(e.target.value, 10) })}
                    className="flex-1 accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className={`text-[11px] ${themeClasses.muted} font-mono`}>80%</span>
                </div>

                {/* Ratio Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className={`text-[10px] ${themeClasses.muted} uppercase font-semibold`}>Presets:</span>
                  {[
                    { label: '70:30', ratio: 70 },
                    { label: '60:40', ratio: 60 },
                    { label: '50:50', ratio: 50 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onUpdateSettings({ tabletRatio: preset.ratio })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                        (settings.tabletRatio || 65) === preset.ratio
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : `${themeClasses.subCard} ${themeClasses.muted} hover:text-foreground border-border/50`
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CATEGORY 4: PROGRAMMABLE KEYS & HOTKEYS                   */}
          {/* ========================================================= */}
          {activeCategory === 'programmable' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                    <Zap className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                    <span>Custom Programmable Keys</span>
                  </div>
                  <span className={`text-[11px] ${themeClasses.muted}`}>4 Configurable Keys</span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      id: 'reciprocal' as ProgrammableKeyId,
                      name: '1/x Key (Reciprocal)',
                      defaultLabel: '1/x',
                      config:
                        settings.programmableKeys?.reciprocal || {
                          label: '1/x',
                          actionType: 'default_unary',
                          value: '1/x',
                        },
                    },
                    {
                      id: 'sqr' as ProgrammableKeyId,
                      name: 'x² Key (Square)',
                      defaultLabel: 'x²',
                      config:
                        settings.programmableKeys?.sqr || {
                          label: 'x²',
                          actionType: 'default_unary',
                          value: 'sqr',
                        },
                    },
                    {
                      id: 'sqrt' as ProgrammableKeyId,
                      name: '√x Key (Square Root)',
                      defaultLabel: '√',
                      config:
                        settings.programmableKeys?.sqrt || {
                          label: '√',
                          actionType: 'default_unary',
                          value: '√x',
                        },
                    },
                    {
                      id: 'custom' as ProgrammableKeyId,
                      name: 'Custom Key (M)',
                      defaultLabel: 'Tax +8%',
                      config:
                        settings.programmableKeys?.custom ||
                        settings.customButton || { label: 'Tax +8%', actionType: 'tax', value: '8' },
                    },
                  ].map((item) => {
                    const isDefault = item.config.actionType === 'default_unary';
                    const hk = item.config.hotkey || DEFAULT_KEY_HOTKEYS[item.id];
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${themeClasses.card}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-bold flex items-center gap-2 flex-wrap ${themeClasses.heading}`}>
                            <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-mono text-[11px] font-bold shrink-0">
                              {item.config.label || item.defaultLabel}
                            </span>
                            <span className="truncate">{item.name}</span>
                            {hk && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${
                                  hk.enabled !== false
                                    ? 'bg-muted/80 text-foreground border-border/60'
                                    : 'bg-muted/40 text-muted-foreground border-border/40 line-through'
                                }`}
                              >
                                {hk.enabled !== false
                                  ? (hk.modifier === 'None' ? hk.key : `${hk.modifier}+${hk.key}`)
                                  : 'Hotkey Disabled'}
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] ${themeClasses.muted} mt-0.5 truncate`}>
                            {isDefault ? (
                              <span>Default math function</span>
                            ) : (
                              <span>
                                {item.config.actionType === 'tax' && `Add Tax (${item.config.value}%)`}
                                {item.config.actionType === 'tip' && `Add Tip (${item.config.value}%)`}
                                {item.config.actionType === 'multiplier' && `Multiply by ${item.config.value}`}
                                {item.config.actionType === 'constant' && `Constant (${item.config.value})`}
                                {item.config.actionType === 'formula' && `Formula: ${item.config.value}`}
                                {item.config.actionType === 'doubleZero' && 'Append 00'}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onOpenChange(false);
                            if (onOpenProgrammableModal) {
                              onOpenProgrammableModal(item.id);
                            } else if (onOpenCustomModal) {
                              onOpenCustomModal();
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${themeClasses.input} hover:border-current/40`}
                        >
                          <Cog className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Program</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Keyboard Shortcuts Cheatsheet */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                    <Keyboard className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                    <span>Keyboard Shortcuts Cheatsheet</span>
                  </div>
                  {onOpenShortcuts && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        onOpenShortcuts();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className={`p-3 rounded-xl border space-y-2 text-xs ${themeClasses.card}`}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono">
                    <div className="flex items-center justify-between">
                      <span className={themeClasses.muted}>Calculate:</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Enter / =</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={themeClasses.muted}>Clear All:</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Esc</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={themeClasses.muted}>Backspace:</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">⌫ Del</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={themeClasses.muted}>Custom Key:</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">M</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={themeClasses.muted}>Always-on-Top:</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Alt+P</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={themeClasses.muted}>Modes:</span>
                      <span className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Alt+1/2/3</span>
                    </div>
                    <div className={`flex items-center justify-between col-span-2 pt-1 border-t ${themeClasses.border}`}>
                      <span className={themeClasses.muted}>Programmable Hotkeys:</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                        Alt+R (1/x) · Alt+S (x²) · Alt+Q (√) · Alt+K (M)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CATEGORY 5: AUDIO & FEEDBACK                              */}
          {/* ========================================================= */}
          {activeCategory === 'audio' && (
            <div className="space-y-4">
              {/* Audio Mode: Sound Enabled vs No Audio / Mute */}
              <div className={`p-3.5 rounded-xl border space-y-3 ${themeClasses.card}`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                    {settings.soundEnabled ? (
                      <Volume2 className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span>Audio & Sound Output</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    settings.soundEnabled
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-destructive/15 text-destructive border border-destructive/30'
                  }`}>
                    {settings.soundEnabled ? 'Audio Active' : 'Muted'}
                  </span>
                </div>

                {/* Primary Setting Option: Sound vs Mute */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ soundEnabled: true });
                      soundFX.setMuted(false);
                      soundFX.playKeyClick(settings.soundVolume || 0.25, 'num', settings.soundPack || 'default');
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      settings.soundEnabled
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40 font-bold'
                        : `${themeClasses.subCard} hover:border-primary/40`
                    }`}
                  >
                    <Volume2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Sound Enabled</span>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Clicks & Fanfares</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ soundEnabled: false });
                      soundFX.setMuted(true);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !settings.soundEnabled
                        ? 'border-destructive bg-destructive/10 ring-2 ring-destructive/40 font-bold'
                        : `${themeClasses.subCard} hover:border-destructive/40`
                    }`}
                  >
                    <VolumeX className="w-5 h-5 text-destructive shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">No Audio / Mute</span>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Completely Silent</span>
                  </button>
                </div>

                {!settings.soundEnabled && (
                  <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30 text-[11px] text-muted-foreground flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-destructive shrink-0" />
                    <span>Mute active: All calculation clicks, chimes, victory fanfare, and mini-game audio are silenced.</span>
                  </div>
                )}

                {settings.soundEnabled && (
                  <>
                    <div className={`flex items-center justify-between pt-2 border-t ${themeClasses.border}`}>
                      <div className={`text-xs font-medium ${themeClasses.muted}`}>
                        Master Volume ({Math.round(settings.soundVolume * 100)}%)
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.soundVolume}
                        onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                        className="w-32 accent-primary cursor-pointer"
                      />
                    </div>

                    <div className={`pt-3 border-t ${themeClasses.border} space-y-2.5`}>
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-semibold ${themeClasses.heading}`}>
                          Sound Personality Pack
                        </div>
                        <span className="text-[10px] text-muted-foreground">Select acoustic profile</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { id: 'default', name: 'Modern Synthetic', desc: 'Crisp minimal clicks with frequency shift' },
                          { id: 'cherry-blue', name: 'Cherry MX Blue', desc: 'Tactile mechanical switch with metallic click' },
                          { id: 'thoccy', name: 'Thoccy Tactile', desc: 'Deep warm acoustic low-frequency thock' },
                          { id: 'chiptune', name: '8-Bit Chiptune', desc: 'Retro arcade blips & 8-bit sound fx' },
                          { id: 'typewriter', name: 'Vintage Typewriter', desc: 'Mechanical clatter, carriage return & bell' },
                          { id: 'piano', name: 'Musical Piano', desc: 'Harmonic pentatonic notes 0-9 & chords' },
                        ].map((pack) => {
                          const isSelected = (settings.soundPack || 'default') === pack.id;
                          return (
                            <div
                              key={pack.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                                  : `${themeClasses.subCard} hover:border-primary/40`
                              }`}
                              onClick={() => {
                                onUpdateSettings({ soundPack: pack.id as SoundProfile });
                                soundFX.playKeyClick(settings.soundVolume, 'num', pack.id as SoundProfile);
                              }}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                                  <span>{pack.name}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                                </div>
                                <div className="text-[10.5px] text-slate-600 dark:text-slate-300 font-medium leading-tight mt-0.5">
                                  {pack.desc}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  soundFX.playKeyClick(settings.soundVolume, 'equal', pack.id as SoundProfile);
                                }}
                                className="px-2 py-1 rounded-md text-[10px] font-bold bg-muted hover:bg-muted/80 text-slate-900 dark:text-slate-100 border border-border/80 shrink-0 cursor-pointer"
                                title="Audition sound"
                              >
                                Test
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile & Touch Haptic Vibration Feedback */}
              <div className={`p-3.5 rounded-xl border space-y-3 ${themeClasses.card}`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-xs font-bold ${themeClasses.heading}`}>
                    <Smartphone className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                    <span>Mobile & Touch Haptic Feedback</span>
                  </div>
                  {typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 flex items-center gap-1">
                      <Vibrate className="w-2.5 h-2.5" />
                      Haptics Supported
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${themeClasses.subCard} ${themeClasses.muted}`}>
                      Mobile & Touch Ready
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xs font-semibold ${themeClasses.heading}`}>Haptic Vibration on Tap</div>
                    <div className={`text-[11px] ${themeClasses.muted}`}>
                      Delivers a crisp tactile vibration pulse whenever calculator buttons are pressed
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.vibrateEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      onUpdateSettings({ vibrateEnabled: enabled });
                      if (enabled) {
                        soundFX.vibrate(25);
                        toast.success('Haptic vibration enabled');
                      } else {
                        toast.info('Haptic vibration disabled');
                      }
                    }}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                {settings.vibrateEnabled && (
                  <div className={`pt-2 border-t ${themeClasses.border} flex items-center justify-between gap-3`}>
                    <span className={`text-[11px] ${themeClasses.muted}`}>
                      Test vibration response on this device:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.vibrate([15, 30, 20]);
                        const supported =
                          typeof window !== 'undefined' &&
                          'navigator' in window &&
                          typeof navigator.vibrate === 'function';
                        if (supported) {
                          toast.success('Haptic pulse fired', {
                            description: 'Vibration pattern dispatched to device hardware',
                          });
                        } else {
                          toast.info('Haptic trigger simulated', {
                            description: 'Hardware vibration requires a mobile browser supporting Navigator.vibrate',
                          });
                        }
                      }}
                      className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1.5 font-medium cursor-pointer transition-colors ${themeClasses.input} hover:border-current/40`}
                    >
                      <Zap className={`w-3 h-3 ${themeClasses.accent}`} />
                      <span>Test Vibration</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CATEGORY 6: USER STATISTICS & SYSTEM ANALYTICS            */}
          {/* ========================================================= */}
          {activeCategory === 'stats' && (
            <UserStatisticsTab
              themeClasses={themeClasses}
              unlockedMilestonesCount={settings.unlockedAchievements?.length || 0}
              onOpenMilestones={onOpenMilestones}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
