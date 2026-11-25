import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCalculator } from '@/hooks/useCalculator';

type Calc = ReturnType<typeof useCalculator>;

function setup() {
  const { result } = renderHook(() => useCalculator());
  // Each key is its own act() so state settles like real key presses.
  const press = (...keys: string[]) => {
    for (const k of keys) {
      act(() => {
        const c: Calc = result.current;
        if (/^[0-9]$/.test(k)) c.inputDigit(k);
        else if (k === '.') c.inputDecimal();
        else if (k === '=') c.calculateEquals();
        else if (k === 'AC') c.clear(true);
        else if (k === '⌫') c.deleteChar();
        else if (k === '(' || k === ')') c.handleParenthesis(k);
        else if (['%', '±', '+/-', '√x'].includes(k)) c.applyUnaryFunction(k);
        else c.setOperator(k);
      });
    }
  };
  return { result, press, display: () => result.current.display };
}

beforeEach(() => {
  localStorage.clear();
});

describe('basic arithmetic', () => {
  it('adds and chains', () => {
    const { press, display } = setup();
    press('2', '+', '3', '=');
    expect(display()).toBe('5');
    press('×', '4', '=');
    expect(display()).toBe('20');
  });

  it('fixes floating point noise', () => {
    const { press, display } = setup();
    press('0', '.', '1', '+', '0', '.', '2', '=');
    expect(display()).toBe('0.3');
  });
});

describe('percent', () => {
  it('adds a percentage of the first number (200 + 10% = 220)', () => {
    const { press, display } = setup();
    press('2', '0', '0', '+', '1', '0', '%');
    expect(display()).toBe('20');
    press('=');
    expect(display()).toBe('220');
  });

  it('subtracts a percentage (200 − 25% = 150)', () => {
    const { press, display } = setup();
    press('2', '0', '0', '−', '2', '5', '%', '=');
    expect(display()).toBe('150');
  });

  it('multiplies by a percentage (80 × 50% = 40)', () => {
    const { press, display } = setup();
    press('8', '0', '×', '5', '0', '%', '=');
    expect(display()).toBe('40');
  });

  it('on its own divides by 100', () => {
    const { press, display } = setup();
    press('5', '%');
    expect(display()).toBe('0.05');
  });
});

describe('negate', () => {
  it('keyboard ± works and lets you keep typing', () => {
    const { press, display } = setup();
    press('5', '±', '3');
    expect(display()).toBe('-53');
    press('±');
    expect(display()).toBe('53');
  });

  it('negates a result', () => {
    const { press, display } = setup();
    press('2', '+', '3', '=', '+/-');
    expect(display()).toBe('-5');
  });
});

describe('brackets', () => {
  it('= closes open brackets (2 × (3 + 4 = 14)', () => {
    const { press, display } = setup();
    press('2', '×', '(', '3', '+', '4', '=');
    expect(display()).toBe('14');
  });

  it('closed brackets work', () => {
    const { press, display } = setup();
    press('2', '×', '(', '3', '+', '4', ')', '=');
    expect(display()).toBe('14');
  });
});

describe('errors', () => {
  it('divide by zero shows a message and recovers', () => {
    const { press, display } = setup();
    press('5', '÷', '0', '=');
    expect(display()).toBe('Cannot divide by zero');
    press('+', '3', '=');
    expect(display()).not.toBe('NaN');
    expect(display()).toBe('3');
  });

  it('backspace on an error clears it', () => {
    const { press, display } = setup();
    press('5', '÷', '0', '=', '⌫');
    expect(display()).toBe('0');
  });

  it('typing after an error starts fresh', () => {
    const { press, display } = setup();
    press('5', '÷', '0', '=', '7');
    expect(display()).toBe('7');
  });
});

describe('roots', () => {
  it('cube root of a negative number is real', () => {
    const { press, display } = setup();
    press('3', 'x√y', '8', '±', '=');
    expect(display()).toBe('-2');
  });
});

describe('mode usage stats', () => {
  it('counts Convert and Finance uses and unlocks their badges', () => {
    const { result } = setup();
    act(() => result.current.markModeUsed('convert'));
    act(() => result.current.markModeUsed('finance'));
    const stats = JSON.parse(localStorage.getItem('dockcalc_user_stats') || '{}');
    expect(stats.modesUsed.convert).toBe(1);
    expect(stats.modesUsed.finance).toBe(1);
    const unlocked = result.current.settings.unlockedAchievements || [];
    expect(unlocked).toContain('global-trader');
    expect(unlocked).toContain('financial-planner');
  });
});

describe('defaults', () => {
  it('starts muted with the fraction helper off', () => {
    const { result } = setup();
    expect(result.current.settings.soundEnabled).toBe(false);
    expect(result.current.settings.showExactFraction).toBe(false);
  });
});
