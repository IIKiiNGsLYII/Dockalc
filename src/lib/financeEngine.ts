import type {
  MortgageInputs,
  MortgageResult,
  CompoundInputs,
  CompoundResult,
  RetirementInputs,
  RetirementResult,
  DiscountInputs,
  DiscountResult,
  LoanComparisonInputs,
  LoanComparisonResult,
  AmortizationScheduleRow,
} from '@/types/calculator';

/**
 * Calculate fixed-rate mortgage or loan amortization with extra payments payoff simulation
 */
export function calculateMortgage(inputs: MortgageInputs): MortgageResult {
  const principal = Math.max(0, inputs.principal || 0);
  const annualRate = Math.max(0, inputs.annualRatePct || 0);
  const termYears = Math.max(0.1, inputs.termYears || 30);
  const extraMonthly = Math.max(0, inputs.extraMonthly || 0);

  const monthlyRate = annualRate > 0 ? annualRate / 100 / 12 : 0;
  const totalMonths = Math.round(termYears * 12);

  // Standard regular monthly payment (without extra)
  let standardMonthlyPayment = 0;
  if (monthlyRate === 0) {
    standardMonthlyPayment = totalMonths > 0 ? principal / totalMonths : 0;
  } else {
    standardMonthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  // Baseline total interest without extra payments
  const baselineTotalInterest = Math.max(0, standardMonthlyPayment * totalMonths - principal);

  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let actualMonths = 0;

  const annualSchedule: AmortizationScheduleRow[] = [];
  let currentYear = 1;
  let yearStartBalance = balance;
  let yearPrincipal = 0;
  let yearInterest = 0;

  while (balance > 0.005 && actualMonths < totalMonths * 2) {
    actualMonths++;
    const interest = balance * monthlyRate;
    let payment = standardMonthlyPayment + extraMonthly;

    if (balance + interest < payment) {
      payment = balance + interest;
    }

    const principalPaid = payment - interest;
    balance = Math.max(0, balance - principalPaid);

    totalInterest += interest;
    totalPaid += payment;

    yearPrincipal += principalPaid;
    yearInterest += interest;

    if (actualMonths % 12 === 0 || balance === 0) {
      annualSchedule.push({
        year: currentYear,
        beginningBalance: Math.round(yearStartBalance * 100) / 100,
        principalPaid: Math.round(yearPrincipal * 100) / 100,
        interestPaid: Math.round(yearInterest * 100) / 100,
        endingBalance: Math.round(balance * 100) / 100,
      });
      currentYear++;
      yearStartBalance = balance;
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  const interestSavedWithExtra = extraMonthly > 0 ? Math.max(0, baselineTotalInterest - totalInterest) : 0;
  const monthsSavedWithExtra = extraMonthly > 0 ? Math.max(0, totalMonths - actualMonths) : 0;

  return {
    monthlyPayment: Math.round(standardMonthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    payoffMonths: actualMonths,
    annualSchedule,
    interestSavedWithExtra: Math.round(interestSavedWithExtra * 100) / 100,
    monthsSavedWithExtra,
    monthlyPaymentWithExtra: Math.round((standardMonthlyPayment + extraMonthly) * 100) / 100,
  };
}

/**
 * Compare two mortgage / loan options side-by-side
 */
export function calculateLoanComparison(inputs: LoanComparisonInputs): LoanComparisonResult {
  const loanA = calculateMortgage(inputs.loanA);
  const loanB = calculateMortgage(inputs.loanB);

  const monthlyPaymentDiff = loanA.monthlyPayment - loanB.monthlyPayment;
  const totalInterestDiff = loanA.totalInterest - loanB.totalInterest;
  const totalCostDiff = loanA.totalPaid - loanB.totalPaid;
  const payoffMonthsDiff = loanA.payoffMonths - loanB.payoffMonths;

  let cheaperOption: 'A' | 'B' | 'Equal' = 'Equal';
  if (totalCostDiff < -5) cheaperOption = 'A';
  else if (totalCostDiff > 5) cheaperOption = 'B';

  let summaryText = '';
  if (cheaperOption === 'A') {
    const savings = Math.abs(totalCostDiff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    summaryText = `Option A saves $${savings} in total cost over the life of the loan.`;
  } else if (cheaperOption === 'B') {
    const savings = Math.abs(totalCostDiff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    summaryText = `Option B saves $${savings} in total cost over the life of the loan.`;
  } else {
    summaryText = 'Both loan options have practically identical total loan costs.';
  }

  return {
    loanA,
    loanB,
    monthlyPaymentDiff: Math.round(monthlyPaymentDiff * 100) / 100,
    totalInterestDiff: Math.round(totalInterestDiff * 100) / 100,
    totalCostDiff: Math.round(totalCostDiff * 100) / 100,
    payoffMonthsDiff,
    cheaperOption,
    summaryText,
  };
}

/**
 * Trigger CSV file download in the browser
 */
export function downloadCsvFile(filename: string, csvContent: string): void {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to trigger CSV download:', err);
  }
}

/**
 * Generate CSV string from Amortization Schedule
 */
export function generateAmortizationCsv(
  schedule: AmortizationScheduleRow[],
  loanSummary?: { principal: number; rate: number; termYears: number; extraMonthly?: number }
): string {
  const lines: string[] = [];
  lines.push('Dockalc - Loan Amortization Schedule');
  if (loanSummary) {
    lines.push(`Principal: $${loanSummary.principal}`);
    lines.push(`Annual Interest Rate: ${loanSummary.rate}%`);
    lines.push(`Term: ${loanSummary.termYears} years`);
    if (loanSummary.extraMonthly) {
      lines.push(`Extra Monthly Payment: $${loanSummary.extraMonthly}`);
    }
  }
  lines.push('');
  lines.push('Year,Beginning Balance ($),Principal Paid ($),Interest Paid ($),Ending Balance ($)');

  schedule.forEach((row) => {
    lines.push(
      `${row.year},${row.beginningBalance.toFixed(2)},${row.principalPaid.toFixed(2)},${row.interestPaid.toFixed(2)},${row.endingBalance.toFixed(2)}`
    );
  });

  return lines.join('\n');
}

/**
 * Generate CSV string from Compound Interest Annual Progression
 */
export function generateCompoundGrowthCsv(
  annualBreakdown: CompoundResult['annualBreakdown'],
  summary?: { initial: number; regular: number; rate: number; years: number }
): string {
  const lines: string[] = [];
  lines.push('Dockalc - Compound Interest Growth Progression');
  if (summary) {
    lines.push(`Initial Deposit: $${summary.initial}`);
    lines.push(`Regular Additions: $${summary.regular}`);
    lines.push(`Annual Return Rate: ${summary.rate}%`);
    lines.push(`Investment Horizon: ${summary.years} years`);
  }
  lines.push('');
  lines.push('Year,Total Contributions ($),Annual Interest Earned ($),Ending Balance ($)');

  annualBreakdown.forEach((row) => {
    lines.push(
      `${row.year},${row.contributions.toFixed(2)},${row.interestEarned.toFixed(2)},${row.balance.toFixed(2)}`
    );
  });

  return lines.join('\n');
}

/**
 * Calculate compound interest growth with periodic contributions
 */
export function calculateCompoundInterest(inputs: CompoundInputs): CompoundResult {
  const principal = Math.max(0, inputs.initialDeposit || 0);
  const regularAddition = Math.max(0, inputs.regularAddition || 0);
  const annualRate = (inputs.annualRatePct || 0) / 100;
  const horizonYears = Math.max(1, Math.round(inputs.horizonYears || 10));

  const periodsPerYearMap: Record<CompoundInputs['compoundFrequency'], number> = {
    daily: 365,
    monthly: 12,
    quarterly: 4,
    semiannually: 2,
    annually: 1,
  };

  const compPerYear = periodsPerYearMap[inputs.compoundFrequency] || 12;
  const isMonthlyAddition = inputs.additionFrequency !== 'annually';

  let currentBalance = principal;
  let totalContributions = principal;
  const annualBreakdown: CompoundResult['annualBreakdown'] = [];

  for (let year = 1; year <= horizonYears; year++) {
    let yearContributions = 0;
    const yearStartBalance = currentBalance;

    // Simulate 12 monthly cycles per year
    for (let month = 1; month <= 12; month++) {
      if (isMonthlyAddition) {
        currentBalance += regularAddition;
        yearContributions += regularAddition;
      }

      // Apply periodic compounding rate for this month
      // Rate per month = (1 + annualRate / compPerYear)^(compPerYear / 12) - 1
      const monthlyEffectiveRate = Math.pow(1 + annualRate / compPerYear, compPerYear / 12) - 1;
      currentBalance += currentBalance * monthlyEffectiveRate;
    }

    if (!isMonthlyAddition) {
      currentBalance += regularAddition;
      yearContributions += regularAddition;
    }

    totalContributions += yearContributions;
    const interestEarned = currentBalance - yearStartBalance - yearContributions;

    annualBreakdown.push({
      year,
      contributions: Math.round(totalContributions * 100) / 100,
      interestEarned: Math.round(Math.max(0, interestEarned) * 100) / 100,
      balance: Math.round(currentBalance * 100) / 100,
    });
  }

  const totalInterestEarned = Math.max(0, currentBalance - totalContributions);

  return {
    futureValue: Math.round(currentBalance * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalInterestEarned: Math.round(totalInterestEarned * 100) / 100,
    annualBreakdown,
  };
}

/**
 * Calculate retirement feasibility and projected nest egg using the 4% rule standard
 */
export function calculateRetirement(inputs: RetirementInputs): RetirementResult {
  const currentAge = Math.max(18, inputs.currentAge || 30);
  const retirementAge = Math.max(currentAge + 1, inputs.retirementAge || 65);
  const currentSavings = Math.max(0, inputs.currentSavings || 0);
  const annualContribution = Math.max(0, inputs.annualContribution || 0);
  const annualReturn = (inputs.annualReturnPct || 7) / 100;
  const desiredAnnualSpend = Math.max(0, inputs.desiredAnnualSpend || 50000);

  const yearsToRetirement = retirementAge - currentAge;

  // FV of current savings
  const fvSavings = currentSavings * Math.pow(1 + annualReturn, yearsToRetirement);

  // FV of annual contributions
  let fvContributions = 0;
  if (annualReturn === 0) {
    fvContributions = annualContribution * yearsToRetirement;
  } else {
    fvContributions =
      annualContribution * ((Math.pow(1 + annualReturn, yearsToRetirement) - 1) / annualReturn);
  }

  const nestEggAtRetirement = fvSavings + fvContributions;
  // 4% Safe Withdrawal Rate standard (Trinity Study)
  const annualSustainableIncome = nestEggAtRetirement * 0.04;
  const requiredNestEgg = desiredAnnualSpend > 0 ? desiredAnnualSpend / 0.04 : 0;
  const surplusOrShortfall = nestEggAtRetirement - requiredNestEgg;

  return {
    nestEggAtRetirement: Math.round(nestEggAtRetirement * 100) / 100,
    annualSustainableIncome: Math.round(annualSustainableIncome * 100) / 100,
    isFunded: surplusOrShortfall >= 0,
    surplusOrShortfall: Math.round(surplusOrShortfall * 100) / 100,
    yearsToRetirement,
    requiredNestEgg: Math.round(requiredNestEgg * 100) / 100,
  };
}

/**
 * Calculate commercial discounts, secondary coupons, sales tax, and currency converted prices
 */
export function calculateDiscount(
  inputs: DiscountInputs,
  exchangeRate = 1
): DiscountResult {
  const originalPrice = Math.max(0, inputs.originalPrice || 0);
  const discountPct = Math.max(0, Math.min(100, inputs.discountPct || 0));
  const secondDiscountPct = Math.max(0, Math.min(100, inputs.secondDiscountPct || 0));
  const salesTaxPct = Math.max(0, inputs.salesTaxPct || 0);

  const primaryDiscountAmount = originalPrice * (discountPct / 100);
  const afterFirstDiscount = originalPrice - primaryDiscountAmount;

  const secondDiscountAmount = afterFirstDiscount * (secondDiscountPct / 100);
  const discountedPrice = afterFirstDiscount - secondDiscountAmount;

  const taxAmount = discountedPrice * (salesTaxPct / 100);
  const netPrice = discountedPrice + taxAmount;

  const totalDiscountAmount = primaryDiscountAmount + secondDiscountAmount;
  const totalSavings = originalPrice - discountedPrice;
  const effectiveDiscountPct =
    originalPrice > 0 ? (totalSavings / originalPrice) * 100 : 0;

  const convertedNetPrice =
    exchangeRate > 0 ? Math.round(netPrice * exchangeRate * 100) / 100 : undefined;

  return {
    discountedPrice: Math.round(discountedPrice * 100) / 100,
    secondDiscountAmount: Math.round(secondDiscountAmount * 100) / 100,
    totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    netPrice: Math.round(netPrice * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    effectiveDiscountPct: Math.round(effectiveDiscountPct * 10) / 10,
    convertedNetPrice,
    targetCurrency: inputs.targetCurrency,
  };
}
