import React from 'react';
import {
  Delete,
  Divide,
  X as Multiply,
  Minus,
  Plus,
  Equal,
  Cog,
} from 'lucide-react';
import type {
  CalcMode,
  NumberBase,
  CalculatorTheme,
  CalculatorSettings,
  ProgrammableKeyId,
} from '@/types/calculator';
import { getCornerRadiusClasses } from '@/lib/cornerRadius';

interface KeypadProps {
  mode: CalcMode;
  base: NumberBase;
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onOperator: (op: string) => void;
  onEquals: () => void;
  onClear: (all?: boolean) => void;
  onBackspace: () => void;
  onUnary: (fn: string) => void;
  onConstant: (c: 'pi' | 'e' | 'phi') => void;
  onParenthesis: (p: '(' | ')') => void;
  is2nd: boolean;
  onToggle2nd: () => void;
  onBitShift: (shift: 'Lsh' | 'Rsh' | 'RoL' | 'RoR' | 'Ash') => void;
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onMemoryStore: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onToggleMemory: () => void;
  activeMemorySlot: number;
  hasMemoryValue: boolean;
  theme: CalculatorTheme;
  settings: CalculatorSettings;
  onCustomButton?: () => void;
  onOpenCustomModal?: () => void;
  onProgrammableKey?: (keyId: ProgrammableKeyId) => void;
  onOpenProgrammableModal?: (keyId: ProgrammableKeyId) => void;
  onRpnEnter?: () => void;
  onRpnSwap?: () => void;
  onRpnDrop?: () => void;
  onRpnRoll?: () => void;
  rpnStack?: string[];
}

