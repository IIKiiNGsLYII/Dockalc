import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Zap, Trophy, Flame, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { recordSprintCompletion } from '@/lib/userStats';
import type { CalculatorTheme } from '@/types/calculator';

export interface ThemeClassPack {
  bg?: string;
  card?: string;
  subCard?: string;
  border?: string;
  accent?: string;
  heading?: string;
  muted?: string;
  buttonPrimary?: string;
  buttonSecondary?: string;
}

export interface MentalMathSprintProps {
  onUnlockMilestone?: (id: string) => void;
  onPlaySound?: (type: 'num' | 'op' | 'equal' | 'clear') => void;
  theme?: CalculatorTheme;
  customThemeStyle?: React.CSSProperties;
  themeClasses?: ThemeClassPack;
}

interface Question {
  text: string;
  answer: number;
}

export const MentalMathSprint: React.FC<MentalMathSprintProps> = ({
  onUnlockMilestone,
  onPlaySound,
  theme,
  customThemeStyle,
  themeClasses,
}) => {
  const fallbackThemeClasses: Required<ThemeClassPack> = {
    bg: 'bg-background',
    card: 'bg-card',
    subCard: 'bg-muted/40',
    border: 'border-border/70',
    accent: 'text-primary',
    heading: 'text-foreground',
    muted: 'text-muted-foreground',
    buttonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    buttonSecondary: 'bg-muted text-foreground hover:bg-muted/80',
  };

  const tc = {
    bg: themeClasses?.bg || fallbackThemeClasses.bg,
    card: themeClasses?.card || fallbackThemeClasses.card,
    subCard: themeClasses?.subCard || fallbackThemeClasses.subCard,
    border: themeClasses?.border || fallbackThemeClasses.border,
    accent: themeClasses?.accent || fallbackThemeClasses.accent,
    heading: themeClasses?.heading || fallbackThemeClasses.heading,
    muted: themeClasses?.muted || fallbackThemeClasses.muted,
    buttonPrimary: themeClasses?.buttonPrimary || fallbackThemeClasses.buttonPrimary,
    buttonSecondary: themeClasses?.buttonSecondary || fallbackThemeClasses.buttonSecondary,
  };
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({ text: '', answer: 0 });
  const [userInput, setUserInput] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('dockcalc_sprint_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<string>('');
  const questionRef = useRef<Question>({ text: '', answer: 0 });
  const gameStateRef = useRef<'idle' | 'playing' | 'gameover'>('idle');
  const streakRef = useRef<number>(0);

  // Keep refs synchronized to ensure immediate, zero-latency keyboard & touch keypad input
  useEffect(() => {
    inputRef.current = userInput;
  }, [userInput]);

  useEffect(() => {
    questionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  // Generate diverse, rapid-fire arithmetic challenges
  const generateQuestion = useCallback((): Question => {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let a = 0;
    let b = 0;
    let ans = 0;

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * 45) + 6;
        b = Math.floor(Math.random() * 45) + 6;
        ans = a + b;
        return { text: `${a} + ${b}`, answer: ans };
      case '-':
        a = Math.floor(Math.random() * 50) + 15;
        b = Math.floor(Math.random() * (a - 4)) + 4;
        ans = a - b;
        return { text: `${a} − ${b}`, answer: ans };
      case '×':
        a = Math.floor(Math.random() * 11) + 2;
        b = Math.floor(Math.random() * 11) + 2;
        ans = a * b;
        return { text: `${a} × ${b}`, answer: ans };
      case '÷':
      default:
        b = Math.floor(Math.random() * 9) + 2;
        ans = Math.floor(Math.random() * 10) + 2;
        a = b * ans;
        return { text: `${a} ÷ ${b}`, answer: ans };
    }
  }, []);

  // Start new 30s Sprint
  const startSprint = () => {
    const initialQ = generateQuestion();
    setGameState('playing');
    gameStateRef.current = 'playing';
    setTimeLeft(30);
    setScore(0);
    setStreak(0);
    streakRef.current = 0;
    setMaxStreak(0);
    setCorrectCount(0);
    setTotalAttempts(0);
    setUserInput('');
    inputRef.current = '';
    setFeedback(null);
    setCurrentQuestion(initialQ);
    questionRef.current = initialQ;
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState('gameover');
          gameStateRef.current = 'gameover';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Handle game over milestone evaluations & stats recording
  useEffect(() => {
    if (gameState === 'gameover') {
      recordSprintCompletion(score, correctCount, maxStreak);
      if (score > highScore) {
        setHighScore(score);
        try {
          localStorage.setItem('dockcalc_sprint_highscore', score.toString());
        } catch {
          // Ignore
        }
      }

      // Check milestones
      if (onUnlockMilestone) {
        onUnlockMilestone('sprint-starter');
        if (maxStreak >= 5) onUnlockMilestone('sprint-streak-5');
        if (correctCount >= 12) onUnlockMilestone('sprint-speed-demon');
        if (score >= 3500) onUnlockMilestone('sprint-centurion');
        if (correctCount >= 1 && totalAttempts === correctCount) {
          onUnlockMilestone('flawless-sprint');
        }
      }
    }
  }, [gameState, score, highScore, maxStreak, correctCount, totalAttempts, onUnlockMilestone]);

  // Check and process Answer
  const evaluateAnswer = useCallback(
    (inputToTest: string) => {
      if (gameStateRef.current !== 'playing' || !inputToTest) return;

      const parsed = parseInt(inputToTest, 10);
      setTotalAttempts((prev) => prev + 1);

      if (parsed === questionRef.current.answer) {
        // Correct!
        if (onPlaySound) onPlaySound('equal');
        const newStreak = streakRef.current + 1;
        streakRef.current = newStreak;
        setStreak(newStreak);
        setMaxStreak((prev) => Math.max(prev, newStreak));
        setCorrectCount((prev) => prev + 1);

        // Score calculation: 100 base + 25 * streak
        const earned = 100 + (newStreak - 1) * 25;
        setScore((prev) => prev + earned);

        // Streak reward: +2 seconds for every 3 in a row
        if (newStreak % 3 === 0) {
          setTimeLeft((prev) => Math.min(60, prev + 2));
        }

        setFeedback('correct');
        setUserInput('');
        inputRef.current = '';
        const nextQ = generateQuestion();
        setCurrentQuestion(nextQ);
        questionRef.current = nextQ;
        setTimeout(() => setFeedback(null), 300);
      } else {
        // Wrong!
        if (onPlaySound) onPlaySound('clear');
        streakRef.current = 0;
        setStreak(0);
        setFeedback('wrong');
        setUserInput('');
        inputRef.current = '';
        setTimeout(() => setFeedback(null), 400);
      }
    },
    [onPlaySound, onUnlockMilestone, generateQuestion]
  );

  // Process input digit or control command with auto-match check
  const handleInputDigit = useCallback(
    (val: string) => {
      if (gameStateRef.current !== 'playing') return;

      if (val === 'DEL') {
        if (onPlaySound) onPlaySound('clear');
        setUserInput((prev) => {
          const next = prev.slice(0, -1);
          inputRef.current = next;
          return next;
        });
        return;
      }

      if (val === 'ENTER') {
        evaluateAnswer(inputRef.current);
        return;
      }

      if (onPlaySound) onPlaySound('num');

      // Append number with immediate reflection in ref
      const current = inputRef.current;
      if (current.length >= 5) return;
      const nextInput = current + val;
      inputRef.current = nextInput;
      setUserInput(nextInput);

      // Auto-evaluation: If the entered number exactly equals the target answer, evaluate immediately!
      const parsed = parseInt(nextInput, 10);
      if (!Number.isNaN(parsed) && parsed === questionRef.current.answer) {
        evaluateAnswer(nextInput);
      }
    },
    [onPlaySound, evaluateAnswer]
  );

  // Global keyboard listener during gameplay
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        e.stopPropagation();
        handleInputDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        handleInputDigit('DEL');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleInputDigit('ENTER');
      } else if (e.key === '-' && inputRef.current === '') {
        e.preventDefault();
        e.stopPropagation();
        inputRef.current = '-';
        setUserInput('-');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [gameState, handleInputDigit]);

  return (
    <div className="space-y-3" style={customThemeStyle}>
      {/* Header bar: High score & rules */}
      <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${tc.subCard} ${tc.border}`}>
        <div className={`flex items-center gap-1.5 font-bold ${tc.heading}`}>
          <Zap className={`w-4 h-4 ${tc.accent} shrink-0`} />
          <span>Mental Math Sprint</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 text-[11px] ${tc.muted}`}>
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span>Best: <strong className={tc.heading}>{highScore}</strong></span>
          </div>
        </div>
      </div>

      {gameState === 'idle' && (
        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center space-y-3.5 shadow-sm transition-colors ${tc.card} ${tc.border}`}>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shadow-inner">
            ⚡
          </div>
          <div>
            <h3 className={`font-bold text-base ${tc.heading}`}>30-Second Speed Arithmetic</h3>
            <p className={`text-xs mt-1 max-w-sm ${tc.muted}`}>
              Solve as many mental math equations as possible before the clock expires! Instant keypad response & bonus time streaks.
            </p>
          </div>
          <button
            type="button"
            onClick={startSprint}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${tc.buttonPrimary}`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Sprint</span>
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="space-y-3">
          {/* Status indicators */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Timer */}
            <div className={`p-2 rounded-xl border transition-colors ${
              timeLeft <= 5 ? 'border-red-500 bg-red-500/15 text-red-500 animate-pulse' : `${tc.subCard} ${tc.border} ${tc.heading}`
            }`}>
              <div className={`text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 font-semibold ${timeLeft <= 5 ? 'text-red-500' : tc.muted}`}>
                <Timer className="w-3 h-3" /> Time
              </div>
              <div className="text-lg font-black font-mono">{timeLeft}s</div>
            </div>

            {/* Score */}
            <div className={`p-2 rounded-xl border transition-colors ${tc.subCard} ${tc.border} ${tc.heading}`}>
              <div className={`text-[10px] uppercase tracking-wider font-semibold ${tc.muted}`}>Score</div>
              <div className={`text-lg font-black font-mono ${tc.accent}`}>{score}</div>
            </div>

            {/* Streak */}
            <div className={`p-2 rounded-xl border transition-colors ${tc.subCard} ${tc.border} ${tc.heading}`}>
              <div className={`text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 font-semibold ${tc.muted}`}>
                <Flame className={`w-3 h-3 ${streak >= 3 ? 'text-amber-500 fill-amber-500' : tc.muted}`} /> Streak
              </div>
              <div className="text-lg font-black font-mono text-amber-500">{streak}x</div>
            </div>
          </div>

          {/* Active Question Box */}
          <div
            className={`p-5 rounded-2xl border transition-all text-center relative overflow-hidden ${
              feedback === 'correct'
                ? 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : feedback === 'wrong'
                ? 'border-red-500 bg-red-500/15 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                : `${tc.card} ${tc.border} shadow-xs`
            }`}
          >
            <div className={`text-xs mb-1 font-medium ${tc.muted}`}>Solve the equation:</div>
            <div className={`text-3xl font-black font-mono tracking-wider ${tc.heading}`}>
              {currentQuestion.text} = ?
            </div>

            {/* Input preview */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className={`min-w-28 px-3 py-1.5 rounded-lg border border-primary/50 font-mono text-xl font-bold flex items-center justify-center min-h-[40px] shadow-xs ${tc.subCard} ${tc.accent}`}>
                {userInput || <span className="opacity-30">_</span>}
              </div>
            </div>

            {/* Micro feedback badge */}
            {feedback === 'correct' && (
              <div className="absolute top-2 right-3 text-xs font-bold text-emerald-500 flex items-center gap-1 animate-bounce">
                <CheckCircle2 className="w-3.5 h-3.5" /> +{100 + (streak - 1) * 25}
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="absolute top-2 right-3 text-xs font-bold text-red-500 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Miss!
              </div>
            )}
          </div>

          {/* Compact Rapid Input Keypad with Immediate Pointer Down Activation */}
          <div className="grid grid-cols-3 gap-1.5 p-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', 'ENTER'].map((k) => {
              const isEnter = k === 'ENTER';
              const isDel = k === 'DEL';
              return (
                <button
                  key={k}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleInputDigit(k);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shadow-xs ${
                    isEnter
                      ? tc.buttonPrimary
                      : isDel
                      ? `${tc.subCard} border ${tc.border} hover:opacity-80 ${tc.heading}`
                      : `${tc.card} border ${tc.border} hover:opacity-85 ${tc.heading} font-mono text-sm`
                  }`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className={`p-5 rounded-2xl border text-center space-y-3.5 shadow-sm transition-colors ${tc.card} ${tc.border}`}>
          <div className="w-12 h-12 mx-auto rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <h3 className={`font-bold text-base ${tc.heading}`}>Sprint Completed!</h3>
            <p className={`text-xs mt-0.5 ${tc.muted}`}>Time has expired. Excellent mental workout!</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className={`p-2 rounded-xl border ${tc.border} ${tc.subCard}`}>
              <div className={`text-[10px] uppercase ${tc.muted}`}>Score</div>
              <div className={`text-base font-bold font-mono ${tc.accent}`}>{score}</div>
            </div>
            <div className={`p-2 rounded-xl border ${tc.border} ${tc.subCard}`}>
              <div className={`text-[10px] uppercase ${tc.muted}`}>Solved</div>
              <div className={`text-base font-bold font-mono ${tc.heading}`}>{correctCount}</div>
            </div>
            <div className={`p-2 rounded-xl border ${tc.border} ${tc.subCard}`}>
              <div className={`text-[10px] uppercase ${tc.muted}`}>Accuracy</div>
              <div className={`text-base font-bold font-mono ${tc.heading}`}>
                {totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0}%
              </div>
            </div>
            <div className={`p-2 rounded-xl border ${tc.border} ${tc.subCard}`}>
              <div className={`text-[10px] uppercase ${tc.muted}`}>Max Streak</div>
              <div className="text-base font-bold text-amber-500 font-mono">{maxStreak}x</div>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={startSprint}
              className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md ${tc.buttonPrimary}`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
