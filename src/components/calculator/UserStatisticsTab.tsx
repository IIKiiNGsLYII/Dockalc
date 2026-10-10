import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  Calculator,
  Trophy,
  Flame,
  Zap,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Calendar,
  Hash,
  Activity,
  Layers,
  ChevronRight,
  Target,
  AlertTriangle,
  Sliders,
  Repeat,
  Eraser,
  TrendingDown,
  ShieldCheck,
  Download,
  Upload,
} from 'lucide-react';
import { getUserStats, resetUserStats, type UserStats } from '@/lib/userStats';
import { ACHIEVEMENTS_LIST } from '@/lib/numberMagic';
import { toast } from 'sonner';

interface UserStatisticsTabProps {
  themeClasses: {
    card: string;
    subCard: string;
    heading: string;
    muted: string;
    accent: string;
    input: string;
  };
  unlockedMilestonesCount?: number;
  onOpenMilestones?: () => void;
}

// Ordered calculation milestones for next-target progress
const CALC_MILESTONES = [
  { target: 1, title: 'First Step' },
  { target: 10, title: 'Decade Club' },
  { target: 25, title: 'Quarter-Century' },
  { target: 50, title: 'Half-Century' },
  { target: 100, title: 'Centurion' },
  { target: 250, title: 'Calculation Maestro' },
  { target: 500, title: 'Math Legend' },
  { target: 1000, title: 'Grandmaster 1K' },
  { target: 2000, title: 'Calculation Virtuoso (2K)' },
  { target: 5000, title: '5K Milestone Master (5K)' },
  { target: 10000, title: 'Ten-Thousand Titan (10K)' },
  { target: 15000, title: 'Fifteen-K Pioneer (15K)' },
  { target: 20000, title: 'Twenty-K Prodigy (20K)' },
  { target: 25000, title: 'Quarter-Century-K Master (25K)' },
  { target: 30000, title: 'Thirty-K Trailblazer (30K)' },
  { target: 40000, title: 'Forty-K Veteran (40K)' },
  { target: 50000, title: 'Fifty-K Grandee (50K)' },
  { target: 60000, title: 'Sixty-K Champion (60K)' },
  { target: 70000, title: 'Seventy-K Sovereign (70K)' },
  { target: 80000, title: 'Eighty-K Mythic (80K)' },
  { target: 90000, title: 'Ninety-K Overlord (90K)' },
  { target: 100000, title: 'One Hundred Thousand Megastar (100K)' },
];

