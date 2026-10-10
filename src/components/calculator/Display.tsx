import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type {
  CalcMode,
  AngleUnit,
  NumberBase,
  BitWidth,
  CalculatorTheme,
  CalculatorSettings,
} from '@/types/calculator';
import { formatDisplayNumber } from '@/lib/mathEngine';
import { getCornerRadiusClasses } from '@/lib/cornerRadius';
import { isPrimeNumber, isFibonacciNumber } from '@/lib/numberMagic';
import { toExactFraction, toExactRadical } from '@/lib/exactMath';
import { toast } from 'sonner';

interface DisplayProps {
  display: string;
  expression: string;
  runningEquation?: string;
  mode: CalcMode;
  angleUnit: AngleUnit;
  onToggleAngleUnit: () => void;
  base: NumberBase;
  onSetBase: (b: NumberBase) => void;
  bitWidth: BitWidth;
  onSetBitWidth: (w: BitWidth) => void;
  programmerBigInt: bigint;
  onToggleBit: (index: number) => void;
  hasMemoryValue: boolean;
  onToggleMemory: () => void;
  theme: CalculatorTheme;
  settings: CalculatorSettings;
  parenthesisDepth: number;
  onBackspace?: () => void;
  onClear?: () => void;
  rpnStack?: string[];
  onInsertExact?: (val: string) => void;
}

