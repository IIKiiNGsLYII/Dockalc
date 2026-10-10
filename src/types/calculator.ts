export type CalcMode = 'standard' | 'scientific' | 'programmer' | 'convert' | 'finance';

export type AngleUnit = 'DEG' | 'RAD' | 'GRAD';

export type NumberBase = 'HEX' | 'DEC' | 'OCT' | 'BIN';

export type BitWidth = 64 | 32 | 16 | 8;

export type NotationMode = 'normal' | 'scientific' | 'engineering';

export interface HistoryItem {
  id: string;
  timestamp: number;
  expression: string;
  runningEquation?: string;
  result: string;
  mode: CalcMode;
  base?: NumberBase;
  note?: string;
}

export interface MemorySlot {
  index: number;
  value: string;
  updatedAt: number;
  label?: string;
}

export type CustomActionType = 'doubleZero' | 'tax' | 'tip' | 'multiplier' | 'constant' | 'formula' | 'default_unary';

export type ProgrammableKeyId = 'custom' | 'reciprocal' | 'sqr' | 'sqrt';

export type HotkeyModifier = 'None' | 'Alt' | 'Ctrl' | 'Shift' | 'Meta';

export interface HotkeyCombination {
  enabled: boolean;
  modifier: HotkeyModifier;
  key: string; // e.g. 'R', 'S', 'Q', 'K'
}

export const DEFAULT_KEY_HOTKEYS: Record<ProgrammableKeyId, HotkeyCombination> = {
  reciprocal: { enabled: true, modifier: 'Alt', key: 'R' },
  sqr: { enabled: true, modifier: 'Alt', key: 'S' },
  sqrt: { enabled: true, modifier: 'Alt', key: 'Q' },
  custom: { enabled: true, modifier: 'Alt', key: 'K' },
};

export interface CustomButtonConfig {
  label: string;
  actionType: CustomActionType;
  value: string; // e.g. "8.25" for tax, "1.60934" for multiplier, "00"
  hotkey?: HotkeyCombination;
}

export type ProgrammableKeysConfig = Record<ProgrammableKeyId, CustomButtonConfig>;

export interface CalculatorTheme {
  id: string;
  name: string;
  description: string;
  category: 'dark' | 'light' | 'retro' | 'cyber' | 'warm' | 'custom';
  classes: {
    bg: string;
    card: string;
    displayBg: string;
    displayText: string;
    displayDim: string;
    keyNum: string;
    keyOp: string;
    keyFn: string;
    keyEqual: string;
    keyActive: string;
    border: string;
    accent: string;
  };
}

export type CalculatorFontStyle = 'montserrat' | 'mono' | 'sans' | 'digital';
export type KeypadFontWeight = 'regular' | 'medium' | 'bold';
export type CornerRadiusPreset = 'sharp' | 'subtle' | 'standard' | 'extra' | 'pill';

export interface CustomThemeConfig {
  hue: number;            // 0 - 360
  saturation: number;     // 0 - 100
  lightness: number;      // 0 - 100
  opacity: number;        // 0.2 - 1.0
  mode: 'dark' | 'light';
  hexColor?: string;
}

export type DeviceLayoutMode = 'auto' | 'phone' | 'tablet' | 'desktop';