export const UserStatisticsTab: React.FC<UserStatisticsTabProps> = ({
  themeClasses,
  unlockedMilestonesCount = 0,
  onOpenMilestones,
}) => {
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setStats(getUserStats());
  }, []);

  // Compute next milestone progress
  const currentTotal = stats.totalCalculations;
  const nextMilestone = CALC_MILESTONES.find((m) => m.target > currentTotal) || {
    target: 100000,
    title: 'One Hundred Thousand Megastar',
  };
  const prevMilestone = [...CALC_MILESTONES].reverse().find((m) => m.target <= currentTotal);
  const prevTarget = prevMilestone ? prevMilestone.target : 0;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((currentTotal - prevTarget) / Math.max(1, nextMilestone.target - prevTarget)) * 100))
  );

  // Compute operations total & percentages
  const opEntries = Object.entries(stats.operations) as [keyof UserStats['operations'], number][];
  const totalOpsSum = opEntries.reduce((acc, [, val]) => acc + val, 0);

  // Compute mode totals
  const modeEntries = Object.entries(stats.modesUsed) as [keyof UserStats['modesUsed'], number][];
  const totalModeUses = modeEntries.reduce((acc, [, val]) => acc + val, 0);

  // 3-Stage Reset State:
  // Stage 1: 'Reset Statistics'
  // Stage 2: 'Are you sure?'
  // Stage 3: 'Hold for 5 seconds to reset' (with 5-second hold progress fill)
  const [resetStage, setResetStage] = useState<1 | 2 | 3>(1);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current);
    };
  }, []);

  const handleStageClick = () => {
    if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current);

    if (resetStage === 1) {
      setResetStage(2);
      // Auto-revert to Stage 1 after 8 seconds of inactivity
      stageTimeoutRef.current = setTimeout(() => {
        setResetStage(1);
      }, 8000);
    } else if (resetStage === 2) {
      setResetStage(3);
      // Auto-revert to Stage 1 after 12 seconds of inactivity
      stageTimeoutRef.current = setTimeout(() => {
        setResetStage(1);
        setHoldProgress(0);
      }, 12000);
    }
  };

  const startHolding = () => {
    if (resetStage !== 3) return;
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current);

    const startTime = Date.now();
    const duration = 5000; // 5000ms = 5 seconds

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        const fresh = resetUserStats();
        setStats(fresh);
        setResetStage(1);
        setHoldProgress(0);
        toast.success('All user statistics have been completely reset!');
      }
    }, 50);
  };

  const cancelHolding = () => {
    if (resetStage === 3) {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      setHoldProgress(0);
      if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current);
      stageTimeoutRef.current = setTimeout(() => {
        setResetStage(1);
      }, 8000);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    try {
      const rawStats = localStorage.getItem('dockcalc_user_stats') || '{}';
      const rawSettings = localStorage.getItem('dockcalc_settings_v3') || '{}';
      const rawAchievements = localStorage.getItem('dockcalc_unlocked_achievements') || '[]';
      const rawTimestamps = localStorage.getItem('dockcalc_achievement_timestamps') || '{}';
      const rawStreak = localStorage.getItem('dockcalc_daily_streak') || '{}';

      const payload = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        userStats: JSON.parse(rawStats),
        settings: JSON.parse(rawSettings),
        unlockedAchievements: JSON.parse(rawAchievements),
        achievementTimestamps: JSON.parse(rawTimestamps),
        dailyStreak: JSON.parse(rawStreak),
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dockcalc-data-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Offline statistics & milestones backup downloaded!');
    } catch {
      toast.error('Failed to export backup data.');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.userStats) {
          localStorage.setItem('dockcalc_user_stats', JSON.stringify(data.userStats));
        }
        if (data.unlockedAchievements) {
          localStorage.setItem('dockcalc_unlocked_achievements', JSON.stringify(data.unlockedAchievements));
        }
        if (data.achievementTimestamps) {
          localStorage.setItem('dockcalc_achievement_timestamps', JSON.stringify(data.achievementTimestamps));
        }
        if (data.dailyStreak) {
          localStorage.setItem('dockcalc_daily_streak', JSON.stringify(data.dailyStreak));
        }
        if (data.settings) {
          const cur = JSON.parse(localStorage.getItem('dockcalc_settings_v3') || '{}');
          localStorage.setItem('dockcalc_settings_v3', JSON.stringify({
            ...cur,
            ...data.settings,
            unlockedAchievements: data.unlockedAchievements || cur.unlockedAchievements,
          }));
        }
        toast.success('Backup restored successfully! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch {
        toast.error('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  // Compute Noteworthy Statistics: 4 Key Metrics
  // 1. Most Used Number (Digit 0-9)
  const allDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const sortedDigitsByUsageDesc = [...allDigits].sort(
    (a, b) => (stats.digitCounts?.[b] || 0) - (stats.digitCounts?.[a] || 0)
  );
  const mostPressedDigit =
    stats.totalDigitsPressed > 0 && (stats.digitCounts?.[sortedDigitsByUsageDesc[0]] || 0) > 0
      ? { digit: sortedDigitsByUsageDesc[0], count: stats.digitCounts[sortedDigitsByUsageDesc[0]] }
      : null;

  // 2. Least Used Number (Digit 0-9)
  const sortedDigitsByUsageAsc = [...allDigits].sort(
    (a, b) => (stats.digitCounts?.[a] || 0) - (stats.digitCounts?.[b] || 0)
  );
  const leastPressedDigit =
    stats.totalDigitsPressed > 0
      ? { digit: sortedDigitsByUsageAsc[0], count: stats.digitCounts?.[sortedDigitsByUsageAsc[0]] || 0 }
      : null;

  // 3. Most Common Calculated Result Number
  const resultEntries = Object.entries(stats.calculatedResultCounts || {});
  const sortedResults = resultEntries.sort(([, a], [, b]) => b - a);
  const mostCommonCalculatedResult =
    sortedResults.length > 0 && sortedResults[0][1] > 0
      ? { value: sortedResults[0][0], count: sortedResults[0][1] }
      : null;

  // 4. Running Average Value
  const avgCalcValue = stats.countOfCalculationsForAverage > 0
    ? (stats.sumOfCalculations / stats.countOfCalculationsForAverage).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : '—';

  // Dynamic contrast handling based on theme:
  // When active theme has a dark background (modern dark, solar amber, cyber emerald, terracotta, custom dark),
  // guarantee high-contrast WCAG AA readable text colors instead of hardcoded near-black text.
  const isLight =
    themeClasses.card.includes('text-[#0F172A]') ||
    themeClasses.card.includes('text-[#111111]') ||
    false;

  const textPrimaryClass = isLight ? 'text-slate-900' : 'text-slate-100';
  const textSecondaryClass = isLight ? 'text-slate-700' : 'text-slate-300';
  const textMutedClass = isLight ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="space-y-4">
      {/* 1. Milestone Progress Hero Card */}
      <div
        role={onOpenMilestones ? 'button' : undefined}
        tabIndex={onOpenMilestones ? 0 : undefined}
        onClick={onOpenMilestones}
        onKeyDown={(e) => {
          if (onOpenMilestones && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onOpenMilestones();
          }
        }}
        className={`p-3.5 sm:p-4 rounded-xl border ${themeClasses.card} space-y-3 transition-all ${
          onOpenMilestones
            ? 'cursor-pointer hover:border-primary/60 hover:shadow-sm active:scale-[0.99] group'
            : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-bold ${textPrimaryClass} group-hover:text-primary transition-colors`}>
                  Next Calculation Milestone
                </span>
                {onOpenMilestones && (
                  <span className="text-[10px] text-sky-500 dark:text-sky-400 font-semibold hidden sm:inline">
                    (Click to review all milestones →)
                  </span>
                )}
              </div>
              <div className={`text-[11px] truncate ${textSecondaryClass} font-medium`}>
                {nextMilestone.title} ({nextMilestone.target.toLocaleString()} calculations)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-black font-mono text-primary">{progressPercent}%</span>
            {onOpenMilestones && (
              <ChevronRight className={`w-4 h-4 ${textMutedClass} group-hover:text-primary group-hover:translate-x-0.5 transition-all`} />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden border border-border/40">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className={`flex items-center justify-between text-[10px] ${textMutedClass} font-medium pt-0.5`}>
          <span>{currentTotal.toLocaleString()} evaluated</span>
          <span className="group-hover:text-primary transition-colors font-semibold">
            {Math.max(0, nextMilestone.target - currentTotal).toLocaleString()} to unlock
          </span>
        </div>
      </div>

      {/* 2. Lifetime Highlights Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <Calculator className="w-3 h-3 text-primary" /> Lifetime Calcs
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-primary">
              {stats.totalCalculations.toLocaleString()}
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <Hash className="w-3 h-3 text-amber-500" /> Digits Keyed
            </div>
            <div className={`text-base sm:text-lg font-black font-mono ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
              {stats.totalDigitsPressed.toLocaleString()}
            </div>
          </div>

          {/* Replaced Equals Pressed with Times Calculator Cleared */}
          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <Eraser className="w-3 h-3 text-rose-500" /> Times Cleared
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-400">
              {(stats.totalClearPressed || 0).toLocaleString()}
            </div>
          </div>

          <div
            role={onOpenMilestones ? 'button' : undefined}
            tabIndex={onOpenMilestones ? 0 : undefined}
            onClick={onOpenMilestones}
            onKeyDown={(e) => {
              if (onOpenMilestones && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onOpenMilestones();
              }
            }}
            className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 transition-all shadow-xs ${
              onOpenMilestones
                ? 'cursor-pointer hover:border-primary/60 hover:shadow-sm active:scale-95 group'
                : ''
            }`}
          >
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold group-hover:text-primary transition-colors`}>
              <Trophy className="w-3 h-3 text-yellow-500 group-hover:scale-110 transition-transform" /> Milestones
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-amber-600 dark:text-amber-400 group-hover:brightness-110 transition-all">
              {unlockedMilestonesCount}/{ACHIEVEMENTS_LIST.length}
            </div>
            {onOpenMilestones && (
              <div className={`text-[9px] ${textMutedClass} group-hover:text-primary font-medium flex items-center justify-center gap-0.5 pt-0.5`}>
                <span>View all</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
        </div>

        {/* Row 2: 4 Core Number Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* 1. Most Used Number */}
          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <Sparkles className="w-3 h-3 text-sky-500" /> Most Used Number
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-sky-600 dark:text-sky-400 truncate px-1">
              {mostPressedDigit ? `'${mostPressedDigit.digit}' (${mostPressedDigit.count.toLocaleString()}×)` : '—'}
            </div>
          </div>

          {/* 2. Most Common Calculated Number */}
          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <Target className="w-3 h-3 text-emerald-500" /> Most Common Result
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400 truncate px-1">
              {mostCommonCalculatedResult ? `${mostCommonCalculatedResult.value} (${mostCommonCalculatedResult.count}×)` : '—'}
            </div>
          </div>

          {/* 3. Least Used Number */}
          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <TrendingDown className="w-3 h-3 text-amber-500" /> Least Used Number
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-amber-600 dark:text-amber-400 truncate px-1">
              {leastPressedDigit ? `'${leastPressedDigit.digit}' (${leastPressedDigit.count.toLocaleString()}×)` : '—'}
            </div>
          </div>

          {/* 4. Average Calculation Value */}
          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <TrendingUp className="w-3 h-3 text-rose-500" /> Avg Calc Value
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-rose-600 dark:text-rose-400 truncate px-1">
              {avgCalcValue}
            </div>
          </div>
        </div>

        {/* Row 3: Additional Power User Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <Sliders className="w-3 h-3 text-purple-500" /> Custom Key Uses
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-purple-600 dark:text-purple-400">
              {(stats.customKeyUses || 0).toLocaleString()}
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <Repeat className="w-3 h-3 text-teal-500" /> Conversions & RPN
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-teal-600 dark:text-teal-400">
              {(stats.totalConversions || 0) + (stats.totalRpnOps || 0)}
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <Flame className="w-3 h-3 text-orange-500" /> Highest Value
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-orange-600 dark:text-orange-400 truncate px-1">
              {stats.highestCalculatedValue !== null ? stats.highestCalculatedValue.toLocaleString() : '—'}
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border ${themeClasses.card} text-center space-y-0.5 shadow-xs`}>
            <div className={`flex items-center justify-center gap-1 text-[10px] ${textMutedClass} uppercase font-semibold`}>
              <Activity className="w-3 h-3 text-blue-500" /> Lowest Value
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-blue-600 dark:text-blue-400 truncate px-1">
              {stats.lowestCalculatedValue !== null ? stats.lowestCalculatedValue.toLocaleString() : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Calculator Mode Usage */}
      <div className={`p-3.5 sm:p-4 rounded-xl border ${themeClasses.card} space-y-2.5 shadow-xs`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-xs font-bold ${themeClasses.heading}`}>
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Mode Usage Distribution</span>
          </div>
          <span className={`text-[10px] ${textMutedClass} font-medium`}>
            {totalModeUses > 0 ? `${totalModeUses} mode sessions` : 'Active tracking'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {[
            { key: 'standard', name: 'Standard Mode', desc: 'Everyday math & paper tape' },
            { key: 'scientific', name: 'Scientific Mode', desc: 'Trigonometry & powers' },
            { key: 'programmer', name: 'Programmer Mode', desc: 'HEX/DEC/BIN bitwise' },
            { key: 'convert', name: 'Convert Mode', desc: 'Currencies & physical units' },
            { key: 'finance', name: 'Finance Mode', desc: 'Loans, tips & interest' },
          ].map((item) => {
            const count = stats.modesUsed[item.key as keyof UserStats['modesUsed']] || 0;
            const pct = totalModeUses > 0 ? Math.round((count / totalModeUses) * 100) : 0;
            return (
              <div key={item.key} className={`p-2 rounded-lg border ${themeClasses.subCard} space-y-1`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${textPrimaryClass}`}>{item.name}</span>
                  <span className="font-mono text-[11px] text-primary font-bold">{count} ({pct}%)</span>
                </div>
                <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary/80 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Arithmetic & Operations Breakdown */}
      <div className={`p-3.5 sm:p-4 rounded-xl border ${themeClasses.card} space-y-2.5 shadow-xs`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-xs font-bold ${themeClasses.heading}`}>
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Operations Breakdown</span>
          </div>
          <span className={`text-[10px] ${textMutedClass} font-medium`}>{totalOpsSum} logged ops</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
          {[
            { label: 'Addition (+)', count: stats.operations.add },
            { label: 'Subtraction (−)', count: stats.operations.subtract },
            { label: 'Multiplication (×)', count: stats.operations.multiply },
            { label: 'Division (÷)', count: stats.operations.divide },
            { label: 'Percentages (%)', count: stats.operations.percent },
            { label: 'Powers & Roots', count: stats.operations.power + stats.operations.sqrt },
            { label: 'Trigonometry', count: stats.operations.trig },
            { label: 'Logarithms', count: stats.operations.log },
            { label: 'Bitwise / Logic', count: stats.operations.bitwise },
          ].map((op) => (
            <div key={op.label} className={`p-2 rounded-lg border ${themeClasses.subCard} flex items-center justify-between`}>
              <span className={`text-[11px] ${textSecondaryClass} font-medium truncate`}>{op.label}</span>
              <span className={`font-mono font-bold text-xs ${textPrimaryClass} shrink-0`}>{op.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Mental Math Sprint & Fun Gadget Records */}
      <div className={`p-3.5 sm:p-4 rounded-xl border ${themeClasses.card} space-y-2.5 shadow-xs`}>
        <div className={`flex items-center gap-1.5 text-xs font-bold ${themeClasses.heading}`}>
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>Mini-Games & Gadgets Activity</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-center">
          <div className={`p-2 rounded-lg border ${themeClasses.subCard}`}>
            <div className={`text-[10px] ${textMutedClass} font-semibold uppercase`}>Sprint High Score</div>
            <div className="text-sm font-black font-mono text-primary">{stats.sprintStats.highScore}</div>
          </div>
          <div className={`p-2 rounded-lg border ${themeClasses.subCard}`}>
            <div className={`text-[10px] ${textMutedClass} font-semibold uppercase`}>Equations Solved</div>
            <div className={`text-sm font-black font-mono ${textPrimaryClass}`}>{stats.sprintStats.totalSolved}</div>
          </div>
          <div className={`p-2 rounded-lg border ${themeClasses.subCard}`}>
            <div className={`text-[10px] ${textMutedClass} font-semibold uppercase`}>Best Streak</div>
            <div className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">{stats.sprintStats.bestStreak}x</div>
          </div>
          <div className={`p-2 rounded-lg border ${themeClasses.subCard}`}>
            <div className={`text-[10px] ${textMutedClass} font-semibold uppercase`}>Dice & Coins</div>
            <div className={`text-sm font-black font-mono ${textPrimaryClass}`}>
              {stats.gadgetsStats.diceRolls + stats.gadgetsStats.coinFlips}
            </div>
          </div>
        </div>
      </div>

      {/* 6. System Activity & Numeric Extremes */}
      <div className={`p-3.5 sm:p-4 rounded-xl border ${themeClasses.card} space-y-2 shadow-xs`}>
        <div className={`flex items-center gap-1.5 text-xs font-bold ${themeClasses.heading}`}>
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>Activity Timeline & Extremes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className={`p-2.5 rounded-lg border ${themeClasses.subCard} space-y-1`}>
            <div className={`${textMutedClass} font-semibold text-[11px]`}>System Activity Period</div>
            <div className={`font-medium ${textSecondaryClass} flex items-center justify-between`}>
              <span>First Session:</span>
              <strong className={`font-mono ${textPrimaryClass}`}>{stats.firstSessionDate || 'Today'}</strong>
            </div>
            <div className={`font-medium ${textSecondaryClass} flex items-center justify-between`}>
              <span>Last Active:</span>
              <strong className={`font-mono ${textPrimaryClass}`}>{stats.lastActiveDate || 'Today'}</strong>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border ${themeClasses.subCard} space-y-1`}>
            <div className={`${textMutedClass} font-semibold text-[11px]`}>Numeric Calculation Range</div>
            <div className={`font-medium ${textSecondaryClass} flex items-center justify-between`}>
              <span>Highest Value:</span>
              <strong className="font-mono text-emerald-600 dark:text-emerald-400 truncate max-w-[140px]">
                {stats.highestCalculatedValue !== null ? stats.highestCalculatedValue.toLocaleString() : '—'}
              </strong>
            </div>
            <div className={`font-medium ${textSecondaryClass} flex items-center justify-between`}>
              <span>Lowest Value:</span>
              <strong className="font-mono text-blue-600 dark:text-blue-400 truncate max-w-[140px]">
                {stats.lowestCalculatedValue !== null ? stats.lowestCalculatedValue.toLocaleString() : '—'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Offline Storage & Backup Controls */}
      <div className={`p-3.5 sm:p-4 rounded-xl border ${themeClasses.card} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs`}>
        <div className="space-y-1">
          <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Offline Storage & Data Persistence</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Active & Persistent
            </span>
          </div>
          <span className={`text-[11px] ${textMutedClass} block max-w-lg leading-relaxed`}>
            All statistics, calculation counts, streaks, and milestone badges remain permanently saved in your device storage and persist across offline sessions, app updates, and restarts.
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportData}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            title="Import an existing data backup"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <button
            type="button"
            onClick={handleExportData}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            title="Download an offline JSON backup of your statistics and milestones"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      {/* 8. Reset Stats Control - 3 Stage with Fixed Size Invariant Hold Card */}
      <div className={`p-3.5 sm:p-4 rounded-xl border ${themeClasses.card} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Reset Statistics Data</span>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            {resetStage === 1 && 'Persistent statistics on this device. Click to begin reset process.'}
            {resetStage === 2 && 'Step 2/3: Click confirmation required before final hold step.'}
            {resetStage === 3 && 'Step 3/3: Press and hold the button for 5 continuous seconds to confirm reset.'}
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {resetStage > 1 && (
            <button
              type="button"
              onClick={() => {
                setResetStage(1);
                setHoldProgress(0);
              }}
              className="px-2.5 py-2 rounded-lg text-xs border border-border/60 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
          )}

          {resetStage === 1 && (
            <button
              type="button"
              onClick={handleStageClick}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Statistics</span>
            </button>
          )}

          {resetStage === 2 && (
            <button
              type="button"
              onClick={handleStageClick}
              className="px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-amber-500 text-amber-950 hover:bg-amber-400 transition-all shadow-xs animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Are you sure?</span>
            </button>
          )}

          {resetStage === 3 && (
            <div className="relative">
              <button
                type="button"
                onMouseDown={startHolding}
                onMouseUp={cancelHolding}
                onMouseLeave={cancelHolding}
                onTouchStart={startHolding}
                onTouchEnd={cancelHolding}
                onTouchCancel={cancelHolding}
                className="relative overflow-hidden w-[230px] sm:w-[240px] h-9 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white select-none transition-transform active:scale-95 shadow-sm"
              >
                {/* 5-second Hold Progress Fill Bar */}
                <div
                  className="absolute inset-0 bg-red-950/70 transition-all duration-75 pointer-events-none"
                  style={{ width: `${holdProgress}%` }}
                />
                <RotateCcw className={`w-3.5 h-3.5 relative z-10 shrink-0 ${holdProgress > 0 ? 'animate-spin' : ''}`} />
                <span className="relative z-10 font-bold whitespace-nowrap truncate">
                  {holdProgress > 0
                    ? `Holding... ${Math.round(holdProgress)}% (${(5 - (holdProgress * 5) / 100).toFixed(1)}s)`
                    : 'Hold for 5 seconds to reset'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
