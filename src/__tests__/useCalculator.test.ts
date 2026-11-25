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
        else if (k.startsWith('paste:')) c.pasteValue(k.slice(6));
        else if (k.startsWith('mode:')) c.setMode(k.slice(5) as Calc['mode']);
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

describe('repeat equals', () => {
  it('pressing = again repeats the last operation', () => {
    const { press, display } = setup();
    press('5', '+', '2', '=');
    expect(display()).toBe('7');
    press('=');
    expect(display()).toBe('9');
    press('=');
    expect(display()).toBe('11');
  });

  it('applies the last operation to a newly typed number', () => {
    const { press, display } = setup();
    press('5', '×', '3', '=', '4', '=');
    expect(display()).toBe('12');
  });

  it('AC forgets the repeat', () => {
    const { press, display } = setup();
    press('5', '+', '2', '=', 'AC', '=');
    expect(display()).toBe('0');
  });
});

describe('paste', () => {
  it('pastes formatted money and accounting negatives', () => {
    const { press, display } = setup();
    press('paste:$1,234.50');
    expect(display()).toBe('1234.50');
    press('+', 'paste:(34.50)', '=');
    expect(display()).toBe('1200');
  });

  it('rejects text that is not a number', () => {
    const { result, display } = setup();
    let ok = true;
    act(() => {
      ok = result.current.pasteValue('hello');
    });
    expect(ok).toBe(false);
    expect(display()).toBe('0');
  });
});

describe('operators after functions and brackets', () => {
  it('keeps the earlier operation after a closed bracket (2 × (3 + 4) + 1 = 15)', () => {
    const { press, display } = setup();
    press('2', '×', '(', '3', '+', '4', ')', '+', '1', '=');
    expect(display()).toBe('15');
  });

  it('keeps the earlier operation after a function (9 + √16 + 1 = 14)', () => {
    const { press, display } = setup();
    press('9', '+', '1', '6', '√x', '+', '1', '=');
    expect(display()).toBe('14');
  });

  it('pressing two operators in a row uses the last one', () => {
    const { press, display } = setup();
    press('8', '+', '×', '2', '=');
    expect(display()).toBe('16');
  });
});

describe('order of operations', () => {
  it('Standard mode works left to right like a basic calculator (2 + 3 × 4 = 20)', () => {
    const { press, display } = setup();
    press('2', '+', '3', '×', '4', '=');
    expect(display()).toBe('20');
  });

  it('Scientific mode multiplies first (2 + 3 × 4 = 14)', () => {
    const { press, display } = setup();
    press('mode:scientific', '2', '+', '3', '×', '4', '=');
    expect(display()).toBe('14');
  });

  it('Scientific mode shows the partial result when it can (2 × 3 + 4 → 6 then 10)', () => {
    const { press, display } = setup();
    press('mode:scientific', '2', '×', '3', '+');
    expect(display()).toBe('6');
    press('4', '=');
    expect(display()).toBe('10');
  });

  it('Scientific mode: 2 + 3 × 4 − 5 = 9', () => {
    const { press, display } = setup();
    press('mode:scientific', '2', '+', '3', '×', '4', '−', '5', '=');
    expect(display()).toBe('9');
  });

  it('Scientific mode: powers before multiplication (2 × 3 ^ 2 = 18)', () => {
    const { press, display } = setup();
    press('mode:scientific', '2', '×', '3', 'y^x', '2', '=');
    expect(display()).toBe('18');
  });

  it('Scientific mode with brackets: (2 + 3) × 4 = 20 and 2 × (3 + 4 × 5) = 46', () => {
    const { press, display } = setup();
    press('mode:scientific', '(', '2', '+', '3', ')', '×', '4', '=');
    expect(display()).toBe('20');
    press('AC', '2', '×', '(', '3', '+', '4', '×', '5', ')', '=');
    expect(display()).toBe('46');
  });
});
