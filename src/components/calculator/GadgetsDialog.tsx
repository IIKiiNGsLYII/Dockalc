import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Dices,
  Coins,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Play,
  Flame,
  Zap,
  Calendar,
  Lock,
} from 'lucide-react';
import { soundFX } from '@/lib/audio';
import { ACHIEVEMENTS_LIST, type AchievementItem, getMilestoneProgress } from '@/lib/numberMagic';
import { AchievementBadge } from './AchievementBadge';
import { fireCelebratoryParticles } from '@/lib/confetti';
import { MentalMathSprint } from './MentalMathSprint';
import { THEMES } from '@/lib/themes';
import { getUserStats } from '@/lib/userStats';
import type { CalculatorSettings, CalculatorTheme } from '@/types/calculator';

interface GadgetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unlockedAchievements?: string[];
  onUnlockAchievement?: (id: string) => void;
  settings?: CalculatorSettings;
  onUpdateSettings?: (partial: Partial<CalculatorSettings>) => void;
  initialTab?: 'dice' | 'target24' | 'sprint' | 'badges';
  theme?: CalculatorTheme;
  customThemeStyle?: React.CSSProperties;
}

export const GadgetsDialog: React.FC<GadgetsDialogProps> = ({
  open,
  onOpenChange,
  unlockedAchievements = [],
  onUnlockAchievement,
  settings,
  onUpdateSettings,
  initialTab = 'dice',
  theme,
  customThemeStyle,
}) => {
  const currentUnlocked = settings?.unlockedAchievements || unlockedAchievements;
  const activeTheme = theme || THEMES.find((t) => t.id === settings?.theme) || THEMES[0];
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
      ? 'bg-[var(--theme-display-bg,#0e1012)] border-[var(--theme-border,#2d3139)] text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
      : isSolar
      ? 'bg-[#100C07] border-[#423321] text-[#FEF3C7]'
      : isCyber
      ? 'bg-[#08100E] border-[#1A3832] text-[#E6FFFA]'
      : isRetroMac
      ? 'bg-[#DCDCDC] border-[#999999] text-[#111111]'
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

    buttonPrimary: isCustom
      ? 'bg-[var(--theme-accent,#3b82f6)] hover:bg-[var(--theme-accent-hover,#60a5fa)] text-[var(--theme-accent-text,#ffffff)]'
      : isNordic
      ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs'
      : isSolar
      ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#16120C] font-bold shadow-xs'
      : isCyber
      ? 'bg-[#10B981] hover:bg-[#059669] text-[#0A1412] font-bold shadow-xs'
      : isRetroMac
      ? 'bg-[#222222] hover:bg-[#444444] text-white font-bold shadow-xs'
      : isTerracotta
      ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold shadow-xs'
      : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-xs',

    chipActive: isCustom
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
      : 'bg-[#3B82F6] text-white font-bold shadow-xs',

    chipInactive: isCustom
      ? 'bg-[var(--theme-key-fn,#1a1d22)] text-[var(--theme-display-dim,#a1a1aa)] hover:text-[var(--theme-display-text,#f4f4f5)]'
      : isNordic
      ? 'bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#475569]'
      : isSolar
      ? 'bg-[#2C2216] hover:bg-[#3D3020] text-[#D97706]'
      : isCyber
      ? 'bg-[#142B27] hover:bg-[#1C3B35] text-[#10B981]'
      : isRetroMac
      ? 'bg-[#CCCCCC] hover:bg-[#BBBBBB] text-[#333333]'
      : isTerracotta
      ? 'bg-[#30211D] hover:bg-[#453631] text-[#FED7AA]/80'
      : 'bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA]',
  };
  const triggerUnlock = (id: string) => {
    if (onUnlockAchievement) {
      onUnlockAchievement(id);
    } else if (onUpdateSettings && settings) {
      const cur = settings.unlockedAchievements || [];
      if (!cur.includes(id)) {
        onUpdateSettings({ unlockedAchievements: [...cur, id] });
      }
    }
  };

  const [activeTab, setActiveTab] = useState<'dice' | 'target24' | 'sprint' | 'badges'>(initialTab);

  useEffect(() => {
    if (open && initialTab) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);
  const [coinFlipsTotal, setCoinFlipsTotal] = useState(0);
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<'all' | 'calc' | 'wonder' | 'mode' | 'game' | 'easter'>('all');

  // ==========================================
  // DICE & COIN TOSS STATE
  // ==========================================
  const [d6Result, setD6Result] = useState<number | null>(6);
  const [d20Result, setD20Result] = useState<number | null>(20);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>('heads');
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);
  const coinStreakRef = useRef<{ side: 'heads' | 'tails' | null; count: number }>({ side: null, count: 0 });
  const d6ConsecutiveOnesRef = useRef<number>(0);

  const rollD6 = () => {
    setIsRollingDice(true);
    soundFX.playKeyClick(0.3, 'fn', 'thoccy');
    let rolls = 0;
    const interval = setInterval(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setD6Result(val);
      rolls++;
      if (rolls >= 8) {
        clearInterval(interval);
        setIsRollingDice(false);
        soundFX.playKeyClick(0.3, 'num', 'cherry-blue');
        if (val === 6) {
          triggerUnlock('lucky-strike');
        }
        if (val === 1) {
          d6ConsecutiveOnesRef.current += 1;
          // Snake Eyes requires rolling two 1s back to back
          if (d6ConsecutiveOnesRef.current >= 2) {
            triggerUnlock('snake-eyes');
          }
        } else {
          d6ConsecutiveOnesRef.current = 0;
        }
      }
    }, 50);
  };

  const rollD20 = () => {
    setIsRollingDice(true);
    soundFX.playKeyClick(0.3, 'fn', 'thoccy');
    let rolls = 0;
    const interval = setInterval(() => {
      const val = Math.floor(Math.random() * 20) + 1;
      setD20Result(val);
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        setIsRollingDice(false);
        if (val === 20) {
          soundFX.playVictoryChime(0.4);
          fireCelebratoryParticles('starlight');
          triggerUnlock('dice-roller');
        } else if (val === 1) {
          soundFX.playKeyClick(0.3, 'clear', 'chiptune');
          triggerUnlock('critical-fumble');
        } else {
          soundFX.playKeyClick(0.3, 'num', 'cherry-blue');
        }
      }
    }, 50);
  };

  const flipCoin = () => {
    setIsFlippingCoin(true);
    soundFX.playKeyClick(0.3, 'fn', 'thoccy');
    let flips = 0;
    const interval = setInterval(() => {
      setCoinResult(Math.random() > 0.5 ? 'heads' : 'tails');
      flips++;
      if (flips >= 10) {
        clearInterval(interval);
        const finalSide: 'heads' | 'tails' = Math.random() > 0.5 ? 'heads' : 'tails';
        setCoinResult(finalSide);
        setIsFlippingCoin(false);
        soundFX.playKeyClick(0.35, 'equal', 'typewriter');
        setCoinFlipsTotal((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            triggerUnlock('coin-master');
          }
          return next;
        });

        // Track matching coin streak (3 matching in a row for 'coin-streak', 10 for 'hot-hand')
        if (coinStreakRef.current.side === finalSide) {
          coinStreakRef.current.count += 1;
        } else {
          coinStreakRef.current = { side: finalSide, count: 1 };
        }
        if (coinStreakRef.current.count >= 3) {
          triggerUnlock('coin-streak');
        }
        if (coinStreakRef.current.count >= 10) {
          triggerUnlock('hot-hand');
        }
      }
    }, 60);
  };

  // ==========================================
  // TARGET 24 PUZZLE STATE
  // ==========================================
  const target24StartTimeRef = useRef<number>(Date.now());
  // Pre-vetted solvable 4-card hands for 24 game
  const SOLVABLE_HANDS = [
    [1, 3, 4, 6], // 6 / (1 - 3/4) = 24
    [3, 3, 8, 8], // 8 / (3 - 8/3) = 24
    [4, 4, 6, 8], // (8 - 6) * 4 * ? -> (8 - 4) * 6
    [2, 3, 4, 5], // (5 + 3 - 2) * 4 = 24
    [1, 5, 5, 5], // (5 - 1/5) * 5 = 24
    [2, 7, 8, 9], // (9 - 7 + 8) * 2 = 24
    [3, 5, 7, 9], // (7 - 5) * (9 + 3) = 24
    [2, 4, 6, 8], // 8 + 6 + 4 + 2 = 20, (8*6)/(4-2) = 24
    [3, 4, 4, 8], // (8 - 4 + 4) * 3 = 24
    [1, 2, 7, 7], // (7 * 7 - 1) / 2 = 24
  ];

  const [puzzleCards, setPuzzleCards] = useState<number[]>([1, 3, 4, 6]);
  const [usedCards, setUsedCards] = useState<boolean[]>([false, false, false, false]);
  const [exprInput, setExprInput] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [solvedCount, setSolvedCount] = useState<number>(0);

  const startNew24Hand = () => {
    const randomHand = SOLVABLE_HANDS[Math.floor(Math.random() * SOLVABLE_HANDS.length)];
    setPuzzleCards(randomHand);
    setUsedCards([false, false, false, false]);
    setExprInput('');
    setFeedback('');
    target24StartTimeRef.current = Date.now();
  };

  const handleCardClick = (val: number, index: number) => {
    if (usedCards[index]) return;
    soundFX.playKeyClick(0.2, 'num', 'piano', val.toString());
    const newUsed = [...usedCards];
    newUsed[index] = true;
    setUsedCards(newUsed);
    setExprInput((prev) => (prev ? `${prev} ${val}` : `${val}`));
  };

  const handleOpClick = (op: string) => {
    soundFX.playKeyClick(0.2, 'op', 'piano');
    setExprInput((prev) => `${prev} ${op}`);
  };

  const clearExpr = () => {
    soundFX.playKeyClick(0.2, 'clear', 'piano');
    setUsedCards([false, false, false, false]);
    setExprInput('');
    setFeedback('');
  };

  const evaluate24 = () => {
    try {
      if (!usedCards.every(Boolean)) {
        setFeedback('Must use all 4 numbers exactly once!');
        return;
      }
      // Clean expression to safe math
      const safeExpr = exprInput.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${safeExpr})`)();

      if (Math.abs(result - 24) < 0.0001) {
        soundFX.playVictoryChime(0.4);
        fireCelebratoryParticles('fireworks');
        setFeedback('🎉 Brilliant! You reached 24!');
        const elapsed = (Date.now() - target24StartTimeRef.current) / 1000;
        if (elapsed <= 10) {
          triggerUnlock('speedrunner');
        }
        setSolvedCount((c) => {
          const next = c + 1;
          if (next >= 3) {
            triggerUnlock('target24-grandmaster');
          }
          return next;
        });
        triggerUnlock('target24-solver');
      } else {
        soundFX.playKeyClick(0.3, 'clear', 'chiptune');
        setFeedback(`Result equals ${result}, not 24. Try again!`);
      }
    } catch {
      setFeedback('Invalid arithmetic expression.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={customThemeStyle}
        className={`max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-5 border transition-colors ${themeClasses.dialog}`}
      >
        <DialogHeader className="pb-1 text-left space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <Trophy className={`w-5 h-5 shrink-0 ${themeClasses.accent}`} />
            <DialogTitle className={`text-base sm:text-lg font-bold truncate leading-normal ${themeClasses.heading}`}>
              Dockcalc Fun Gadgets & Milestones
            </DialogTitle>
          </div>
          <DialogDescription className={`text-xs leading-normal pr-4 ${themeClasses.muted}`}>
            Dice rollers, coin tosses, mental math micro-games, and your calculation milestone badges.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Buttons */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs font-semibold overflow-x-auto ${themeClasses.tabBar}`}>
          <button
            type="button"
            onClick={() => setActiveTab('dice')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dice'
                ? themeClasses.tabActive
                : themeClasses.tabInactive
            }`}
          >
            <Dices className={`w-3.5 h-3.5 ${activeTab === 'dice' ? themeClasses.accent : themeClasses.muted}`} />
            <span>Dice & Coin</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('target24')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'target24'
                ? themeClasses.tabActive
                : themeClasses.tabInactive
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${activeTab === 'target24' ? themeClasses.accent : themeClasses.muted}`} />
            <span>Target 24</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sprint')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sprint'
                ? themeClasses.tabActive
                : themeClasses.tabInactive
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${activeTab === 'sprint' ? themeClasses.accent : themeClasses.muted}`} />
            <span>Math Sprint</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'badges'
                ? themeClasses.tabActive
                : themeClasses.tabInactive
            }`}
          >
            <Trophy className={`w-3.5 h-3.5 ${activeTab === 'badges' ? themeClasses.accent : themeClasses.muted}`} />
            <span>Milestones ({currentUnlocked.length}/{ACHIEVEMENTS_LIST.length})</span>
          </button>
        </div>

        {/* TAB 1: DICE & COIN TOSS */}
        {activeTab === 'dice' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* D6 Dice */}
              <div className={`p-3.5 rounded-xl border flex flex-col items-center justify-between text-center gap-3 ${themeClasses.card}`}>
                <div className={`text-xs font-bold uppercase tracking-wider ${themeClasses.muted}`}>
                  D6 Die
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center text-3xl font-black text-primary shadow-inner">
                  {d6Result}
                </div>
                <button
                  type="button"
                  onClick={rollD6}
                  disabled={isRollingDice}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50 ${themeClasses.buttonPrimary}`}
                >
                  Roll D6
                </button>
              </div>

              {/* D20 Dice */}
              <div className={`p-3.5 rounded-xl border flex flex-col items-center justify-between text-center gap-3 ${themeClasses.card}`}>
                <div className={`text-xs font-bold uppercase tracking-wider ${themeClasses.muted}`}>
                  D20 Die
                </div>
                <div
                  className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black shadow-inner ${
                    d20Result === 20
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse'
                      : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                  }`}
                >
                  {d20Result}
                </div>
                <button
                  type="button"
                  onClick={rollD20}
                  disabled={isRollingDice}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Roll D20
                </button>
              </div>

              {/* Coin Toss */}
              <div className={`p-3.5 rounded-xl border flex flex-col items-center justify-between text-center gap-3 ${themeClasses.card}`}>
                <div className={`text-xs font-bold uppercase tracking-wider ${themeClasses.muted}`}>
                  Coin Toss
                </div>
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex flex-col items-center justify-center text-xs font-black text-amber-500 shadow-inner uppercase tracking-wider">
                  <Coins className="w-5 h-5 mb-0.5 text-amber-500" />
                  <span>{coinResult}</span>
                </div>
                <button
                  type="button"
                  onClick={flipCoin}
                  disabled={isFlippingCoin}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Flip Coin
                </button>
              </div>
            </div>
            <p className={`text-[11px] text-center ${themeClasses.muted}`}>
              Roll a natural 20 on the D20 to unlock the High Roller achievement badge!
            </p>
          </div>
        )}

        {/* TAB 2: TARGET 24 PUZZLE */}
        {activeTab === 'target24' && (
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between">
              <div className={`text-xs ${themeClasses.muted}`}>
                Combine all 4 numbers with <code className={`font-mono font-bold ${themeClasses.accent}`}>+ - × ÷ ()</code> to equal <span className={`font-bold ${themeClasses.heading}`}>24</span>!
              </div>
              <button
                type="button"
                onClick={startNew24Hand}
                className={`flex items-center gap-1 text-[11px] font-semibold hover:underline cursor-pointer ${themeClasses.accent}`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>New Hand</span>
              </button>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-4 gap-2">
              {puzzleCards.map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={usedCards[idx]}
                  onClick={() => handleCardClick(card, idx)}
                  className={`h-14 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all cursor-pointer shadow-xs ${
                    usedCards[idx]
                      ? `${themeClasses.subCard} opacity-40 line-through`
                      : `${themeClasses.card} border-primary/40 hover:border-primary ${themeClasses.heading} hover:scale-105`
                  }`}
                >
                  {card}
                </button>
              ))}
            </div>

            {/* Operators Row */}
            <div className="flex items-center gap-1.5 justify-center">
              {['+', '-', '×', '÷', '(', ')'].map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => handleOpClick(op)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold cursor-pointer transition-all ${themeClasses.subCard} ${themeClasses.heading} hover:opacity-80`}
                >
                  {op}
                </button>
              ))}
              <button
                type="button"
                onClick={clearExpr}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${themeClasses.subCard} ${themeClasses.muted} hover:text-destructive`}
              >
                Clear
              </button>
            </div>

            {/* Current Expression Window */}
            <div className={`p-3 rounded-xl border flex items-center justify-between min-h-[44px] ${themeClasses.subCard}`}>
              <div className={`font-mono text-sm sm:text-base font-bold ${themeClasses.heading}`}>
                {exprInput || <span className={`font-normal opacity-50 ${themeClasses.muted}`}>Tap numbers and operators above</span>}
              </div>
              <button
                type="button"
                onClick={evaluate24}
                className={`py-1 px-3 rounded-md text-xs font-bold transition-all cursor-pointer shadow-xs ${themeClasses.buttonPrimary}`}
              >
                Check = 24
              </button>
            </div>

            {feedback && (
              <div
                className={`text-xs font-semibold p-2 rounded-lg border text-center ${
                  feedback.includes('Brilliant')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}
              >
                {feedback}
              </div>
            )}

            <div className={`text-[11px] text-center ${themeClasses.muted}`}>
              Puzzles solved this session: <span className={`font-bold ${themeClasses.heading}`}>{solvedCount}</span>
            </div>
          </div>
        )}

        {/* TAB 3: MENTAL MATH SPRINT MINI-GAME */}
        {activeTab === 'sprint' && (
          <div className="pt-1">
            <MentalMathSprint
              onUnlockMilestone={triggerUnlock}
              onPlaySound={(type) => {
                if (settings?.soundEnabled ?? true) {
                  soundFX.playKeyClick(settings?.soundVolume ?? 0.2, type, 'piano');
                }
              }}
              theme={activeTheme}
              customThemeStyle={customThemeStyle}
              themeClasses={themeClasses}
            />
          </div>
        )}

        {/* TAB 4: MILESTONE ACHIEVEMENTS */}
        {activeTab === 'badges' && (
          <div className="space-y-3.5 pt-1 w-full">
            {/* Unlocked Progress Header */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${themeClasses.subCard}`}>
              <div>
                <div className={`text-xs font-bold flex items-center gap-1.5 ${themeClasses.heading}`}>
                  <Trophy className={`w-3.5 h-3.5 ${themeClasses.accent}`} />
                  <span>
                    Milestone Progress: {currentUnlocked.length} / {ACHIEVEMENTS_LIST.length} Unlocked
                  </span>
                </div>
                <div className={`text-[10px] mt-0.5 ${themeClasses.muted}`}>
                  Unlock more badges through regular calculations, math wonders, and gadgets
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black font-mono ${themeClasses.accent}`}>
                  {Math.round((currentUnlocked.length / ACHIEVEMENTS_LIST.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'calc', label: 'Volume' },
                { id: 'wonder', label: 'Wonders' },
                { id: 'mode', label: 'Modes' },
                { id: 'game', label: 'Gadgets' },
                { id: 'easter', label: 'Secret' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setBadgeCategoryFilter(c.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                    badgeCategoryFilter === c.id
                      ? themeClasses.chipActive
                      : themeClasses.chipInactive
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1 w-full">
              {(() => {
                const userStats = getUserStats();
                return ACHIEVEMENTS_LIST.filter(
                  (ach) =>
                    badgeCategoryFilter === 'all' ||
                    (badgeCategoryFilter === 'easter'
                      ? ach.category === 'easter' || Boolean(ach.isSecret)
                      : ach.category === badgeCategoryFilter)
                ).map((ach) => {
                const unlocked = currentUnlocked.includes(ach.id);
                const unlockTimestamp = settings?.achievementUnlockedAt?.[ach.id];
                const unlockDateStr = unlockTimestamp
                  ? new Date(unlockTimestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : null;
                const isLockedSecret = !unlocked && Boolean(ach.isSecret);
                const displayTitle = isLockedSecret ? (ach.secretTitle || '??? Secret Achievement') : ach.title;
                const displayDesc = isLockedSecret ? (ach.secretHint || 'A mysterious arithmetic secret awaits discovery...') : ach.description;

                const isApex100k = ach.id === 'calc-100k' || ach.id === 'custom-key-100k' || ach.tier === 'apex';
                const isEpic = ach.id === 'all-milestones-epic' || ach.tier === 'epic';
                const nonEpicTotal = ACHIEVEMENTS_LIST.filter((a) => a.id !== 'all-milestones-epic' && !a.isSecret).length;
                const nonEpicUnlocked = currentUnlocked.filter((id) => {
                  const achItem = ACHIEVEMENTS_LIST.find((a) => a.id === id);
                  return achItem && achItem.id !== 'all-milestones-epic' && !achItem.isSecret;
                }).length;
                const epicProgressPct = Math.round((nonEpicUnlocked / Math.max(1, nonEpicTotal)) * 100);

                const tierTheme = {
                  epic: {
                    badge: 'border-red-500/60 bg-gradient-to-r from-red-500/40 via-purple-500/40 to-amber-500/40 text-amber-300 font-black shadow-md animate-pulse',
                    cardUnlocked: 'bg-gradient-to-r from-purple-950/80 via-pink-950/70 to-amber-950/80 border-amber-400 shadow-2xl ring-2 ring-amber-400/70',
                  },
                  apex: {
                    badge: 'border-amber-400/80 bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-500/20 text-amber-500 dark:text-amber-300 font-black',
                    cardUnlocked: 'bg-gradient-to-br from-amber-500/20 via-purple-600/15 to-transparent border-amber-400/80 shadow-lg ring-1 ring-amber-400/60',
                  },
                  legendary: {
                    badge: 'border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-300 font-black',
                    cardUnlocked: 'bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent border-purple-500/40 shadow-xs',
                  },
                  gold: {
                    badge: 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold',
                    cardUnlocked: 'bg-amber-500/5 border-amber-500/35 shadow-xs',
                  },
                  silver: {
                    badge: 'border-slate-400/40 bg-slate-400/15 text-slate-700 dark:text-slate-300 font-bold',
                    cardUnlocked: 'bg-slate-500/5 border-slate-400/30 shadow-xs',
                  },
                  bronze: {
                    badge: 'border-orange-600/40 bg-orange-600/15 text-orange-700 dark:text-orange-400 font-bold',
                    cardUnlocked: 'bg-orange-500/5 border-orange-500/30 shadow-xs',
                  },
                }[ach.tier || 'bronze'] || {
                  badge: 'border-muted bg-muted/40 text-muted-foreground font-bold',
                  cardUnlocked: 'bg-muted/10 border-border',
                };

                // Special presentation for the EPIC all-milestones completionist badge
                if (isEpic) {
                  return (
                    <div
                      key={ach.id}
                      className={`col-span-full p-4 sm:p-5 rounded-2xl border-2 transition-all w-full relative overflow-hidden ${
                        unlocked
                          ? 'bg-gradient-to-r from-purple-950/90 via-pink-950/80 to-amber-950/90 border-amber-400 shadow-2xl ring-4 ring-amber-400/40'
                          : 'bg-gradient-to-r from-purple-950/50 via-slate-900/60 to-amber-950/50 border-amber-400/60 shadow-lg'
                      }`}
                    >
                      {/* Background animated particles / sparkles shimmer */}
                      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

                      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        {/* Huge Wild Contained SVG Badge */}
                        <div className="w-24 h-26 shrink-0 flex items-center justify-center select-none transition-transform hover:scale-105 relative">
                          <AchievementBadge achievement={ach} size={90} animated={unlocked} />
                        </div>

                        {/* Content Area */}
                        <div className="space-y-2 min-w-0 flex-1 text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                <span className="text-sm sm:text-base font-black text-foreground tracking-tight">
                                  {ach.title}
                                </span>
                              </div>
                              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-0.5">
                                Ultimate Master Completionist Achievement
                              </div>
                            </div>
                            <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
                              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md font-black text-white bg-gradient-to-r from-red-500 via-purple-600 to-amber-500 shadow-md border border-amber-300 animate-pulse flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> EPIC
                              </span>
                              {unlocked ? (
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 shadow-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> UNLOCKED
                                  </span>
                                  {unlockDateStr && (
                                    <span className="text-[10px] font-mono text-amber-300/80 flex items-center gap-1">
                                      <Calendar className="w-2.5 h-2.5 text-amber-400" /> {unlockDateStr}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-amber-300/90 font-mono">
                                  {nonEpicUnlocked} / {nonEpicTotal} ({epicProgressPct}%)
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {ach.description}
                          </p>

                          {/* Live Completionist Progress Bar */}
                          <div className="pt-1 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                              <span>Mastery Progression</span>
                              <span className="text-amber-400 font-mono">{nonEpicUnlocked} of {nonEpicTotal} Unlocked (Secret Excluded)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black/40 border border-amber-400/30 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-red-500 via-purple-500 to-amber-400 transition-all duration-500"
                                style={{ width: `${epicProgressPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const cardStyle = isApex100k
                  ? unlocked
                    ? 'bg-gradient-to-br from-amber-500/25 via-purple-600/25 to-pink-500/20 border-amber-400/80 shadow-lg ring-1 ring-amber-400/60'
                    : 'bg-gradient-to-br from-amber-500/10 via-purple-600/10 to-transparent border-amber-400/40 shadow-xs'
                  : unlocked
                    ? `${tierTheme.cardUnlocked} ring-1 ring-border/40`
                    : `${themeClasses.subCard} opacity-70`;

                const progress = !unlocked && !isLockedSecret ? getMilestoneProgress(ach.id, userStats) : null;

                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all min-h-[126px] h-full w-full min-w-0 ${cardStyle}`}
                  >
                    <div className="w-14 h-16 shrink-0 flex items-center justify-center select-none transition-transform hover:scale-110">
                      <AchievementBadge achievement={ach} size={50} animated={unlocked} locked={isLockedSecret} />
                    </div>
                    <div className="min-w-0 flex-1 h-full flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className={`text-xs font-bold leading-snug flex items-start gap-1.5 ${unlocked ? themeClasses.heading : themeClasses.muted}`}>
                            {isLockedSecret && <Lock className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />}
                            <span className="break-words">{displayTitle}</span>
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {isLockedSecret ? (
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-purple-500/40 bg-purple-500/20 text-purple-300 font-bold flex items-center gap-1">
                                <span>Riddle</span>
                              </span>
                            ) : isApex100k ? (
                              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-black text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 shadow-xs flex items-center gap-1">
                                👑 {ach.id === 'calc-100k' ? 'APEX 100K' : 'APEX 10K'}
                              </span>
                            ) : (
                              <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${tierTheme.badge}`}>
                                {ach.tier}
                              </span>
                            )}
                            {unlocked && (
                              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={`text-[11px] leading-relaxed break-words text-pretty ${isLockedSecret ? 'text-purple-300/90 italic font-medium' : themeClasses.muted}`}>
                          {displayDesc}
                        </p>
                      </div>

                      {unlocked && unlockDateStr ? (
                        <div className="text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1 pt-1 mt-auto">
                          <Calendar className="w-2.5 h-2.5 text-primary/70 shrink-0" />
                          <span>Unlocked: {unlockDateStr}</span>
                        </div>
                      ) : isLockedSecret ? (
                        <div className="text-[10px] text-purple-400/80 font-mono flex items-center gap-1 pt-1 mt-auto">
                          <span>🔒 Secret Milestone</span>
                        </div>
                      ) : progress ? (
                        <div className="space-y-1 pt-1 mt-auto">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-muted-foreground/80 font-medium">
                              {progress.label}: {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                            </span>
                            <span className="font-bold text-primary">
                              {Math.round(progress.percentage)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden border border-border/40">
                            <div
                              className="h-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-300 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground/60 font-mono flex items-center gap-1 pt-1 mt-auto">
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
              })()}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
