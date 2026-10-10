// Persistent User Statistics Tracking for Dockcalc
export interface UserStats {
  totalCalculations: number;
  totalEqualsPressed: number;
  totalClearPressed: number;
  totalDigitsPressed: number;
  totalBackspacePressed: number;
  customKeyUses: number;
  totalConversions: number;
  totalRpnOps: number;
  digitCounts: Record<string, number>;
  calculatedResultCounts: Record<string, number>;
  sumOfCalculations: number;
  countOfCalculationsForAverage: number;
  operations: {
    add: number;
    subtract: number;
    multiply: number;
    divide: number;
    percent: number;
    power: number;
    sqrt: number;
    trig: number;
    log: number;
    bitwise: number;
    other: number;
  };
  modesUsed: {
    standard: number;
    scientific: number;
    programmer: number;
    convert: number;
    finance: number;
  };
  memoryOps: {
    store: number;
    recall: number;
    clear: number;
    add: number;
    subtract: number;
  };
  highestCalculatedValue: number | null;
  lowestCalculatedValue: number | null;
  sprintStats: {
    totalPlayed: number;
    highScore: number;
    totalSolved: number;
    bestStreak: number;
  };
  gadgetsStats: {
    diceRolls: number;
    coinFlips: number;
    target24Solved: number;
  };
  easterEggsFound: {
    hitchhiker42: number;
    primesDiscovered: number;
    fibonaccisDiscovered: number;
    upsideDownUsed: number;
  };
  firstSessionDate: string;
  lastActiveDate: string;
}

const STORAGE_KEY = 'dockcalc_user_stats';

const DEFAULT_STATS: UserStats = {
  totalCalculations: 0,
  totalEqualsPressed: 0,
  totalClearPressed: 0,
  totalDigitsPressed: 0,
  totalBackspacePressed: 0,
  customKeyUses: 0,
  totalConversions: 0,
  totalRpnOps: 0,
  digitCounts: { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 },
  calculatedResultCounts: {},
  sumOfCalculations: 0,
  countOfCalculationsForAverage: 0,
  operations: {
    add: 0,
    subtract: 0,
    multiply: 0,
    divide: 0,
    percent: 0,
    power: 0,
    sqrt: 0,
    trig: 0,
    log: 0,
    bitwise: 0,
    other: 0,
  },
  modesUsed: {
    standard: 0,
    scientific: 0,
    programmer: 0,
    convert: 0,
    finance: 0,
  },
  memoryOps: {
    store: 0,
    recall: 0,
    clear: 0,
    add: 0,
    subtract: 0,
  },
  highestCalculatedValue: null,
  lowestCalculatedValue: null,
  sprintStats: {
    totalPlayed: 0,
    highScore: 0,
    totalSolved: 0,
    bestStreak: 0,
  },
  gadgetsStats: {
    diceRolls: 0,
    coinFlips: 0,
    target24Solved: 0,
  },
  easterEggsFound: {
    hitchhiker42: 0,
    primesDiscovered: 0,
    fibonaccisDiscovered: 0,
    upsideDownUsed: 0,
  },
  firstSessionDate: new Date().toISOString().split('T')[0],
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      digitCounts: { ...DEFAULT_STATS.digitCounts, ...(parsed.digitCounts || {}) },
      calculatedResultCounts: { ...(parsed.calculatedResultCounts || {}) },
      operations: { ...DEFAULT_STATS.operations, ...parsed.operations },
      modesUsed: { ...DEFAULT_STATS.modesUsed, ...parsed.modesUsed },
      memoryOps: { ...DEFAULT_STATS.memoryOps, ...parsed.memoryOps },
      sprintStats: { ...DEFAULT_STATS.sprintStats, ...parsed.sprintStats },
      gadgetsStats: { ...DEFAULT_STATS.gadgetsStats, ...parsed.gadgetsStats },
      easterEggsFound: { ...DEFAULT_STATS.easterEggsFound, ...parsed.easterEggsFound },
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota errors
  }
}

