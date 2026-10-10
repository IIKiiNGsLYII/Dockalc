import { useEffect } from 'react';
import type { CalcMode, NumberBase, ProgrammableKeyId, ProgrammableKeysConfig } from '@/types/calculator';

interface KeyboardShortcutOptions {
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
  onSetMode: (m: CalcMode) => void;
  onToggleHistory: () => void;
  onToggleMemory: () => void;
  onOpenShortcutsModal: () => void;
  onOpenFormulaModal?: () => void;
  onMemoryStore: () => void;
  onMemoryRecall: () => void;
  onMemoryClear: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onCustomButton?: () => void;
  programmableKeys?: ProgrammableKeysConfig;
  onExecuteProgrammableKey?: (keyId: ProgrammableKeyId) => void;
  onTogglePin?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts(options: KeyboardShortcutOptions) {
  const {
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
    onSetMode,
    onToggleHistory,
    onToggleMemory,
    onOpenShortcutsModal,
    onOpenFormulaModal,
    onMemoryStore,
    onMemoryRecall,
    onMemoryClear,
    onMemoryAdd,
    onMemorySubtract,
    onCustomButton,
    programmableKeys,
    onExecuteProgrammableKey,
    onTogglePin,
    disabled = false,
  } = options;

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key;

      // Check Programmable Keys user-defined and default hotkeys (Modifier + Key)
      if (programmableKeys && onExecuteProgrammableKey) {
        const progEntries = Object.entries(programmableKeys) as [ProgrammableKeyId, typeof programmableKeys[ProgrammableKeyId]][];
        for (const [keyId, cfg] of progEntries) {
          const hk = cfg?.hotkey;
          if (hk && hk.enabled !== false && hk.key) {
            const mod = hk.modifier || 'Alt';
            const modMatches =
              (mod === 'None' && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) ||
              (mod === 'Alt' && e.altKey && !e.ctrlKey && !e.metaKey) ||
              (mod === 'Ctrl' && (e.ctrlKey || e.metaKey) && !e.altKey) ||
              (mod === 'Shift' && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) ||
              (mod === 'Meta' && e.metaKey && !e.ctrlKey && !e.altKey);

            if (modMatches && key.toLowerCase() === hk.key.toLowerCase()) {
              e.preventDefault();
              onExecuteProgrammableKey(keyId);
              return;
            }
          }
        }
      }

      // Help shortcut ? or Shift + / anywhere
      if (key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        onOpenShortcutsModal();
        return;
      }

      // Formula cheat sheet shortcut Alt + F
      if (e.altKey && !e.ctrlKey && !e.metaKey && key.toLowerCase() === 'f' && onOpenFormulaModal) {
        e.preventDefault();
        onOpenFormulaModal();
        return;
      }

      // Mode switching shortcuts (Alt+1, Alt+2, Alt+3)
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (key === '1') {
          e.preventDefault();
          onSetMode('standard');
          return;
        }
        if (key === '2') {
          e.preventDefault();
          onSetMode('scientific');
          return;
        }
        if (key === '3') {
          e.preventDefault();
          onSetMode('programmer');
          return;
        }
        if (key === '4') {
          e.preventDefault();
          onSetMode('convert');
          return;
        }
        if (key.toLowerCase() === 'p' && onTogglePin) {
          e.preventDefault();
          onTogglePin();
          return;
        }
      }