export const Keypad: React.FC<KeypadProps> = ({
  mode,
  base,
  onDigit,
  onDecimal,
  onOperator,
  onEquals,
  onClear,
  onBackspace,
  onUnary,
  onConstant,
  onParenthesis,
  is2nd,
  onToggle2nd,
  onBitShift,
  onMemoryClear,
  onMemoryRecall,
  onMemoryStore,
  onMemoryAdd,
  onMemorySubtract,
  onToggleMemory,
  activeMemorySlot,
  hasMemoryValue,
  theme,
  settings,
  onCustomButton,
  onOpenCustomModal,
  onProgrammableKey,
  onOpenProgrammableModal,
  onRpnEnter,
  onRpnSwap,
  onRpnDrop,
  onRpnRoll,
  rpnStack,
}) => {
  const cornerClasses = getCornerRadiusClasses(settings.cornerRadius || 'extra');
  const isNordic = theme.id === 'nordic-light';
  const activeWeight = settings.numberFontWeight || settings.keypadFontWeight || 'medium';
  const weightClass =
    activeWeight === 'regular'
      ? 'font-normal'
      : activeWeight === 'bold'
      ? 'font-bold'
      : 'font-medium';
  const baseBtn =
    `relative flex items-center justify-center calc-btn ${weightClass} py-0.5 sm:py-1 transition-all active:scale-[0.97] ${cornerClasses.button} select-none cursor-pointer focus:outline-none`;

  const isDigitDisabled = (digit: string) => {
    if (mode !== 'programmer') return false;
    const d = parseInt(digit, 10);
    if (base === 'BIN') return d > 1;
    if (base === 'OCT') return d > 7;
    if (base === 'DEC') return d > 9;
    return false;
  };

  const isHexLetterDisabled = (letter: string) => {
    if (mode !== 'programmer') return true;
    return base !== 'HEX';
  };

  const showMemoryBar = settings.showMemoryBar !== false;
  const progKeys = settings.programmableKeys || {
    custom: settings.customButton || { label: '÷12', actionType: 'formula', value: 'x / 12' },
    reciprocal: { label: '1/x', actionType: 'default_unary', value: '1/x' },
    sqr: { label: 'x²', actionType: 'default_unary', value: 'sqr' },
    sqrt: { label: '√', actionType: 'default_unary', value: '√x' },
  };

  const customConfig = progKeys.custom || settings.customButton || { label: '÷12', actionType: 'formula', value: 'x / 12' };
  const reciprocalConfig = progKeys.reciprocal || { label: '1/x', actionType: 'default_unary', value: '1/x' };
  const sqrConfig = progKeys.sqr || { label: 'x²', actionType: 'default_unary', value: 'sqr' };
  const sqrtConfig = progKeys.sqrt || { label: '√', actionType: 'default_unary', value: '√x' };

  return (
    <div className="flex flex-col gap-2 sm:gap-2.5 flex-1 min-h-0 keypad-container justify-center">
      {/* Optional Memory Control Ribbon matching keypad key design (Hideable in settings) */}
      {showMemoryBar && (
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5 text-xs shrink-0">
          <button
            type="button"
            onClick={onMemoryClear}
            disabled={!hasMemoryValue}
            className={`${baseBtn} py-1 text-xs font-semibold ${theme.classes.keyFn} disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Memory Clear (MC)"
          >
            MC
          </button>
          <button
            type="button"
            onClick={onMemoryRecall}
            disabled={!hasMemoryValue}
            className={`${baseBtn} py-1 text-xs font-semibold ${theme.classes.keyFn} ${
              hasMemoryValue ? 'text-primary ring-1 ring-primary/40 font-bold' : ''
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Memory Recall (MR)"
          >
            MR
          </button>
          <button
            type="button"
            onClick={onMemoryAdd}
            className={`${baseBtn} py-1 text-xs font-semibold ${theme.classes.keyFn}`}
            title="Memory Add (M+)"
          >
            M+
          </button>
          <button
            type="button"
            onClick={onMemorySubtract}
            className={`${baseBtn} py-1 text-xs font-semibold ${theme.classes.keyFn}`}
            title="Memory Subtract (M-)"
          >
            M-
          </button>
          <button
            type="button"
            onClick={onMemoryStore}
            className={`${baseBtn} py-1 text-xs font-semibold ${theme.classes.keyFn} ${
              hasMemoryValue ? 'text-primary' : ''
            }`}
            title="Memory Store (MS)"
          >
            MS
          </button>
        </div>
      )}

      {/* RPN Controls Bar (themed to follow active theme style, design, and tint) */}
      {settings.rpnMode && (
        <div
          className={`grid grid-cols-4 gap-1.5 p-1 rounded-xl border text-xs font-mono transition-all ${
            isNordic
              ? 'bg-[#F1F5F9] border-[#CBD5E1] shadow-2xs'
              : theme.id === 'dockalc-dark'
              ? 'bg-[#1E1E22] border-[#36363C] shadow-2xs'
              : theme.id === 'warm-terracotta'
              ? 'bg-[#251D1A] border-[#453631] shadow-2xs'
              : theme.id === 'solar-amber'
              ? 'bg-[#241C12] border-[#423321] shadow-2xs'
              : theme.id === 'cyber-emerald'
              ? 'bg-[#0A140B] border-[#16381C] shadow-2xs'
              : 'bg-card/80 border-border/60 shadow-2xs'
          }`}
        >
          {/* ENTER Button (Primary Stack Push) */}
          <button
            type="button"
            onClick={onRpnEnter}
            className={`${baseBtn} py-1 sm:py-1.5 font-bold transition-all shadow-xs ${
              isNordic
                ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1E40AF]'
                : theme.id === 'dockalc-dark'
                ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#3B82F6]/50'
                : theme.id === 'warm-terracotta'
                ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white border border-[#FB923C]'
                : theme.id === 'solar-amber'
                ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#16120C] border border-[#FCD34D]'
                : theme.id === 'cyber-emerald'
                ? 'bg-[#22C55E] hover:bg-[#4ADE80] text-[#040804] border border-[#86EFAC]'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50'
            }`}
            title="Push to stack (ENTER)"
          >
            ENTER
          </button>

          {/* SWAP x⇄y Button */}
          <button
            type="button"
            onClick={onRpnSwap}
            disabled={!rpnStack || rpnStack.length < 1}
            className={`${baseBtn} py-1 sm:py-1.5 font-semibold transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
              isNordic
                ? 'bg-[#FFFFFF] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] shadow-2xs'
                : theme.id === 'dockalc-dark'
                ? 'bg-[#27272A] hover:bg-[#323236] text-[#93C5FD] border border-[#3F3F46]'
                : theme.id === 'warm-terracotta'
                ? 'bg-[#2E2420] hover:bg-[#3E312C] text-[#FED7AA] border border-[#4D3C36]'
                : theme.id === 'solar-amber'
                ? 'bg-[#2C2216] hover:bg-[#3D3020] text-[#FEF3C7] border border-[#4A3924]'
                : theme.id === 'cyber-emerald'
                ? 'bg-[#0F2111] hover:bg-[#153319] text-[#86EFAC] border border-[#1C4722]'
                : `${theme.classes.keyFn}`
            }`}
            title="Swap X and Y registers (x⇄y)"
          >
            SWAP x⇄y
          </button>

          {/* ROLL R↓ Button */}
          <button
            type="button"
            onClick={onRpnRoll}
            disabled={!rpnStack || rpnStack.length < 1}
            className={`${baseBtn} py-1 sm:py-1.5 font-semibold transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
              isNordic
                ? 'bg-[#FFFFFF] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] shadow-2xs'
                : theme.id === 'dockalc-dark'
                ? 'bg-[#27272A] hover:bg-[#323236] text-[#93C5FD] border border-[#3F3F46]'
                : theme.id === 'warm-terracotta'
                ? 'bg-[#2E2420] hover:bg-[#3E312C] text-[#FED7AA] border border-[#4D3C36]'
                : theme.id === 'solar-amber'
                ? 'bg-[#2C2216] hover:bg-[#3D3020] text-[#FEF3C7] border border-[#4A3924]'
                : theme.id === 'cyber-emerald'
                ? 'bg-[#0F2111] hover:bg-[#153319] text-[#86EFAC] border border-[#1C4722]'
                : `${theme.classes.keyFn}`
            }`}
            title="Roll down stack (R↓)"
          >
            ROLL R↓
          </button>

          {/* DROP Button */}
          <button
            type="button"
            onClick={onRpnDrop}
            disabled={!rpnStack || rpnStack.length < 1}
            className={`${baseBtn} py-1 sm:py-1.5 font-semibold transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
              isNordic
                ? 'bg-[#FFFFFF] hover:bg-rose-50 text-rose-600 border border-[#CBD5E1] shadow-2xs'
                : theme.id === 'dockalc-dark'
                ? 'bg-[#27272A] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-[#3F3F46]'
                : theme.id === 'warm-terracotta'
                ? 'bg-[#2E2420] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-[#4D3C36]'
                : theme.id === 'solar-amber'
                ? 'bg-[#2C2216] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-[#4A3924]'
                : theme.id === 'cyber-emerald'
                ? 'bg-[#0F2111] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-[#1C4722]'
                : 'bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30'
            }`}
            title="Drop top element from stack"
          >
            DROP
          </button>
        </div>
      )}

      {/* SCIENTIFIC EXTENSION ROW (only in scientific mode) */}
      {mode === 'scientific' && (
        <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={onToggle2nd}
            className={`${baseBtn} py-1 sm:py-1.5 font-bold ${
              is2nd ? 'bg-primary text-primary-foreground font-bold shadow-xs' : theme.classes.keyFn
            }`}
            title="2nd functions"
          >
            2nd
          </button>
          <button
            type="button"
            onClick={() => onParenthesis('(')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            (
          </button>
          <button
            type="button"
            onClick={() => onParenthesis(')')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            )
          </button>
          <button
            type="button"
            onClick={() => onConstant('pi')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            π
          </button>
          <button
            type="button"
            onClick={() => onConstant('e')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            e
          </button>
          <button
            type="button"
            onClick={() => onUnary('fact')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            n!
          </button>
          <button
            type="button"
            onClick={() => onUnary(is2nd ? 'asin' : 'sin')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            {is2nd ? 'sin⁻¹' : 'sin'}
          </button>
          <button
            type="button"
            onClick={() => onUnary(is2nd ? 'acos' : 'cos')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            {is2nd ? 'cos⁻¹' : 'cos'}
          </button>
          <button
            type="button"
            onClick={() => onUnary(is2nd ? 'atan' : 'tan')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            {is2nd ? 'tan⁻¹' : 'tan'}
          </button>
          <button
            type="button"
            onClick={() => onUnary('ln')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            ln
          </button>
          <button
            type="button"
            onClick={() => onUnary('log')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            log
          </button>
          <button
            type="button"
            onClick={() => onOperator('^')}
            className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
          >
            xʸ
          </button>
        </div>
      )}

      {/* PROGRAMMER EXTENSION (only in programmer mode) */}
      {mode === 'programmer' && (
        <div className="flex flex-col gap-1.5 font-mono">
          <div className="grid grid-cols-6 gap-1.5">
            {['A', 'B', 'C', 'D', 'E', 'F'].map((letter) => {
              const disabled = isHexLetterDisabled(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => onDigit(letter)}
                  disabled={disabled}
                  className={`${baseBtn} py-1 sm:py-1.5 font-bold ${
                    disabled
                      ? 'opacity-30 cursor-not-allowed bg-muted/20 text-muted-foreground'
                      : `${theme.classes.keyFn} text-foreground hover:text-primary font-bold`
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-6 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => onOperator('AND')}
              className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
            >
              AND
            </button>
            <button
              type="button"
              onClick={() => onOperator('OR')}
              className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
            >
              OR
            </button>
            <button
              type="button"
              onClick={() => onOperator('XOR')}
              className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
            >
              XOR
            </button>
            <button
              type="button"
              onClick={() => onUnary('NOT')}
              className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
            >
              NOT
            </button>
            <button
              type="button"
              onClick={() => onBitShift('Lsh')}
              className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
            >
              Lsh
            </button>
            <button
              type="button"
              onClick={() => onBitShift('Rsh')}
              className={`${baseBtn} py-1 sm:py-1.5 ${theme.classes.keyFn}`}
            >
              Rsh
            </button>
          </div>
        </div>
      )}

      {/* MAIN 4-COLUMN TACTILE KEYPAD GRID (Matches Screenshot Exactly) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 flex-1 min-h-0 auto-rows-fr">
        {/* ROW 1: % , CE , C , ⌫ */}
        <button
          type="button"
          onClick={() => onUnary('%')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-base sm:text-lg font-medium overflow-hidden ${theme.classes.keyFn}`}
          title="Percentage (%)"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => onClear(false)}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-xs sm:text-sm font-semibold overflow-hidden ${theme.classes.keyFn}`}
          title="Clear Entry (CE)"
        >
          CE
        </button>
        <button
          type="button"
          onClick={() => onClear(true)}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-xs sm:text-sm font-semibold overflow-hidden ${theme.classes.keyFn}`}
          title="Clear (C) - Esc"
        >
          C
        </button>
        <button
          type="button"
          onClick={onBackspace}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 overflow-hidden ${theme.classes.keyFn}`}
          title="Backspace (⌫)"
        >
          <Delete className="w-4 h-4 sm:w-5 sm:h-5 opacity-90" />
        </button>

        {/* ROW 2: 1/x , x² , √ , ÷ (Programmable with Cog icons) */}
        <div className="relative group h-full">
          <button
            type="button"
            onClick={() => onProgrammableKey ? onProgrammableKey('reciprocal') : onUnary('1/x')}
            className={`${baseBtn} w-full min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-xs sm:text-sm font-medium overflow-hidden ${theme.classes.keyFn} ${
              reciprocalConfig.actionType !== 'default_unary' ? 'text-primary font-bold' : ''
            }`}
            title={`Reciprocal / Programmable (${reciprocalConfig.label}) - Key: I`}
          >
            <span className="truncate">{reciprocalConfig.label}</span>
          </button>
          {onOpenProgrammableModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenProgrammableModal('reciprocal');
              }}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-card border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs z-10"
              title="Program 1/x Key"
            >
              <Cog className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="relative group h-full">
          <button
            type="button"
            onClick={() => onProgrammableKey ? onProgrammableKey('sqr') : onUnary('sqr')}
            className={`${baseBtn} w-full min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-xs sm:text-sm font-medium overflow-hidden ${theme.classes.keyFn} ${
              sqrConfig.actionType !== 'default_unary' ? 'text-primary font-bold' : ''
            }`}
            title={`Square / Programmable (${sqrConfig.label}) - Key: Q`}
          >
            <span className="truncate">{sqrConfig.label}</span>
          </button>
          {onOpenProgrammableModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenProgrammableModal('sqr');
              }}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-card border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs z-10"
              title="Program x² Key"
            >
              <Cog className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="relative group h-full">
          <button
            type="button"
            onClick={() => onProgrammableKey ? onProgrammableKey('sqrt') : onUnary('√x')}
            className={`${baseBtn} w-full min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-xs sm:text-sm font-medium overflow-hidden ${theme.classes.keyFn} ${
              sqrtConfig.actionType !== 'default_unary' ? 'text-primary font-bold' : ''
            }`}
            title={`Square root / Programmable (${sqrtConfig.label}) - Key: R`}
          >
            <span className="truncate">{sqrtConfig.label}</span>
          </button>
          {onOpenProgrammableModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenProgrammableModal('sqrt');
              }}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-card border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs z-10"
              title="Program √ Key"
            >
              <Cog className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* DIVIDE BUTTON */}
        <button
          type="button"
          onClick={() => onOperator('÷')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-bold overflow-hidden ${theme.classes.keyOp}`}
          title="Divide (÷) - /"
        >
          <Divide className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* ROW 3: 7 , 8 , 9 , × */}
        {['7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onDigit(digit)}
            disabled={isDigitDisabled(digit)}
            className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-semibold overflow-hidden ${theme.classes.keyNum} ${
              isDigitDisabled(digit) ? 'opacity-30 cursor-not-allowed bg-muted/20 text-muted-foreground' : ''
            }`}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onOperator('×')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-bold overflow-hidden ${theme.classes.keyOp}`}
          title="Multiply (×) - *"
        >
          <Multiply className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* ROW 4: 4 , 5 , 6 , - */}
        {['4', '5', '6'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onDigit(digit)}
            disabled={isDigitDisabled(digit)}
            className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-semibold overflow-hidden ${theme.classes.keyNum} ${
              isDigitDisabled(digit) ? 'opacity-30 cursor-not-allowed bg-muted/20 text-muted-foreground' : ''
            }`}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onOperator('-')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-bold overflow-hidden ${theme.classes.keyOp}`}
          title="Subtract (-) - -"
        >
          <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* ROW 5: 1 , 2 , 3 , + */}
        {['1', '2', '3'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onDigit(digit)}
            disabled={isDigitDisabled(digit)}
            className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-semibold overflow-hidden ${theme.classes.keyNum} ${
              isDigitDisabled(digit) ? 'opacity-30 cursor-not-allowed bg-muted/20 text-muted-foreground' : ''
            }`}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onOperator('+')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-bold overflow-hidden ${theme.classes.keyOp}`}
          title="Add (+) - +"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* ROW 6: ± (custom/prog) , 0 , . , = */}
        <div className="relative group h-full">
          <button
            type="button"
            onClick={() => onProgrammableKey ? onProgrammableKey('custom') : onCustomButton ? onCustomButton() : onUnary('±')}
            className={`${baseBtn} w-full min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-xs sm:text-sm font-medium overflow-hidden ${theme.classes.keyFn} ${
              customConfig.label !== '±' ? 'text-primary font-bold' : ''
            }`}
            title={`Configurable Key (${customConfig.label}) - Key: ${settings.customButton?.hotkey || 'T'}`}
          >
            <span className="truncate">{customConfig.label || '±'}</span>
          </button>
          {onOpenProgrammableModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenProgrammableModal('custom');
              }}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-card border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs z-10"
              title="Program Custom Key"
            >
              <Cog className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDigit('0')}
          disabled={isDigitDisabled('0')}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-semibold overflow-hidden ${theme.classes.keyNum} ${
            isDigitDisabled('0') ? 'opacity-30 cursor-not-allowed bg-muted/20 text-muted-foreground' : ''
          }`}
        >
          0
        </button>

        <button
          type="button"
          onClick={onDecimal}
          disabled={mode === 'programmer'}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-semibold overflow-hidden ${theme.classes.keyNum} ${
            mode === 'programmer' ? 'opacity-30 cursor-not-allowed bg-muted/20 text-muted-foreground' : ''
          }`}
          title="Decimal point (.)"
        >
          .
        </button>

        <button
          type="button"
          onClick={onEquals}
          className={`${baseBtn} min-h-[28px] xs:min-h-[32px] sm:min-h-[36px] h-full py-0.5 sm:py-1 text-lg sm:text-xl font-bold overflow-hidden ${theme.classes.keyEqual} shadow-sm`}
          title="Calculate (=) - Enter"
        >
          <Equal className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