export function recordCalculation(options: {
  operator?: string;
  mode?: string;
  resultNum?: number;
}): UserStats {
  const stats = getUserStats();
  stats.totalCalculations += 1;
  stats.totalEqualsPressed += 1;
  stats.lastActiveDate = new Date().toISOString().split('T')[0];

  // Record mode usage
  if (options.mode) {
    const m = options.mode.toLowerCase() as keyof UserStats['modesUsed'];
    if (m in stats.modesUsed) {
      stats.modesUsed[m] += 1;
    }
  }

  // Record operation
  if (options.operator) {
    const op = options.operator;
    if (op === '+' || op === 'add') stats.operations.add += 1;
    else if (op === '-' || op === 'sub' || op === '−') stats.operations.subtract += 1;
    else if (op === '×' || op === '*' || op === 'mul') stats.operations.multiply += 1;
    else if (op === '÷' || op === '/' || op === 'div') stats.operations.divide += 1;
    else if (op.includes('%') || op === 'pct') stats.operations.percent += 1;
    else if (op.includes('^') || op.includes('pow')) stats.operations.power += 1;
    else if (op.includes('sqrt') || op.includes('√')) stats.operations.sqrt += 1;
    else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].some((t) => op.includes(t))) stats.operations.trig += 1;
    else if (op.includes('log') || op.includes('ln')) stats.operations.log += 1;
    else if (['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR', '<<', '>>'].some((b) => op.includes(b))) stats.operations.bitwise += 1;
    else stats.operations.other += 1;
  }

  // Record high/low numeric bounds, result frequency & average tracking
  if (typeof options.resultNum === 'number' && !Number.isNaN(options.resultNum) && Number.isFinite(options.resultNum)) {
    if (stats.highestCalculatedValue === null || options.resultNum > stats.highestCalculatedValue) {
      stats.highestCalculatedValue = options.resultNum;
    }
    if (stats.lowestCalculatedValue === null || options.resultNum < stats.lowestCalculatedValue) {
      stats.lowestCalculatedValue = options.resultNum;
    }
    stats.sumOfCalculations += options.resultNum;
    stats.countOfCalculationsForAverage += 1;

    // Record calculated result frequency
    const formattedResult = Number.isInteger(options.resultNum)
      ? String(options.resultNum)
      : String(Number(options.resultNum.toFixed(6)));
    if (!stats.calculatedResultCounts) {
      stats.calculatedResultCounts = {};
    }
    stats.calculatedResultCounts[formattedResult] = (stats.calculatedResultCounts[formattedResult] || 0) + 1;
  }

  saveUserStats(stats);
  return stats;
}

export function recordCustomKeyUse(): UserStats {
  const stats = getUserStats();
  stats.customKeyUses = (stats.customKeyUses || 0) + 1;
  saveUserStats(stats);
  return stats;
}

export function recordConversion(): void {
  const stats = getUserStats();
  stats.totalConversions = (stats.totalConversions || 0) + 1;
  saveUserStats(stats);
}

export function recordRpnOp(): void {
  const stats = getUserStats();
  stats.totalRpnOps = (stats.totalRpnOps || 0) + 1;
  saveUserStats(stats);
}

export function recordDigitPress(digit?: string): void {
  const stats = getUserStats();
  stats.totalDigitsPressed += 1;
  if (digit && typeof digit === 'string' && digit >= '0' && digit <= '9') {
    if (!stats.digitCounts) {
      stats.digitCounts = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 };
    }
    stats.digitCounts[digit] = (stats.digitCounts[digit] || 0) + 1;
  }
  saveUserStats(stats);
}

export function recordClearPress(): void {
  const stats = getUserStats();
  stats.totalClearPressed += 1;
  saveUserStats(stats);
}

export function recordBackspacePress(): void {
  const stats = getUserStats();
  stats.totalBackspacePressed += 1;
  saveUserStats(stats);
}

export function recordMemoryOp(type: keyof UserStats['memoryOps']): void {
  const stats = getUserStats();
  if (type in stats.memoryOps) {
    stats.memoryOps[type] += 1;
    saveUserStats(stats);
  }
}

export function recordGadgetStat(type: 'diceRoll' | 'coinFlip' | 'target24'): void {
  const stats = getUserStats();
  if (type === 'diceRoll') stats.gadgetsStats.diceRolls += 1;
  if (type === 'coinFlip') stats.gadgetsStats.coinFlips += 1;
  if (type === 'target24') stats.gadgetsStats.target24Solved += 1;
  saveUserStats(stats);
}

export function recordSprintCompletion(score: number, solved: number, streak: number): void {
  const stats = getUserStats();
  stats.sprintStats.totalPlayed += 1;
  stats.sprintStats.totalSolved += solved;
  if (score > stats.sprintStats.highScore) {
    stats.sprintStats.highScore = score;
  }
  if (streak > stats.sprintStats.bestStreak) {
    stats.sprintStats.bestStreak = streak;
  }
  saveUserStats(stats);
}

export function recordEasterEgg(type: keyof UserStats['easterEggsFound']): void {
  const stats = getUserStats();
  if (type in stats.easterEggsFound) {
    stats.easterEggsFound[type] += 1;
    saveUserStats(stats);
  }
}

export function resetUserStats(): UserStats {
  const resetState = {
    ...DEFAULT_STATS,
    firstSessionDate: new Date().toISOString().split('T')[0],
    lastActiveDate: new Date().toISOString().split('T')[0],
  };
  saveUserStats(resetState);
  return resetState;
}