      // Memory shortcuts with Ctrl/Cmd
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (key.toLowerCase() === 'h') {
          e.preventDefault();
          onToggleHistory();
          return;
        }
        if (key.toLowerCase() === 'm') {
          e.preventDefault();
          if (e.shiftKey) {
            onToggleMemory();
          } else {
            onMemoryStore();
          }
          return;
        }
        if (key.toLowerCase() === 'r') {
          e.preventDefault();
          onMemoryRecall();
          return;
        }
        if (key.toLowerCase() === 'l') {
          e.preventDefault();
          onMemoryClear();
          return;
        }
        if (key.toLowerCase() === 'p') {
          e.preventDefault();
          onMemoryAdd();
          return;
        }
        if (key.toLowerCase() === 'q') {
          e.preventDefault();
          onMemorySubtract();
          return;
        }
        if (key === '/' || key === '?') {
          e.preventDefault();
          onOpenShortcutsModal();
          return;
        }
      }

      // Quick function keys from Cheatsheet
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const lKey = key.toLowerCase();
        if (lKey === 'm' && onCustomButton) {
          e.preventDefault();
          onCustomButton();
          return;
        }
        if (lKey === 'r') {
          e.preventDefault();
          onUnary('√x');
          return;
        }
        if (lKey === 'q') {
          e.preventDefault();
          onUnary('sqr');
          return;
        }
        if (lKey === 'i') {
          e.preventDefault();
          onUnary('1/x');
          return;
        }
        if (key === 'F9' || lKey === 'n') {
          e.preventDefault();
          onUnary('±');
          return;
        }
      }

      // Help cheatsheet modal shortcut
      if (key === '?' || key === 'F1') {
        e.preventDefault();
        onOpenShortcutsModal();
        return;
      }

      // If mode is 'convert', do not route calculation digits/operators to Standard calculator!
      // ConvertView handles keyboard typing directly into the active conversion input.
      if (mode === 'convert') {
        return;
      }

      // Digits 0-9
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        onDigit(key);
        return;
      }

      // In Programmer HEX mode, allow A-F (case insensitive)
      if (mode === 'programmer' && base === 'HEX' && /^[a-fA-F]$/.test(key)) {
        e.preventDefault();
        onDigit(key.toUpperCase());
        return;
      }

      // Decimal point
      if (key === '.' || key === ',') {
        e.preventDefault();
        onDecimal();
        return;
      }

      // Arithmetic operators
      if (key === '+' || key === '-') {
        e.preventDefault();
        onOperator(key === '-' ? '−' : '+');
        return;
      }
      if (key === '*' || key === 'x' || key === 'X') {
        e.preventDefault();
        onOperator('×');
        return;
      }
      if (key === '/') {
        e.preventDefault();
        onOperator('÷');
        return;
      }
      if (key === '%') {
        e.preventDefault();
        if (mode === 'programmer') {
          onOperator('MOD');
        } else {
          onUnary('%');
        }
        return;
      }
      if (key === '^') {
        e.preventDefault();
        onOperator('y^x');
        return;
      }

      // Equals / Calculate
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        // Prevent key-repeat from increasing calculation counts when key is held down
        if (e.repeat) return;
        onEquals();
        return;
      }

      // Backspace / Delete
      if (key === 'Backspace') {
        e.preventDefault();
        onBackspace();
        return;
      }

      // Clear (Escape)
      if (key === 'Escape') {
        e.preventDefault();
        onClear(true);
        return;
      }

      // Parentheses
      if (key === '(' || key === ')') {
        e.preventDefault();
        onParenthesis(key);
        return;
      }

      // Scientific letter shortcuts (when not in programmer hex mode)
      if (mode === 'scientific') {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 's' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onUnary('sin');
          return;
        }
        if (lowerKey === 'c' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onUnary('cos');
          return;
        }
        if (lowerKey === 't' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onUnary('tan');
          return;
        }
        if (lowerKey === 'l' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onUnary('ln');
          return;
        }
        if (lowerKey === 'g' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onUnary('log');
          return;
        }
        if (lowerKey === 'p' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onConstant('pi');
          return;
        }
        if (lowerKey === 'e' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onConstant('e');
          return;
        }
        if (lowerKey === 'r' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onUnary('√x');
          return;
        }
        if (key === '!') {
          e.preventDefault();
          onUnary('n!');
          return;
        }
        if (lowerKey === 'n' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onUnary('+/-');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    base,
    disabled,
    mode,
    onBackspace,
    onClear,
    onConstant,
    onDecimal,
    onDigit,
    onEquals,
    onMemoryAdd,
    onMemoryClear,
    onMemoryRecall,
    onMemoryStore,
    onMemorySubtract,
    onOpenShortcutsModal,
    onOperator,
    onParenthesis,
    onSetMode,
    onToggleHistory,
    onToggleMemory,
    onUnary,
  ]);
}
