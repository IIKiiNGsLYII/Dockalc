import React, { useState, useId, useEffect } from 'react';
import type {
  CalculatorTheme,
  CalculatorSettings,
  FinanceSubModule,
  MortgageInputs,
  CompoundInputs,
  RetirementInputs,
  DiscountInputs,
  MortgageResult,
  CompoundResult,
  RetirementResult,
  DiscountResult,
  LoanComparisonInputs,
  LoanComparisonResult,
} from '@/types/calculator';
import {
  calculateMortgage,
  calculateCompoundInterest,
  calculateRetirement,
  calculateDiscount,
  calculateLoanComparison,
  generateAmortizationCsv,
  generateCompoundGrowthCsv,
  downloadCsvFile,
} from '@/lib/financeEngine';
import {
  Home,
  TrendingUp,
  Tag,
  Palmtree,
  Scale,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  PlusCircle,
  Download,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { getCornerRadiusClasses } from '@/lib/cornerRadius';
import { toast } from 'sonner';

interface FinanceViewProps {
  theme: CalculatorTheme;
  settings: CalculatorSettings;
  onLogHistory: (expression: string, result: string, note?: string) => void;
  playClick?: (type?: 'num' | 'op' | 'fn' | 'equal' | 'clear') => void;
}

const COMMON_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

export const FinanceView: React.FC<FinanceViewProps> = ({
  theme,
  settings,
  onLogHistory,
  playClick,
}) => {
  const mortgagePrincipalId = useId();
  const mortgageRateId = useId();
  const mortgageTermId = useId();
  const mortgageExtraId = useId();
  const compoundDepositId = useId();
  const compoundAdditionId = useId();
  const compoundRateId = useId();
  const compoundHorizonId = useId();
  const retirementCurrentAgeId = useId();
  const retirementRetireAgeId = useId();
  const retirementSavingsId = useId();
  const retirementContributionId = useId();
  const retirementReturnId = useId();
  const retirementSpendId = useId();
  const discountPriceId = useId();
  const discountRateId = useId();
  const discountCouponId = useId();
  const discountTaxId = useId();

  // Toolbar Submodules: Discount & Tax moved before Retirement per user requirement
  const [activeModule, setActiveModule] = useState<FinanceSubModule>('mortgage');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAmortization, setShowAmortization] = useState(false);
  const [showCompoundBreakdown, setShowCompoundBreakdown] = useState(false);

  // Exchange rate state for Currency Discount
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 154.2,
    CAD: 1.36,
    AUD: 1.52,
    CHF: 0.91,
    CNY: 7.23,
  });

  // Mortgage Inputs
  const [mortgageInputs, setMortgageInputs] = useState<MortgageInputs>({
    principal: 350000,
    annualRatePct: 6.5,
    termYears: 30,
    extraMonthly: 0,
  });

  // Compound Interest Inputs
  const [compoundInputs, setCompoundInputs] = useState<CompoundInputs>({
    initialDeposit: 10000,
    regularAddition: 500,
    additionFrequency: 'monthly',
    annualRatePct: 7.5,
    compoundFrequency: 'monthly',
    horizonYears: 15,
  });

  // Retirement Inputs
  const [retirementInputs, setRetirementInputs] = useState<RetirementInputs>({
    currentAge: 32,
    retirementAge: 65,
    currentSavings: 45000,
    annualContribution: 12000,
    annualReturnPct: 7.0,
    desiredAnnualSpend: 60000,
  });

  // Discount Inputs
  const [discountInputs, setDiscountInputs] = useState<DiscountInputs>({
    originalPrice: 199.99,
    discountPct: 25,
    secondDiscountPct: 10,
    salesTaxPct: 8.25,
    targetCurrency: 'EUR',
  });

  // Loan Comparison Inputs
  const [comparisonInputs, setComparisonInputs] = useState<LoanComparisonInputs>({
    loanA: { principal: 400000, annualRatePct: 6.5, termYears: 30, extraMonthly: 0 },
    loanB: { principal: 400000, annualRatePct: 5.5, termYears: 15, extraMonthly: 0 },
  });

  // Fetch live exchange rates from open API on mount
  useEffect(() => {
    let isMounted = true;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && data.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch(() => {
        // Fallback to offline defaults
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const isNordic = theme.id === 'nordic-light';
  const cornerClasses = getCornerRadiusClasses(settings.cornerRadius || 'extra');

  // Format currency
  const fmtCurrency = (val: number, symbol = '$') => {
    return `${symbol}${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculations
  const mortgageResult: MortgageResult = calculateMortgage(mortgageInputs);
  const compoundResult: CompoundResult = calculateCompoundInterest(compoundInputs);
  const retirementResult: RetirementResult = calculateRetirement(retirementInputs);
  const activeRate = exchangeRates[discountInputs.targetCurrency || 'EUR'] || 1;
  const discountResult: DiscountResult = calculateDiscount(discountInputs, activeRate);
  const comparisonResult: LoanComparisonResult = calculateLoanComparison(comparisonInputs);

  const cardBgClass = isNordic
    ? 'bg-[#FFFFFF] border-[#CBD5E1] text-[#0F172A]'
    : theme.id === 'dockalc-dark'
    ? 'bg-[#18181B] border-[#27272A] text-foreground'
    : 'bg-card border-border/80 text-foreground';

  const inputClass = `w-full py-1.5 px-2.5 text-xs font-mono font-semibold rounded-lg border outline-none transition-all ${
    isNordic
      ? 'bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] focus:border-[#1D4ED8]'
      : 'bg-muted/40 text-foreground border-border/60 focus:border-primary'
  }`;

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 w-full h-full pb-1">
      {/* SUB-MODULE TABS - Category order: Loan & Mortgage, Compound Growth, Discount & Tax, Retirement, Loan Comparison */}
      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 shrink-0">
        {[
          { id: 'mortgage', label: 'Loan & Mortgage', icon: Home },
          { id: 'compound', label: 'Compound Growth', icon: TrendingUp },
          { id: 'discount', label: 'Discount & Tax', icon: Tag },
          { id: 'retirement', label: 'Retirement Nest Egg', icon: Palmtree },
          { id: 'comparison', label: 'Loan Comparison', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (playClick) playClick('fn');
                setActiveModule(tab.id as FinanceSubModule);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg sm:rounded-xl border transition-all cursor-pointer shrink-0 ${
                isActive
                  ? isNordic
                    ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs'
                    : 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : isNordic
                  ? 'bg-[#F8FAFC] text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9] font-bold'
                  : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-MODULE CONTENT CARD */}
      <div
        className={`flex-1 min-h-0 flex flex-col ${cornerClasses.card} border ${cardBgClass} p-2.5 sm:p-3 overflow-y-auto shadow-xs`}
      >
        {/* ========================================================= */}
        {/* SUB-MODULE 1: MORTGAGE & LOAN AMORTIZATION */}
        {/* ========================================================= */}
        {activeModule === 'mortgage' && (
          <div className="flex flex-col gap-2.5">
            {/* Header & Commit Action */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-border/40">
              <div className="flex items-center gap-1.5 min-w-0">
                <Home className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-xs sm:text-sm">Mortgage & Loan Amortization</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (playClick) playClick('equal');
                  const expr = `$${mortgageInputs.principal.toLocaleString()} @ ${mortgageInputs.annualRatePct}% (${mortgageInputs.termYears}yr)${
                    mortgageInputs.extraMonthly ? ` + $${mortgageInputs.extraMonthly}/mo extra` : ''
                  }`;
                  const res = `${fmtCurrency(mortgageResult.monthlyPayment)}/mo (Total Int: ${fmtCurrency(mortgageResult.totalInterest)})`;
                  onLogHistory(expr, res, 'Mortgage Calculation');
                  handleCopy(`${expr} = ${res}`, 'mortgage-log');
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer shrink-0 ml-auto sm:ml-0"
                title="Commit calculation to History"
              >
                {copiedKey === 'mortgage-log' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <PlusCircle className="w-3 h-3" />
                )}
                <span>{copiedKey === 'mortgage-log' ? 'Added!' : 'Save to History'}</span>
              </button>
            </div>

            {/* Inputs Grid - Responsive layout that cleanly wraps in split windows */}
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2">
              <div>
                <label htmlFor={mortgagePrincipalId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Principal ($)
                </label>
                <input
                  id={mortgagePrincipalId}
                  type="number"
                  min="0"
                  step="5000"
                  value={mortgageInputs.principal}
                  onChange={(e) =>
                    setMortgageInputs((prev) => ({
                      ...prev,
                      principal: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={mortgageRateId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Interest Rate (%/yr)
                </label>
                <input
                  id={mortgageRateId}
                  type="number"
                  min="0"
                  step="0.1"
                  value={mortgageInputs.annualRatePct}
                  onChange={(e) =>
                    setMortgageInputs((prev) => ({
                      ...prev,
                      annualRatePct: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              {/* Term (Years) with clean non-overlapping header chips */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor={mortgageTermId} className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
                    Term (Years)
                  </label>
                  <div className="flex items-center gap-1">
                    {[15, 30].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setMortgageInputs((prev) => ({ ...prev, termYears: yr }))}
                        className={`px-1.5 py-0.2 text-[9.5px] font-bold rounded border transition-colors cursor-pointer ${
                          mortgageInputs.termYears === yr
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground'
                        }`}
                      >
                        {yr}y
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id={mortgageTermId}
                  type="number"
                  min="1"
                  max="50"
                  value={mortgageInputs.termYears}
                  onChange={(e) =>
                    setMortgageInputs((prev) => ({
                      ...prev,
                      termYears: parseFloat(e.target.value) || 1,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              {/* Extra Monthly Payment Simulation */}
              <div>
                <label htmlFor={mortgageExtraId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Extra Monthly ($)
                </label>
                <input
                  id={mortgageExtraId}
                  type="number"
                  min="0"
                  step="50"
                  value={mortgageInputs.extraMonthly || ''}
                  placeholder="0 (Optional)"
                  onChange={(e) =>
                    setMortgageInputs((prev) => ({
                      ...prev,
                      extraMonthly: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Extra Payments Payoff Impact Banner */}
            {(mortgageInputs.extraMonthly ?? 0) > 0 && (
              <div className="p-2 rounded-lg sm:rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="text-[11px] sm:text-xs">
                    <span className="font-bold text-emerald-500">Extra Payment Impact: </span>
                    <span className="text-foreground">
                      Saves <strong>{fmtCurrency(mortgageResult.interestSavedWithExtra || 0)}</strong> in interest and pays off{' '}
                      <strong>
                        {((mortgageResult.monthsSavedWithExtra || 0) / 12).toFixed(1)} yrs ({mortgageResult.monthsSavedWithExtra} mos)
                      </strong>{' '}
                      earlier!
                    </span>
                  </div>
                </div>
                <span className="font-mono text-emerald-500 font-bold shrink-0 ml-2 text-xs">
                  {fmtCurrency(mortgageResult.monthlyPaymentWithExtra || 0)}/mo total
                </span>
              </div>
            )}

            {/* Metric Output Cards - 2x2 grid on narrow/split window widths for zero overlap */}
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2">
              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic
                  ? 'bg-[#EFF6FF] border-[#BFDBFE] shadow-2xs'
                  : 'bg-primary/10 border-primary/40 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#1D4ED8]' : 'text-primary'
                }`}>
                  Monthly Payment
                </span>
                <span className={`text-base sm:text-lg font-mono font-extrabold mt-0.5 truncate ${
                  isNordic ? 'text-[#1E40AF]' : 'text-primary'
                }`}>
                  {fmtCurrency(mortgageResult.monthlyPayment)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#475569] font-medium' : 'text-muted-foreground'
                }`}>
                  Principal & Interest
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic
                  ? 'bg-[#FFFFFF] border-[#CBD5E1] shadow-2xs'
                  : 'bg-card/80 border-border/70 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#475569]' : 'text-muted-foreground'
                }`}>
                  Total Interest
                </span>
                <span className={`text-sm sm:text-base font-mono font-bold mt-0.5 truncate ${
                  isNordic ? 'text-[#B45309]' : 'text-amber-500'
                }`}>
                  {fmtCurrency(mortgageResult.totalInterest)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  {mortgageInputs.principal > 0
                    ? `${((mortgageResult.totalInterest / mortgageInputs.principal) * 100).toFixed(1)}% of loan`
                    : ''}
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic
                  ? 'bg-[#FFFFFF] border-[#CBD5E1] shadow-2xs'
                  : 'bg-card/80 border-border/70 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#475569]' : 'text-muted-foreground'
                }`}>
                  Total Cost
                </span>
                <span className={`text-sm sm:text-base font-mono font-bold mt-0.5 truncate ${
                  isNordic ? 'text-[#0F172A]' : 'text-foreground'
                }`}>
                  {fmtCurrency(mortgageResult.totalPaid)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  Principal + Interest
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic
                  ? 'bg-[#FFFFFF] border-[#CBD5E1] shadow-2xs'
                  : 'bg-card/80 border-border/70 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#475569]' : 'text-muted-foreground'
                }`}>
                  Payoff Time
                </span>
                <span className={`text-sm sm:text-base font-mono font-bold mt-0.5 truncate ${
                  isNordic ? 'text-[#15803D]' : 'text-emerald-500'
                }`}>
                  {(mortgageResult.payoffMonths / 12).toFixed(1)} yrs
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  {mortgageResult.payoffMonths} payments
                </span>
              </div>
            </div>

            {/* Expandable Amortization Schedule with CSV Export */}
            <div className="mt-1 border border-border/50 rounded-lg sm:rounded-xl overflow-hidden">
              <div className="w-full py-1.5 px-2.5 bg-muted/30 flex flex-wrap items-center justify-between gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAmortization((v) => !v)}
                  className="flex items-center gap-1.5 text-left cursor-pointer hover:text-primary transition-colors flex-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Annual Amortization Schedule</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({mortgageResult.annualSchedule.length} years)
                  </span>
                  {showAmortization ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  )}
                </button>

                {/* Export CSV Button */}
                <button
                  type="button"
                  onClick={() => {
                    const csv = generateAmortizationCsv(mortgageResult.annualSchedule, {
                      principal: mortgageInputs.principal,
                      rate: mortgageInputs.annualRatePct,
                      termYears: mortgageInputs.termYears,
                      extraMonthly: mortgageInputs.extraMonthly,
                    });
                    downloadCsvFile(`mortgage-amortization-${mortgageInputs.termYears}yr.csv`, csv);
                    toast.success('Amortization schedule CSV downloaded!');
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer shrink-0 ml-2"
                  title="Export full amortization schedule as CSV"
                >
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>
              </div>

              {showAmortization && (
                <div className="p-2 bg-card/60">
                  <div className="w-full max-w-full overflow-x-auto">
                    <table className="w-full text-[11px] font-mono [&>div]:max-w-full">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground text-[10px] uppercase">
                          <th className="py-1 px-1.5 text-left whitespace-nowrap">Yr</th>
                          <th className="py-1 px-1.5 text-right whitespace-nowrap">Begin Bal</th>
                          <th className="py-1 px-1.5 text-right whitespace-nowrap">Principal</th>
                          <th className="py-1 px-1.5 text-right whitespace-nowrap">Interest</th>
                          <th className="py-1 px-1.5 text-right whitespace-nowrap">Ending Bal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mortgageResult.annualSchedule.map((row) => (
                          <tr
                            key={row.year}
                            className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-1 px-1.5 text-left font-bold">{row.year}</td>
                            <td className="py-1 px-1.5 text-right text-muted-foreground">
                              {fmtCurrency(row.beginningBalance)}
                            </td>
                            <td className="py-1 px-1.5 text-right text-emerald-500 font-semibold">
                              {fmtCurrency(row.principalPaid)}
                            </td>
                            <td className="py-1 px-1.5 text-right text-amber-500 font-semibold">
                              {fmtCurrency(row.interestPaid)}
                            </td>
                            <td className="py-1 px-1.5 text-right font-bold text-foreground">
                              {fmtCurrency(row.endingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODULE 2: COMPOUND INTEREST GROWTH */}
        {/* ========================================================= */}
        {activeModule === 'compound' && (
          <div className="flex flex-col gap-2.5">
            {/* Header & Commit Action */}
            <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold text-xs sm:text-sm">Compound Interest Growth</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (playClick) playClick('equal');
                  const expr = `$${compoundInputs.initialDeposit.toLocaleString()} + $${compoundInputs.regularAddition}/mo @ ${compoundInputs.annualRatePct}% (${compoundInputs.horizonYears}yr)`;
                  const res = `Future: ${fmtCurrency(compoundResult.futureValue)} (Interest: ${fmtCurrency(compoundResult.totalInterestEarned)})`;
                  onLogHistory(expr, res, 'Compound Growth');
                  handleCopy(`${expr} = ${res}`, 'compound-log');
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                title="Commit calculation to History"
              >
                {copiedKey === 'compound-log' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <PlusCircle className="w-3 h-3" />
                )}
                <span>{copiedKey === 'compound-log' ? 'Added!' : 'Save to History'}</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label htmlFor={compoundDepositId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Initial Deposit ($)
                </label>
                <input
                  id={compoundDepositId}
                  type="number"
                  min="0"
                  step="1000"
                  value={compoundInputs.initialDeposit}
                  onChange={(e) =>
                    setCompoundInputs((prev) => ({
                      ...prev,
                      initialDeposit: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={compoundAdditionId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Regular Addition ($)
                </label>
                <input
                  id={compoundAdditionId}
                  type="number"
                  min="0"
                  step="50"
                  value={compoundInputs.regularAddition}
                  onChange={(e) =>
                    setCompoundInputs((prev) => ({
                      ...prev,
                      regularAddition: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={compoundRateId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Annual Return (%/yr)
                </label>
                <input
                  id={compoundRateId}
                  type="number"
                  min="0"
                  step="0.5"
                  value={compoundInputs.annualRatePct}
                  onChange={(e) =>
                    setCompoundInputs((prev) => ({
                      ...prev,
                      annualRatePct: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={compoundHorizonId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Horizon (Years)
                </label>
                <input
                  id={compoundHorizonId}
                  type="number"
                  min="1"
                  max="60"
                  value={compoundInputs.horizonYears}
                  onChange={(e) =>
                    setCompoundInputs((prev) => ({
                      ...prev,
                      horizonYears: parseFloat(e.target.value) || 1,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Quick frequency controls */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground font-semibold">Compounding:</span>
                {(['monthly', 'quarterly', 'annually'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setCompoundInputs((prev) => ({ ...prev, compoundFrequency: freq }))}
                    className={`px-2 py-0.5 rounded border capitalize transition-colors cursor-pointer ${
                      compoundInputs.compoundFrequency === freq
                        ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                        : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setCompoundInputs((prev) => ({
                      ...prev,
                      additionFrequency: prev.additionFrequency === 'monthly' ? 'annually' : 'monthly',
                    }))
                  }
                  className="px-2 py-0.5 rounded border border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Schedule: {compoundInputs.additionFrequency === 'monthly' ? 'Monthly Addition' : 'Annual Addition'}
                </button>
              </div>
            </div>

            {/* Metric Output Cards - High-contrast light theme & responsive split */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic ? 'bg-[#F0FDF4] border-[#BBF7D0] shadow-2xs' : 'border-emerald-500/40 bg-emerald-500/10 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#15803D]' : 'text-emerald-500'
                }`}>
                  Future Portfolio Value
                </span>
                <span className={`text-base sm:text-lg font-mono font-extrabold mt-0.5 truncate ${
                  isNordic ? 'text-[#166534]' : 'text-emerald-500'
                }`}>
                  {fmtCurrency(compoundResult.futureValue)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  In {compoundInputs.horizonYears} years
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic ? 'bg-[#FFFFFF] border-[#CBD5E1] shadow-2xs' : 'border-border/60 bg-muted/20 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#334155]' : 'text-muted-foreground'
                }`}>
                  Total Contributions
                </span>
                <span className={`text-sm sm:text-base font-mono font-bold mt-0.5 truncate ${
                  isNordic ? 'text-[#0F172A]' : 'text-foreground'
                }`}>
                  {fmtCurrency(compoundResult.totalContributions)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  Principal invested
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic ? 'bg-[#FFFFFF] border-[#CBD5E1] shadow-2xs' : 'border-border/60 bg-muted/20 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#334155]' : 'text-muted-foreground'
                }`}>
                  Total Interest Earned
                </span>
                <span className={`text-sm sm:text-base font-mono font-bold mt-0.5 truncate ${
                  isNordic ? 'text-[#B45309]' : 'text-amber-500'
                }`}>
                  {fmtCurrency(compoundResult.totalInterestEarned)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  {compoundResult.totalContributions > 0
                    ? `+${((compoundResult.totalInterestEarned / compoundResult.totalContributions) * 100).toFixed(1)}% growth`
                    : ''}
                </span>
              </div>
            </div>

            {/* Expandable Annual Breakdown with CSV Export */}
            <div className="mt-1 border border-border/50 rounded-lg sm:rounded-xl overflow-hidden">
              <div className="w-full py-1.5 px-2.5 bg-muted/30 flex items-center justify-between text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowCompoundBreakdown((v) => !v)}
                  className="flex items-center gap-1.5 text-left cursor-pointer hover:text-emerald-500 transition-colors flex-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Annual Growth Progression</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({compoundResult.annualBreakdown.length} checkpoints)
                  </span>
                  {showCompoundBreakdown ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  )}
                </button>

                {/* Export CSV Button */}
                <button
                  type="button"
                  onClick={() => {
                    const csv = generateCompoundGrowthCsv(compoundResult.annualBreakdown, {
                      initial: compoundInputs.initialDeposit,
                      regular: compoundInputs.regularAddition,
                      rate: compoundInputs.annualRatePct,
                      years: compoundInputs.horizonYears,
                    });
                    downloadCsvFile(`compound-growth-${compoundInputs.horizonYears}yr.csv`, csv);
                    toast.success('Compound growth progression CSV downloaded!');
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors cursor-pointer shrink-0 ml-2"
                  title="Export growth progression as CSV"
                >
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>
              </div>

              {showCompoundBreakdown && (
                <div className="p-2 bg-card/60">
                  <div className="w-full max-w-full overflow-x-auto">
                    <table className="w-full text-[11px] font-mono [&>div]:max-w-full">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground text-[10px] uppercase">
                          <th className="py-1 px-1.5 text-left whitespace-nowrap">Yr</th>
                          <th className="py-1 px-1.5 text-right whitespace-nowrap">Total Contrib</th>
                          <th className="py-1 px-1.5 text-right whitespace-nowrap">Annual Int</th>
                          <th className="py-1 px-1.5 text-right whitespace-nowrap">Ending Bal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compoundResult.annualBreakdown.map((row) => (
                          <tr
                            key={row.year}
                            className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-1 px-1.5 text-left font-bold">{row.year}</td>
                            <td className="py-1 px-1.5 text-right text-muted-foreground">
                              {fmtCurrency(row.contributions)}
                            </td>
                            <td className="py-1 px-1.5 text-right text-amber-500 font-semibold">
                              +{fmtCurrency(row.interestEarned)}
                            </td>
                            <td className="py-1 px-1.5 text-right font-bold text-emerald-500">
                              {fmtCurrency(row.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODULE 3: CURRENCY DISCOUNT & TAX RATES */}
        {/* ========================================================= */}
        {activeModule === 'discount' && (
          <div className="flex flex-col gap-2.5">
            {/* Header & Commit Action */}
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border/40 w-full min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 shrink">
                <Tag className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="font-bold text-xs sm:text-sm whitespace-nowrap">Currency Discount & Tax Rates</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (playClick) playClick('equal');
                  const expr = `$${discountInputs.originalPrice} - ${discountInputs.discountPct}% ${
                    discountInputs.secondDiscountPct ? `- ${discountInputs.secondDiscountPct}%` : ''
                  } + ${discountInputs.salesTaxPct}% tax`;
                  const res = `Net: ${fmtCurrency(discountResult.netPrice)} (Saved: ${fmtCurrency(discountResult.totalSavings)}) ${
                    discountResult.convertedNetPrice
                      ? `[${discountResult.targetCurrency} ${discountResult.convertedNetPrice.toFixed(2)}]`
                      : ''
                  }`;
                  onLogHistory(expr, res, 'Commercial Discount');
                  handleCopy(`${expr} = ${res}`, 'discount-log');
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border border-purple-500/40 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Commit calculation to History"
              >
                {copiedKey === 'discount-log' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <PlusCircle className="w-3 h-3" />
                )}
                <span>{copiedKey === 'discount-log' ? 'Added!' : 'Save to History'}</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div>
                <label htmlFor={discountPriceId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Original Price ($)
                </label>
                <input
                  id={discountPriceId}
                  type="number"
                  min="0"
                  step="5"
                  value={discountInputs.originalPrice}
                  onChange={(e) =>
                    setDiscountInputs((prev) => ({
                      ...prev,
                      originalPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={discountRateId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Discount (%)
                </label>
                <input
                  id={discountRateId}
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={discountInputs.discountPct}
                  onChange={(e) =>
                    setDiscountInputs((prev) => ({
                      ...prev,
                      discountPct: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={discountCouponId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  2nd Coupon (%)
                </label>
                <input
                  id={discountCouponId}
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={discountInputs.secondDiscountPct || 0}
                  onChange={(e) =>
                    setDiscountInputs((prev) => ({
                      ...prev,
                      secondDiscountPct: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={discountTaxId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Sales Tax (%)
                </label>
                <input
                  id={discountTaxId}
                  type="number"
                  min="0"
                  step="0.25"
                  value={discountInputs.salesTaxPct || 0}
                  onChange={(e) =>
                    setDiscountInputs((prev) => ({
                      ...prev,
                      salesTaxPct: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Target FX Currency
                </label>
                <select
                  value={discountInputs.targetCurrency}
                  onChange={(e) =>
                    setDiscountInputs((prev) => ({
                      ...prev,
                      targetCurrency: e.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  {COMMON_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick preset discount pills with high contrast */}
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px]">
              <span className={`font-semibold ${isNordic ? 'text-[#1E293B]' : 'text-muted-foreground'}`}>Quick Deals:</span>
              {[10, 15, 20, 25, 30, 40, 50, 70].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountInputs((prev) => ({ ...prev, discountPct: pct }))}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    discountInputs.discountPct === pct
                      ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-xs'
                      : isNordic
                      ? 'bg-[#FFFFFF] text-[#0F172A] border-[#CBD5E1] hover:bg-[#F1F5F9] font-bold shadow-2xs'
                      : 'bg-muted/50 text-foreground border-border hover:bg-muted/80 font-semibold'
                  }`}
                >
                  {pct}% OFF
                </button>
              ))}
            </div>

            {/* Metric Output Cards - High-contrast light theme & responsive split */}
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2">
              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic
                  ? 'bg-[#FAF5FF] border-[#E9D5FF] text-[#7E22CE] shadow-2xs'
                  : 'border-purple-500/40 bg-purple-500/10 text-purple-500 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#7E22CE]' : 'text-purple-400'
                }`}>
                  Final Net Price
                </span>
                <span className={`text-base sm:text-lg font-mono font-extrabold mt-0.5 truncate ${
                  isNordic ? 'text-[#6B21A8]' : 'text-purple-400'
                }`}>
                  {fmtCurrency(discountResult.netPrice)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  With {discountInputs.salesTaxPct}% tax
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D] shadow-2xs'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#15803D]' : 'text-emerald-400'
                }`}>
                  Total Saved
                </span>
                <span className={`text-base sm:text-lg font-mono font-extrabold mt-0.5 truncate ${
                  isNordic ? 'text-[#166534]' : 'text-emerald-400'
                }`}>
                  {fmtCurrency(discountResult.totalSavings)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  {discountResult.effectiveDiscountPct}% effective cut
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic
                  ? 'bg-[#FFFFFF] border-[#CBD5E1] shadow-2xs'
                  : 'border-border/60 bg-muted/20 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#334155]' : 'text-muted-foreground'
                }`}>
                  Tax Amount
                </span>
                <span className={`text-sm sm:text-base font-mono font-bold mt-0.5 truncate ${
                  isNordic ? 'text-[#0F172A]' : 'text-foreground'
                }`}>
                  +{fmtCurrency(discountResult.taxAmount)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  On {fmtCurrency(discountResult.discountedPrice)}
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic
                  ? 'bg-[#F8FAFC] border-[#CBD5E1] shadow-2xs'
                  : 'border-border/60 bg-muted/20 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#0369A1]' : 'text-cyan-400'
                }`}>
                  Converted FX
                </span>
                <span className={`text-sm sm:text-base font-mono font-bold mt-0.5 truncate ${
                  isNordic ? 'text-[#0284C7]' : 'text-cyan-400'
                }`}>
                  {discountResult.convertedNetPrice
                    ? `${discountResult.targetCurrency} ${discountResult.convertedNetPrice.toFixed(2)}`
                    : 'N/A'}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  Rate: 1 USD = {activeRate.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODULE 4: RETIREMENT NEST EGG (4% RULE) */}
        {/* ========================================================= */}
        {activeModule === 'retirement' && (
          <div className="flex flex-col gap-2.5">
            {/* Header & Commit Action */}
            <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <Palmtree className="w-4 h-4 text-cyan-500 shrink-0" />
                <span className="font-bold text-xs sm:text-sm">Retirement Nest Egg (4% Rule)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (playClick) playClick('equal');
                  const expr = `Age ${retirementInputs.currentAge} to ${retirementInputs.retirementAge} ($${retirementInputs.annualContribution}/yr @ ${retirementInputs.annualReturnPct}%)`;
                  const res = `Nest Egg: ${fmtCurrency(retirementResult.nestEggAtRetirement)} (Safe Spend: ${fmtCurrency(retirementResult.annualSustainableIncome)}/yr)`;
                  onLogHistory(expr, res, 'Retirement Plan');
                  handleCopy(`${expr} = ${res}`, 'retirement-log');
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border border-cyan-500/40 bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors cursor-pointer"
                title="Commit calculation to History"
              >
                {copiedKey === 'retirement-log' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <PlusCircle className="w-3 h-3" />
                )}
                <span>{copiedKey === 'retirement-log' ? 'Added!' : 'Save to History'}</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label htmlFor={retirementCurrentAgeId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Current Age
                </label>
                <input
                  id={retirementCurrentAgeId}
                  type="number"
                  min="18"
                  max="100"
                  value={retirementInputs.currentAge}
                  onChange={(e) =>
                    setRetirementInputs((prev) => ({
                      ...prev,
                      currentAge: parseInt(e.target.value, 10) || 18,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={retirementRetireAgeId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Retirement Age
                </label>
                <input
                  id={retirementRetireAgeId}
                  type="number"
                  min="19"
                  max="100"
                  value={retirementInputs.retirementAge}
                  onChange={(e) =>
                    setRetirementInputs((prev) => ({
                      ...prev,
                      retirementAge: parseInt(e.target.value, 10) || 65,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={retirementSavingsId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Current Savings ($)
                </label>
                <input
                  id={retirementSavingsId}
                  type="number"
                  min="0"
                  step="5000"
                  value={retirementInputs.currentSavings}
                  onChange={(e) =>
                    setRetirementInputs((prev) => ({
                      ...prev,
                      currentSavings: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={retirementContributionId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Annual Contribution ($/yr)
                </label>
                <input
                  id={retirementContributionId}
                  type="number"
                  min="0"
                  step="1000"
                  value={retirementInputs.annualContribution}
                  onChange={(e) =>
                    setRetirementInputs((prev) => ({
                      ...prev,
                      annualContribution: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={retirementReturnId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Expected Return (%/yr)
                </label>
                <input
                  id={retirementReturnId}
                  type="number"
                  min="0"
                  step="0.5"
                  value={retirementInputs.annualReturnPct}
                  onChange={(e) =>
                    setRetirementInputs((prev) => ({
                      ...prev,
                      annualReturnPct: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={retirementSpendId} className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-1">
                  Target Spend ($/yr)
                </label>
                <input
                  id={retirementSpendId}
                  type="number"
                  min="0"
                  step="5000"
                  value={retirementInputs.desiredAnnualSpend}
                  onChange={(e) =>
                    setRetirementInputs((prev) => ({
                      ...prev,
                      desiredAnnualSpend: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* Feasibility Status Banner */}
            <div
              className={`p-2 rounded-lg sm:rounded-xl border flex items-center justify-between gap-2 ${
                retirementResult.isFunded
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-500'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {retirementResult.isFunded ? (
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                )}
                <div className="text-[11px] sm:text-xs">
                  <span className="font-bold">
                    {retirementResult.isFunded ? 'Goal Achievable! ' : 'Capital Shortfall: '}
                  </span>
                  <span>
                    {retirementResult.isFunded
                      ? `Surplus: ${fmtCurrency(retirementResult.surplusOrShortfall)} over required nest egg`
                      : `Needs ${fmtCurrency(Math.abs(retirementResult.surplusOrShortfall))} more to reach target`}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background/50 border border-current/20 shrink-0">
                {retirementResult.yearsToRetirement} yrs left
              </span>
            </div>

            {/* Metric Output Cards - High-contrast light theme & responsive split */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic ? 'bg-[#ECFEFF] border-[#A5F3FC] shadow-2xs' : 'border-cyan-500/40 bg-cyan-500/10 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#0E7490]' : 'text-cyan-500'
                }`}>
                  Projected Nest Egg
                </span>
                <span className={`text-base sm:text-lg font-mono font-extrabold mt-0.5 truncate ${
                  isNordic ? 'text-[#155E75]' : 'text-cyan-500'
                }`}>
                  {fmtCurrency(retirementResult.nestEggAtRetirement)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  At age {retirementInputs.retirementAge}
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic ? 'bg-[#FFFFFF] border-[#CBD5E1] shadow-2xs' : 'border-border/60 bg-muted/20 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#334155]' : 'text-muted-foreground'
                }`}>
                  Safe Annual Spend (4%)
                </span>
                <span className={`text-sm sm:text-base font-mono font-bold mt-0.5 truncate ${
                  isNordic ? 'text-[#0F172A]' : 'text-foreground'
                }`}>
                  {fmtCurrency(retirementResult.annualSustainableIncome)}/yr
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  {fmtCurrency(retirementResult.annualSustainableIncome / 12)}/month
                </span>
              </div>

              <div className={`p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between ${
                isNordic ? 'bg-[#FFFFFF] border-[#CBD5E1] shadow-2xs' : 'border-border/60 bg-muted/20 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isNordic ? 'text-[#334155]' : 'text-muted-foreground'
                }`}>
                  Required Nest Egg
                </span>
                <span className={`text-sm sm:text-base font-mono font-bold mt-0.5 truncate ${
                  isNordic ? 'text-[#0F172A]' : 'text-foreground'
                }`}>
                  {fmtCurrency(retirementResult.requiredNestEgg)}
                </span>
                <span className={`text-[9px] font-mono ${
                  isNordic ? 'text-[#64748B]' : 'text-muted-foreground'
                }`}>
                  For {fmtCurrency(retirementInputs.desiredAnnualSpend)}/yr goal
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODULE 5: LOAN COMPARISON (Option A vs Option B) */}
        {/* ========================================================= */}
        {activeModule === 'comparison' && (
          <div className="flex flex-col gap-2.5">
            {/* Header & Commit Action */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-border/40">
              <div className="flex items-center gap-1.5 min-w-0">
                <Scale className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-xs sm:text-sm">Side-by-Side Loan Comparison</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                <button
                  type="button"
                  onClick={() => {
                    const csvLines = [
                      'Dockalc - Loan Comparison Report',
                      '',
                      'Metric,Option A,Option B,Difference (A - B)',
                      `Principal,$${comparisonInputs.loanA.principal},$${comparisonInputs.loanB.principal},$${(comparisonInputs.loanA.principal - comparisonInputs.loanB.principal).toFixed(2)}`,
                      `Interest Rate,${comparisonInputs.loanA.annualRatePct}%,${comparisonInputs.loanB.annualRatePct}%,${(comparisonInputs.loanA.annualRatePct - comparisonInputs.loanB.annualRatePct).toFixed(2)}%`,
                      `Term Length,${comparisonInputs.loanA.termYears} years,${comparisonInputs.loanB.termYears} years,${comparisonInputs.loanA.termYears - comparisonInputs.loanB.termYears} years`,
                      `Monthly Payment,$${comparisonResult.loanA.monthlyPayment.toFixed(2)},$${comparisonResult.loanB.monthlyPayment.toFixed(2)},$${comparisonResult.monthlyPaymentDiff.toFixed(2)}`,
                      `Total Interest,$${comparisonResult.loanA.totalInterest.toFixed(2)},$${comparisonResult.loanB.totalInterest.toFixed(2)},$${comparisonResult.totalInterestDiff.toFixed(2)}`,
                      `Total Loan Cost,$${comparisonResult.loanA.totalPaid.toFixed(2)},$${comparisonResult.loanB.totalPaid.toFixed(2)},$${comparisonResult.totalCostDiff.toFixed(2)}`,
                      `Payoff Time,${(comparisonResult.loanA.payoffMonths / 12).toFixed(1)} yrs,${(comparisonResult.loanB.payoffMonths / 12).toFixed(1)} yrs,${(comparisonResult.payoffMonthsDiff / 12).toFixed(1)} yrs`,
                      '',
                      `Summary: ${comparisonResult.summaryText}`,
                    ].join('\n');
                    downloadCsvFile('loan-comparison-report.csv', csvLines);
                    toast.success('Loan comparison CSV report downloaded!');
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded border border-border/60 bg-muted/40 text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                  title="Export comparison report as CSV"
                >
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (playClick) playClick('equal');
                    const expr = `Compare Loan A ($${comparisonInputs.loanA.principal.toLocaleString()}, ${comparisonInputs.loanA.annualRatePct}%, ${comparisonInputs.loanA.termYears}yr) vs Loan B ($${comparisonInputs.loanB.principal.toLocaleString()}, ${comparisonInputs.loanB.annualRatePct}%, ${comparisonInputs.loanB.termYears}yr)`;
                    const res = comparisonResult.summaryText;
                    onLogHistory(expr, res, 'Loan Comparison');
                    handleCopy(`${expr} => ${res}`, 'compare-log');
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  title="Commit comparison to History"
                >
                  {copiedKey === 'compare-log' ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <PlusCircle className="w-3 h-3" />
                  )}
                  <span>{copiedKey === 'compare-log' ? 'Added!' : 'Save to History'}</span>
                </button>
              </div>
            </div>

            {/* Comparison Highlights Banner */}
            <div
              className={`p-2.5 rounded-lg sm:rounded-xl border flex items-center justify-between gap-2 ${
                comparisonResult.cheaperOption === 'Equal'
                  ? 'bg-muted/30 border-border/60 text-foreground'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
                <div className="text-xs">
                  <span className="font-bold">Recommendation: </span>
                  <span className="text-foreground">{comparisonResult.summaryText}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background/50 border border-current/20 font-bold shrink-0">
                {comparisonResult.cheaperOption !== 'Equal' ? `Option ${comparisonResult.cheaperOption} Preferred` : 'Equivalent'}
              </span>
            </div>

            {/* Side-by-Side Loan Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A Box */}
              <div className="p-2.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-primary/20">
                  <span className="font-bold text-xs text-primary">Loan Option A</span>
                  <span className="text-[10px] font-mono text-muted-foreground">Primary Terms</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">
                      Principal ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={comparisonInputs.loanA.principal}
                      onChange={(e) =>
                        setComparisonInputs((prev) => ({
                          ...prev,
                          loanA: { ...prev.loanA, principal: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={comparisonInputs.loanA.annualRatePct}
                      onChange={(e) =>
                        setComparisonInputs((prev) => ({
                          ...prev,
                          loanA: { ...prev.loanA, annualRatePct: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-semibold text-muted-foreground">
                        Term (Years)
                      </label>
                      <div className="flex items-center gap-1">
                        {[15, 30].map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() =>
                              setComparisonInputs((prev) => ({
                                ...prev,
                                loanA: { ...prev.loanA, termYears: yr },
                              }))
                            }
                            className={`px-1 text-[9px] font-bold rounded border ${
                              comparisonInputs.loanA.termYears === yr
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {yr}y
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={comparisonInputs.loanA.termYears}
                      onChange={(e) =>
                        setComparisonInputs((prev) => ({
                          ...prev,
                          loanA: { ...prev.loanA, termYears: parseFloat(e.target.value) || 1 },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">
                      Extra Monthly ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={comparisonInputs.loanA.extraMonthly || ''}
                      placeholder="0"
                      onChange={(e) =>
                        setComparisonInputs((prev) => ({
                          ...prev,
                          loanA: { ...prev.loanA, extraMonthly: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Option A Summary Pills */}
                <div className="pt-1 border-t border-primary/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Monthly:</span>
                  <span className="font-mono font-bold text-primary">{fmtCurrency(comparisonResult.loanA.monthlyPayment)}/mo</span>
                </div>
              </div>

              {/* Option B Box */}
              <div className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
                  <span className="font-bold text-xs text-cyan-500">Loan Option B</span>
                  <span className="text-[10px] font-mono text-muted-foreground">Alternative Terms</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">
                      Principal ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={comparisonInputs.loanB.principal}
                      onChange={(e) =>
                        setComparisonInputs((prev) => ({
                          ...prev,
                          loanB: { ...prev.loanB, principal: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={comparisonInputs.loanB.annualRatePct}
                      onChange={(e) =>
                        setComparisonInputs((prev) => ({
                          ...prev,
                          loanB: { ...prev.loanB, annualRatePct: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-semibold text-muted-foreground">
                        Term (Years)
                      </label>
                      <div className="flex items-center gap-1">
                        {[15, 30].map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() =>
                              setComparisonInputs((prev) => ({
                                ...prev,
                                loanB: { ...prev.loanB, termYears: yr },
                              }))
                            }
                            className={`px-1 text-[9px] font-bold rounded border ${
                              comparisonInputs.loanB.termYears === yr
                                ? 'bg-cyan-500 text-white border-cyan-500'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {yr}y
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={comparisonInputs.loanB.termYears}
                      onChange={(e) =>
                        setComparisonInputs((prev) => ({
                          ...prev,
                          loanB: { ...prev.loanB, termYears: parseFloat(e.target.value) || 1 },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-0.5">
                      Extra Monthly ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={comparisonInputs.loanB.extraMonthly || ''}
                      placeholder="0"
                      onChange={(e) =>
                        setComparisonInputs((prev) => ({
                          ...prev,
                          loanB: { ...prev.loanB, extraMonthly: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Option B Summary Pills */}
                <div className="pt-1 border-t border-cyan-500/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Monthly:</span>
                  <span className="font-mono font-bold text-cyan-500">{fmtCurrency(comparisonResult.loanB.monthlyPayment)}/mo</span>
                </div>
              </div>
            </div>

            {/* Comparison Metrics Breakdown Table */}
            <div className="border border-border/50 rounded-lg sm:rounded-xl overflow-hidden bg-card/60 p-2">
              <div className="w-full max-w-full overflow-x-auto">
                <table className="w-full text-[11px] font-mono [&>div]:max-w-full">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground text-[10px] uppercase">
                      <th className="py-1 px-1.5 text-left whitespace-nowrap">Comparison Metric</th>
                      <th className="py-1 px-1.5 text-right whitespace-nowrap text-primary">Option A</th>
                      <th className="py-1 px-1.5 text-right whitespace-nowrap text-cyan-500">Option B</th>
                      <th className="py-1 px-1.5 text-right whitespace-nowrap">Difference (A - B)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-1 px-1.5 text-left font-semibold text-foreground">Monthly Payment</td>
                      <td className="py-1 px-1.5 text-right text-primary font-bold">{fmtCurrency(comparisonResult.loanA.monthlyPayment)}</td>
                      <td className="py-1 px-1.5 text-right text-cyan-500 font-bold">{fmtCurrency(comparisonResult.loanB.monthlyPayment)}</td>
                      <td className={`py-1 px-1.5 text-right font-bold ${comparisonResult.monthlyPaymentDiff > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {comparisonResult.monthlyPaymentDiff > 0 ? '+' : ''}{fmtCurrency(comparisonResult.monthlyPaymentDiff)}/mo
                      </td>
                    </tr>
                    <tr className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-1 px-1.5 text-left font-semibold text-foreground">Total Interest Paid</td>
                      <td className="py-1 px-1.5 text-right text-foreground">{fmtCurrency(comparisonResult.loanA.totalInterest)}</td>
                      <td className="py-1 px-1.5 text-right text-foreground">{fmtCurrency(comparisonResult.loanB.totalInterest)}</td>
                      <td className={`py-1 px-1.5 text-right font-bold ${comparisonResult.totalInterestDiff > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                        {comparisonResult.totalInterestDiff > 0 ? '+' : ''}{fmtCurrency(comparisonResult.totalInterestDiff)}
                      </td>
                    </tr>
                    <tr className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-1 px-1.5 text-left font-semibold text-foreground">Total Loan Cost</td>
                      <td className="py-1 px-1.5 text-right font-bold text-foreground">{fmtCurrency(comparisonResult.loanA.totalPaid)}</td>
                      <td className="py-1 px-1.5 text-right font-bold text-foreground">{fmtCurrency(comparisonResult.loanB.totalPaid)}</td>
                      <td className={`py-1 px-1.5 text-right font-bold ${comparisonResult.totalCostDiff > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                        {comparisonResult.totalCostDiff > 0 ? '+' : ''}{fmtCurrency(comparisonResult.totalCostDiff)}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-1 px-1.5 text-left font-semibold text-foreground">Payoff Timeline</td>
                      <td className="py-1 px-1.5 text-right text-muted-foreground">{(comparisonResult.loanA.payoffMonths / 12).toFixed(1)} yrs</td>
                      <td className="py-1 px-1.5 text-right text-muted-foreground">{(comparisonResult.loanB.payoffMonths / 12).toFixed(1)} yrs</td>
                      <td className="py-1 px-1.5 text-right text-muted-foreground font-semibold">
                        {(comparisonResult.payoffMonthsDiff / 12).toFixed(1)} yrs
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
