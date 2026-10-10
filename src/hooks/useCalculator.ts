import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type {
  CalcMode,
  AngleUnit,
  NumberBase,
  BitWidth,
  HistoryItem,
  MemorySlot,
  CalculatorSettings,
  CustomButtonConfig,
  ProgrammableKeyId,
} from '@/types/calculator';
import {
  factorial,
  toRadians,
  fromRadians,
  sanitizeNumber,
  formatDisplayNumber,
  parseBaseString,
  formatBaseBigInt,
  clampBigInt,
  getBitMask,
  toggleBit,
  bitShift,
} from '@/lib/mathEngine';
import { soundFX } from '@/lib/audio';
import { fireCelebratoryParticles, fireCloverConfetti } from '@/lib/confetti';
import {
  isPrimeNumber,
  isFibonacciNumber,
  ACHIEVEMENTS_LIST,
  checkCalculationMilestones,
  checkCustomKeyMilestones,
  checkWonderAndModeMilestones,
  checkEpicCompletionistMilestone,
  type AchievementItem,
} from '@/lib/numberMagic';
import {
  recordCalculation,
  recordDigitPress,
  recordClearPress,
  recordBackspacePress,
  recordMemoryOp,
  recordEasterEgg,
  recordCustomKeyUse,
  recordConversion,
  recordRpnOp,
  getUserStats,
} from '@/lib/userStats';
import { toast } from 'sonner';
import { THEMES, buildCustomTheme, getCustomThemeStyles } from '@/lib/themes';
import { DEFAULT_KEY_HOTKEYS, type ProgrammableKeysConfig } from '@/types/calculator';

const STORAGE_KEY_SETTINGS = 'dockalc_calculator_settings_v1';
const STORAGE_KEY_HISTORY = 'dockalc_calculator_history_v1';
const STORAGE_KEY_MEMORY = 'dockalc_calculator_memory_v1';

export const DEFAULT_PROGRAMMABLE_KEYS: ProgrammableKeysConfig = {
  custom: {
    label: 'Tax +8%',
    actionType: 'tax',
    value: '8',
    hotkey: DEFAULT_KEY_HOTKEYS.custom,
  },
  reciprocal: {
    label: '1/x',
    actionType: 'default_unary',
    value: '1/x',
    hotkey: DEFAULT_KEY_HOTKEYS.reciprocal,
  },
  sqr: {
    label: 'x²',
    actionType: 'default_unary',
    value: 'sqr',
    hotkey: DEFAULT_KEY_HOTKEYS.sqr,
  },
  sqrt: {
    label: '√',
    actionType: 'default_unary',
    value: '√x',
    hotkey: DEFAULT_KEY_HOTKEYS.sqrt,
  },
};

const DEFAULT_SETTINGS: CalculatorSettings = {
  theme: 'dockalc-dark',
  customTheme: {
    hue: 217,
    saturation: 90,
    lightness: 60,
    opacity: 0.95,
    mode: 'dark',
    hexColor: '#3B82F6',
  },
  fontStyle: 'montserrat',
  keypadFontWeight: 'medium',
  numberFontWeight: 'medium',
  fontScale: 1.0,
  displayFontScale: 1.0,
  cornerRadius: 'extra',
  cornerRadiusPx: 16,
  soundEnabled: true,
  soundVolume: 0.35,
  vibrateEnabled: true,
  thousandsSeparator: true,
  decimalPlaces: -1,
  notation: 'normal',
  rpnMode: false,
  showBitGrid: true,
  tapeDocked: true,
  showMemoryBar: true,
  showPaperTape: true,
  showEquationBar: true,
  equationBarPosition: 'bottom',
  alwaysOnTop: false,
  windowOpacity: 1,
  compactOverlay: false,
  tabletRatio: 65,
  deviceLayout: 'auto',
  confettiEnabled: false,
  confettiMode: 'everyX',
  confettiEveryX: 5,
  confettiRandomMin: 5,
  confettiRandomMax: 50,
  funNumberRoll: false,
  funMatrixGlow: false,
  funVictoryChime: false,
  funRippleWaves: false,
  soundPack: 'default',
  particleStyle: 'confetti',
  upsideDownMode: false,
  hitchhiker42Enabled: true,
  numberMagicBadges: true,
  unlockedAchievements: [],
  customButton: {
    label: 'Tax +8%',
    actionType: 'tax',
    value: '8',
    hotkey: DEFAULT_KEY_HOTKEYS.custom,
  },
  programmableKeys: DEFAULT_PROGRAMMABLE_KEYS,
};

const DEFAULT_MEMORY_SLOTS: MemorySlot[] = Array.from({ length: 10 }, (_, i) => ({
  index: i,
  value: '0',
  updatedAt: Date.now(),
  label: `M${i}`,
}));