export interface CalculatorSettings {
  theme: string;
  customTheme?: CustomThemeConfig;
  fontStyle?: CalculatorFontStyle;
  keypadFontWeight?: KeypadFontWeight;
  numberFontWeight?: KeypadFontWeight;
  fontScale?: number;
  displayFontScale?: number;
  cornerRadius?: CornerRadiusPreset;
  cornerRadiusPx?: number;
  soundEnabled: boolean;
  soundVolume: number;
  vibrateEnabled: boolean;
  thousandsSeparator: boolean;
  decimalPlaces: number; // -1 for auto
  notation: NotationMode;
  rpnMode: boolean;
  showBitGrid: boolean;
  tapeDocked: boolean;
  showMemoryBar: boolean;
  showPaperTape?: boolean;
  showEquationBar?: boolean;
  equationBarPosition?: 'top' | 'bottom';
  customButton: CustomButtonConfig;
  programmableKeys?: ProgrammableKeysConfig;
  alwaysOnTop: boolean;
  windowOpacity: number;
  compactOverlay: boolean;
  defaultMode?: CalcMode;
  tabletRatio?: number; // 50 to 80 (percentage for calculator column on tablets/side-by-side)
  deviceLayout?: DeviceLayoutMode;
  defaultWindowWidth?: number;
  defaultWindowHeight?: number;
  // Fun Effects & Addons
  confettiEnabled?: boolean;
  confettiMode?: 'every' | 'everyX' | 'every10' | 'random';
  confettiEveryX?: number;
  confettiRandomMin?: number;
  confettiRandomMax?: number;
  funNumberRoll?: boolean;
  funMatrixGlow?: boolean;
  funVictoryChime?: boolean;
  funRippleWaves?: boolean;
  // Sound Personality Packs (Category 1)
  soundPack?: 'default' | 'cherry-blue' | 'thoccy' | 'chiptune' | 'typewriter' | 'piano';
  // Particle Cannons Style (Category 2)
  particleStyle?: 'confetti' | 'fireworks' | 'coins' | 'math-runes' | 'starlight';
  // Favorite Number Clover Confetti
  favoriteNumberCloverEnabled?: boolean;
  favoriteNumber?: number | string;
  // Nostalgic Easter Eggs & Number Magic (Category 3)
  upsideDownMode?: boolean;
  hitchhiker42Enabled?: boolean;
  numberMagicBadges?: boolean;
  // Gamification & Milestones (Category 5)
  unlockedAchievements?: string[];
  achievementUnlockedAt?: Record<string, number>;
}

export type FinanceSubModule = 'mortgage' | 'compound' | 'discount' | 'retirement' | 'comparison';

export interface MortgageInputs {
  principal: number;
  annualRatePct: number;
  termYears: number;
  extraMonthly?: number;
}

export interface AmortizationScheduleRow {
  year: number;
  beginningBalance: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  payoffMonths: number;
  annualSchedule: AmortizationScheduleRow[];
  interestSavedWithExtra?: number;
  monthsSavedWithExtra?: number;
  monthlyPaymentWithExtra?: number;
}

export interface LoanComparisonItem {
  principal: number;
  annualRatePct: number;
  termYears: number;
  extraMonthly?: number;
}

export interface LoanComparisonInputs {
  loanA: LoanComparisonItem;
  loanB: LoanComparisonItem;
}

export interface LoanComparisonResult {
  loanA: MortgageResult;
  loanB: MortgageResult;
  monthlyPaymentDiff: number; // A - B
  totalInterestDiff: number;  // A - B
  totalCostDiff: number;      // A - B
  payoffMonthsDiff: number;   // A - B
  cheaperOption: 'A' | 'B' | 'Equal';
  summaryText: string;
}

export type CompoundFrequency = 'daily' | 'monthly' | 'quarterly' | 'semiannually' | 'annually';

export interface CompoundInputs {
  initialDeposit: number;
  regularAddition: number;
  additionFrequency: 'monthly' | 'annually';
  annualRatePct: number;
  compoundFrequency: CompoundFrequency;
  horizonYears: number;
}

export interface CompoundResult {
  futureValue: number;
  totalContributions: number;
  totalInterestEarned: number;
  annualBreakdown: {
    year: number;
    contributions: number;
    interestEarned: number;
    balance: number;
  }[];
}

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  annualContribution: number;
  annualReturnPct: number;
  desiredAnnualSpend: number;
}

export interface RetirementResult {
  nestEggAtRetirement: number;
  annualSustainableIncome: number;
  isFunded: boolean;
  surplusOrShortfall: number;
  yearsToRetirement: number;
  requiredNestEgg: number;
}

export interface DiscountInputs {
  originalPrice: number;
  discountPct: number;
  secondDiscountPct?: number;
  salesTaxPct?: number;
  targetCurrency?: string;
}

export interface DiscountResult {
  discountedPrice: number;
  secondDiscountAmount: number;
  totalDiscountAmount: number;
  taxAmount: number;
  netPrice: number;
  totalSavings: number;
  effectiveDiscountPct: number;
  convertedNetPrice?: number;
  targetCurrency?: string;
}