export const Display: React.FC<DisplayProps> = ({
  display,
  expression,
  runningEquation,
  mode,
  angleUnit,
  onToggleAngleUnit,
  base,
  onSetBase,
  bitWidth,
  onSetBitWidth,
  programmerBigInt,
  onToggleBit,
  hasMemoryValue,
  onToggleMemory,
  theme,
  settings,
  parenthesisDepth,
  onBackspace,
  onClear,
  rpnStack,
  onInsertExact,
}: DisplayProps & { onInsertExact?: (val: string) => void }) => {
  const [copied, setCopied] = useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  // Exact Fraction and Radical representation detection
  const numericVal = Number(display);
  const exactFraction = React.useMemo(() => {
    return !isNaN(numericVal) && isFinite(numericVal) ? toExactFraction(numericVal) : null;
  }, [numericVal]);

  const exactRadical = React.useMemo(() => {
    return !isNaN(numericVal) && isFinite(numericVal) ? toExactRadical(numericVal) : null;
  }, [numericVal]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;

    // Horizontal swipe threshold: 28px (left or right swipe deletes last digit)
    if (Math.abs(deltaX) > 28 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (onBackspace) {
        onBackspace();
        if (settings.vibrateEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20);
        }
      }
    } else if (deltaY > 36 && Math.abs(deltaY) > Math.abs(deltaX) * 1.1) {
      // Downward swipe clears entry
      if (onClear) {
        onClear();
        if (settings.vibrateEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([15, 30, 15]);
        }
        toast.info('Cleared display', { duration: 1200 });
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const formattedDisplay =
    mode === 'programmer'
      ? display
      : formatDisplayNumber(display, {
          thousandsSeparator: settings.thousandsSeparator,
          decimalPlaces: settings.decimalPlaces,
          notation: settings.notation,
        });

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    toast.success('Copied to clipboard', { description: display });
    setTimeout(() => setCopied(false), 1500);
  };

  const getMainFontSizePx = (len: number, scale: number) => {
    let basePx = 60; // Exactly 60px base at 100% scale for initial numbers (e.g. '0')
    if (len > 22) basePx = 24;
    else if (len > 18) basePx = 28;
    else if (len > 14) basePx = 35;
    else if (len > 10) basePx = 42;
    else if (len > 6) basePx = 50;
    else if (len > 4) basePx = 55;
    else basePx = 60;

    return Math.round(basePx * (scale || 1.0));
  };

  const getEquationFontSizePx = (scale: number) => {
    return Math.round(16 * (scale || 1.0)); // 16px baseline for equation
  };

  const getEquationLabelFontSizePx = (scale: number) => {
    return Math.round(11 * (scale || 1.0)); // 11px baseline for label
  };

  const isNordic = theme.id === 'nordic-light';
  const cornerClasses = getCornerRadiusClasses(settings.cornerRadius || 'extra');

  // Number Magic & Easter Egg checks
  const currentNum = Number(display);
  const isValidInteger = !isNaN(currentNum) && Number.isInteger(currentNum) && currentNum > 0 && currentNum < 100000000;
  const isPrime = (settings.numberMagicBadges ?? true) && isValidInteger && isPrimeNumber(currentNum);
  const isFib = (settings.numberMagicBadges ?? true) && isValidInteger && isFibonacciNumber(currentNum);
  const isHitchhiker42 = (settings.hitchhiker42Enabled ?? true) && (display === '42' || display === '42.0');

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Calculation Display Shell (Switches to clean light mode with matching text in Nordic theme) */}
      <div
        className={`relative ${cornerClasses.card} p-3 sm:p-3.5 border transition-all ${
          isNordic
            ? 'bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] shadow-inner'
            : theme.id === 'dockalc-dark'
            ? 'bg-[#19191C] text-[#F4F4F5] border-[#2E2E34] shadow-inner'
            : theme.id === 'custom'
            ? 'bg-[var(--theme-display-bg)] text-[var(--theme-display-text)] border-[var(--theme-display-border)] shadow-inner'
            : 'bg-[#0A0D14] text-white border-white/10 shadow-inner'
        } ${
          settings.funMatrixGlow
            ? 'shadow-[0_0_24px_rgba(59,130,246,0.35)] ring-1 ring-primary/50'
            : ''
        } flex flex-col justify-between min-h-[140px] sm:min-h-[160px] md:min-h-[175px] w-full overflow-hidden`}
      >
        {/* Top Header Row of Display: Left Base/Mode indicator, Right Copy Button */}
        <div className="flex items-center justify-between text-xs font-mono select-none gap-1">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 overflow-x-auto whitespace-nowrap scrollbar-none pr-1">
            {mode === 'programmer' ? (
              <div className="flex items-center gap-1">
                {(['HEX', 'DEC', 'OCT', 'BIN'] as NumberBase[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onSetBase(b)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      base === b
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : isNordic
                        ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            ) : (
              <span className={`text-xs font-mono font-semibold tracking-wider uppercase ${isNordic ? 'text-[#475569]' : 'text-white/50'}`}>
                {mode === 'scientific' ? angleUnit : 'DEC'}
              </span>
            )}

            {mode === 'scientific' && (
              <button
                type="button"
                onClick={onToggleAngleUnit}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  isNordic
                    ? 'bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A]'
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
                title="Cycle angle unit (DEG, RAD, GRAD)"
              >
                {angleUnit}
              </button>
            )}

            {settings.rpnMode && (
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold border transition-colors ${
                  isNordic
                    ? 'bg-[#E2E8F0] text-[#1D4ED8] border-[#CBD5E1]'
                    : theme.id === 'dockalc-dark'
                    ? 'bg-[#2563EB]/20 text-[#60A5FA] border-[#3B82F6]/40'
                    : theme.id === 'warm-terracotta'
                    ? 'bg-[#EA580C]/20 text-[#FB923C] border-[#FB923C]/40'
                    : theme.id === 'solar-amber'
                    ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                    : theme.id === 'cyber-emerald'
                    ? 'bg-[#22C55E]/20 text-[#4ADE80] border-[#22C55E]/40'
                    : 'bg-primary/20 text-primary border-primary/40'
                }`}
                title={`RPN Mode active${rpnStack ? ` (Stack count: ${rpnStack.length})` : ''}`}
              >
                RPN{rpnStack && rpnStack.length > 0 ? ` [${rpnStack.length}]` : ''}
              </span>
            )}

            {hasMemoryValue && (
              <button
                type="button"
                onClick={onToggleMemory}
                className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30"
                title="Memory has value"
              >
                M
              </button>
            )}

            {/* Number Magic: Prime Badge */}
            {isPrime && (
              <span
                className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-xs"
                title="Prime Number Result"
              >
                💎 Prime
              </span>
            )}

            {/* Number Magic: Fibonacci Badge */}
            {isFib && (
              <span
                className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-xs"
                title="Fibonacci Number Result"
              >
                🌀 Fibonacci
              </span>
            )}

            {/* Hitchhiker's 42 Easter Egg */}
            {isHitchhiker42 && (
              <span
                className="flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/25 text-indigo-200 border border-indigo-400/50 animate-pulse shadow-xs"
                title="Hitchhiker's Guide: The Answer to Life, the Universe, and Everything"
              >
                <span>🌌</span>
                <span className="hidden sm:inline">The Answer: 42</span>
              </span>
            )}
          </div>

          {/* Copy Button (top right icon in screenshot) */}
          <button
            type="button"
            onClick={handleCopy}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isNordic
                ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                : 'text-white/40 hover:text-white hover:bg-white/10'
            }`}
            title="Copy current value to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Dedicated Running Equation Bar (Top Position) */}
        {settings.showEquationBar !== false && settings.equationBarPosition === 'top' && (
          <div className={`my-1 min-h-[32px] sm:min-h-[36px] px-2.5 py-1 rounded-lg border flex items-center justify-between select-text transition-all ${
            isNordic
              ? 'border-[#CBD5E1] bg-[#E2E8F0]/80 text-[#0F172A] shadow-xs'
              : 'border-white/10 bg-white/[0.07] text-white/80 shadow-xs'
          }`}>
            <span
              style={{ fontSize: `${getEquationLabelFontSizePx(settings.displayFontScale ?? 1.0)}px` }}
              className={`font-mono font-bold uppercase tracking-wider shrink-0 flex items-center select-none ${
                isNordic
                  ? 'text-[#475569]'
                  : 'text-white/60'
              }`}
            >
              Equation
            </span>
            <span
              style={{ fontSize: `${getEquationFontSizePx(settings.displayFontScale ?? 1.0)}px` }}
              className={`font-mono font-medium overflow-x-auto whitespace-nowrap scrollbar-none ml-2 text-right flex-1 ${
                isNordic ? 'text-[#0F172A]' : 'text-white/95'
              }`}
            >
              {runningEquation || expression || (display !== '0' ? display : '0')}
            </span>
          </div>
        )}

        {/* Expression Line / RPN Stack View */}
        <div className={`h-4 sm:h-4.5 overflow-x-auto overflow-y-hidden text-right text-[11px] sm:text-xs font-medium whitespace-nowrap scrollbar-none select-text ${
          isNordic ? 'text-[#64748B]' : 'text-white/40'
        }`}>
          {settings.rpnMode && rpnStack && rpnStack.length > 0 ? (
            <span className="font-mono text-[11px] flex items-center justify-end gap-1.5">
              <span className={`text-[10px] font-bold ${
                isNordic
                  ? 'text-[#1D4ED8]'
                  : theme.id === 'dockalc-dark'
                  ? 'text-[#60A5FA]'
                  : theme.id === 'warm-terracotta'
                  ? 'text-[#FB923C]'
                  : theme.id === 'solar-amber'
                  ? 'text-[#F59E0B]'
                  : theme.id === 'cyber-emerald'
                  ? 'text-[#4ADE80]'
                  : 'text-primary'
              }`}>Y:</span>
              <span className={isNordic ? 'text-[#0F172A] font-semibold' : 'text-white/95 font-semibold'}>
                {rpnStack[rpnStack.length - 1]}
              </span>
              {rpnStack.length > 1 && (
                <>
                  <span className="opacity-30">|</span>
                  <span className={`text-[10px] font-bold opacity-75 ${
                    isNordic
                      ? 'text-[#1D4ED8]'
                      : theme.id === 'dockalc-dark'
                      ? 'text-[#60A5FA]'
                      : theme.id === 'warm-terracotta'
                      ? 'text-[#FB923C]'
                      : theme.id === 'solar-amber'
                      ? 'text-[#F59E0B]'
                      : theme.id === 'cyber-emerald'
                      ? 'text-[#4ADE80]'
                      : 'text-primary'
                  }`}>Z:</span>
                  <span className={isNordic ? 'text-[#334155]' : 'text-white/75'}>
                    {rpnStack[rpnStack.length - 2]}
                  </span>
                </>
              )}
            </span>
          ) : (
            expression || '\u00A0'
          )}
        </div>

        {/* Main Result Line with Touch Swipe Support */}
        <div
          key={settings.funNumberRoll ? formattedDisplay : undefined}
          onClick={handleCopy}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title="Tap to copy, swipe left or right to delete digit"
          style={{
            fontSize: `${getMainFontSizePx(formattedDisplay.length, settings.displayFontScale ?? 1.0)}px`,
            lineHeight: 1.08,
            fontWeight: 'var(--app-number-font-weight, 500)',
          }}
          className={`flex-1 flex items-center justify-end tracking-tight text-right overflow-x-auto overflow-y-hidden whitespace-nowrap cursor-pointer select-text py-1 my-auto transition-all touch-pan-y ${
            settings.funNumberRoll ? 'animate-in fade-in-50 zoom-in-95 duration-100' : ''
          } ${
            isNordic ? 'text-[#0F172A]' : 'text-white'
          }`}
        >
          {formattedDisplay}
        </div>

        {/* Exact Fraction & Radical Simplification Strip */}
        {(exactFraction || exactRadical) && (
          <div className={`flex items-center justify-between gap-1.5 py-1 px-2.5 my-1 rounded-lg border text-[11px] font-mono select-none transition-all ${
            isNordic
              ? 'bg-[#E2E8F0]/90 border-[#CBD5E1] text-[#0F172A] shadow-xs'
              : 'bg-white/[0.06] border-white/10 text-white shadow-xs'
          }`}>
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              {exactFraction && (
                <span className="flex items-center gap-1.5 text-primary font-semibold">
                  <span className={`text-[10px] uppercase tracking-wider font-sans ${isNordic ? 'text-[#475569]' : 'text-white/60'}`}>
                    Fraction:
                  </span>
                  <span className="font-bold underline decoration-primary/50">{exactFraction.vulgar}</span>
                  {exactFraction.fraction !== exactFraction.vulgar && (
                    <span className={`text-[10px] ${isNordic ? 'text-[#64748B]' : 'text-white/50'}`}>
                      ({exactFraction.fraction})
                    </span>
                  )}
                </span>
              )}
              {exactFraction && exactRadical && (
                <span className={isNordic ? 'text-[#94A3B8]' : 'text-white/20'}>|</span>
              )}
              {exactRadical && (
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className={`text-[10px] uppercase tracking-wider font-sans ${isNordic ? 'text-[#475569]' : 'text-white/60'}`}>
                    Radical:
                  </span>
                  <span className="font-bold">{exactRadical.radical}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const toCopy = exactFraction ? exactFraction.vulgar : exactRadical!.radical;
                  navigator.clipboard.writeText(toCopy);
                  toast.success(`Copied "${toCopy}" to clipboard`);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium transition-colors cursor-pointer border ${
                  isNordic
                    ? 'bg-[#CBD5E1]/60 hover:bg-[#CBD5E1] border-[#94A3B8]/40 text-[#0F172A]'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
                title="Copy exact representation"
              >
                Copy
              </button>
              {onInsertExact && (
                <button
                  type="button"
                  onClick={() => {
                    const toInsert = exactFraction ? exactFraction.vulgar : exactRadical!.radical;
                    onInsertExact(toInsert);
                    toast.success(`Inserted "${toInsert}" into calculator`);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors cursor-pointer shadow-xs"
                  title="Insert into equation"
                >
                  Insert
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dedicated Running Equation Bar (Bottom Position - default) */}
        {settings.showEquationBar !== false && settings.equationBarPosition !== 'top' && (
          <div className={`mt-1 min-h-[32px] sm:min-h-[36px] px-2.5 py-1 rounded-lg border flex items-center justify-between select-text transition-all ${
            isNordic
              ? 'border-[#CBD5E1] bg-[#E2E8F0]/80 text-[#0F172A] shadow-xs'
              : 'border-white/10 bg-white/[0.07] text-white/80 shadow-xs'
          }`}>
            <span
              style={{ fontSize: `${getEquationLabelFontSizePx(settings.displayFontScale ?? 1.0)}px` }}
              className={`font-mono font-bold uppercase tracking-wider shrink-0 flex items-center select-none ${
                isNordic
                  ? 'text-[#475569]'
                  : 'text-white/60'
              }`}
            >
              Equation
            </span>
            <span
              style={{ fontSize: `${getEquationFontSizePx(settings.displayFontScale ?? 1.0)}px` }}
              className={`font-mono font-medium overflow-x-auto whitespace-nowrap scrollbar-none ml-2 text-right flex-1 ${
                isNordic ? 'text-[#0F172A]' : 'text-white/95'
              }`}
            >
              {runningEquation || expression || (display !== '0' ? display : '0')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