export function useCalculator() {
  const [mode, setModeState] = useState<CalcMode>('standard');
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [runningEquation, setRunningEquation] = useState<string>('');
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [isNewInput, setIsNewInput] = useState<boolean>(true);
  
  // Sequential milestone celebration queue
  const [milestoneQueue, setMilestoneQueue] = useState<AchievementItem[]>([]);
  const currentMilestoneCelebration = milestoneQueue.length > 0 ? milestoneQueue[0] : null;

  const clearCelebratedMilestone = useCallback(() => {
    setMilestoneQueue((q) => q.slice(1));
  }, []);

  const dismissMilestoneCelebration = useCallback(() => {
    setMilestoneQueue((q) => q.slice(1));
  }, []);

  // Track recent calculation timestamps for Rapid Fire (5 within 15s)
  const recentCalcTimestampsRef = useRef<number[]>([]);

  // Track modes used for polymath / all-rounder milestones
  const [usedModes, setUsedModes] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('dockcalc_used_modes');
      return s ? JSON.parse(s) : ['standard'];
    } catch {
      return ['standard'];
    }
  });

  // Scientific controls
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('DEG');
  const [is2nd, setIs2nd] = useState<boolean>(false);
  const [parenthesisStack, setParenthesisStack] = useState<{ prev: string | null; op: string | null }[]>([]);

  // Programmer controls
  const [base, setBaseState] = useState<NumberBase>('DEC');
  const [bitWidth, setBitWidth] = useState<BitWidth>(64);
  const [programmerBigInt, setProgrammerBigInt] = useState<bigint>(0n);

  // RPN Stack
  const [rpnStack, setRpnStack] = useState<string[]>([]);

  // Fun Confetti & Addons counter
  const enterPressCountRef = useRef<number>(0);
  const randomThresholdRef = useRef<number | null>(null);

  // Memory & History
  const [activeMemorySlot, setActiveMemorySlot] = useState<number>(0);
  const [memorySlots, setMemorySlots] = useState<MemorySlot[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_MEMORY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_MEMORY_SLOTS;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [settings, setSettings] = useState<CalculatorSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
        let parsed = saved ? JSON.parse(saved) : {};

        // Hydrate from dedicated achievement backup if settings was corrupted or missing
        try {
          const backupUnlocked = JSON.parse(localStorage.getItem('dockcalc_unlocked_achievements') || '[]');
          const backupTimestamps = JSON.parse(localStorage.getItem('dockcalc_achievement_timestamps') || '{}');
          if (Array.isArray(backupUnlocked) && backupUnlocked.length > (parsed.unlockedAchievements?.length || 0)) {
            parsed = {
              ...parsed,
              unlockedAchievements: Array.from(new Set([...(parsed.unlockedAchievements || []), ...backupUnlocked])),
              achievementUnlockedAt: { ...backupTimestamps, ...(parsed.achievementUnlockedAt || {}) },
            };
          }
        } catch {
          // ignore
        }

        if (saved || parsed.unlockedAchievements) {
          const progKeys: ProgrammableKeysConfig = {
            ...DEFAULT_PROGRAMMABLE_KEYS,
            ...(parsed.programmableKeys || {}),
          };
          // Ensure all programmable keys have valid hotkey configurations
          (['custom', 'reciprocal', 'sqr', 'sqrt'] as ProgrammableKeyId[]).forEach((id) => {
            if (!progKeys[id]?.hotkey) {
              progKeys[id] = {
                ...progKeys[id],
                hotkey: DEFAULT_KEY_HOTKEYS[id],
              };
            }
          });

          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            displayFontScale:
              !parsed.displayFontScale || parsed.displayFontScale === 1.5
                ? 1.0
                : parsed.displayFontScale,
            programmableKeys: progKeys,
          };
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Keep ref for audio
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      if (settings.unlockedAchievements && settings.unlockedAchievements.length > 0) {
        localStorage.setItem('dockcalc_unlocked_achievements', JSON.stringify(settings.unlockedAchievements));
      }
      if (settings.achievementUnlockedAt && Object.keys(settings.achievementUnlockedAt).length > 0) {
        localStorage.setItem('dockcalc_achievement_timestamps', JSON.stringify(settings.achievementUnlockedAt));
      }
    } catch {
      // Storage unavailable
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // Storage unavailable
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(memorySlots));
    } catch {
      // Storage unavailable
    }
  }, [memorySlots]);

  // Keep soundFX global mute in sync with calculator settings
  useEffect(() => {
    soundFX.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  const playClick = useCallback((type: 'num' | 'op' | 'fn' | 'equal' | 'clear' = 'num', keyLabel?: string) => {
    if (settingsRef.current.soundEnabled) {
      soundFX.playKeyClick(
        settingsRef.current.soundVolume,
        type,
        settingsRef.current.soundPack || 'default',
        keyLabel
      );
    }
    if (settingsRef.current.vibrateEnabled) {
      soundFX.vibrate(10);
    }
  }, []);

  // Update programmer BigInt whenever display changes in programmer mode
  useEffect(() => {
    if (mode === 'programmer') {
      const parsed = parseBaseString(display, base);
      setProgrammerBigInt(clampBigInt(parsed, bitWidth));
    }
  }, [display, base, bitWidth, mode]);

  const unlockAchievement = useCallback((id: string) => {
    setSettings((prev) => {
      const cur = prev.unlockedAchievements || [];
      if (cur.includes(id)) return prev;
      const now = Date.now();
      const updatedTimestamps = { ...(prev.achievementUnlockedAt || {}), [id]: now };
      const item = ACHIEVEMENTS_LIST.find((a) => a.id === id);
      if (item) {
        setMilestoneQueue((q) => {
          if (q.some((existing) => existing.id === item.id)) return q;
          return [...q, item];
        });
      }
      const updated = [...cur, id];

      // Check if all other non-epic, non-secret milestones are now unlocked -> unlock EPIC
      const nonEpicNonSecretIds = ACHIEVEMENTS_LIST.filter((a) => a.id !== 'all-milestones-epic' && !a.isSecret).map((a) => a.id);
      if (!updated.includes('all-milestones-epic') && nonEpicNonSecretIds.every((k) => updated.includes(k))) {
        updated.push('all-milestones-epic');
        updatedTimestamps['all-milestones-epic'] = now;
        const epicItem = ACHIEVEMENTS_LIST.find((a) => a.id === 'all-milestones-epic');
        if (epicItem) {
          setMilestoneQueue((q) => {
            if (q.some((existing) => existing.id === epicItem.id)) return q;
            return [...q, epicItem];
          });
        }
      }

      // Meta Progress Milestones check
      const totalAll = ACHIEVEMENTS_LIST.length;
      const ratio = updated.length / totalAll;

      const triggerMeta = (metaId: string) => {
        if (!updated.includes(metaId)) {
          updated.push(metaId);
          updatedTimestamps[metaId] = now;
          const metaItem = ACHIEVEMENTS_LIST.find((a) => a.id === metaId);
          if (metaItem) {
            setMilestoneQueue((q) => {
              if (q.some((existing) => existing.id === metaItem.id)) return q;
              return [...q, metaItem];
            });
          }
        }
      };

      if (ratio >= 0.25) triggerMeta('collector-25');
      if (ratio >= 0.50) triggerMeta('collector-50');
      if (ratio >= 0.75) triggerMeta('collector-75');

      const wonderBadges = ACHIEVEMENTS_LIST.filter((a) => a.category === 'wonder').map((a) => a.id);
      if (wonderBadges.length > 0 && wonderBadges.every((bId) => updated.includes(bId))) {
        triggerMeta('set-wonders');
      }

      const modeBadges = ACHIEVEMENTS_LIST.filter((a) => a.category === 'mode').map((a) => a.id);
      if (modeBadges.length > 0 && modeBadges.every((bId) => updated.includes(bId))) {
        triggerMeta('set-modes');
      }

      const gameBadges = ACHIEVEMENTS_LIST.filter((a) => a.category === 'game').map((a) => a.id);
      if (gameBadges.length > 0 && gameBadges.every((bId) => updated.includes(bId))) {
        triggerMeta('set-games');
      }

      const tiersCovered = new Set(ACHIEVEMENTS_LIST.filter((a) => updated.includes(a.id)).map((a) => a.tier));
      if (tiersCovered.has('bronze') && tiersCovered.has('silver') && tiersCovered.has('gold') && tiersCovered.has('legendary')) {
        triggerMeta('full-spectrum');
      }

      const secretUnlockedCount = ACHIEVEMENTS_LIST.filter((a) => a.isSecret && updated.includes(a.id)).length;
      if (secretUnlockedCount >= 5) {
        triggerMeta('secret-finder');
      }

      return { ...prev, unlockedAchievements: updated, achievementUnlockedAt: updatedTimestamps };
    });
  }, []);

  // Daily Streak checker
  const checkDailyStreak = useCallback(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const stored = localStorage.getItem('dockcalc_daily_streak');
      let streak = 1;
      if (stored) {
        const parsed = JSON.parse(stored);
        const lastDate = new Date(parsed.lastDate);
        const today = new Date(todayStr);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
          streak = parsed.streak || 1;
        } else if (diffDays === 1) {
          streak = (parsed.streak || 0) + 1;
        } else {
          streak = 1;
        }
      }
      localStorage.setItem('dockcalc_daily_streak', JSON.stringify({ lastDate: todayStr, streak }));
      if (streak >= 3) unlockAchievement('streak-3');
      if (streak >= 7) unlockAchievement('streak-7');
      if (streak >= 30) unlockAchievement('streak-30');
      if (streak >= 100) unlockAchievement('streak-100');
      if (streak >= 365) unlockAchievement('streak-365');
    } catch {
      // ignore
    }
  }, [unlockAchievement]);

  useEffect(() => {
    checkDailyStreak();
  }, [checkDailyStreak]);

  // Track theme hopping (try every theme)
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('dockcalc_themes_used') || '[]');
      if (settings.theme && !stored.includes(settings.theme)) {
        const next = [...stored, settings.theme];
        localStorage.setItem('dockcalc_themes_used', JSON.stringify(next));
        if (next.length >= 5) {
          unlockAchievement('theme-hopper');
        }
      }
    } catch {
      // ignore
    }
  }, [settings.theme, unlockAchievement]);

  // Clipboard copy tracker
  const recordClipboardCopy = useCallback(() => {
    try {
      const copies = (parseInt(localStorage.getItem('dockcalc_copy_count') || '0', 10) || 0) + 1;
      localStorage.setItem('dockcalc_copy_count', copies.toString());
      if (copies >= 25) {
        unlockAchievement('copycat');
      }
    } catch {
      // ignore
    }
  }, [unlockAchievement]);

  // Listen to global copy events to record clipboard copying
  useEffect(() => {
    const handleCopy = () => {
      recordClipboardCopy();
    };
    window.addEventListener('copy', handleCopy);
    return () => window.removeEventListener('copy', handleCopy);
  }, [recordClipboardCopy]);

  // Record history item
  const recordHistory = useCallback(
    (expr: string, res: string, calcMode: CalcMode, currentBase?: NumberBase, runningEq?: string) => {
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: Date.now(),
        expression: expr,
        runningEquation: runningEq || expr,
        result: res,
        mode: calcMode,
        base: calcMode === 'programmer' ? currentBase : undefined,
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 200));
    },
    []
  );

  // Digit input
  const inputDigit = useCallback((digit: string) => {
    playClick('num');
    recordDigitPress(digit);

    if (mode === 'programmer') {
      // Validate digit for active base
      const validHex = /^[0-9A-Fa-f]$/;
      const validDec = /^[0-9]$/;
      const validOct = /^[0-7]$/;
      const validBin = /^[0-1]$/;

      let isValid = false;
      if (base === 'HEX' && validHex.test(digit)) isValid = true;
      if (base === 'DEC' && validDec.test(digit)) isValid = true;
      if (base === 'OCT' && validOct.test(digit)) isValid = true;
      if (base === 'BIN' && validBin.test(digit)) isValid = true;

      if (!isValid) return;

      setDisplay((prev) => {
        if (isNewInput || prev === '0' || prev === 'Error') {
          setIsNewInput(false);
          return digit.toUpperCase();
        }
        const updated = prev + digit.toUpperCase();
        // Check if value fits in bit width
        const parsed = parseBaseString(updated, base);
        const clamped = clampBigInt(parsed, bitWidth);
        return formatBaseBigInt(clamped, base, bitWidth);
      });
      return;
    }

    // Standard / Scientific mode
    setDisplay((prev) => {
      if (isNewInput || prev === '0' || prev === 'Error') {
        setIsNewInput(false);
        return digit;
      }
      if (prev.length > 20) return prev;
      return prev + digit;
    });

    setRunningEquation((prev) => {
      if (hasEvaluated) {
        setHasEvaluated(false);
        return digit;
      }
      return prev ? `${prev}${digit}` : digit;
    });
  }, [base, bitWidth, hasEvaluated, isNewInput, mode, playClick]);

  // Decimal point input
  const inputDecimal = useCallback(() => {
    if (mode === 'programmer') return; // No decimals in programmer mode
    playClick('num');

    setDisplay((prev) => {
      if (isNewInput || prev === 'Error') {
        setIsNewInput(false);
        return '0.';
      }
      if (prev.includes('.')) return prev;
      return `${prev}.`;
    });

    setRunningEquation((prev) => {
      if (hasEvaluated) {
        setHasEvaluated(false);
        return '0.';
      }
      if (!prev) return '0.';
      const lastToken = prev.trim().split(' ').pop() || '';
      if (lastToken.includes('.')) return prev;
      return `${prev}.`;
    });
  }, [hasEvaluated, isNewInput, mode, playClick]);

  // Single character delete / backspace
  const deleteChar = useCallback(() => {
    playClick('clear');
    recordBackspacePress();
    setDisplay((prev) => {
      if (prev === 'Error' || prev.length <= 1) {
        setIsNewInput(true);
        return '0';
      }
      return prev.slice(0, -1);
    });

    setRunningEquation((prev) => {
      if (prev.length <= 1) return '';
      return prev.slice(0, -1);
    });
  }, [playClick]);

  // Clear current / All Clear
  const clear = useCallback((all: boolean = false) => {
    playClick('clear');
    recordClearPress();
    try {
      const clears = (parseInt(localStorage.getItem('dockcalc_clear_count') || '0', 10) || 0) + 1;
      localStorage.setItem('dockcalc_clear_count', clears.toString());
      if (clears >= 100) {
        unlockAchievement('clean-slate');
      }
    } catch {
      // ignore
    }
    setDisplay('0');
    setIsNewInput(true);
    setHasEvaluated(false);
    if (all) {
      setExpression('');
      setRunningEquation('');
      setPreviousValue(null);
      setPendingOp(null);
      setParenthesisStack([]);
    } else {
      setRunningEquation((prev) => {
        const parts = prev.trim().split(' ');
        if (parts.length > 1) {
          parts.pop();
          return `${parts.join(' ')} `;
        }
        return '';
      });
    }
  }, [playClick, unlockAchievement]);

  // Execute binary operation calculation
  const executeMath = useCallback((a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return sanitizeNumber(a + b);
      case '−':
      case '-':
        return sanitizeNumber(a - b);
      case '×':
      case '*':
        return sanitizeNumber(a * b);
      case '÷':
      case '/':
        if (b === 0) throw new Error('Cannot divide by zero');
        return sanitizeNumber(a / b);
      case '%':
        return sanitizeNumber(a % b);
      case 'y^x':
      case '^':
        return sanitizeNumber(Math.pow(a, b));
      case 'x√y':
      case 'yroot':
        if (a === 0) throw new Error('Invalid Input');
        return sanitizeNumber(Math.pow(b, 1 / a));
      case 'EE':
        return sanitizeNumber(a * Math.pow(10, b));
      default:
        return b;
    }
  }, []);

  // Programmer binary operation calculation
  const executeProgrammerMath = useCallback((a: bigint, b: bigint, op: string, width: BitWidth): bigint => {
    const mask = getBitMask(width);
    let res: bigint;
    switch (op) {
      case '+':
        res = a + b;
        break;
      case '−':
      case '-':
        res = a - b;
        break;
      case '×':
      case '*':
        res = a * b;
        break;
      case '÷':
      case '/':
        if (b === 0n) throw new Error('Cannot divide by zero');
        res = a / b;
        break;
      case 'MOD':
      case '%':
        if (b === 0n) throw new Error('Cannot divide by zero');
        res = a % b;
        break;
      case 'AND':
        res = a & b;
        break;
      case 'OR':
        res = a | b;
        break;
      case 'XOR':
        res = a ^ b;
        break;
      case 'NAND':
        res = ~(a & b);
        break;
      case 'NOR':
        res = ~(a | b);
        break;
      case 'XNOR':
        res = ~(a ^ b);
        break;
      case 'Lsh':
        res = a << (b % BigInt(width));
        break;
      case 'Rsh':
        res = a >> (b % BigInt(width));
        break;
      default:
        res = b;
    }
    return res & mask;
  }, []);

  // Set binary operator (+, -, *, /, etc.)
  const setOperator = useCallback((op: string) => {
    playClick('op');

    if (settings.rpnMode) {
      // In RPN mode, binary operators evaluate immediately on top 2 stack items!
      if (rpnStack.length < 1) return;
      const bStr = display;
      const aStr = rpnStack[rpnStack.length - 1];
      const newStack = rpnStack.slice(0, -1);

      try {
        if (mode === 'programmer') {
          const a = parseBaseString(aStr, base);
          const b = parseBaseString(bStr, base);
          const res = executeProgrammerMath(a, b, op, bitWidth);
          const resStr = formatBaseBigInt(res, base, bitWidth);
          setDisplay(resStr);
          setRpnStack(newStack);
          setIsNewInput(true);
          recordHistory(`${aStr} ${op} ${bStr}`, resStr, mode, base);
        } else {
          const a = Number(aStr);
          const b = Number(bStr);
          const res = executeMath(a, b, op);
          const resStr = res.toString();
          setDisplay(resStr);
          setRpnStack(newStack);
          setIsNewInput(true);
          recordHistory(`${aStr} ${op} ${bStr}`, resStr, mode);
        }
      } catch (err: unknown) {
        setDisplay(err instanceof Error ? err.message : 'Error');
        setIsNewInput(true);
      }
      return;
    }

    // Standard Algebraic mode
    if (pendingOp && !isNewInput && previousValue !== null) {
      // Chain calculation
      try {
        let resultStr = '';
        if (mode === 'programmer') {
          const prevBig = parseBaseString(previousValue, base);
          const currBig = parseBaseString(display, base);
          const calcBig = executeProgrammerMath(prevBig, currBig, pendingOp, bitWidth);
          resultStr = formatBaseBigInt(calcBig, base, bitWidth);
        } else {
          const prevNum = Number(previousValue);
          const currNum = Number(display);
          const calcNum = executeMath(prevNum, currNum, pendingOp);
          resultStr = calcNum.toString();
        }
        setDisplay(resultStr);
        setPreviousValue(resultStr);
        setExpression(`${resultStr} ${op} `);
      } catch (err: unknown) {
        setDisplay(err instanceof Error ? err.message : 'Error');
        setExpression('');
        setPreviousValue(null);
        setPendingOp(null);
        setIsNewInput(true);
        return;
      }
    } else {
      setPreviousValue(display);
      setExpression(`${display} ${op} `);
    }

    setPendingOp(op);
    setIsNewInput(true);
    setHasEvaluated(false);
    setRunningEquation((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return `${display} ${op} `;
      }
      // If trailing character is already an operator, replace it
      if (/[\+\-\×\*\÷\/\%]$/.test(trimmed)) {
        return `${trimmed.slice(0, -1).trim()} ${op} `;
      }
      return `${trimmed} ${op} `;
    });
  }, [base, bitWidth, display, executeMath, executeProgrammerMath, isNewInput, mode, pendingOp, playClick, previousValue, recordHistory, rpnStack, settings.rpnMode]);

  // Equals (=) execution
  const calculateEquals = useCallback(() => {
    playClick('equal');

    if (settings.rpnMode) {
      // In RPN mode, enter pushes to stack
      setRpnStack((prev) => [...prev, display]);
      setIsNewInput(true);
      return;
    }

    if (!pendingOp || previousValue === null) {
      return;
    }

    try {
      let resultStr = '';
      const fullExpr = `${previousValue} ${pendingOp} ${display}`;

      // Check parentheses nesting depth for secret milestone (nested-deep)
      const exprToCheck = runningEquation || fullExpr;
      let depth = 0;
      let maxDepth = 0;
      for (const ch of exprToCheck) {
        if (ch === '(') {
          depth++;
          if (depth > maxDepth) maxDepth = depth;
        } else if (ch === ')') {
          depth = Math.max(0, depth - 1);
        }
      }
      if (maxDepth >= 5) {
        unlockAchievement('nested-deep');
      }

      // Check expression length / complexity for secret milestone (novelist)
      if (exprToCheck.length >= 20 || exprToCheck.split(/[\+\-\×\*\÷\/\s\(\)]+/).filter(Boolean).length >= 10) {
        unlockAchievement('novelist');
      }

      // Check daily calculation streak
      checkDailyStreak();

      if (mode === 'programmer') {
        const prevBig = parseBaseString(previousValue, base);
        const currBig = parseBaseString(display, base);
        const calcBig = executeProgrammerMath(prevBig, currBig, pendingOp, bitWidth);
        resultStr = formatBaseBigInt(calcBig, base, bitWidth);
      } else {
        const prevNum = Number(previousValue);
        const currNum = Number(display);
        const calcNum = executeMath(prevNum, currNum, pendingOp);
        resultStr = calcNum.toString();
      }

      setDisplay(resultStr);
      setExpression(`${fullExpr} =`);
      let eqToRecord = runningEquation ? runningEquation.trim() : fullExpr;
      if (eqToRecord.endsWith('=')) {
        eqToRecord = eqToRecord.slice(0, -1).trim();
      }
      // If eqToRecord ends with an operator (e.g. "3 +"), append display to ensure the second operand is captured
      if (/[\+\-\×\*\÷\/\%]$/.test(eqToRecord)) {
        eqToRecord = `${eqToRecord} ${display}`;
      } else if (!eqToRecord.includes(display) && !eqToRecord.endsWith(display)) {
        eqToRecord = fullExpr;
      }

      setRunningEquation(`${eqToRecord} =`);
      setHasEvaluated(true);
      recordHistory(fullExpr, resultStr, mode, mode === 'programmer' ? base : undefined, eqToRecord);
      setPreviousValue(null);
      setPendingOp(null);
      setIsNewInput(true);

      // Track total successful equal evaluations
      enterPressCountRef.current += 1;
      const count = enterPressCountRef.current;

      // Celebratory Confetti & Fun Addons execution
      if (settings.confettiEnabled) {
        const confettiMode = settings.confettiMode || 'everyX';

        let shouldFire = false;
        if (confettiMode === 'every') {
          shouldFire = true;
        } else if (confettiMode === 'everyX' || confettiMode === 'every10') {
          const interval = Math.max(2, settings.confettiEveryX ?? 5);
          if (count % interval === 0) {
            shouldFire = true;
          }
        } else if (confettiMode === 'random') {
          const min = Math.max(1, settings.confettiRandomMin ?? 5);
          const max = Math.max(min, settings.confettiRandomMax ?? 50);
          if (randomThresholdRef.current === null) {
            randomThresholdRef.current = Math.floor(Math.random() * (max - min + 1)) + min;
          }
          if (count >= randomThresholdRef.current) {
            shouldFire = true;
            enterPressCountRef.current = 0;
            randomThresholdRef.current = Math.floor(Math.random() * (max - min + 1)) + min;
          }
        }

        if (shouldFire) {
          fireCelebratoryParticles(settings.particleStyle || 'confetti');
        }
      }

      // Rapid fire calculation tracking (5 calculations in 15 seconds)
      const nowTime = Date.now();
      recentCalcTimestampsRef.current = [
        ...recentCalcTimestampsRef.current.filter((t) => nowTime - t < 15000),
        nowTime,
      ];
      if (recentCalcTimestampsRef.current.length >= 5) {
        unlockAchievement('rapid-fire');
      }

      // Achievement checks & Easter eggs
      if ((settings.hitchhiker42Enabled ?? true) && (resultStr === '42' || resultStr === '42.0')) {
        toast('🌌 42: The Answer to Life, the Universe, and Everything!', {
          description: 'Hitchhiker’s Guide cosmic easter egg discovered!',
          duration: 4000,
        });
        unlockAchievement('the-answer');
        recordEasterEgg('hitchhiker42');
      }

      // Progressive Calculation Volume Milestones & Persistent User Stats Recording
      const numVal = Number(resultStr);

      // Favorite Number Clover Confetti Match Trigger
      const favNumStr = (settings.favoriteNumber ?? '').toString().trim();
      if (
        settings.favoriteNumberCloverEnabled &&
        favNumStr &&
        (resultStr === favNumStr ||
          (!Number.isNaN(Number(favNumStr)) && Math.abs(numVal - Number(favNumStr)) < 1e-9))
      ) {
        fireCloverConfetti();
        toast('🍀 Favorite Number Calculated!', {
          description: `Result matched your favorite number (${favNumStr})!`,
          duration: 3500,
        });
      }

      // Secret Milestone: Lucky Number 13 (Calculated 13 times)
      if (resultStr === '13' || Math.abs(numVal - 13) < 1e-9) {
        let count13 = 0;
        try {
          count13 = (parseInt(localStorage.getItem('dockcalc_calc_13_count') || '0', 10) || 0) + 1;
          localStorage.setItem('dockcalc_calc_13_count', count13.toString());
        } catch {
          count13 += 1;
        }
        if (count13 >= 13) {
          unlockAchievement('lucky-number-13');
        }
      }

      // Secret Milestone: Dolly's Favorite (925)
      if (resultStr === '925' || Math.abs(numVal - 925) < 1e-9) {
        unlockAchievement('dollys-favorite');
      }

      // Secret Milestone: Revolutionary (1776)
      if (resultStr === '1776' || Math.abs(numVal - 1776) < 1e-9) {
        unlockAchievement('revolutionary');
      }

      // Secret Milestone: One Armed Bandit (777)
      if (resultStr === '777' || resultStr.endsWith('777') || Math.abs(numVal - 777) < 1e-9) {
        unlockAchievement('lucky-seven');
      }

      const updatedStats = recordCalculation({
        operator: pendingOp || undefined,
        mode,
        resultNum: Number.isNaN(numVal) ? undefined : numVal,
      });

      const totalCount = Math.max(count, updatedStats.totalCalculations);
      checkCalculationMilestones(totalCount, unlockAchievement);

      // Evaluate wonder, numeric magic, and mode milestones
      const curUsedModes = usedModes.includes(mode) ? usedModes : [...usedModes, mode];
      if (!usedModes.includes(mode)) {
        setUsedModes(curUsedModes);
        try {
          localStorage.setItem('dockcalc_used_modes', JSON.stringify(curUsedModes));
        } catch {
          // ignore storage error
        }
      }

      checkWonderAndModeMilestones(
        resultStr,
        mode,
        settings.rpnMode || rpnStack.length > 0,
        curUsedModes,
        unlockAchievement
      );

      if (settings.upsideDownMode) {
        unlockAchievement('pocket-acrobat');
      }

      if (settings.soundPack === 'typewriter' || settings.soundPack === 'piano') {
        unlockAchievement('audiophile');
      }
      if (settings.soundPack === 'piano') {
        unlockAchievement('piano-virtuoso');
      }

      if (settings.funVictoryChime && settings.soundEnabled) {
        soundFX.playVictoryChime(settings.soundVolume);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error';
      if (errMsg.toLowerCase().includes('divide by zero') || errMsg.toLowerCase().includes('cannot divide')) {
        unlockAchievement('black-hole');
      }
      setDisplay(errMsg);
      setExpression('');
      setRunningEquation('');
      setHasEvaluated(false);
      setPreviousValue(null);
      setPendingOp(null);
      setIsNewInput(true);
    }
  }, [base, bitWidth, display, executeMath, executeProgrammerMath, mode, pendingOp, playClick, previousValue, recordHistory, runningEquation, settings.rpnMode]);

  // Unary operations (Square, Square Root, Trig, Log, Negation, Reciprocal, etc.)
  const applyUnaryFunction = useCallback((fn: string) => {
    playClick('fn');

    if (mode === 'programmer') {
      try {
        const currentBig = parseBaseString(display, base);
        const mask = getBitMask(bitWidth);
        let resBig: bigint;

        switch (fn) {
          case '+/-':
          case 'NEG': {
            resBig = (-currentBig) & mask;
            break;
          }
          case 'NOT':
          case '~': {
            resBig = (~currentBig) & mask;
            break;
          }
          case 'x²': {
            resBig = (currentBig * currentBig) & mask;
            break;
          }
          default:
            return;
        }

        const resStr = formatBaseBigInt(resBig, base, bitWidth);
        setDisplay(resStr);
        setIsNewInput(true);
        recordHistory(`${fn}(${display})`, resStr, mode, base);
      } catch {
        setDisplay('Error');
        setIsNewInput(true);
      }
      return;
    }

    // Standard / Scientific
    try {
      const x = Number(display);
      let res: number;
      let label = `${fn}(${display})`;

      switch (fn) {
        case '+/-':
          res = -x;
          label = `-( ${display} )`;
          break;
        case '1/x':
          if (x === 0) throw new Error('Cannot divide by zero');
          res = 1 / x;
          break;
        case 'x²':
          res = x * x;
          label = `sqr(${display})`;
          break;
        case 'x³':
          res = x * x * x;
          label = `cube(${display})`;
          break;
        case '√x':
        case 'sqrt':
          if (x < 0) throw new Error('Invalid Input');
          res = Math.sqrt(x);
          break;
        case '∛x':
        case 'cbrt':
          res = Math.cbrt(x);
          break;
        case '%':
          res = x / 100;
          label = `${display}%`;
          break;
        case 'sin':
          res = Math.sin(toRadians(x, angleUnit));
          break;
        case 'cos':
          res = Math.cos(toRadians(x, angleUnit));
          break;
        case 'tan': {
          const rad = toRadians(x, angleUnit);
          if (Math.abs(Math.cos(rad)) < 1e-15) throw new Error('Invalid Input');
          res = Math.tan(rad);
          break;
        }
        case 'asin':
          if (x < -1 || x > 1) throw new Error('Invalid Input');
          res = fromRadians(Math.asin(x), angleUnit);
          break;
        case 'acos':
          if (x < -1 || x > 1) throw new Error('Invalid Input');
          res = fromRadians(Math.acos(x), angleUnit);
          break;
        case 'atan':
          res = fromRadians(Math.atan(x), angleUnit);
          break;
        case 'sinh':
          res = Math.sinh(x);
          break;
        case 'cosh':
          res = Math.cosh(x);
          break;
        case 'tanh':
          res = Math.tanh(x);
          break;
        case 'asinh':
          res = Math.asinh(x);
          break;
        case 'acosh':
          if (x < 1) throw new Error('Invalid Input');
          res = Math.acosh(x);
          break;
        case 'atanh':
          if (x <= -1 || x >= 1) throw new Error('Invalid Input');
          res = Math.atanh(x);
          break;
        case 'ln':
          if (x <= 0) throw new Error('Invalid Input');
          res = Math.log(x);
          break;
        case 'log':
        case 'log10':
          if (x <= 0) throw new Error('Invalid Input');
          res = Math.log10(x);
          break;
        case 'log2':
          if (x <= 0) throw new Error('Invalid Input');
          res = Math.log2(x);
          break;
        case 'e^x':
          res = Math.exp(x);
          break;
        case '10^x':
          res = Math.pow(10, x);
          break;
        case '2^x':
          res = Math.pow(2, x);
          break;
        case 'n!':
        case 'fact':
          if (x < 0 || x > 170) throw new Error('Invalid Input');
          res = factorial(x);
          break;
        case 'abs':
          res = Math.abs(x);
          break;
        case 'rand':
          res = Math.random();
          label = 'rand()';
          break;
        default:
          return;
      }

      const sanitized = sanitizeNumber(res);
      const resStr = sanitized.toString();
      setDisplay(resStr);
      setExpression(label);
      setIsNewInput(true);
      const unaryEq = runningEquation ? `${runningEquation} [${fn}]` : label;
      recordHistory(label, resStr, mode, undefined, unaryEq);
    } catch (err: unknown) {
      setDisplay(err instanceof Error ? err.message : 'Error');
      setIsNewInput(true);
    }
  }, [angleUnit, base, bitWidth, display, mode, playClick, recordHistory]);

  // Insert mathematical constant
  const insertConstant = useCallback((c: 'pi' | 'e' | 'phi') => {
    playClick('num');
    let val = 0;
    switch (c) {
      case 'pi':
        val = Math.PI;
        break;
      case 'e':
        val = Math.E;
        break;
      case 'phi':
        val = 1.618033988749895;
        break;
    }
    setDisplay(val.toString());
    setIsNewInput(true);
  }, [playClick]);

  // Parentheses handling
  const handleParenthesis = useCallback((p: '(' | ')') => {
    playClick('op');
    if (p === '(') {
      setParenthesisStack((prev) => [...prev, { prev: previousValue, op: pendingOp }]);
      setPreviousValue(null);
      setPendingOp(null);
      setExpression((prev) => `${prev}( `);
      setIsNewInput(true);
    } else {
      if (parenthesisStack.length === 0) return;
      // Close parenthesis: evaluate inside
      if (pendingOp && previousValue !== null) {
        try {
          const a = Number(previousValue);
          const b = Number(display);
          const calc = executeMath(a, b, pendingOp);
          const top = parenthesisStack[parenthesisStack.length - 1];
          setParenthesisStack((prev) => prev.slice(0, -1));
          setPreviousValue(top.prev);
          setPendingOp(top.op);
          setDisplay(calc.toString());
          setExpression((prev) => `${prev}${display} ) `);
          setIsNewInput(true);
        } catch {
          setDisplay('Error');
        }
      } else {
        const top = parenthesisStack[parenthesisStack.length - 1];
        setParenthesisStack((prev) => prev.slice(0, -1));
        setPreviousValue(top.prev);
        setPendingOp(top.op);
        setExpression((prev) => `${prev}${display} ) `);
        setIsNewInput(true);
      }
    }
  }, [display, executeMath, parenthesisStack, pendingOp, playClick, previousValue]);

  // Mode switching
  const setMode = useCallback((newMode: CalcMode) => {
    playClick('fn');
    setModeState(newMode);
    setPendingOp(null);
    setPreviousValue(null);
    setExpression('');

    // If switching to standard mode, auto change notation style to standard ('normal')
    if (newMode === 'standard') {
      setSettings((prev) => ({ ...prev, notation: 'normal' }));
    }

    // If switching to programmer mode, ensure integer display
    if (newMode === 'programmer') {
      const num = Math.trunc(Number(display)) || 0;
      const bInt = clampBigInt(BigInt(num), bitWidth);
      setDisplay(formatBaseBigInt(bInt, base, bitWidth));
    }
  }, [base, bitWidth, display, playClick]);

  // Programmer mode: Base change
  const setBase = useCallback((newBase: NumberBase) => {
    playClick('fn');
    // Convert current programmerBigInt to new base
    const formatted = formatBaseBigInt(programmerBigInt, newBase, bitWidth);
    setBaseState(newBase);
    setDisplay(formatted);
    setIsNewInput(true);
  }, [bitWidth, playClick, programmerBigInt]);

  // Programmer mode: Bit width change (64, 32, 16, 8)
  const setBitWidthAction = useCallback((width: BitWidth) => {
    playClick('fn');
    setBitWidth(width);
    const clamped = clampBigInt(programmerBigInt, width);
    setProgrammerBigInt(clamped);
    setDisplay(formatBaseBigInt(clamped, base, width));
  }, [base, playClick, programmerBigInt]);

  // Programmer mode: Toggle specific bit (0 to 63)
  const toggleBitAt = useCallback((bitIndex: number) => {
    playClick('fn');
    const updated = toggleBit(programmerBigInt, bitIndex, bitWidth);
    setProgrammerBigInt(updated);
    setDisplay(formatBaseBigInt(updated, base, bitWidth));
  }, [base, bitWidth, playClick, programmerBigInt]);

  // Programmer mode: Bit shifts
  const applyBitShift = useCallback((shiftType: 'Lsh' | 'Rsh' | 'RoL' | 'RoR' | 'Ash') => {
    playClick('fn');
    const shifted = bitShift(programmerBigInt, shiftType, 1n, bitWidth);
    setProgrammerBigInt(shifted);
    const resStr = formatBaseBigInt(shifted, base, bitWidth);
    setDisplay(resStr);
    setIsNewInput(true);
    recordHistory(`${shiftType}(${display})`, resStr, 'programmer', base);
  }, [base, bitWidth, display, playClick, programmerBigInt, recordHistory]);

  // Memory Actions
  const memoryClear = useCallback((slotIdx?: number) => {
    playClick('clear');
    recordMemoryOp('clear');
    const idx = slotIdx ?? activeMemorySlot;
    setMemorySlots((prev) =>
      prev.map((slot) => (slot.index === idx ? { ...slot, value: '0', updatedAt: Date.now() } : slot))
    );
  }, [activeMemorySlot, playClick]);

  const memoryRecall = useCallback((slotIdx?: number) => {
    playClick('fn');
    recordMemoryOp('recall');
    const idx = slotIdx ?? activeMemorySlot;
    const targetSlot = memorySlots.find((s) => s.index === idx);
    if (targetSlot) {
      setDisplay(targetSlot.value);
      setIsNewInput(true);
    }
    const stats = getUserStats();
    if (stats.memoryOps.store >= 1 && stats.memoryOps.recall >= 1) {
      unlockAchievement('memory-keeper');
    }
  }, [activeMemorySlot, memorySlots, playClick, unlockAchievement]);

  const memoryStore = useCallback((slotIdx?: number) => {
    playClick('fn');
    recordMemoryOp('store');
    const idx = slotIdx ?? activeMemorySlot;
    setMemorySlots((prev) =>
      prev.map((slot) => (slot.index === idx ? { ...slot, value: display, updatedAt: Date.now() } : slot))
    );
    const stats = getUserStats();
    if (stats.memoryOps.store >= 1 && stats.memoryOps.recall >= 1) {
      unlockAchievement('memory-keeper');
    }
  }, [activeMemorySlot, display, playClick, unlockAchievement]);

  const memoryAdd = useCallback((slotIdx?: number) => {
    playClick('fn');
    recordMemoryOp('add');
    const idx = slotIdx ?? activeMemorySlot;
    setMemorySlots((prev) =>
      prev.map((slot) => {
        if (slot.index === idx) {
          const currentVal = Number(slot.value) || 0;
          const addVal = Number(display) || 0;
          return { ...slot, value: sanitizeNumber(currentVal + addVal).toString(), updatedAt: Date.now() };
        }
        return slot;
      })
    );
  }, [activeMemorySlot, display, playClick]);

  const memorySubtract = useCallback((slotIdx?: number) => {
    playClick('fn');
    recordMemoryOp('subtract');
    const idx = slotIdx ?? activeMemorySlot;
    setMemorySlots((prev) =>
      prev.map((slot) => {
        if (slot.index === idx) {
          const currentVal = Number(slot.value) || 0;
          const subVal = Number(display) || 0;
          return { ...slot, value: sanitizeNumber(currentVal - subVal).toString(), updatedAt: Date.now() };
        }
        return slot;
      })
    );
  }, [activeMemorySlot, display, playClick]);

  // History Actions
  const clearHistory = useCallback(() => {
    playClick('clear');
    setHistory([]);
  }, [playClick]);

  const deleteHistoryItem = useCallback((id: string) => {
    playClick('clear');
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, [playClick]);

  const recallHistoryItem = useCallback((item: HistoryItem, useResultOnly: boolean = true) => {
    playClick('fn');
    try {
      const reuses = (parseInt(localStorage.getItem('dockcalc_history_reuse_count') || '0', 10) || 0) + 1;
      localStorage.setItem('dockcalc_history_reuse_count', reuses.toString());
      if (reuses >= 10) {
        unlockAchievement('history-buff');
      }
    } catch {
      // ignore
    }
    if (useResultOnly) {
      setDisplay(item.result);
      setIsNewInput(true);
    } else {
      setDisplay(item.result);
      setExpression(item.expression);
      setIsNewInput(true);
    }
  }, [playClick, unlockAchievement]);

  const updateHistoryItemNote = useCallback((id: string, note: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  }, []);

  const exportHistory = useCallback((format: 'text' | 'csv' | 'json') => {
    if (history.length === 0) return '';
    if (format === 'json') {
      return JSON.stringify(history, null, 2);
    }
    if (format === 'csv') {
      const header = 'Timestamp,Expression,RunningEquation,Result,Mode,Base,Note\n';
      const rows = history
        .map(
          (h) =>
            `"${new Date(h.timestamp).toISOString()}","${h.expression.replace(/"/g, '""')}","${(h.runningEquation || h.expression).replace(/"/g, '""')}","${h.result}","${h.mode}","${h.base || ''}","${(h.note || '').replace(/"/g, '""')}"`
        )
        .join('\n');
      return header + rows;
    }
    // Default text format (paper tape style)
    return history
      .map(
        (h) =>
          `[${new Date(h.timestamp).toLocaleTimeString()}] ${h.runningEquation || h.expression} = ${h.result}${h.note ? ` (${h.note})` : ''}`
      )
      .join('\n');
  }, [history]);

  // RPN Operations
  const rpnPush = useCallback(() => {
    playClick('fn');
    recordRpnOp();
    setRpnStack((prev) => [...prev, display]);
    setIsNewInput(true);
  }, [display, playClick]);

  const rpnSwap = useCallback(() => {
    playClick('fn');
    recordRpnOp();
    if (rpnStack.length < 1) return;
    const topStack = rpnStack[rpnStack.length - 1];
    setRpnStack((prev) => [...prev.slice(0, -1), display]);
    setDisplay(topStack);
    setIsNewInput(true);
  }, [display, playClick, rpnStack]);

  const rpnDrop = useCallback(() => {
    playClick('clear');
    recordRpnOp();
    if (rpnStack.length > 0) {
      const newStack = rpnStack.slice(0, -1);
      const popped = rpnStack[rpnStack.length - 1];
      setDisplay(popped);
      setRpnStack(newStack);
      setIsNewInput(true);
    }
  }, [playClick, rpnStack]);

  const rpnRoll = useCallback(() => {
    playClick('fn');
    recordRpnOp();
    if (rpnStack.length < 1) return;
    // Rotate stack: bottom moves to top
    const all = [...rpnStack, display];
    const rotated = [all[all.length - 1], ...all.slice(0, all.length - 1)];
    setDisplay(rotated[rotated.length - 1]);
    setRpnStack(rotated.slice(0, -1));
    setIsNewInput(true);
  }, [display, playClick, rpnStack]);

  // --- Execute Any Programmable Button ---
  const executeProgrammableKey = useCallback((keyId: ProgrammableKeyId) => {
    playClick('fn');
    const updatedStats = recordCustomKeyUse();
    checkCustomKeyMilestones(updatedStats.customKeyUses, unlockAchievement);

    const config = settings.programmableKeys?.[keyId] || (
      keyId === 'custom'
        ? settings.customButton
        : keyId === 'reciprocal'
        ? { label: '1/x', actionType: 'default_unary' as const, value: '1/x' }
        : keyId === 'sqr'
        ? { label: 'x²', actionType: 'default_unary' as const, value: 'sqr' }
        : { label: '√', actionType: 'default_unary' as const, value: '√x' }
    );

    if (config.actionType === 'default_unary') {
      applyUnaryFunction(config.value || (keyId === 'reciprocal' ? '1/x' : keyId === 'sqr' ? 'sqr' : '√x'));
      return;
    }

    const { actionType, value, label } = config;

    if (actionType === 'doubleZero') {
      inputDigit('00');
      return;
    }

    if (actionType === 'tax') {
      const rate = Number(value) || 0;
      const current = Number(display) || 0;
      const res = sanitizeNumber(current * (1 + rate / 100));
      const resStr = res.toString();
      setDisplay(resStr);
      setIsNewInput(true);
      recordHistory(`${display} + ${rate}% tax`, resStr, mode, base);
      return;
    }

    if (actionType === 'tip') {
      const tipRate = Number(value) || 0;
      const current = Number(display) || 0;
      const res = sanitizeNumber(current * (1 + tipRate / 100));
      const resStr = res.toString();
      setDisplay(resStr);
      setIsNewInput(true);
      recordHistory(`${display} + ${tipRate}% tip`, resStr, mode, base);
      return;
    }

    if (actionType === 'multiplier') {
      const factor = Number(value) || 1;
      const current = Number(display) || 0;
      const res = sanitizeNumber(current * factor);
      const resStr = res.toString();
      setDisplay(resStr);
      setIsNewInput(true);
      recordHistory(`${display} × ${factor}`, resStr, mode, base);
      return;
    }

    if (actionType === 'constant') {
      const constVal = value.trim();
      setDisplay(constVal);
      setIsNewInput(true);
      recordHistory(`const ${label}`, constVal, mode, base);
      return;
    }

    if (actionType === 'formula') {
      try {
        const x = Number(display) || 0;
        const sanitizedFormula = value
          .replace(/x/gi, `(${x})`)
          .replace(/\^/g, '**');
        if (!/^[0-9+\-*/(). eE*]+$/.test(sanitizedFormula)) {
          throw new Error('Invalid formula characters');
        }
        // eslint-disable-next-line no-eval
        const evaluated = Function(`"use strict"; return (${sanitizedFormula})`)();
        const res = sanitizeNumber(Number(evaluated));
        if (isNaN(res) || !isFinite(res)) throw new Error('Result not a number');
        const resStr = res.toString();
        setDisplay(resStr);
        setIsNewInput(true);
        recordHistory(`f(${display}) [${label}]`, resStr, mode, base);
      } catch {
        setDisplay('Error');
        setIsNewInput(true);
      }
    }
  }, [applyUnaryFunction, base, display, inputDigit, mode, playClick, recordHistory, settings.customButton, settings.programmableKeys]);

  const executeCustomButton = useCallback(() => {
    executeProgrammableKey('custom');
  }, [executeProgrammableKey]);

  // Settings
  const updateSettings = useCallback((partial: Partial<CalculatorSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateProgrammableKey = useCallback((keyId: ProgrammableKeyId, config: CustomButtonConfig) => {
    const currentKeys = settings.programmableKeys || {
      custom: settings.customButton,
      reciprocal: { label: '1/x', actionType: 'default_unary' as const, value: '1/x' },
      sqr: { label: 'x²', actionType: 'default_unary' as const, value: 'sqr' },
      sqrt: { label: '√', actionType: 'default_unary' as const, value: '√x' },
    };
    const updated = {
      ...currentKeys,
      [keyId]: config,
    };
    if (keyId === 'custom') {
      updateSettings({ customButton: config, programmableKeys: updated });
    } else {
      updateSettings({ programmableKeys: updated });
    }
  }, [settings.customButton, settings.programmableKeys, updateSettings]);

  const updateCustomButton = useCallback((config: CustomButtonConfig) => {
    updateProgrammableKey('custom', config);
  }, [updateProgrammableKey]);

  const activeTheme = useMemo(() => {
    if (settings.theme === 'custom') {
      return buildCustomTheme(settings.customTheme);
    }
    return THEMES.find((t) => t.id === settings.theme) || THEMES[0];
  }, [settings.theme, settings.customTheme]);

  const customThemeStyle = useMemo(() => {
    if (settings.theme === 'custom') {
      return getCustomThemeStyles(settings.customTheme);
    }
    return undefined;
  }, [settings.theme, settings.customTheme]);

  return {
    mode,
    setMode,
    display,
    setDisplay,
    expression,
    runningEquation,
    pendingOp,
    isNewInput,
    inputDigit,
    inputDecimal,
    deleteChar,
    clear,
    setOperator,
    calculateEquals,
    applyUnaryFunction,
    insertConstant,
    handleParenthesis,
    parenthesisDepth: parenthesisStack.length,
    // Scientific
    angleUnit,
    setAngleUnit,
    is2nd,
    toggle2nd: () => setIs2nd((v) => !v),
    // Programmer
    base,
    setBase,
    bitWidth,
    setBitWidth: setBitWidthAction,
    programmerBigInt,
    toggleBitAt,
    applyBitShift,
    // RPN
    rpnStack,
    rpnPush,
    rpnSwap,
    rpnDrop,
    rpnRoll,
    // Memory
    memorySlots,
    activeMemorySlot,
    setActiveMemorySlot,
    memoryClear,
    memoryRecall,
    memoryStore,
    memoryAdd,
    memorySubtract,
    hasMemoryValue: memorySlots.some((s) => s.value !== '0'),
    // History
    history,
    clearHistory,
    deleteHistoryItem,
    recallHistoryItem,
    updateHistoryItemNote,
    exportHistory,
    recordHistory,
    recordClipboardCopy,
    checkDailyStreak,
    // Custom Programmable Button
    executeCustomButton,
    executeProgrammableKey,
    updateCustomButton,
    updateProgrammableKey,
    // Settings & Theme
    settings,
    updateSettings,
    activeTheme,
    customThemeStyle,
    playClick,
    unlockAchievement,
    milestoneQueue,
    remainingInMilestoneQueue: Math.max(0, milestoneQueue.length - 1),
    currentMilestoneCelebration,
    newlyUnlockedMilestone: currentMilestoneCelebration,
    dismissMilestoneCelebration,
    clearCelebratedMilestone,
    triggerConfetti: () => fireCelebratoryParticles(settings.particleStyle || 'confetti'),
    triggerParticles: (style?: any) => fireCelebratoryParticles(style || settings.particleStyle || 'confetti'),
  };
}
