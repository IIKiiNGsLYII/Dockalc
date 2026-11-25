import { describe, expect, it } from 'vitest';
import { calculateMortgage, calculateRetirement, calculateDiscount } from '@/lib/financeEngine';

describe('mortgage', () => {
  it('matches the standard payment formula ($200k, 6%, 30 yrs = $1,199.10)', () => {
    const r = calculateMortgage({ principal: 200000, annualRatePct: 6, termYears: 30, extraMonthly: 0 } as never);
    expect(r.monthlyPayment).toBeCloseTo(1199.1, 1);
    expect(r.payoffMonths).toBe(360);
  });

  it('extra payments shorten the loan', () => {
    const r = calculateMortgage({ principal: 200000, annualRatePct: 6, termYears: 30, extraMonthly: 200 } as never);
    expect(r.payoffMonths).toBeLessThan(360);
    expect(r.interestSavedWithExtra).toBeGreaterThan(0);
  });
});

describe('retirement', () => {
  it('honors a 0% return instead of swapping in 7%', () => {
    const r = calculateRetirement({
      currentAge: 30, retirementAge: 40, currentSavings: 1000, annualContribution: 100,
      annualReturnPct: 0, desiredAnnualSpend: 0,
    } as never);
    expect(r.nestEggAtRetirement).toBe(2000);
    expect(r.requiredNestEgg).toBe(0);
  });
});

describe('discount', () => {
  it('stacks discounts then adds tax', () => {
    const r = calculateDiscount({ originalPrice: 100, discountPct: 20, secondDiscountPct: 10, salesTaxPct: 5 } as never);
    expect(r.discountedPrice).toBe(72);
    expect(r.netPrice).toBe(75.6);
  });
});
